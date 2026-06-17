import { Award, Users, BookOpen } from "lucide-react";
import SearchBar from "./SearchBar";

const stats = [
  { icon: BookOpen, value: "6+", label: "Cursos activos" },
  { icon: Users, value: "500+", label: "Profesionales formados" },
  { icon: Award, value: "EDUCA", label: "Aval MPPE" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-900 text-white">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent-400 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center max-w-4xl mx-auto mb-10 animate-fade-in-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-sm font-medium text-brand-100 mb-6">
            <Award className="w-4 h-4 text-accent-400" />
            Certificados avalados por EDUCA ante el MPPE
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            Formación profesional que{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">
              impulsa tu carrera
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-brand-100 max-w-2xl mx-auto leading-relaxed">
            Cursos presenciales y online en contabilidad, tributos, derecho laboral
            y liderazgo. Aprende con expertos del sector petrolero y legal venezolano.
          </p>
        </div>

        <SearchBar />

        <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-5 h-5 text-accent-400 mx-auto mb-2" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-brand-200 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
