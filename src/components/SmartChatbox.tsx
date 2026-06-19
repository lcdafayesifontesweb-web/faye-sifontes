"use client";

import { useState } from "react";
import { MessageCircle, X, Bot } from "lucide-react";

interface SmartChatboxProps {
  courseSlug: string;
  courseTitle: string;
  /** Eleva el FAB cuando hay barra sticky inferior (CTA móvil del curso) */
  elevated?: boolean;
}

/**
 * SmartChatbox — asistente por curso, preparado para integración futura.
 *
 * Para conectar Chatbase o Voiceflow por curso:
 * 1. Usa `courseSlug` para seleccionar el bot/script correspondiente.
 * 2. Monta el embed dentro de `#smart-chat-embed-root-{courseSlug}`.
 * 3. Oculta el panel simulado cuando el embed esté activo.
 */
export default function SmartChatbox({
  courseSlug,
  courseTitle,
  elevated = false,
}: SmartChatboxProps) {
  const [open, setOpen] = useState(false);
  const embedRootId = `smart-chat-embed-root-${courseSlug}`;
  const fabBottom = elevated ? "bottom-24 lg:bottom-6" : "bottom-6";

  return (
    <>
      {open && (
        <div
          className={`fixed ${elevated ? "bottom-40 lg:bottom-24" : "bottom-24"} right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[70vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-brand-gray/30 overflow-hidden animate-fade-in-up`}
          role="dialog"
          aria-label={`Asistente Virtual — ${courseTitle}`}
        >
          <header className="flex items-center justify-between px-4 py-3 bg-brand-dark text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-blue flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-sm leading-tight">
                  Asistente Virtual SS Consultores
                </p>
                <p className="text-xs text-white/70 truncate max-w-[220px]">
                  {courseTitle}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 min-h-[200px]">
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
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`fixed ${fabBottom} right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-brand-blue hover:bg-brand-600 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center group`}
        aria-label={open ? "Cerrar asistente virtual" : "Abrir asistente virtual"}
        aria-expanded={open}
      >
        <span className="absolute inset-0 rounded-full bg-brand-blue animate-ping opacity-30 group-hover:opacity-0 transition-opacity" />
        {open ? (
          <X className="w-6 h-6 relative" />
        ) : (
          <MessageCircle className="w-6 h-6 relative" />
        )}
      </button>
    </>
  );
}
