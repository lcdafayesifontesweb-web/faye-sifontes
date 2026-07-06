"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

const serviceLinks = [
  { href: "/servicios/contabilidad", label: "Asesoría Contable" },
  { href: "/servicios/coworking", label: "Salas de Coworking" },
];

const navLinks = [
  { href: "/#categorias", label: "Áreas" },
  { href: "/#cursos", label: "Cursos" },
  { href: "/#instructores", label: "Instructores" },
  { href: "/#testimonios", label: "Testimonios" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setServicesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-gray/30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 lg:h-24">
          <Link href="/" className="flex items-center group shrink-0">
            <Image
              src="/logofaye.png"
              alt="Lcda. Faye Sifontes — SS Consultores"
              width={180}
              height={60}
              className="h-12 md:h-14 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-brand-dark/70 hover:text-brand-blue transition-colors"
            >
              Inicio
            </Link>

            <Link
              href="/quienes-somos"
              className="text-sm font-medium text-brand-dark/70 hover:text-brand-blue transition-colors"
            >
              Quiénes Somos
            </Link>

            <Link
              href="/#categorias"
              className="text-sm font-medium text-brand-dark/70 hover:text-brand-blue transition-colors"
            >
              Áreas
            </Link>

            {/* Dropdown Servicios — desktop */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button
                type="button"
                onClick={() => setServicesOpen((v) => !v)}
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-dark/70 hover:text-brand-blue transition-colors"
                aria-expanded={servicesOpen}
                aria-haspopup="true"
              >
                Servicios
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    servicesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {servicesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2">
                  <div className="w-56 rounded-xl bg-white border border-brand-gray/30 shadow-xl py-2 overflow-hidden animate-fade-in-up">
                    {serviceLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block px-4 py-3 text-sm text-brand-dark/80 hover:bg-brand-50 hover:text-brand-blue transition-colors"
                        onClick={() => setServicesOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                    <div className="border-t border-brand-gray/20 mt-1 pt-1">
                      <Link
                        href="/#servicios"
                        className="block px-4 py-3 text-xs text-brand-gray hover:text-brand-blue transition-colors"
                        onClick={() => setServicesOpen(false)}
                      >
                        Ver todos los servicios
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {navLinks.slice(1).map((link) => (
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
          <nav className="md:hidden pb-4 flex flex-col gap-1">
            <Link
              href="/"
              className="px-3 py-2 rounded-lg text-brand-dark/70 hover:bg-brand-50 hover:text-brand-blue font-medium"
              onClick={() => setOpen(false)}
            >
              Inicio
            </Link>

            <Link
              href="/quienes-somos"
              className="px-3 py-2 rounded-lg text-brand-dark/70 hover:bg-brand-50 hover:text-brand-blue font-medium"
              onClick={() => setOpen(false)}
            >
              Quiénes Somos
            </Link>

            <Link
              href="/#categorias"
              className="px-3 py-2 rounded-lg text-brand-dark/70 hover:bg-brand-50 hover:text-brand-blue font-medium"
              onClick={() => setOpen(false)}
            >
              Áreas
            </Link>

            {/* Servicios — mobile accordion */}
            <div>
              <button
                type="button"
                onClick={() => setMobileServicesOpen((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-brand-dark/70 hover:bg-brand-50 font-medium"
              >
                Servicios
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    mobileServicesOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {mobileServicesOpen && (
                <div className="ml-4 mt-1 flex flex-col gap-1 border-l-2 border-brand-blue/20 pl-3">
                  {serviceLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-3 py-2 rounded-lg text-sm text-brand-dark/70 hover:bg-brand-50 hover:text-brand-blue"
                      onClick={() => {
                        setOpen(false);
                        setMobileServicesOpen(false);
                      }}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href="/#servicios"
                    className="px-3 py-2 rounded-lg text-xs text-brand-gray hover:text-brand-blue"
                    onClick={() => setOpen(false)}
                  >
                    Ver todos
                  </Link>
                </div>
              )}
            </div>

            {navLinks.slice(1).map((link) => (
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
