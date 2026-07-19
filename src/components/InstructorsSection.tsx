"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import type { HomeInstructor } from "@/sanity/queries";

interface InstructorsSectionProps {
  instructors: HomeInstructor[];
}

export default function InstructorsSection({
  instructors,
}: InstructorsSectionProps) {
  const [selected, setSelected] = useState<HomeInstructor | null>(null);

  return (
    <section id="instructores" className="py-20 bg-slate-50 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Nuestros Facilitadores
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Aprende de profesionales con experiencia real en tribunales,
            empresas petroleras y consultoría empresarial.
          </p>
        </div>

        {instructors.length === 0 ? (
          <p className="text-center text-slate-500">
            No hay instructores registrados aún.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {instructors.map((instructor) => (
              <InstructorCard
                key={instructor.id}
                instructor={instructor}
                onOpen={() => setSelected(instructor)}
              />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <InstructorModal
          instructor={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}

function InstructorCard({
  instructor,
  onOpen,
}: {
  instructor: HomeInstructor;
  onOpen: () => void;
}) {
  return (
    <article className="text-center group flex flex-col h-full">
      <button
        type="button"
        onClick={onOpen}
        className="w-full text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 rounded-2xl"
        aria-label={`Ver perfil completo de ${instructor.name}`}
      >
        {instructor.photoUrl ? (
          <div className="relative w-28 h-28 mx-auto rounded-full overflow-hidden shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 mb-5 ring-4 ring-white">
            <Image
              src={instructor.photoUrl}
              alt={instructor.name}
              fill
              className="object-cover"
              sizes="112px"
            />
          </div>
        ) : (
          <div
            className={`w-28 h-28 mx-auto rounded-full bg-gradient-to-br ${instructor.avatarColor} flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300 mb-5 ring-4 ring-white`}
          >
            <span className="text-3xl font-bold text-white">
              {instructor.avatarInitials}
            </span>
          </div>
        )}
        <h3 className="font-bold text-slate-900 text-lg mb-1">
          {instructor.name}
        </h3>
        <p className="text-sm text-brand-600 font-medium mb-3">
          {instructor.role}
        </p>
      </button>

      <p className="line-clamp-4 text-sm text-gray-600 leading-relaxed text-left px-1 mb-3 flex-1">
        {instructor.bio}
      </p>

      <button
        type="button"
        onClick={onOpen}
        className="text-sm font-semibold text-brand-700 hover:text-brand-900 transition-colors mt-auto"
      >
        Ver perfil completo →
      </button>
    </article>
  );
}

function InstructorModal({
  instructor,
  onClose,
}: {
  instructor: HomeInstructor;
  onClose: () => void;
}) {
  const titleId = useId();
  const photoSrc = instructor.photoUrlLarge ?? instructor.photoUrl;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in-up"
        aria-label="Cerrar perfil"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl animate-fade-in-up">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center text-center mb-6">
            {photoSrc ? (
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden shadow-xl ring-4 ring-brand-50 mb-5">
                <Image
                  src={photoSrc}
                  alt={instructor.name}
                  fill
                  className="object-cover"
                  sizes="176px"
                />
              </div>
            ) : (
              <div
                className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br ${instructor.avatarColor} flex items-center justify-center shadow-xl ring-4 ring-brand-50 mb-5`}
              >
                <span className="text-4xl font-bold text-white">
                  {instructor.avatarInitials}
                </span>
              </div>
            )}

            <h3
              id={titleId}
              className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight"
            >
              {instructor.name}
            </h3>
            <p className="mt-2 text-base font-semibold text-brand-600">
              {instructor.role}
            </p>
          </div>

          <div className="text-left">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Biografía
            </h4>
            <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line">
              {instructor.bio}
            </p>
          </div>

          {instructor.courses.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100 text-left">
              <h4 className="text-sm font-bold text-slate-900 mb-3">
                Cursos impartidos:
              </h4>
              <ul className="space-y-2">
                {instructor.courses.map((course) => (
                  <li key={course.slug}>
                    <Link
                      href={`/curso/${course.slug}`}
                      onClick={onClose}
                      className="text-sm text-brand-700 hover:text-brand-900 font-medium hover:underline"
                    >
                      {course.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
