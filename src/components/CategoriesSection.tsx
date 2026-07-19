import Link from "next/link";
import {
  Calculator,
  BarChart3,
  Scale,
  Users,
  Monitor,
  ArrowRight,
} from "lucide-react";
import type { Category, CourseArea } from "@/data/coursesData";

const iconMap = {
  Calculator,
  BarChart3,
  Scale,
  Users,
  Monitor,
};

interface CategoriesSectionProps {
  categories: Category[];
  activeCategory?: CourseArea | null;
}

export default function CategoriesSection({
  categories,
  activeCategory = null,
}: CategoriesSectionProps) {
  return (
    <section id="categorias" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Áreas Académicas
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Explora nuestras 5 áreas de especialización diseñadas para
            profesionales que buscan excelencia.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => {
            const Icon = iconMap[cat.icon as keyof typeof iconMap];
            const isActive = activeCategory === cat.id;

            return (
              <Link
                key={cat.id}
                href={`/?categoria=${cat.id}#cursos`}
                scroll={false}
                className={`group relative bg-white rounded-2xl p-6 shadow-sm border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  isActive
                    ? "border-brand-500 ring-2 ring-brand-200 shadow-md"
                    : "border-slate-100 hover:border-brand-200"
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-700 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">
                  {cat.description}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      isActive
                        ? "text-white bg-brand-600"
                        : "text-brand-600 bg-brand-50"
                    }`}
                  >
                    {cat.courseCount} curso{cat.courseCount !== 1 ? "s" : ""}
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
