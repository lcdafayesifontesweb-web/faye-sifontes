/**
 * Normaliza características/temario desde Sanity:
 * - array de strings (formato legado)
 * - string multilínea (formato nuevo, pegado desde Excel/Word)
 */
export function normalizeFeaturesList(
  features: string | string[] | null | undefined
): string[] {
  if (Array.isArray(features)) {
    return features
      .map((item) => String(item).replace(/^[•\-\*\s]+/, "").trim())
      .filter(Boolean);
  }

  if (typeof features === "string") {
    return features
      .split(/\r?\n/)
      .map((item) => item.replace(/^[•\-\*\s]+/, "").trim())
      .filter(Boolean);
  }

  return [];
}
