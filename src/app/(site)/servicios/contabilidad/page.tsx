import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  BarChart3,
  FileText,
  ShieldCheck,
  Landmark,
  ArrowLeft,
} from "lucide-react";
import Accordion from "@/components/services/Accordion";
import ServiceCta from "@/components/services/ServiceCta";

export const metadata: Metadata = {
  title: "Asesoría y Gestión Contable en Venezuela | SS Consultores",
  description:
    "Asesoría y gestión contable integral bajo NIIF PYME en Venezuela. Declaraciones IVA, ISLR, IGTF, libros legales, IVSS, INCES, BANAVIH y MINTRA. SS Consultores — Puerto La Cruz.",
  keywords: [
    "asesoría contable Venezuela",
    "gestión contable NIIF PYME",
    "declaraciones IVA ISLR",
    "contador Puerto La Cruz",
    "SS Consultores",
  ],
};

const services = [
  {
    icon: BookOpen,
    title: "Contabilidad Básica",
    description:
      "Registro diario, libros contables obligatorios (Diario, Mayor e Inventario).",
  },
  {
    icon: BarChart3,
    title: "Estados Financieros",
    description:
      "Suministro para análisis y uso interno de la junta directiva.",
  },
  {
    icon: FileText,
    title: "Declaraciones Fiscales",
    description: "IVA, ISLR, IGTF, archivos digitales (TXT / XML).",
  },
  {
    icon: ShieldCheck,
    title: "Supervisión y Soporte",
    description:
      "Cumplimiento con IVSS, INCES, BANAVIH y MINTRA.",
  },
  {
    icon: Landmark,
    title: "Trámites Municipales",
    description: "Relación de ingresos para Alcaldía.",
  },
];

const accordionItems = [
  {
    id: "adicionales",
    title: "Servicios Adicionales",
    content: (
      <ul className="space-y-2 list-disc list-inside">
        <li>Preparación de Estados Financieros con informe</li>
        <li>Balances Personales</li>
        <li>Actualización de libros legales</li>
        <li>Macros de Excel para nómina</li>
      </ul>
    ),
  },
  {
    id: "cliente",
    title: "Responsabilidades del Cliente",
    content: (
      <ul className="space-y-2 list-disc list-inside">
        <li>Conciliaciones bancarias internas</li>
        <li>Elaboración física de Libros de Compra y Venta</li>
        <li>Inventario físico</li>
      </ul>
    ),
  },
];

export default function ContabilidadPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-dark via-brand-800 to-brand-dark text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <Link
            href="/#servicios"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a servicios
          </Link>
          <div className="max-w-3xl">
            <span className="inline-block text-sm font-semibold text-brand-blue uppercase tracking-wider mb-4">
              Servicios Corporativos
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
              Asesoría y Gestión Contable Integral
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed">
              Procesamiento de información financiera bajo NIIF PYME y
              desarrollo integral fiscal.
            </p>
          </div>
        </div>
      </section>

      {/* Servicios incluidos */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-4">
              Servicios Incluidos
            </h2>
            <p className="text-brand-dark/60 max-w-2xl mx-auto">
              Solución contable y fiscal completa para empresas que buscan
              cumplimiento, orden y tranquilidad operativa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="p-6 rounded-2xl border border-brand-gray/30 bg-slate-50 hover:shadow-lg hover:border-brand-blue/20 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-brand-blue" />
                </div>
                <h3 className="font-bold text-brand-dark mb-2">{title}</h3>
                <p className="text-sm text-brand-dark/70 leading-relaxed">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ / Aspectos legales */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-4">
              Aspectos Legales y Operativos
            </h2>
            <p className="text-brand-dark/60">
              Transparencia sobre alcance del servicio y responsabilidades
              compartidas.
            </p>
          </div>
          <Accordion items={accordionItems} />
        </div>
      </section>

      <ServiceCta
        message="Hola, me interesa solicitar una cotización personalizada para el servicio de Asesoría y Gestión Contable Integral."
        label="Solicitar una cotización personalizada"
      />
    </>
  );
}
