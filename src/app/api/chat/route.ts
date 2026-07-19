import { NextResponse } from "next/server";
import { client as sanityClient } from "@/sanity/client";
import type { ChatMessage, ChatRequestBody } from "@/types/chat";
import { normalizeFeaturesList } from "@/lib/features";

export const runtime = "nodejs";

const MAX_HISTORY = 12;
const GEMINI_MODEL = "gemini-3.1-flash-lite";

const generalContext =
  "Empresa: SS Consultores. Directora: Lcda. Faye Sifontes. Sede: CC Centinela PB local 2, Puerto La Cruz, Anzoátegui. Contacto/WhatsApp: 0424-8979101. Alianza institucional: Certificados avalados por EDUCA ante el MPPE solo para Asistente Administrativo, Contable y Excel; el resto son certificados por la Lcda. Faye Sifontes. Métodos de pago: Pago Móvil, Zelle y Efectivo.";

const FALLBACK_REPLY =
  "En este momento nuestro asistente está atendiendo múltiples consultas. Por favor, espera unos segundos o escríbenos directamente por WhatsApp al 0424-8979101 para atención inmediata.";

const COURSE_BY_SLUG_QUERY = `*[_type == "course" && slug.current == $slug][0]{
  title,
  description,
  date,
  schedule,
  modality,
  features,
  price,
  currency,
  certifiedBy,
  "instructor": instructor->name,
  gallery
}`;

interface SanityCourseChatData {
  title?: string;
  description?: string;
  date?: string;
  schedule?: string;
  modality?: string;
  features?: string | string[];
  price?: number;
  currency?: string;
  certifiedBy?: string;
  instructor?: string | null;
  gallery?: unknown[];
}

interface GeminiContent {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
  error?: { code?: number; message?: string; status?: string };
}

function okMessage(message: string) {
  return NextResponse.json({ message });
}

function sanitizeMessages(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m): m is { role: string; content: string } => {
      if (!m || typeof m !== "object") return false;
      const row = m as { role?: unknown; content?: unknown };
      return (
        typeof row.content === "string" &&
        row.content.trim().length > 0 &&
        (row.role === "user" || row.role === "assistant" || row.role === "model")
      );
    })
    .map((m) => ({
      role:
        m.role === "assistant" || m.role === "model"
          ? ("assistant" as const)
          : ("user" as const),
      content: m.content.trim().slice(0, 2000),
    }))
    .slice(-MAX_HISTORY);
}

function toGeminiContents(messages: ChatMessage[]): GeminiContent[] {
  return messages.map((msg) => ({
    role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: msg.content }],
  }));
}

function buildSystemInstruction(
  courseData: Omit<SanityCourseChatData, "features"> & { features: string[] }
): string {
  return `${generalContext}

Estás respondiendo dudas en la página web de este curso específico. Tu prioridad es resolver la consulta aquí mismo para que el usuario no necesite contactar por WhatsApp. Basa tus respuestas en estos datos del curso: ${JSON.stringify(courseData)}

Reglas de respuesta:
1) Usa ÚNICAMENTE la información de empresa (arriba) y del curso activo (courseData). No inventes datos.
2) Si la pregunta se responde con datos del curso (contenido/módulos, horario, duración, modalidad, precio, facilitador, certificación, descripción/dirigido a, fechas), responde completo y NO menciones WhatsApp ni ningún otro contacto.
3) En esas respuestas (regla 2), cierra SIEMPRE con una frase corta que invite a la acción en esta misma página (inscribirse con el botón «Reserva tu lugar» más abajo). Varía la redacción para no repetir la misma frase cada vez; la idea es quedarse en la web. Ejemplos de cierre (elige uno distinto o parafraséalo): «Puedes inscribirte con el botón "Reserva tu lugar" más abajo en esta página.» / «Cuando quieras, usa "Reserva tu lugar" al final de esta página para completar tu inscripción.» / «Si te interesa, el botón "Reserva tu lugar" de esta misma página te lleva al registro.»
4) SOLO menciona WhatsApp en estos casos:
   a) La pregunta no está cubierta por courseData ni por el contexto de empresa (ej. descuentos, cupos, inscripción grupal, casos particulares, detalles de pago más allá de los métodos generales listados).
   b) El usuario pide explícitamente hablar con una persona, contactar directamente, o más ayuda humana.
   c) Pide indicaciones adicionales o seguimiento humano sobre la sede (la dirección en sí —CC Centinela PB local 2, Puerto La Cruz, Anzoátegui— respóndela directo SIN WhatsApp; solo escala si pide más ayuda).
5) Cuando SÍ menciones WhatsApp: hazlo una sola vez en la respuesta, de forma puntual, y escribe el número SIEMPRE exactamente así: 0424-8979101 (sin espacios, con ese guion, sin asteriscos markdown alrededor del número). En ese caso NO hace falta cerrar con «Reserva tu lugar» salvo que encaje bien.
6) Puedes usar **negrita** con doble asterisco solo en palabras o frases cortas, nunca envolviendo el número de WhatsApp.
7) Respuestas breves (máximo 2-3 párrafos cortos). No ofrezcas WhatsApp «por si acaso» ni como cierre por defecto.`;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    console.error("[api/chat] GEMINI_API_KEY ausente o vacía.");
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY no está configurada en el servidor. Configúrala en Vercel / .env.local.",
      },
      { status: 500 }
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const courseSlug =
    typeof body.courseSlug === "string" ? body.courseSlug.trim() : "";
  if (!courseSlug) {
    return NextResponse.json(
      { error: "courseSlug es requerido" },
      { status: 400 }
    );
  }

  const messages = sanitizeMessages(body.messages);
  if (messages.length === 0 || messages[0].role !== "user") {
    return NextResponse.json(
      {
        error:
          "Se requiere un historial válido que comience con un mensaje del usuario.",
      },
      { status: 400 }
    );
  }

  let courseData: SanityCourseChatData | null = null;
  try {
    courseData = await sanityClient.fetch<SanityCourseChatData | null>(
      COURSE_BY_SLUG_QUERY,
      { slug: courseSlug }
    );
  } catch (err) {
    console.error("[api/chat] Sanity fetch error:", err);
    return okMessage(FALLBACK_REPLY);
  }

  if (!courseData?.title) {
    console.error("[api/chat] Curso no encontrado para slug:", courseSlug);
    return NextResponse.json(
      { error: `No se encontró el curso con slug: ${courseSlug}` },
      { status: 404 }
    );
  }

  // Normaliza temario (array legado o texto multilínea) para el prompt
  const courseForPrompt = {
    ...courseData,
    features: normalizeFeaturesList(courseData.features),
  };

  const systemPrompt = buildSystemInstruction(courseForPrompt);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: toGeminiContents(messages),
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[GEMINI ERROR]:", response.status, errText);
      return okMessage(FALLBACK_REPLY);
    }

    const data = (await response.json()) as GeminiGenerateResponse;
    const replyText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!replyText) {
      console.error(
        "[GEMINI ERROR]: empty candidates",
        JSON.stringify(data)
      );
      return okMessage(FALLBACK_REPLY);
    }

    return okMessage(replyText);
  } catch (err) {
    console.error("[GEMINI ERROR]:", err);
    return okMessage(FALLBACK_REPLY);
  }
}
