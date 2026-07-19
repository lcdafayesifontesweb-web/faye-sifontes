export interface CourseChatContext {
  title: string;
  description: string;
  price: number;
  currency: string;
  modality: string;
  schedule: string;
  date: string;
  features: string[];
  instructorName?: string;
  certifiedBy?: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequestBody {
  messages: ChatMessage[];
  courseContext: CourseChatContext;
}

export interface ChatResponseBody {
  message: string;
}
