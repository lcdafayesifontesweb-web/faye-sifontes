import Link from "next/link";
import {
  Briefcase,
  Building2,
  Wifi,
  Zap,
  Tv,
  Video,
  Users,
  ArrowRight,
} from "lucide-react";

const accountingFeatures = [
  "NIIF PYME y declaraciones fiscales",
  "IVA, ISLR e IGTF",
  "Libros legales actualizados",
  "Obligaciones IVSS, INCES, BANAVIH, MINTRA",
];

const coworkingFeatures = [
  { icon: Wifi, label: "Wi-Fi de alta velocidad" },
  { icon: Zap, label: "Planta Eléctrica 24/7" },
  { icon: Tv, label: "Smart TV" },
  { icon: Video, label: "Zoom Ilimitado" },
  { icon: Users, label: "Espacio de reuniones" },
];

export default function ServicesSection() {
  return (
    <section id="servicios" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tarjeta 1 — Servicio Contable */}
          <article className="group relative bg-white rounded-3xl border border-brand-gray/30 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-br from-brand-dark to-brand-800 p-8 text-white">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-5">
                <Briefcase className="w-7 h-7 text-brand-blue" />
              </div>
              <h3 className="text-2xl font-bold leading-snug mb-2">
                Asesoría y Gestión Contable Integral
              </h3>
              <p className="text-white/75 text-sm">
                Tranquilidad operativa y fiscal para tu empresa
              </p>
            </div>

            <div className="p-8 flex flex-col flex-1">
              <p className="text-brand-dark/70 text-sm leading-relaxed mb-6">
                Procesamiento de información financiera bajo NIIF PYME,
                declaraciones fiscales (IVA, ISLR, IGTF), actualización de
                libros legales y supervisión de obligaciones ante entes
                paraestatales (IVSS, INCES, BANAVIH, MINTRA). Un servicio
                diseñado para la tranquilidad operativa y fiscal de tu empresa.
              </p>

              <ul className="space-y-2.5 mb-8">
                {accountingFeatures.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-sm text-brand-dark/80"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/servicios/contabilidad"
                className="mt-auto inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white font-semibold transition-all group-hover:scale-[1.01]"
              >
                Ver más detalles
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </article>

          {/* Tarjeta 2 — Coworking */}
          <article className="group relative bg-white rounded-3xl border border-brand-gray/30 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-br from-brand-blue to-brand-700 p-8 text-white">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-5">
                <Building2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold leading-snug mb-2">
                Alquiler de Salas Tecnológicas y Coworking
              </h3>
              <p className="text-white/75 text-sm">
                Espacios modernos en Puerto La Cruz
              </p>
            </div>

            <div className="p-8 flex flex-col flex-1">
              <p className="text-brand-dark/70 text-sm leading-relaxed mb-6">
                Espacios modernos y climatizados en Puerto La Cruz, ideales para
                reuniones, capacitaciones y trabajo corporativo.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {coworkingFeatures.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 border border-brand-blue/10"
                  >
                    <div className="w-9 h-9 rounded-lg bg-brand-blue/10 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-brand-blue" />
                    </div>
                    <span className="text-sm font-medium text-brand-dark/80">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/servicios/coworking"
                className="mt-auto inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white font-semibold transition-all group-hover:scale-[1.01]"
              >
                Ver más detalles
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
