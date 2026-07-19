import { Star, Quote } from "lucide-react";
import { testimonials } from "@/data/coursesData";

export default function SocialProofSection() {
  return (
    <section id="testimonios" className="py-20 bg-white scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-dark mb-4">
            Lo que dicen nuestros alumnos
          </h2>
          <p className="text-brand-dark/60 text-lg">
            Profesionales que ya transformaron su carrera con SS Consultores.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <blockquote
              key={t.id}
              className="relative bg-slate-50 rounded-2xl p-7 border border-slate-100 hover:shadow-lg transition-shadow"
            >
              <Quote className="w-8 h-8 text-brand-200 absolute top-5 right-5" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-brand-blue text-brand-blue" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <footer>
                <p className="font-bold text-slate-900">{t.name}</p>
                <p className="text-sm text-slate-500">
                  {t.role} — {t.company}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
