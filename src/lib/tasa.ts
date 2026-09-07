export type TasaResponse = {
  tasa: number;
  fuente: string;
  ultimaActualizacion: string;
};

/** Formato venezolano: 2.162,50 */
export function formatBs(amount: number): string {
  return amount.toLocaleString("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Ejemplo: 07/09/2026 - 3:15 PM (hora Caracas).
 * El BCV publica una tasa diaria (fecha valor), así que cuando el timestamp
 * cae en medianoche de Caracas devolvemos solo la fecha: mostrar "12:00 AM"
 * parece un dato roto.
 */
export function formatUltimaActualizacion(date: Date = new Date()): string {
  const dtf = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Caracas",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const fecha = dtf.format(date); // DD/MM/YYYY

  const timeParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Caracas",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);

  const hour = timeParts.find((p) => p.type === "hour")?.value ?? "";
  const minute = timeParts.find((p) => p.type === "minute")?.value ?? "";
  const dayPeriod = timeParts.find((p) => p.type === "dayPeriod")?.value ?? "";

  if (hour === "12" && minute === "00" && dayPeriod.toUpperCase() === "AM") {
    return fecha;
  }

  return `${fecha} - ${hour}:${minute} ${dayPeriod}`;
}

export function usdToBs(usd: number, tasa: number): number {
  return Math.round(usd * tasa * 100) / 100;
}
