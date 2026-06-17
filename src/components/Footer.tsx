import Link from "next/link";
import { MapPin, Phone, Mail, Instagram, Award } from "lucide-react";
import { BRAND } from "@/data/coursesData";

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <h3 className="text-xl font-bold mb-3">{BRAND.company}</h3>
            <p className="text-brand-200 text-sm mb-4">{BRAND.handle}</p>
            <p className="text-brand-100 text-sm leading-relaxed">
              Formación profesional premium para contadores, abogados y
              empresarios. Impulsamos tu carrera con conocimiento práctico y
              certificación oficial.
            </p>
            <div className="flex items-center gap-2 mt-4 text-accent-400">
              <Award className="w-4 h-4" />
              <span className="text-xs font-medium">{BRAND.alliance}</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-brand-100 mb-4 uppercase text-xs tracking-wider">
              Directora
            </h4>
            <p className="text-sm text-white font-medium">{BRAND.director}</p>
            <p className="text-brand-200 text-sm mt-2">
              Consultora empresarial y formadora con trayectoria en el sector
              petrolero y tributario venezolano.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-brand-100 mb-4 uppercase text-xs tracking-wider">
              Contacto
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-brand-100">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-accent-400" />
                <span>{BRAND.address}</span>
              </li>
              <li>
                <a
                  href={`tel:${BRAND.phone}`}
                  className="flex items-center gap-2.5 text-brand-100 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0 text-accent-400" />
                  {BRAND.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${BRAND.email}`}
                  className="flex items-center gap-2.5 text-brand-100 hover:text-white transition-colors break-all"
                >
                  <Mail className="w-4 h-4 shrink-0 text-accent-400" />
                  {BRAND.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-brand-100">
                <Instagram className="w-4 h-4 shrink-0 text-accent-400" />
                {BRAND.handle}
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-brand-100 mb-4 uppercase text-xs tracking-wider">
              Enlaces
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#categorias" className="text-brand-200 hover:text-white transition-colors">
                  Áreas académicas
                </Link>
              </li>
              <li>
                <Link href="/#cursos" className="text-brand-200 hover:text-white transition-colors">
                  Cursos destacados
                </Link>
              </li>
              <li>
                <Link href="/#instructores" className="text-brand-200 hover:text-white transition-colors">
                  Instructores
                </Link>
              </li>
              <li>
                <Link href="/#testimonios" className="text-brand-200 hover:text-white transition-colors">
                  Testimonios
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-brand-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-brand-300">
          <p>© {new Date().getFullYear()} {BRAND.company}. Todos los derechos reservados.</p>
          <p className="text-brand-400 text-xs">{BRAND.alliance}</p>
        </div>
      </div>
    </footer>
  );
}
