"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  consumeQueuedSectionScroll,
  isHomePath,
  scrollToSection,
  stripHashFromUrl,
} from "@/lib/smartScroll";

/**
 * En el Home: ejecuta scrolls pendientes (navegación desde otras páginas)
 * y limpia cualquier `#` residual en la URL.
 */
export default function HomeScrollHandler() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isHomePath(pathname)) return;

    // Limpiar hash legado (enlaces viejos / favoritos)
    const hashId = window.location.hash.replace(/^#/, "");
    if (hashId) {
      stripHashFromUrl();
      const t = window.setTimeout(() => scrollToSection(hashId), 80);
      return () => window.clearTimeout(t);
    }

    const pending = consumeQueuedSectionScroll();
    if (!pending) return;

    const t = window.setTimeout(() => scrollToSection(pending), 120);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
