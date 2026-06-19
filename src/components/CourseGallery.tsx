import Image from "next/image";

interface CourseGalleryProps {
  images: { url: string; alt: string }[];
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
            <div
              key={image.url}
              className={`relative overflow-hidden rounded-xl shadow-md group ${
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
