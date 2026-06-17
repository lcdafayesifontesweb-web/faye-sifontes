"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Star,
  ArrowRight,
} from "lucide-react";
import type { HomeCourse } from "@/sanity/queries";

interface FeaturedCoursesProps {
  courses: HomeCourse[];
}

export default function FeaturedCourses({ courses }: FeaturedCoursesProps) {
  const [current, setCurrent] = useState(0);

  if (courses.length === 0) {
    return (
      <section id="cursos" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500">
          No hay cursos destacados disponibles en este momento.
        </div>
      </section>
    );
  }

  const prev = () => setCurrent((c) => (c === 0 ? courses.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === courses.length - 1 ? 0 : c + 1));

  return (
    <section id="cursos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="inline-block text-sm font-semibold text-accent-600 uppercase tracking-wider mb-2">
              Próximas fechas
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Cursos Destacados
            </h2>
          </div>
          {courses.length > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prev}
                className="p-2.5 rounded-full border border-slate-200 hover:bg-brand-50 hover:border-brand-300 transition-colors"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </button>
              <button
                type="button"
                onClick={next}
                className="p-2.5 rounded-full border border-slate-200 hover:bg-brand-50 hover:border-brand-300 transition-colors"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          )}
        </div>

        <div className="lg:hidden">
          {courses.map((course, idx) => {
            if (idx !== current) return null;
            return <CourseCard key={course.id} course={course} />;
          })}
          {courses.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {courses.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrent(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    idx === current ? "bg-brand-600" : "bg-slate-200"
                  }`}
                  aria-label={`Ir al curso ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:grid lg:grid-cols-2 gap-8">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CourseCard({ course }: { course: HomeCourse }) {
  return (
    <article className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300">
      <div
        className={`h-48 bg-gradient-to-br ${course.imageGradient} relative p-6 flex flex-col justify-between overflow-hidden`}
      >
        {course.coverImageUrl && (
          <Image
            src={course.coverImageUrl}
            alt={course.title}
            fill
            className="object-cover opacity-30"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        )}
        <div className="relative flex items-center justify-between">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-semibold">
            <Star className="w-3 h-3 fill-accent-400 text-accent-400" />
            Destacado
          </span>
          <span className="text-white/90 text-sm font-bold">
            ${course.price} {course.currency}
          </span>
        </div>
        <h3 className="relative text-xl font-bold text-white leading-snug pr-4">
          {course.title}
        </h3>
      </div>

      <div className="p-6">
        <p className="text-slate-600 text-sm leading-relaxed mb-5">
          {course.shortDescription}
        </p>

        <ul className="space-y-2.5 mb-6">
          <li className="flex items-center gap-2.5 text-sm text-slate-700">
            <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
            {course.date}
          </li>
          <li className="flex items-center gap-2.5 text-sm text-slate-700">
            <Clock className="w-4 h-4 text-brand-600 shrink-0" />
            {course.schedule}
          </li>
          <li className="flex items-center gap-2.5 text-sm text-slate-700">
            <MapPin className="w-4 h-4 text-brand-600 shrink-0" />
            {course.modalityLabel}
          </li>
        </ul>

        {course.instructorName && (
          <p className="text-xs text-slate-500 mb-5">
            Facilitador:{" "}
            <span className="font-semibold text-slate-700">
              {course.instructorName}
            </span>
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {course.features.slice(0, 3).map((f) => (
            <span
              key={f}
              className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium"
            >
              {f}
            </span>
          ))}
        </div>

        <Link
          href={`/curso/${course.slug}`}
          className="inline-flex items-center gap-2 w-full justify-center px-6 py-3.5 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-semibold shadow-md hover:shadow-lg transition-all group-hover:scale-[1.02]"
        >
          Reserva tu lugar
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}
