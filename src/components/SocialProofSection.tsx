import { Award, Shield, Star, Quote } from "lucide-react";
import { BRAND, testimonials } from "@/data/coursesData";

export default function SocialProofSection() {
  return (
    <section id="testimonios" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Alliance banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-800 to-brand-900 p-8 sm:p-12 mb-16">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-10 -top-10 w-64 h-64 bg-accent-400 rounded-full blur-3xl" />
          </div>
          <div className="relative flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Shield className="w-10 h-10 text-accent-400" />
            </div>
            <div className="text-center lg:text-left flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                Alianza Académica con EDUCA
              </h2>
              <p className="text-brand-100 text-lg leading-relaxed max-w-2xl">
                Todos nuestros certificados están avalados por{" "}
                <strong className="text-white">EDUCA</strong> ante el{" "}
                <strong className="text-white">MPPE</strong> (Ministerio del
                Poder Popular para la Educación), garantizando validez oficial
                y reconocimiento profesional en Venezuela.
              </p>
            </div>
            <div className="flex-shrink-0 text-center">
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-accent-500 text-white font-bold shadow-lg">
                <Award className="w-5 h-5" />
                Certificación Oficial
              </div>
              <p className="text-brand-200 text-xs mt-2">{BRAND.alliance}</p>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Lo que dicen nuestros alumnos
          </h2>
          <p className="text-slate-600 text-lg">
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
                  <Star key={i} className="w-4 h-4 fill-accent-400 text-accent-400" />
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
