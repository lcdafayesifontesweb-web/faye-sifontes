import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChart3,
  FileText,
  ShieldCheck,
  CircleUser,
  Clock,
  Check,
  ArrowRight,
  CalendarCheck,
} from "lucide-react";
import ServiceCta from "@/components/services/ServiceCta";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Asesoría y Gestión Contable en Venezuela | SS Consultores",
  description:
    "Asesoría y gestión contable integral bajo NIIF PYME en Venezuela. Consulta de 45 minutos por $60. Declaraciones IVA, ISLR, IGTF, libros legales, IVSS, INCES, BANAVIH y MINTRA. SS Consultores — Puerto La Cruz.",
  keywords: [
    "asesoría contable Venezuela",
    "gestión contable NIIF PYME",
    "declaraciones IVA ISLR",
    "consulta contable",
    "aseguramiento de ingresos",
    "contador Puerto La Cruz",
    "SS Consultores",
  ],
};

const CONSULTA_WHATSAPP = getWhatsAppUrl(
  "Hola, quiero agendar una consulta de 45 minutos de asesoría contable. El costo es de $60 USD."
);

const highlights = [
  "Contabilidad y Estados Financieros NIIF",
  "Ingeniería Fiscal y Cumplimiento Tributario",
  "Supervisión Contable-Laboral Paralela",
  "Aseguramiento de ingresos sobre personas naturales",
];

const pillars = [
  {
    icon: BarChart3,
    title: "Contabilidad y Estados Financieros NIIF",
    items: [
      "Registros diarios y libros obligatorios (Diario, Mayor e Inventario).",
      "Emisión de Estados Financieros mensuales o trimestrales para la toma de decisiones directivas.",
    ],
  },
  {
    icon: FileText,
    title: "Ingeniería Fiscal y Cumplimiento Tributario",
    items: [
      "Gestión y presentación de IVA, ISLR, IGTF, retenciones y archivos de carga (TXT / XML).",
      "Liquidación y gestión de tasas e impuestos municipales (Alcaldía).",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Supervisión Contable-Laboral Paralela",
    items: [
      "Conciliación y soporte en contribuciones parafiscales: IVSS, INCES, BANAVIH y MINTRA.",
      "Plantillas y macros optimizadas para el control de nómina.",
    ],
  },
  {
    icon: CircleUser,
    title: "Aseguramiento de ingresos sobre personas naturales",
    items: [
      "Aseguramiento de ingresos para personas naturales.",
      "Balances personales para respaldo patrimonial.",
    ],
  },
];

const additionalServices = [
  "Preparación de Estados Financieros con informe",
  "Actualización de libros legales",
];

const clientResponsibilities = [
  "Conciliaciones bancarias internas",
  "Elaboración física de Libros de Compra y Venta",
  "Inventario físico",
];

export default function ContabilidadPage() {
  return (
    <>
      <div className="bg-white border-b border-brand-gray/20">
        <Breadcrumbs
          items={[
            { label: "Inicio", href: "/" },
            { label: "Servicios", sectionId: "servicios" },
            { label: "Asesoría Contable" },
          ]}
        />
      </div>

      <section className="relative bg-gradient-to-br from-brand-dark via-brand-800 to-brand-dark text-white overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-10 bg-[url('/bg-contabilidad.jpg')]"
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7">
              <span className="inline-block text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
                Servicios Corporativos
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
                Asesoría y Gestión Contable Integral
              </h1>
              <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-8">
                Procesamiento de información financiera bajo NIIF PYME y
                desarrollo integral fiscal para empresas que necesitan orden,
                cumplimiento y criterio profesional.
              </p>
              <ul className="space-y-2.5 mb-8">
                {highlights.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-white/90">
                    <Check
                      className="w-4 h-4 text-brand-300 shrink-0"
                      aria-hidden="true"
                    />
                    <span className="text-sm sm:text-base">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href={CONSULTA_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-blue hover:bg-brand-600 text-white font-semibold shadow-lg transition-all"
                >
                  Agendar consulta
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#pilares"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/25 text-white hover:bg-white/10 font-semibold transition-all"
                >
                  Ver pilares
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <article className="rounded-3xl bg-white text-brand-dark p-7 sm:p-8 shadow-2xl border border-white/10">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center">
                    <CalendarCheck
                      className="w-7 h-7 text-brand-blue"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue bg-brand-blue/10 px-3 py-1 rounded-full">
                    Nuevo
                  </span>
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  Agendar consulta de 45 minutos
                </h2>
                <p className="text-brand-dark/65 leading-relaxed mb-6">
                  Sesión personalizada para revisar tu caso contable o fiscal y
                  definir el siguiente paso con criterio profesional.
                </p>
                <div className="flex items-end justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
                  <div>
                    <p className="text-sm text-brand-dark/50 mb-1">Inversión</p>
                    <p className="text-4xl font-extrabold text-brand-dark">
                      $60
                      <span className="ml-1 text-base font-semibold text-brand-dark/50">
                        USD
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-brand-dark/70">
                    <Clock className="w-4 h-4 text-brand-blue" aria-hidden="true" />
                    45 minutos
                  </div>
                </div>
                <Link
                  href={CONSULTA_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-brand-blue hover:bg-brand-600 text-white font-semibold shadow-md transition-all"
                >
                  Agendar por WhatsApp
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="pilares" className="py-16 lg:py-20 bg-white scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-4">
              Cuatro pilares del servicio
            </h2>
            <p className="text-brand-dark/60 max-w-2xl mx-auto">
              La asesoría se organiza en cuatro frentes para cubrir la empresa y
              a las personas naturales con el mismo criterio profesional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map(({ icon: Icon, title, items }, index) => (
              <article
                key={title}
                className="group p-8 rounded-3xl bg-slate-50 border border-brand-gray/20 hover:border-brand-blue/30 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center group-hover:bg-brand-blue group-hover:scale-110 transition-all">
                    <Icon className="w-7 h-7 text-brand-blue group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue">
                    Pilar {index + 1}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-brand-dark mb-4">
                  {title}
                </h3>
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check
                        className="w-4 h-4 text-brand-blue shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span className="text-sm text-brand-dark/65 leading-relaxed">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-4">
              Aspectos Legales y Operativos
            </h2>
            <p className="text-brand-dark/60 max-w-2xl mx-auto">
              Transparencia sobre alcance del servicio y responsabilidades
              compartidas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article className="rounded-3xl bg-white border border-slate-100 shadow-sm p-8">
              <h3 className="text-xl font-bold text-brand-dark mb-5">
                Servicios Adicionales
              </h3>
              <ul className="space-y-3">
                {additionalServices.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check
                      className="w-4 h-4 text-brand-blue shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-brand-dark/70 leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-3xl bg-white border border-slate-100 shadow-sm p-8">
              <h3 className="text-xl font-bold text-brand-dark mb-5">
                Responsabilidades del Cliente
              </h3>
              <ul className="space-y-3">
                {clientResponsibilities.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check
                      className="w-4 h-4 text-brand-blue shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-brand-dark/70 leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <ServiceCta
        message="Hola, me interesa solicitar una cotización personalizada para el servicio de Asesoría y Gestión Contable Integral."
        label="Solicitar una cotización personalizada"
      />
    </>
  );
}
