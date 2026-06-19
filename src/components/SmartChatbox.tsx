"use client";

import { Bot } from "lucide-react";

interface SmartChatboxProps {
  courseSlug: string;
  courseTitle: string;
}

/**
 * SmartChatbox — widget inline por curso, preparado para integración futura.
 *
 * Para conectar Chatbase o Voiceflow por curso:
 * 1. Usa `courseSlug` para seleccionar el bot/script correspondiente.
 * 2. Monta el embed dentro de `#smart-chat-embed-root-{courseSlug}`.
 * 3. Oculta el panel simulado cuando el embed esté activo.
 */
export default function SmartChatbox({
  courseSlug,
  courseTitle,
}: SmartChatboxProps) {
  const embedRootId = `smart-chat-embed-root-${courseSlug}`;

  return (
    <section
      className="w-full bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
      aria-label={`Asistente Virtual — ${courseTitle}`}
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
          <p className="text-xs text-white/70 truncate">{courseTitle}</p>
        </div>
      </header>

      <div className="h-72 overflow-y-auto p-4 space-y-3 bg-slate-50">
        <div className="flex gap-2.5">
          <div className="w-7 h-7 rounded-full bg-brand-blue/10 flex items-center justify-center shrink-0 mt-0.5">
            <Bot className="w-3.5 h-3.5 text-brand-blue" />
          </div>
          <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-slate-100 max-w-[85%]">
            <p className="text-sm text-brand-dark/80 leading-relaxed">
              ¡Hola! Pregúntame lo que necesites sobre{" "}
              <strong>{courseTitle}</strong>: fechas, contenido, modalidad o
              inscripción.
            </p>
          </div>
        </div>

        <div
          id={embedRootId}
          data-course-slug={courseSlug}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      <div className="p-3 border-t border-slate-100 bg-white">
        <input
          type="text"
          disabled
          placeholder="Próximamente..."
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-brand-gray cursor-not-allowed"
        />
      </div>
    </section>
  );
}
