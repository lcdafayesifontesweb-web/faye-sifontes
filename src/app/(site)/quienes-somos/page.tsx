import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Rocket,
  Target,
  Zap,
  Users,
  HeartHandshake,
  Award,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import SmartNavLink from "@/components/SmartNavLink";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Quiénes Somos | SS Consultores — Consultoría Integral Venezuela",
  description:
    "SS Consultores: firma independiente de consultoría integral en contabilidad, tributos y derecho. Misión, visión y valores. Capacitación profesional en Venezuela.",
  keywords: [
    "SS Consultores",
    "quiénes somos",
    "consultoría contable Venezuela",
    "asesoría tributaria",
    "capacitación profesional",
    "Puerto La Cruz",
  ],
};

const VALUES = [
  {
    title: "Honestidad",
    text: "integridad, transparencia y ética para construir relaciones sólidas basadas en la confianza y el respaldo.",
    icon: ShieldCheck,
  },
  {
    title: "Espíritu emprendedor",
    text: "superación, decisión, innovación, audacia, autonomía, iniciativa, creatividad.",
    icon: Rocket,
  },
  {
    title: "Compromiso",
    text: "trabajamos con minuciosidad y detalle en toda la cadena de valor como eje de excelencia, desarrollo y crecimiento.",
    icon: Target,
  },
  {
    title: "Eficiencia",
    text: "productividad, innovación, agilidad, rapidez y eficacia.",
    icon: Zap,
  },
  {
    title: "Trabajo en Equipo",
    text: "se empodera al personal en toma de decisiones importantes maximizando su rendimiento.",
    icon: Users,
  },
  {
    title: "Actitud de servicio",
    text: "cuidar los intereses de nuestros clientes, con la amabilidad y la disposición a servicio.",
    icon: HeartHandshake,
  },
  {
    title: "Lealtad",
    text: "sinceridad y respeto.",
    icon: Award,
  },
];

export default function QuienesSomosPage() {
  const whatsappHref = getWhatsAppUrl(
    "Hola SS Consultores, me gustaría recibir información sobre su asesoría integral."
  );

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Inicio", href: "/" },
          { label: "Quiénes Somos" },
        ]}
      />

      {/* Hero institucional */}
      <section className="bg-gradient-to-b from-slate-50 to-white py-16 md:py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-bold text-brand-dark text-4xl md:text-5xl">
            Quiénes Somos
          </h1>

          <div className="mt-6 max-w-4xl mx-auto space-y-6 text-gray-700 text-lg leading-relaxed text-left sm:text-center">
            <p>
              Una firma independiente de consultoría integral especializada en las
              áreas contable, tributaria y jurídica.
            </p>
            <p>
              Desarrollamos procesos para orientar, planificar, y organizar la
              información Legal, Fiscal y Financiera de la empresa, marcando un
              ritmo en las prioridades del negocio para su crecimiento y
              sostenibilidad en el tiempo.
            </p>
            <p>
              A través de nuestra división de capacitación, unimos a un equipo de
              profesionales y facilitadores expertos con un solo propósito:
              brindar herramientas prácticas y actualizadas del área, para el
              blindaje y crecimiento de profesionales y empresas en Venezuela.
            </p>
          </div>
        </div>
      </section>

      {/* Misión y Visión */}
      <section className="py-16 md:py-20 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto px-4">
          <article className="bg-white rounded-xl p-8 shadow-lg border border-slate-100 border-t-4 border-t-brand-blue">
            <h2 className="font-bold text-2xl text-brand-dark mb-4">MISIÓN</h2>
            <p className="text-gray-700 leading-relaxed">
              Tenemos como misión brindar un servicio a través de la excelencia,
              desarrollando una estructura organizacional que satisfaga los
              requerimientos del cliente, con la profesionalización y el potencial
              de nuestros colaboradores.
            </p>
          </article>

          <article className="bg-white rounded-xl p-8 shadow-lg border border-slate-100 border-t-4 border-t-brand-dark">
            <h2 className="font-bold text-2xl text-brand-blue mb-4">VISIÓN</h2>
            <p className="text-gray-700 leading-relaxed">
              Tenemos como visión y objetivo ofrecer una excelente asesoría
              tributaria y financiera al momento de adecuarse a{" "}
              <strong>los cambios actuales</strong>, permitiendo a nuestros
              clientes la perdurabilidad en el tiempo y la expansión en el
              mercado.
            </p>
          </article>
        </div>
      </section>

      {/* Valores corporativos */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-center font-bold text-3xl text-brand-dark mb-10">
            Nuestros Valores
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
            {VALUES.map(({ title, text, icon: Icon }) => (
              <article
                key={title}
                className="bg-white p-6 rounded-xl border border-gray-100 shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-blue/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-blue" aria-hidden="true" />
                </div>
                <h3 className="font-bold text-brand-dark mb-2">{title}</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 md:py-20 bg-brand-dark text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 leading-snug">
            ¿Listo para impulsar el crecimiento de tu empresa o carrera
            profesional?
          </h2>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <SmartNavLink
              sectionId="cursos"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-blue hover:bg-brand-600 text-white font-bold shadow-lg transition-all"
            >
              Ver Catálogo de Cursos
            </SmartNavLink>
            <Link
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-full sm:w-auto px-8 py-3.5 rounded-xl border-2 border-white/30 hover:border-white hover:bg-white/10 text-white font-bold transition-all"
            >
              Contactar Asesoría
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
