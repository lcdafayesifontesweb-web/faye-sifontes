/**
 * Envío de eventos al Meta Pixel.
 *
 * El snippet del pixel se carga con `afterInteractive`, así que `window.fbq`
 * todavía no existe cuando montan los componentes de la página. Un
 * `window.fbq?.(...)` directo al montar se perdía en silencio, sin error y sin
 * evento: por eso los que no nacen de un clic se encolan hasta que cargue.
 */

const INTERVALO_MS = 200;
/** ~5 s. Si el pixel no cargó para entonces, lo bloqueó el navegador. */
const INTENTOS_MAX = 25;

export function trackPixel(
  event: string,
  params?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;

  if (window.fbq) {
    window.fbq("track", event, params);
    return;
  }

  let intentos = 0;
  const id = window.setInterval(() => {
    if (window.fbq) {
      window.clearInterval(id);
      window.fbq("track", event, params);
      return;
    }
    if (++intentos >= INTENTOS_MAX) window.clearInterval(id);
  }, INTERVALO_MS);
}
