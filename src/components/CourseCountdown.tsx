"use client";

import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";

interface CourseCountdownProps {
  /** Instante ISO de inicio. Si falta, no se renderiza nada. */
  startsAt?: string;
  /**
   * "ficha": bloque de la Ficha del Curso, alineado con el resto de campos.
   * "tarjeta": pastilla compacta para la tarjeta del listado.
   */
  variant?: "ficha" | "tarjeta";
}

type Remaining = {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
};

function getRemaining(target: number, now: number): Remaining | null {
  const diff = target - now;
  if (diff <= 0) return null;

  const totalSegundos = Math.floor(diff / 1000);
  return {
    dias: Math.floor(totalSegundos / 86400),
    horas: Math.floor((totalSegundos % 86400) / 3600),
    minutos: Math.floor((totalSegundos % 3600) / 60),
    segundos: totalSegundos % 60,
  };
}

/**
 * Cuenta regresiva hasta el inicio del curso.
 *
 * Se calcula solo en el navegador: la página se genera en el servidor y se
 * revalida cada 60 s, así que pintar la hora ahí daría un valor viejo y una
 * discrepancia de hidratación. Hasta que monta no ocupa espacio.
 */
export default function CourseCountdown({
  startsAt,
  variant = "ficha",
}: CourseCountdownProps) {
  const target = startsAt ? new Date(startsAt).getTime() : NaN;
  const valido = Number.isFinite(target);

  const [remaining, setRemaining] = useState<Remaining | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!valido) return;

    setMounted(true);
    setRemaining(getRemaining(target, Date.now()));

    const id = setInterval(() => {
      setRemaining(getRemaining(target, Date.now()));
    }, 1000);

    return () => clearInterval(id);
  }, [target, valido]);

  // Al llegar a cero el contador simplemente desaparece: es informativo, no
  // cambia nada de la venta ni del estado del curso.
  if (!valido || !mounted || !remaining) return null;

  if (variant === "tarjeta") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-sm px-2.5 py-1 text-white ring-1 ring-white/20">
        <CalendarClock className="w-3.5 h-3.5 text-brand-300 shrink-0" />
        <span className="text-xs font-semibold tabular-nums">
          {remaining.dias > 0 && `${remaining.dias}d `}
          {String(remaining.horas).padStart(2, "0")}h{" "}
          {String(remaining.minutos).padStart(2, "0")}m{" "}
          {String(remaining.segundos).padStart(2, "0")}s
        </span>
      </span>
    );
  }

  return (
    <div className="flex items-start gap-3 min-w-0">
      <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
        <CalendarClock className="w-4 h-4 text-brand-300" />
      </div>
      <div className="min-w-0">
        <p className="text-white/60 text-xs uppercase tracking-wider mb-1.5">
          Comienza en
        </p>
        <div
          className="flex items-center gap-2"
          // El bloque entero se relee en cada tick; sin esto un lector de
          // pantalla anunciaria los segundos sin parar.
          role="timer"
          aria-live="off"
        >
          <Unidad valor={remaining.dias} etiqueta="días" />
          <Separador />
          <Unidad valor={remaining.horas} etiqueta="horas" />
          <Separador />
          <Unidad valor={remaining.minutos} etiqueta="min" />
          <Separador />
          <Unidad valor={remaining.segundos} etiqueta="seg" />
        </div>
      </div>
    </div>
  );
}

function Unidad({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-white font-bold text-base tabular-nums leading-none">
        {String(valor).padStart(2, "0")}
      </span>
      <span className="text-white/50 text-[10px] uppercase tracking-wide mt-1">
        {etiqueta}
      </span>
    </div>
  );
}

function Separador() {
  return (
    <span className="text-white/30 font-bold text-base leading-none -mt-2">
      :
    </span>
  );
}
