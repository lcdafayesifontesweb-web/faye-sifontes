"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, GraduationCap } from "lucide-react";

const navLinks = [
  { href: "/#categorias", label: "Áreas" },
  { href: "/#cursos", label: "Cursos" },
  { href: "/#instructores", label: "Instructores" },
  { href: "/#testimonios", label: "Testimonios" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-brand-900 leading-tight block">
                SS Consultores
              </span>
              <span className="text-xs text-slate-500 hidden sm:block">@ssconsultores.ve</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-brand-700 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#cursos"
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Ver Cursos
            </Link>
          </nav>

          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
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
                className="px-3 py-2 rounded-lg text-slate-600 hover:bg-brand-50 hover:text-brand-700 font-medium"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/#cursos"
              className="mt-2 text-center px-5 py-2.5 rounded-full bg-accent-500 text-white font-semibold"
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
