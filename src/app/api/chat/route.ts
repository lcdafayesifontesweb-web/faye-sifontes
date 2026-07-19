import { NextResponse } from "next/server";
import type {
  ChatMessage,
  ChatRequestBody,
  CourseChatContext,
} from "@/types/chat";

export const runtime = "nodejs";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const MAX_HISTORY = 12;

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
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        typeof m === "object" &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .map((m) => ({
      role: m.role,
      content: m.content.trim().slice(0, 2000),
    }))
    .slice(-MAX_HISTORY);
}

function buildSystemPrompt(courseContext: CourseChatContext): string {
  return `Eres el Asistente Virtual Inteligente de SS Consultores. Tu objetivo es brindar asistencia comercial y académica precisa sobre nuestros cursos. Responde de forma cordial, concisa y persuasiva utilizando ÚNICAMENTE la información contenida en este contexto oficial del curso: ${JSON.stringify(courseContext)}. Reglas de seguridad: 1) Si el usuario pregunta algo que no esté explícitamente en el contexto (ej. descuentos especiales, pagos a plazos no descritos, problemas personales), indícale amablemente que puede consultarlo directamente con nuestro equipo académico haciendo clic en el botón de WhatsApp. 2) No inventes datos, fechas ni tarifas. 3) Mantén respuestas breves (máximo 2 o 3 párrafos cortos).`;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY no está configurada. Añádela en .env.local para activar el asistente.",
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

  const history = sanitizeMessages(body.messages);
  if (history.length === 0) {
    return NextResponse.json(
      { error: "Se requiere al menos un mensaje de usuario" },
      { status: 400 }
    );
  }

  const openaiMessages = [
    { role: "system" as const, content: buildSystemPrompt(body.courseContext) },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    const openaiRes = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        max_tokens: 450,
        messages: openaiMessages,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error("[api/chat] OpenAI error:", openaiRes.status, errText);
      return NextResponse.json(
        {
          error:
            "No pudimos obtener respuesta del asistente. Intenta de nuevo en unos segundos.",
        },
        { status: 502 }
      );
    }

    const data = (await openaiRes.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const message =
      data.choices?.[0]?.message?.content?.trim() ||
      "No tengo una respuesta en este momento. Por favor escribe a nuestro equipo por WhatsApp.";

    return NextResponse.json({ message } satisfies { message: string });
  } catch (err) {
    console.error("[api/chat] unexpected:", err);
    return NextResponse.json(
      { error: "Error interno del asistente" },
      { status: 500 }
    );
  }
}
