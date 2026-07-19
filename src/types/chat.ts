export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/** Body del POST /api/chat — contexto del curso se resuelve en servidor vía Sanity */
export interface ChatRequestBody {
  messages: ChatMessage[];
  courseSlug: string;
}

export interface ChatResponseBody {
  message: string;
}
