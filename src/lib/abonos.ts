export type Abono = {
  _key?: string;
  fecha?: string | null;
  montoUsd?: number | null;
  referencia?: string | null;
  nota?: string | null;
  notificado?: boolean | null;
};

export type ResumenAbonos = {
  /** Saldo con el que arrancó la reserva. */
  saldoOriginal: number;
  /** Suma de todos los abonos registrados. */
  totalAbonado: number;
  /** Lo que todavía debe. Nunca negativo. */
  saldoRestante: number;
  /** Cuánto pagó de más, si se pasó. */
  excedente: number;
  /** Ya no debe nada. */
  saldado: boolean;
};

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/** Solo cuentan los abonos con un monto válido y positivo. */
export function abonosValidos(abonos?: Abono[] | null): Abono[] {
  return (abonos ?? []).filter(
    (a) => typeof a?.montoUsd === "number" && Number.isFinite(a.montoUsd) && a.montoUsd > 0
  );
}

export function resumirAbonos(
  saldoOriginal?: number | null,
  abonos?: Abono[] | null
): ResumenAbonos {
  const base =
    typeof saldoOriginal === "number" && Number.isFinite(saldoOriginal)
      ? saldoOriginal
      : 0;

  const totalAbonado = redondear(
    abonosValidos(abonos).reduce((suma, a) => suma + (a.montoUsd as number), 0)
  );

  const diferencia = redondear(base - totalAbonado);

  return {
    saldoOriginal: base,
    totalAbonado,
    // Un abono de más no debe producir un saldo negativo en el correo.
    saldoRestante: Math.max(0, diferencia),
    excedente: diferencia < 0 ? redondear(-diferencia) : 0,
    saldado: diferencia <= 0.009,
  };
}

/**
 * Abonos que todavía no se le han notificado al alumno.
 *
 * Es lo que decide qué se envía y qué se marca después, de modo que reenviar
 * el recibo no vuelva a anunciar abonos ya avisados.
 */
export function abonosSinNotificar(abonos?: Abono[] | null): Abono[] {
  return abonosValidos(abonos).filter((a) => !a.notificado);
}

/** Ejemplo: "14/09/2026". Acepta una fecha ISO o "AAAA-MM-DD". */
export function formatFechaAbono(fecha?: string | null): string | null {
  if (!fecha) return null;

  // "AAAA-MM-DD" se interpreta como UTC; se formatea igual para que no
  // retroceda un día al pasarlo a la hora de Caracas.
  const soloFecha = /^\d{4}-\d{2}-\d{2}$/.test(fecha);
  const d = new Date(soloFecha ? `${fecha}T12:00:00Z` : fecha);
  if (Number.isNaN(d.getTime())) return null;

  return new Intl.DateTimeFormat("es-VE", {
    timeZone: soloFecha ? "UTC" : "America/Caracas",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}
