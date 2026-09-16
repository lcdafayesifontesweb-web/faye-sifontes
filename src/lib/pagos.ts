export type PaymentType = "total" | "inicial";

/** Porcentaje de la reserva. */
export const PORCENTAJE_INICIAL = 0.2;

/** Días hábiles antes del inicio para pagar el saldo. */
export const DIAS_HABILES_TOPE = 5;

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

export function montoInicial(total: number): number {
  return redondear(total * PORCENTAJE_INICIAL);
}

export function montoSaldo(total: number): number {
  return redondear(total - montoInicial(total));
}

/** Fecha calendario en Caracas del instante dado, o null si no es válido. */
function fechaEnCaracas(iso: string): Date | null {
  const instante = new Date(iso);
  if (Number.isNaN(instante.getTime())) return null;

  // "en-CA" entrega AAAA-MM-DD.
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Caracas",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(instante)
    .split("-")
    .map(Number);

  // Se ancla en UTC para hacer aritmética de calendario pura, sin que el
  // huso horario de quien ejecuta el código corra la fecha un día.
  return new Date(Date.UTC(y, m - 1, d));
}

/**
 * Fecha tope para pagar el saldo: 5 días hábiles antes del inicio del curso,
 * sin contar sábados ni domingos.
 *
 * Devuelve una fecha de calendario anclada en UTC; formatearla siempre con
 * `formatFechaTope`, que la interpreta como tal.
 */
export function fechaTopePago(startsAt?: string | null): Date | null {
  if (!startsAt) return null;

  const cursor = fechaEnCaracas(startsAt);
  if (!cursor) return null;

  let restantes = DIAS_HABILES_TOPE;
  while (restantes > 0) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
    const dia = cursor.getUTCDay();
    if (dia !== 0 && dia !== 6) restantes -= 1;
  }

  return cursor;
}

/**
 * Ejemplo: "Lunes, 12 de octubre de 2026".
 *
 * Se capitaliza aqui y no con CSS: `capitalize` pone mayuscula en cada
 * palabra y produce "Lunes, 12 De Octubre De 2026".
 */
export function formatFechaTope(fecha: Date): string {
  const texto = new Intl.DateTimeFormat("es-VE", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fecha);

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Si el curso admite reserva con inicial.
 *
 * Hace falta una fecha de inicio para calcular el tope, y ese tope tiene que
 * seguir en el futuro: ofrecer una reserva cuyo plazo ya venció no tiene
 * sentido y dejaría al alumno sin margen para completar el pago.
 */
export function permiteInicial(startsAt?: string | null): boolean {
  const tope = fechaTopePago(startsAt);
  if (!tope) return false;

  // El tope vence al terminar ese día en Caracas (UTC-4 → 04:00 UTC del día
  // siguiente).
  const vence = tope.getTime() + 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000;
  return Date.now() < vence;
}
