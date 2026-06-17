import Image from "next/image";
import type { HomeInstructor } from "@/sanity/queries";

interface InstructorsSectionProps {
  instructors: HomeInstructor[];
}

export default function InstructorsSection({
  instructors,
}: InstructorsSectionProps) {
  return (
    <section id="instructores" className="py-20 bg-slate-50">
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
              <article key={instructor.id} className="text-center group">
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
                <p className="text-sm text-slate-500 leading-relaxed mb-4 px-2">
                  {instructor.bio}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
