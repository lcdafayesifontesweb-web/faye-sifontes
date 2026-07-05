import { Users, BookOpen, MapPin } from "lucide-react";
import SearchBar from "./SearchBar";
import type { SearchCourseItem } from "@/sanity/queries";

interface HeroSectionProps {
  courseCount: number;
  searchCourses: SearchCourseItem[];
}

export default function HeroSection({
  courseCount,
  searchCourses,
}: HeroSectionProps) {
  const stats = [
    {
      icon: BookOpen,
      value: courseCount > 0 ? `${courseCount}` : "—",
      label: "Cursos activos",
    },
    { icon: Users, value: "500+", label: "Profesionales formados" },
    { icon: MapPin, value: "PLC", label: "Puerto La Cruz" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand-700 to-brand-dark text-white">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center opacity-10 bg-[url('/bg-home.jpg')]"
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center max-w-4xl mx-auto mb-10 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            Formación profesional que{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-brand-blue">
              impulsa tu carrera
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Cursos presenciales y online en contabilidad, tributos, derecho laboral
            y liderazgo. Aprende con expertos del sector administrativo, tributario, petrolero y legal.
          </p>
        </div>

        <SearchBar courses={searchCourses} />

        <div className="mt-14 grid grid-cols-3 gap-6 max-w-lg mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-5 h-5 text-brand-blue mx-auto mb-2" />
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-white/70 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
