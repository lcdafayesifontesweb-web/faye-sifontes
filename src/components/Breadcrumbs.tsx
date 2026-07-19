"use client";

import Link from "next/link";
import SmartNavLink from "./SmartNavLink";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  /** Si apunta a una sección del Home, usa scroll inteligente sin `#` */
  sectionId?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3"
    >
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-brand-gray">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {index > 0 && (
              <span
                className="text-brand-gray/50 select-none"
                aria-hidden="true"
              >
                /
              </span>
            )}
            {item.sectionId ? (
              <SmartNavLink
                sectionId={item.sectionId}
                className="hover:text-brand-blue transition-colors"
              >
                {item.label}
              </SmartNavLink>
            ) : item.href ? (
              <Link
                href={item.href}
                className="hover:text-brand-blue transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-brand-dark/50">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
