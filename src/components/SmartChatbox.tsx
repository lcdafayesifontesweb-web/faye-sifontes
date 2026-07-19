"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Bot, Loader2, Send } from "lucide-react";
import type { ChatMessage, CourseChatContext } from "@/types/chat";

interface SmartChatboxProps {
  courseSlug: string;
  courseContext: CourseChatContext;
}

type UiMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function SmartChatbox({
  courseSlug,
  courseContext,
}: SmartChatboxProps) {
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `¡Hola! Pregúntame lo que necesites sobre ${courseContext.title}: fechas, contenido, modalidad, precio o inscripción.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /** Candado síncrono: evita doble submit antes de que React actualice `loading` */
  const inFlightRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    e.stopPropagation();

    const text = input.trim();
    if (!text || loading || inFlightRef.current) return;

    inFlightRef.current = true;
    setLoading(true);
    setError(null);
    setInput("");

    const userMsg: UiMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);

    const payloadMessages: ChatMessage[] = nextMessages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          messages: payloadMessages,
          courseContext,
        }),
      });

      const data = (await res.json()) as {
        message?: string;
        error?: string;
      };

      if (!res.ok || !data.message) {
        // Sin reintentos automáticos: un solo intento por clic
        throw new Error(
          data.error || "No se pudo obtener respuesta del asistente."
        );
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.message!,
        },
      ]);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Error al contactar al asistente.";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-err-${Date.now()}`,
          role: "assistant",
          content:
            "Lo siento, tuve un problema técnico. Puedes escribirnos por WhatsApp y el equipo académico te atenderá de inmediato.",
        },
      ]);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <section
      className="w-full bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
      aria-label={`Asistente Virtual — ${courseContext.title}`}
      data-course-slug={courseSlug}
    >
      <p className="px-4 pt-4 pb-2 text-sm font-semibold text-brand-blue leading-snug">
        ¿Tienes dudas sobre el curso? Pregúntale a nuestro asistente virtual 👇
      </p>

      <header className="flex items-center gap-2.5 px-4 py-3 bg-brand-dark text-white border-t border-brand-dark">
        <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center shrink-0">
          <Bot className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm leading-tight">
            Asistente Virtual SS Consultores
          </p>
          <p className="text-xs text-white/70 truncate">{courseContext.title}</p>
        </div>
      </header>

      <div className="h-72 overflow-y-auto p-4 space-y-3 bg-slate-50">
        {messages.map((m) =>
          m.role === "assistant" ? (
            <div key={m.id} className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-brand-blue" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-100 max-w-[85%]">
                <p className="text-sm text-brand-dark/80 leading-relaxed whitespace-pre-wrap">
                  {m.content}
                </p>
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex justify-end">
              <div className="bg-brand-blue text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm max-w-[85%]">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {m.content}
                </p>
              </div>
            </div>
          )
        )}

        {loading && (
          <div className="flex gap-2.5 items-center text-slate-500 text-sm">
            <div className="w-7 h-7 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0">
              <Loader2 className="w-3.5 h-3.5 text-brand-blue animate-spin" />
            </div>
            <span className="italic">Escribiendo…</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-3 border-t border-slate-100 bg-white flex gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Escribe tu pregunta…"
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-brand-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue disabled:opacity-60"
          maxLength={1000}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-busy={loading}
          className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-brand-blue text-white hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          aria-label="Enviar mensaje"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      {error && (
        <p className="px-4 pb-3 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
