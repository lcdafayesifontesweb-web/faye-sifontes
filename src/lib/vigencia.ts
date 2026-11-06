/** Lo que muestra un curso cuya próxima edición todavía no tiene fecha. */
export const TEXTO_SIN_FECHA = "Por confirmar";

/**
 * Si el curso ya comenzó.
 *
 * Una edición que arrancó deja de ser vendible: mantenerla con fecha dejaba
 * la página anunciando un contador vencido y cobrando cupos de un curso que
 * ya ocurrió. Al pasar la fecha el curso vuelve a «Por confirmar» hasta que
 * le carguen la siguiente.
 *
 * Se calcula al renderizar, no se escribe en Sanity: así no hace falta una
 * tarea programada, no se pierde el texto original de la fecha, y basta con
 * cargar una fecha nueva para que el curso vuelva a estar activo.
 */
export function cursoYaComenzo(startsAt?: string | null): boolean {
  if (!startsAt) return false;

  const inicio = new Date(startsAt).getTime();
  if (!Number.isFinite(inicio)) return false;

  return inicio <= Date.now();
}
