import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const services = [
  {
    href: "/servicios/contabilidad",
    image: "/contabilidad.jpg",
    imageAlt: "Asesoría y gestión contable integral",
    title: "Asesoría y Gestión Contable Integral",
    description:
      "Procesamiento de información financiera bajo NIIF PYME y desarrollo integral fiscal para la tranquilidad y cumplimiento de tu empresa.",
    label: "Ver más detalles",
  },
  {
    href: "/servicios/coworking",
    image: "/coworkhome.jpg",
    imageAlt: "Salas tecnológicas y coworking en Puerto La Cruz",
    title: "Salas Tecnológicas y Coworking",
    description:
      "Espacios modernos y climatizados en Puerto La Cruz, diseñados para inspirar productividad en tus reuniones, capacitaciones y trabajo corporativo.",
    label: "Ver instalaciones",
  },
];

export default function ServicesSection() {
  return (
    <section id="servicios" className="bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-dark mb-4">
            Nuestros Servicios
          </h2>
          <p className="text-brand-dark/60 max-w-2xl mx-auto text-lg">
            Soluciones corporativas y espacios profesionales para impulsar tu
            empresa en Puerto La Cruz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <article
              key={service.href}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:border-brand-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                <Image
                  src={service.image}
                  alt={service.imageAlt}
                  fill
                  className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-brand-dark mb-3 group-hover:text-brand-700 transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm sm:text-base text-brand-dark/65 leading-relaxed mb-6">
                  {service.description}
                </p>
                <Link
                  href={service.href}
                  className="mt-auto inline-flex items-center justify-center gap-2 self-start px-6 py-3 rounded-xl bg-brand-blue hover:bg-brand-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  {service.label}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
