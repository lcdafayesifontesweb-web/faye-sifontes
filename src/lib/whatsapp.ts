import { BRAND } from "@/data/coursesData";

/** Móviles VE: 0412 / 0414 / 0416 / 0424 / 0426 + 7 dígitos, con o sin guiones/espacios */
export const VE_MOBILE_PHONE_REGEX =
  /\b0(412|414|416|424|426)[\s.-]?(\d{3})[\s.-]?(\d{4})\b/g;

export function digitsToWaMePhone(digits: string): string {
  const clean = digits.replace(/\D/g, "");
  if (clean.startsWith("58")) return clean;
  if (clean.startsWith("0")) return `58${clean.slice(1)}`;
  return `58${clean}`;
}

/** Convierte un número VE (ej. 0424-8979101) a URL wa.me */
export function phoneToWhatsAppUrl(
  rawPhone: string,
  message?: string
): string {
  const phone = digitsToWaMePhone(rawPhone);
  const base = `https://wa.me/${phone}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function getWhatsAppUrl(message: string): string {
  return phoneToWhatsAppUrl(BRAND.phone, message);
}

export const DEFAULT_WHATSAPP_FLOAT_URL = phoneToWhatsAppUrl(
  BRAND.phone,
  "Hola, tengo una consulta sobre sus cursos"
);
