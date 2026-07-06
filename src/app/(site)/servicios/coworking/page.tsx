import type { Metadata } from "next";
import Image from "next/image";
import {
  Wifi,
  Zap,
  Users,
  Tv,
  Video,
} from "lucide-react";
import ServiceCta from "@/components/services/ServiceCta";
import Breadcrumbs from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Alquiler de Salas Tecnológicas y Coworking en Puerto La Cruz",
  description:
    "Alquila salas tecnológicas y espacios de coworking en Puerto La Cruz. Wi-Fi de alta velocidad, planta eléctrica 24/7, Smart TV, Zoom ilimitado. Ideal para reuniones y capacitaciones.",
  keywords: [
    "coworking Puerto La Cruz",
    "salas tecnológicas Anzoátegui",
    "alquiler oficina Puerto La Cruz",
    "espacio reuniones",
    "SS Consultores",
  ],
};

const benefits = [
  {
    icon: Wifi,
    title: "Wi-Fi de alta velocidad",
    description: "Conexión estable para trabajo remoto y videoconferencias.",
  },
  {
    icon: Zap,
    title: "Planta Eléctrica 24/7",
    description: "Continuidad operativa sin interrupciones.",
  },
  {
    icon: Users,
    title: "Espacio de reuniones y mesas ejecutivas",
    description: "Ambientes profesionales para equipos y clientes.",
  },
  {
    icon: Tv,
    title: "Smart TV y soporte audiovisual",
    description: "Presentaciones y capacitaciones con equipamiento moderno.",
  },
  {
    icon: Video,
    title: "Conexión para ZOOM Ilimitado",
    description: "Sesiones virtuales sin límites de tiempo.",
  },
];

const galleryImages = [
  {
    src: "/coworking-1.jpg",
    alt: "Sala de reuniones SS Consultores",
    span: "sm:col-span-2 lg:col-span-2",
    tall: true,
  },
  {
    src: "/coworking-2.jpg",
    alt: "Espacio de coworking",
    span: "",
    tall: false,
  },
  {
    src: "/coworking-3.jpg",
    alt: "Instalaciones climatizadas",
    span: "",
    tall: false,
  },
  {
    src: "/coworking-4.jpg",
    alt: "Área de trabajo colaborativo SS Consultores",
    span: "",
    tall: false,
  },
  {
    src: "/coworking-5.jpg",
    alt: "Espacio profesional para reuniones y capacitaciones",
    span: "",
    tall: false,
  },
];

export default function CoworkingPage() {
  return (
    <>
      <div className="bg-white border-b border-brand-gray/20">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Servicios", href: "/#servicios" },
            { label: "Alquiler de Coworking" },
          ]}
        />
      </div>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-blue via-brand-600 to-brand-dark text-white overflow-hidden min-h-[420px] flex items-center">
        {/* Textura de fondo — overlay 10% */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-10 bg-[url('/bg-coworking.jpg')]"
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
          <div className="max-w-3xl">
            <span className="inline-block text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
              Puerto La Cruz, Anzoátegui
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
              Espacios que inspiran productividad
            </h1>
            <p className="text-lg sm:text-xl text-white/85 leading-relaxed">
              Salas tecnológicas y coworking en Puerto La Cruz, ideales para
              reuniones y capacitaciones.
            </p>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-4">
              Todo lo que necesitas para trabajar
            </h2>
            <p className="text-brand-dark/60 max-w-2xl mx-auto">
              Instalaciones modernas, climatizadas y equipadas para el éxito de
              tu equipo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="group p-8 rounded-3xl bg-slate-50 border border-brand-gray/20 hover:border-brand-blue/30 hover:shadow-xl transition-all text-center"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-5 group-hover:bg-brand-blue group-hover:scale-110 transition-all">
                  <Icon className="w-8 h-8 text-brand-blue group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-brand-dark mb-2">{title}</h3>
                <p className="text-sm text-brand-dark/65 leading-relaxed">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Galería Bento */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-4">
              Conoce nuestras instalaciones
            </h2>
            <p className="text-brand-dark/60">
              Espacios diseñados para reuniones, capacitaciones y trabajo
              colaborativo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {galleryImages.map(({ src, alt, span, tall }) => (
              <div
                key={src}
                className={`group relative rounded-xl overflow-hidden bg-brand-dark/5 shadow-md min-h-[220px] ${
                  tall ? "sm:min-h-[260px] lg:min-h-[300px]" : ""
                } transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:z-10 ${span}`}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                  sizes={
                    span
                      ? "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw"
                      : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  }
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/40 to-transparent pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServiceCta
        message="Hola, me gustaría reservar un espacio de Coworking o Sala Tecnológica en Puerto La Cruz."
        label="Reserva tu espacio hoy mismo"
      />
    </>
  );
}
