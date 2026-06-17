"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/#categorias", label: "Áreas" },
  { href: "/#cursos", label: "Cursos" },
  { href: "/#instructores", label: "Instructores" },
  { href: "/#testimonios", label: "Testimonios" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-gray/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <Link href="/" className="flex items-center group shrink-0">
            <Image
              src="/logo-sifontes.jpg"
              alt="Lcda. Faye Sifontes — SS Consultores"
              width={150}
              height={48}
              className="h-10 sm:h-12 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-brand-dark/70 hover:text-brand-blue transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#cursos"
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-brand-blue hover:bg-brand-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Ver Cursos
            </Link>
          </nav>

          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-brand-dark hover:bg-brand-50"
            onClick={() => setOpen(!open)}
            aria-label="Menú"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {open && (
          <nav className="md:hidden pb-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded-lg text-brand-dark/70 hover:bg-brand-50 hover:text-brand-blue font-medium"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#cursos"
              className="mt-2 text-center px-5 py-2.5 rounded-full bg-brand-blue text-white font-semibold"
              onClick={() => setOpen(false)}
            >
              Ver Cursos
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
