import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ServicesSection() {
  return (
    <section id="servicios" className="bg-white scroll-mt-24">
      {/* Encabezado de sección */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16 text-center">
        <span className="inline-block text-sm font-semibold text-brand-blue uppercase tracking-wider mb-2">
          Más allá de la formación
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-brand-dark mb-4">
          Nuestros Servicios
        </h2>
        <p className="text-brand-dark/60 max-w-2xl mx-auto text-lg">
          Soluciones corporativas y espacios profesionales para impulsar tu
          empresa en Puerto La Cruz.
        </p>
      </div>

      {/* Banner 1 — Asesoría Contable */}
      <article className="relative w-full min-h-[500px] lg:min-h-[600px] flex items-center bg-cover bg-center bg-[url('/contabilidad.jpg')]">
        {/* Gradiente: móvil cubre más; desktop oscurece la izquierda */}
        <div
          className="absolute inset-0 z-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/70 lg:from-gray-900/90 lg:via-gray-900/60 lg:to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 flex justify-center lg:justify-start">
          <div className="max-w-xl lg:max-w-2xl text-center lg:text-left lg:w-[55%]">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
              Asesoría y Gestión Contable Integral
            </h3>
            <p className="text-base sm:text-lg text-white/85 leading-relaxed mb-8">
              Procesamiento de información financiera bajo NIIF PYME y
              desarrollo integral fiscal para la tranquilidad y cumplimiento de
              tu empresa.
            </p>
            <Link
              href="/servicios/contabilidad"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-blue hover:bg-brand-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Ver más detalles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>

      {/* Banner 2 — Coworking */}
      <article className="relative w-full min-h-[500px] lg:min-h-[600px] flex items-center bg-cover bg-center bg-[url('/coworkhome.jpg')]">
        {/* Gradiente: móvil cubre más; desktop oscurece la derecha */}
        <div
          className="absolute inset-0 z-0 bg-gradient-to-l from-gray-900/90 via-gray-900/70 to-gray-900/70 lg:from-gray-900/90 lg:via-gray-900/60 lg:to-transparent"
          aria-hidden="true"
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 flex justify-center lg:justify-end">
          <div className="max-w-xl lg:max-w-2xl text-center lg:text-right lg:w-[55%]">
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
              Salas Tecnológicas y Coworking
            </h3>
            <p className="text-base sm:text-lg text-white/85 leading-relaxed mb-8">
              Espacios modernos y climatizados en Puerto La Cruz, diseñados para
              inspirar productividad en tus reuniones, capacitaciones y trabajo
              corporativo.
            </p>
            <Link
              href="/servicios/coworking"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-brand-blue hover:bg-brand-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Ver instalaciones
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </article>
    </section>
  );
}
