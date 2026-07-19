"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Star,
  ArrowRight,
} from "lucide-react";
import type { HomeCourse } from "@/sanity/queries";
import { categories, type CourseArea } from "@/data/coursesData";
import CertificationBadge from "./CertificationBadge";

const PAGE_SIZE = 6;

interface FeaturedCoursesProps {
  courses: HomeCourse[];
}

export default function FeaturedCourses({ courses }: FeaturedCoursesProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoriaParam = searchParams.get("categoria");

  const activeCategory = useMemo(() => {
    if (!categoriaParam) return null;
    const valid = categories.some((c) => c.id === categoriaParam);
    return valid ? (categoriaParam as CourseArea) : null;
  }, [categoriaParam]);

  const filtered = useMemo(() => {
    if (!activeCategory) return courses;
    return courses.filter((c) => c.category === activeCategory);
  }, [courses, activeCategory]);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCategory]);

  useEffect(() => {
    if (!categoriaParam) return;
    const el = document.getElementById("cursos");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [categoriaParam]);

  const visibleCourses = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;
  const activeLabel = categories.find((c) => c.id === activeCategory)?.name;

  const clearFilter = () => {
    router.push(`${pathname}#cursos`, { scroll: false });
  };

  const selectCategory = (id: CourseArea | null) => {
    if (!id) {
      clearFilter();
      return;
    }
    router.push(`${pathname}?categoria=${id}#cursos`, { scroll: false });
  };

  if (courses.length === 0) {
    return (
      <section id="cursos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500">
          No hay cursos publicados en este momento. Vuelve pronto.
        </div>
      </section>
    );
  }

  return (
    <section id="cursos" className="py-20 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 mb-10">
          <div>
            <span className="inline-block text-sm font-semibold text-brand-blue uppercase tracking-wider mb-2">
              Catálogo completo
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Nuestros Cursos
            </h2>
            <p className="mt-2 text-slate-600">
              {activeCategory
                ? `${filtered.length} curso${filtered.length !== 1 ? "s" : ""} en ${activeLabel}`
                : `${courses.length} cursos disponibles`}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterPill
              label="Todos"
              active={!activeCategory}
              onClick={() => selectCategory(null)}
            />
            {categories.map((cat) => (
              <FilterPill
                key={cat.id}
                label={cat.name}
                active={activeCategory === cat.id}
                onClick={() => selectCategory(cat.id)}
              />
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="mb-4">No hay cursos en esta categoría por ahora.</p>
            <button
              type="button"
              onClick={clearFilter}
              className="text-brand-700 font-semibold hover:underline"
            >
              Ver todos los cursos
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center gap-3">
              <p className="text-sm text-slate-500">
                Mostrando {visibleCourses.length} de {filtered.length}
              </p>
              {hasMore ? (
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((n) =>
                      Math.min(n + PAGE_SIZE, filtered.length)
                    )
                  }
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border-2 border-brand-600 text-brand-700 font-semibold hover:bg-brand-50 transition-colors"
                >
                  Mostrar más cursos
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                filtered.length > PAGE_SIZE && (
                  <p className="text-sm font-medium text-slate-400">
                    No hay más cursos
                  </p>
                )
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
        active
          ? "bg-brand-blue text-white shadow-sm"
          : "bg-slate-100 text-slate-700 hover:bg-brand-50 hover:text-brand-700"
      }`}
    >
      {label}
    </button>
  );
}

function CourseCard({ course }: { course: HomeCourse }) {
  return (
    <article className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
      <div
        className={`h-44 bg-gradient-to-br ${course.imageGradient} relative p-5 flex flex-col justify-between overflow-hidden`}
      >
        {course.coverImageUrl && (
          <Image
            src={course.coverImageUrl}
            alt={course.title}
            fill
            className="object-cover opacity-30"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        )}
        <div className="relative flex items-center justify-between">
          {course.featured ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-semibold">
              <Star className="w-3 h-3 fill-brand-blue text-brand-blue" />
              Destacado
            </span>
          ) : (
            <span />
          )}
          <span className="text-white/90 text-sm font-bold">
            ${course.price} {course.currency}
          </span>
        </div>
        <h3 className="relative text-lg font-bold text-white leading-snug pr-2 line-clamp-3">
          {course.title}
        </h3>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {course.shortDescription}
        </p>

        <ul className="space-y-2 mb-4">
          <li className="flex items-center gap-2 text-sm text-slate-700">
            <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
            <span className="truncate">{course.date}</span>
          </li>
          <li className="flex items-center gap-2 text-sm text-slate-700">
            <Clock className="w-4 h-4 text-brand-600 shrink-0" />
            <span className="truncate">{course.schedule}</span>
          </li>
          <li className="flex items-center gap-2 text-sm text-slate-700">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
            <span className="truncate">{course.modalityLabel}</span>
          </li>
        </ul>

        {course.instructorName && (
          <p className="text-xs text-slate-500 mb-3">
            Facilitador:{" "}
            <span className="font-semibold text-slate-700">
              {course.instructorName}
            </span>
          </p>
        )}

        {course.certifiedBy && (
          <div className="mb-4">
            <CertificationBadge certifiedBy={course.certifiedBy} variant="card" />
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          {course.features.slice(0, 2).map((f) => (
            <span
              key={f}
              className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium line-clamp-1 max-w-full"
            >
              {f}
            </span>
          ))}
        </div>

        <Link
          href={`/curso/${course.slug}`}
          className="mt-auto inline-flex items-center gap-2 w-full justify-center px-5 py-3 rounded-xl bg-brand-blue hover:bg-brand-600 text-white font-semibold shadow-md hover:shadow-lg transition-all"
        >
          Reserva tu lugar
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
