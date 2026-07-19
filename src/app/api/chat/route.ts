import { NextResponse } from "next/server";
import type {
  ChatMessage,
  ChatRequestBody,
  CourseChatContext,
} from "@/types/chat";

export const runtime = "nodejs";

const MAX_HISTORY = 12;

/**
 * gemini-1.5-flash fue retirado (404 en generateContent).
 * gemini-2.0-flash es el Flash actual en v1beta.
 * Override opcional: GEMINI_MODEL en env.
 */
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

function isCourseContext(value: unknown): value is CourseChatContext {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.title === "string" &&
    typeof c.description === "string" &&
    typeof c.price === "number" &&
    typeof c.currency === "string" &&
    typeof c.modality === "string" &&
    typeof c.schedule === "string" &&
    Array.isArray(c.features)
  );
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
        (row.role === "user" ||
          row.role === "assistant" ||
          row.role === "model")
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

function buildSystemPrompt(courseContext: CourseChatContext): string {
  return `Eres el Asistente Virtual Inteligente de SS Consultores. Tu objetivo es brindar asistencia comercial y académica precisa sobre nuestros cursos. Responde de forma cordial, concisa y persuasiva utilizando ÚNICAMENTE la información contenida en este contexto oficial del curso: ${JSON.stringify(courseContext)}. Reglas de seguridad: 1) Si el usuario pregunta algo que no esté explícitamente en el contexto (ej. descuentos especiales, pagos a plazos no descritos, problemas personales), indícale amablemente que puede consultarlo directamente con nuestro equipo académico haciendo clic en el botón de WhatsApp. 2) No inventes datos, fechas ni tarifas. 3) Mantén respuestas breves (máximo 2 o 3 párrafos cortos).`;
}

interface GeminiPart {
  text?: string;
}

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: GeminiPart[];
    };
    finishReason?: string;
  }[];
  error?: {
    message?: string;
    status?: string;
    code?: number;
  };
}

function humanGeminiError(status: number, data: GeminiResponse): string {
  const apiMsg = data.error?.message || data.error?.status || "";
  if (status === 404) {
    return `Modelo no encontrado (${GEMINI_MODEL}). Revisa GEMINI_MODEL en Vercel.`;
  }
  if (status === 429) {
    return "Límite de cuota de Gemini alcanzado. Espera un minuto e intenta de nuevo.";
  }
  if (status === 400) {
    return apiMsg
      ? `Solicitud inválida: ${apiMsg}`
      : "Solicitud inválida hacia Gemini.";
  }
  if (status === 403 || status === 401) {
    return "API key de Gemini inválida o sin permisos. Revisa GEMINI_API_KEY en Vercel.";
  }
  return apiMsg
    ? `Error Gemini (${status}): ${apiMsg}`
    : `Error al comunicarse con Gemini (${status}).`;
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY no está configurada. Añádela en .env.local / Vercel para activar el asistente.",
      },
      { status: 503 }
    );
  }

  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!isCourseContext(body.courseContext)) {
    return NextResponse.json(
      { error: "courseContext incompleto o inválido" },
      { status: 400 }
    );
  }

  const messages = sanitizeMessages(body.messages);
  if (messages.length === 0) {
    return NextResponse.json(
      { error: "Se requiere al menos un mensaje de usuario" },
      { status: 400 }
    );
  }

  // Gemini exige que contents empiece por rol "user"
  if (messages[0]?.role !== "user") {
    return NextResponse.json(
      { error: "El historial debe comenzar con un mensaje del usuario" },
      { status: 400 }
    );
  }

  const systemPrompt = buildSystemPrompt(body.courseContext);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const formattedContents = messages.map((m) => ({
    role: m.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: m.content }],
  }));

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: formattedContents,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 512,
        },
      }),
    });

    const data = (await response.json()) as GeminiResponse;

    if (!response.ok) {
      console.error(
        "[api/chat] Gemini error:",
        response.status,
        GEMINI_MODEL,
        JSON.stringify(data)
      );
      return NextResponse.json(
        {
          error: humanGeminiError(response.status, data),
          details: data,
          model: GEMINI_MODEL,
        },
        { status: response.status }
      );
    }

    const replyText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!replyText) {
      console.error("[api/chat] empty candidates:", JSON.stringify(data));
      return NextResponse.json(
        {
          error:
            "Gemini no devolvió texto. Intenta de nuevo o escribe por WhatsApp.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ message: replyText });
  } catch (err) {
    console.error("[api/chat] unexpected:", err);
    return NextResponse.json(
      { error: "Error interno del asistente" },
      { status: 500 }
    );
  }
}
