/**
 * Nombres de los facilitadores de un curso.
 *
 * Los cursos creados antes del campo `instructors` guardan un único
 * facilitador en `instructor`. Mientras queden documentos sin migrar hay que
 * leer ambos, prefiriendo siempre el campo nuevo.
 */
export function resolveInstructorNames(
  names?: (string | null | undefined)[] | null,
  legacyName?: string | null
): string[] {
  const list = (names ?? [])
    .map((name) => name?.trim())
    .filter((name): name is string => Boolean(name));

  if (list.length > 0) return list;

  const legacy = legacyName?.trim();
  return legacy ? [legacy] : [];
}
