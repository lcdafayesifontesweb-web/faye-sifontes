import { NextResponse } from "next/server";
import { client as sanityClient } from "@/sanity/client";
import type { ChatMessage, ChatRequestBody } from "@/types/chat";
import { resolveInstructorNames } from "@/lib/instructors";
import { normalizeFeaturesList } from "@/lib/features";

import {
  checkRateLimit,
  getClientIp,
  tooManyRequests,
} from "@/lib/rateLimit";

export const runtime = "nodejs";

/** Cada consulta cuesta cuota de Gemini: 20 cada 10 min por IP. */
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000;

const MAX_HISTORY = 12;
/**
 * El asistente corre sobre Groq.
 *
 * Se migro desde Gemini porque Google denego el acceso a la cuenta
 * ("Your project has been denied access") y no dejaba crear proyectos
 * nuevos, asi que todas las consultas caian al mensaje de respaldo.
 *
 * La API de Groq es compatible con el formato de OpenAI, de modo que el
 * prompt, los datos del curso y las reglas de respuesta no cambiaron.
 */
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

/** Configurable para cambiar de modelo sin redesplegar. */
const CHAT_MODEL = process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b";

const generalContext =
  "Empresa: SS Consultores. Directora: Lcda. Faye Sifontes. Sede: CC Centinela PB local 2, Puerto La Cruz, Anzoátegui. Contacto/WhatsApp: 0424-8979101. Alianza institucional: Certificados avalados por EDUCA ante el MPPE solo para Asistente Administrativo, Contable y Excel; el resto son certificados por la Lcda. Faye Sifontes. Métodos de pago: Pago Móvil, Zelle y Efectivo.";

/** Fallo pasajero: tiene sentido pedirle que reintente. */
const FALLBACK_REPLY =
  "En este momento nuestro asistente está atendiendo múltiples consultas. Por favor, espera unos segundos o escríbenos directamente por WhatsApp al 0424-8979101 para atención inmediata.";

/**
 * Fallo de configuración o de permisos: no se arregla esperando unos
 * segundos, así que prometerlo seria enganar al visitante. Se le da la via
 * que si funciona.
 */
const FALLBACK_NO_DISPONIBLE =
  "Nuestro asistente no está disponible en este momento. Escríbenos por WhatsApp al 0424-8979101 y te atendemos de una vez.";

const COURSE_BY_SLUG_QUERY = `*[_type == "course" && slug.current == $slug][0]{
  title,
  description,
  date,
  schedule,
  modality,
  features,
  price,
  priceOnline,
  currency,
  certifiedBy,
  "instructorNames": instructors[]->name,
  "legacyInstructorName": instructor->name,
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
  priceOnline?: number;
  currency?: string;
  certifiedBy?: string;
  instructorNames?: (string | null)[] | null;
  legacyInstructorName?: string | null;
  gallery?: unknown[];
}

interface ChatCompletionMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string; code?: string };
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

function toChatMessages(messages: ChatMessage[]): ChatCompletionMessage[] {
  return messages.map((msg) => ({
    role:
      msg.role === "assistant" ? ("assistant" as const) : ("user" as const),
    content: msg.content,
  }));
}

function buildSystemInstruction(
  courseData: Omit<
    SanityCourseChatData,
    "features" | "instructorNames" | "legacyInstructorName"
  > & { features: string[]; facilitadores: string[] }
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
  const limit = checkRateLimit(
    `chat:${getClientIp(request)}`,
    RATE_LIMIT,
    RATE_WINDOW_MS
  );
  if (!limit.allowed) {
    return tooManyRequests(
      limit.retryAfter,
      "Demasiadas consultas seguidas. Espera un momento antes de volver a preguntar."
    );
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    console.error("[api/chat] GROQ_API_KEY ausente o vacía.");
    return NextResponse.json(
      {
        error:
          "GROQ_API_KEY no está configurada en el servidor. Configúrala en Vercel / .env.local.",
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

  // Normaliza temario (array legado o texto multilínea) para el prompt y
  // resuelve los facilitadores a una sola lista antes de enviarla al modelo.
  const {
    instructorNames,
    legacyInstructorName,
    ...courseRest
  } = courseData;
  const courseForPrompt = {
    ...courseRest,
    features: normalizeFeaturesList(courseData.features),
    facilitadores: resolveInstructorNames(instructorNames, legacyInstructorName),
  };

  const systemPrompt = buildSystemInstruction(courseForPrompt);
  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...toChatMessages(messages),
        ],
        temperature: 0.3,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      // 401/403/404 no son saturacion: son clave invalida, proyecto sin
      // acceso o modelo inexistente. Se registran aparte porque requieren
      // intervencion en la cuenta de Google, no reintentar.
      const esConfiguracion = [401, 403, 404].includes(response.status);
      console.error(
        esConfiguracion
          ? `[CHAT CONFIG] El asistente no puede responder: HTTP ${response.status} con el modelo "${CHAT_MODEL}". Revisa GROQ_API_KEY y que el modelo siga disponible.`
          : "[CHAT ERROR]:",
        response.status,
        errText
      );
      return okMessage(
        esConfiguracion ? FALLBACK_NO_DISPONIBLE : FALLBACK_REPLY
      );
    }

    const data = (await response.json()) as ChatCompletionResponse;
    const replyText = data.choices?.[0]?.message?.content?.trim() || "";

    if (!replyText) {
      console.error("[CHAT ERROR]: respuesta vacía", JSON.stringify(data));
      return okMessage(FALLBACK_REPLY);
    }

    return okMessage(replyText);
  } catch (err) {
    console.error("[CHAT ERROR]:", err);
    return okMessage(FALLBACK_REPLY);
  }
}
