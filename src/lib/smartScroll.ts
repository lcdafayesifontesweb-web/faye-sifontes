/** Scroll suave a secciones del Home sin inyectar `#` en la URL */

export const PENDING_SCROLL_KEY = "ss-pending-scroll-section";

export function scrollToSection(sectionId: string): boolean {
  if (typeof document === "undefined") return false;
  const el = document.getElementById(sectionId);
  if (!el) return false;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  return true;
}

export function queueSectionScroll(sectionId: string): void {
  try {
    sessionStorage.setItem(PENDING_SCROLL_KEY, sectionId);
  } catch {
    /* private mode / SSR */
  }
}

export function consumeQueuedSectionScroll(): string | null {
  try {
    const id = sessionStorage.getItem(PENDING_SCROLL_KEY);
    if (id) sessionStorage.removeItem(PENDING_SCROLL_KEY);
    return id;
  } catch {
    return null;
  }
}

/** Quita un hash residual de la barra de direcciones sin recargar */
export function stripHashFromUrl(): void {
  if (typeof window === "undefined") return;
  if (!window.location.hash) return;
  const clean = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", clean);
}

export function isHomePath(pathname: string | null): boolean {
  return pathname === "/";
}
