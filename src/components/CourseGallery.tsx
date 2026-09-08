"use client";

import { useCallback, useEffect, useId, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { GalleryImage } from "@/sanity/queries";

interface CourseGalleryProps {
  images: GalleryImage[];
  courseTitle: string;
}

/** Patrones Bento para variedad visual según cantidad de fotos */
const BENTO_SPANS = [
  "md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-0",
  "min-h-[220px]",
  "min-h-[220px]",
  "md:col-span-2 min-h-[220px]",
  "min-h-[220px]",
  "min-h-[220px]",
];

export default function CourseGallery({
  images,
  courseTitle,
}: CourseGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <section className="py-12 lg:py-16 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-dark mb-2">
            Galería del curso
          </h2>
          <p className="text-brand-dark/60 text-sm sm:text-base">
            Conoce el ambiente y la experiencia de{" "}
            <span className="font-medium text-brand-dark">{courseTitle}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr lg:auto-rows-[200px]">
          {images.map((image, index) => (
            <button
              type="button"
              key={image.url}
              onClick={() => setOpenIndex(index)}
              aria-label={`Ampliar foto: ${image.alt}`}
              className={`relative overflow-hidden rounded-xl shadow-md group cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ${
                BENTO_SPANS[index % BENTO_SPANS.length]
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </button>
          ))}
        </div>
      </div>

      {openIndex !== null && (
        <GalleryLightbox
          images={images}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </section>
  );
}

function GalleryLightbox({
  images,
  index,
  onIndexChange,
  onClose,
}: {
  images: GalleryImage[];
  index: number;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}) {
  const titleId = useId();
  const image = images[index];
  const hasMultiple = images.length > 1;

  const goPrev = useCallback(() => {
    onIndexChange((index - 1 + images.length) % images.length);
  }, [index, images.length, onIndexChange]);

  const goNext = useCallback(() => {
    onIndexChange((index + 1) % images.length);
  }, [index, images.length, onIndexChange]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && images.length > 1) goPrev();
      if (e.key === "ArrowRight" && images.length > 1) goNext();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, goPrev, goNext, images.length]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        aria-label="Cerrar la foto"
        onClick={onClose}
      />

      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 border border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900 transition-colors shadow-sm"
        aria-label="Cerrar"
      >
        <X className="w-5 h-5" />
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 sm:left-6 z-20 p-2 sm:p-3 rounded-full bg-white/90 border border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900 transition-colors shadow-sm"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 sm:right-6 z-20 p-2 sm:p-3 rounded-full bg-white/90 border border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900 transition-colors shadow-sm"
            aria-label="Foto siguiente"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      <figure className="relative z-10 flex flex-col items-center gap-3 max-w-5xl w-full pointer-events-none">
        <div className="relative w-full h-[70vh] sm:h-[78vh]">
          <Image
            src={image.fullUrl}
            alt={image.alt}
            fill
            // `contain` muestra la foto completa; `cover` la recortaria de nuevo.
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
          />
        </div>
        <figcaption
          id={titleId}
          className="text-center text-sm text-white/80 px-4"
        >
          {image.alt}
          {hasMultiple && (
            <span className="block text-xs text-white/50 mt-1">
              {index + 1} de {images.length}
            </span>
          )}
        </figcaption>
      </figure>
    </div>
  );
}
