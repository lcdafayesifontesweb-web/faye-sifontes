"use client";

import type { MouseEvent, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  isHomePath,
  queueSectionScroll,
  scrollToSection,
} from "@/lib/smartScroll";

interface SmartNavLinkProps {
  sectionId: string;
  children: ReactNode;
  className?: string;
  /** Query al llegar al home, ej. "?categoria=contabilidad-tributos" o "categoria=…" */
  homeQuery?: string;
  onNavigate?: () => void;
}

function buildHomeHref(homeQuery?: string): string {
  if (!homeQuery) return "/";
  return homeQuery.startsWith("?") ? `/${homeQuery}` : `/?${homeQuery}`;
}

/**
 * Navegación a secciones del Home con smooth scroll y sin `#` en la URL.
 * Desde otras rutas: va a `/` y scrollea al montar (via HomeScrollHandler).
 */
export default function SmartNavLink({
  sectionId,
  children,
  className,
  homeQuery,
  onNavigate,
}: SmartNavLinkProps) {
  const router = useRouter();
  const pathname = usePathname();
  const href = buildHomeHref(homeQuery);

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onNavigate?.();

    if (isHomePath(pathname)) {
      if (homeQuery) {
        router.push(href, { scroll: false });
      }
      requestAnimationFrame(() => {
        scrollToSection(sectionId);
      });
      return;
    }

    queueSectionScroll(sectionId);
    router.push(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
