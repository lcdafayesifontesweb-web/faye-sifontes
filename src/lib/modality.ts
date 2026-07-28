export type PurchaseModality = "online" | "presencial";

export type CourseModalityFlags = {
  esSoloOnline: boolean;
  esSoloPresencial: boolean;
  esMixto: boolean;
  defaultPurchase: PurchaseModality;
};

function normalizeModalityText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Clasifica la modalidad del curso (valor Sanity o etiqueta legible)
 * para decidir qué precios y opciones de pago mostrar.
 */
export function classifyCourseModality(
  modality: string | undefined | null
): CourseModalityFlags {
  const raw = normalizeModalityText(modality ?? "");

  // Valores exactos del schema Sanity
  if (raw === "zoom") {
    return {
      esSoloOnline: true,
      esSoloPresencial: false,
      esMixto: false,
      defaultPurchase: "online",
    };
  }
  if (raw === "presencial") {
    return {
      esSoloOnline: false,
      esSoloPresencial: true,
      esMixto: false,
      defaultPurchase: "presencial",
    };
  }
  if (raw === "mixto") {
    return {
      esSoloOnline: false,
      esSoloPresencial: false,
      esMixto: true,
      defaultPurchase: "online",
    };
  }

  const hasPresencial = /\bpresencial\b/.test(raw);
  const hasOnline =
    /\bonline\b/.test(raw) ||
    /\bzoom\b/.test(raw) ||
    /\ben vivo\b/.test(raw);
  const hasMixto = /\bmixto\b/.test(raw);

  const esMixto =
    hasMixto || (hasPresencial && hasOnline);
  const esSoloOnline = !esMixto && hasOnline && !hasPresencial;
  const esSoloPresencial = !esMixto && hasPresencial && !hasOnline;

  if (esSoloOnline) {
    return {
      esSoloOnline: true,
      esSoloPresencial: false,
      esMixto: false,
      defaultPurchase: "online",
    };
  }
  if (esSoloPresencial) {
    return {
      esSoloOnline: false,
      esSoloPresencial: true,
      esMixto: false,
      defaultPurchase: "presencial",
    };
  }

  // Mixto o desconocido → permitir ambas opciones
  return {
    esSoloOnline: false,
    esSoloPresencial: false,
    esMixto: true,
    defaultPurchase: "online",
  };
}
