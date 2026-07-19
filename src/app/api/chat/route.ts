import { NextResponse } from "next/server";
import type {
  ChatMessage,
  ChatRequestBody,
  CourseChatContext,
} from "@/types/chat";

export const runtime = "nodejs";

const MAX_HISTORY = 12;
const GEMINI_MODEL = "gemini-1.5-flash";

const FALLBACK_REPLY =
  "En este momento nuestro asistente está atendiendo múltiples consultas. Por favor, espera unos segundos o escríbenos directamente por WhatsApp para atención inmediata.";

/** Respuesta 200 que el frontend (SmartChatbox) consume como éxito */
function okChatMessage(message: string) {
  return NextResponse.json({ message });
}

interface GeminiContentPart {
  text: string;
}

interface GeminiContent {
  role: "user" | "model";
  parts: GeminiContentPart[];
}

interface GeminiGenerateRequest {
  system_instruction: {
    parts: GeminiContentPart[];
  };
  contents: GeminiContent[];
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

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

function buildSystemPrompt(courseContext: CourseChatContext): string {
  return `Eres el Asistente Virtual Inteligente de SS Consultores. Tu objetivo es brindar asistencia comercial y académica precisa sobre nuestros cursos. Responde de forma cordial, concisa y persuasiva utilizando ÚNICAMENTE la información contenida en este contexto oficial del curso: ${JSON.stringify(courseContext)}. Reglas de seguridad: 1) Si el usuario pregunta algo que no esté explícitamente en el contexto (ej. descuentos especiales, pagos a plazos no descritos, problemas personales), indícale amablemente que puede consultarlo directamente con nuestro equipo académico haciendo clic en el botón de WhatsApp. 2) No inventes datos, fechas ni tarifas. 3) Mantén respuestas breves (máximo 2 o 3 párrafos cortos).`;
}

/** Historial UI → contents Gemini (solo user | model) */
function toGeminiContents(messages: ChatMessage[]): GeminiContent[] {
  return messages.map((msg) => ({
    role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
    parts: [{ text: msg.content }],
  }));
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

  if (!isCourseContext(body.courseContext)) {
    return NextResponse.json(
      { error: "courseContext incompleto o inválido" },
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

  const systemPrompt = buildSystemPrompt(body.courseContext);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const payload: GeminiGenerateRequest = {
    system_instruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: toGeminiContents(messages),
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 512,
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as GeminiGenerateResponse;

    if (!response.ok) {
      console.error(
        "[api/chat] Gemini HTTP error:",
        response.status,
        JSON.stringify(data)
      );
      // Fallback graceful: no romper la UI (HTTP 200 + message)
      return okChatMessage(FALLBACK_REPLY);
    }

    const replyText =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!replyText) {
      console.error(
        "[api/chat] Gemini sin texto en candidates:",
        JSON.stringify(data)
      );
      return okChatMessage(FALLBACK_REPLY);
    }

    return okChatMessage(replyText);
  } catch (err) {
    console.error("[api/chat] fetch/unexpected:", err);
    return okChatMessage(FALLBACK_REPLY);
  }
}
