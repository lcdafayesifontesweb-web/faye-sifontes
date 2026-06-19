import { BRAND } from "@/data/coursesData";

export function getWhatsAppUrl(message: string): string {
  const digits = BRAND.phone.replace(/\D/g, "");
  const phone = digits.startsWith("58") ? digits : `58${digits.replace(/^0/, "")}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
