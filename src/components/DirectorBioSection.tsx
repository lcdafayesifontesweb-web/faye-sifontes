import Image from "next/image";
import { Check } from "lucide-react";

const CREDENTIALS = [
  "Especialista en Gerencia Tributaria Integral",
  "Diplomado Tributario -LUZ",
  "Diplomado NIIF -LUZ",
  "Coach Internacional con PNL -ACP COACHING UC",
  "Speaker Internacional -Gustavo Henao",
  "Conferencista de Alta Influencia -Néstor Fernández",
  "Certificada en formateo de franquicias. Bogotá",
  "Profesor UGMA",
  "Creadora de @ssconsultores.ve",
];

export default function DirectorBioSection() {
  return (
    <section className="w-full py-12 md:py-16 bg-slate-50/50 border-b border-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:col-span-7 order-2 lg:order-1">
          <h2 className="font-bold text-3xl md:text-4xl text-brand-dark">
            Lcda. Faye Sifontes Noriega
          </h2>
          <p className="font-semibold text-lg md:text-xl text-brand-blue mt-2 mb-4 tracking-wide">
            CONTADOR PÚBLICO INDEPENDIENTE
          </p>

          <ul className="space-y-1.5 text-sm md:text-base text-gray-700">
            {CREDENTIALS.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <Check
                  className="w-4 h-4 text-brand-blue shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 pl-4 border-l-4 border-brand-blue bg-brand-blue/5 rounded-r-xl py-3 pr-4">
            <p className="font-bold text-brand-dark text-base md:text-lg">
              18 años de experiencia en el área tributaria
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 order-1 lg:order-2">
          <div className="relative w-full max-w-sm sm:max-w-md mx-auto flex justify-center items-center overflow-hidden">
            <div className="relative w-full isolate overflow-hidden">
              <div
                className="absolute inset-0 z-0 bg-gradient-to-tr from-brand-blue to-brand-dark rounded-3xl opacity-15 scale-105 rotate-1 transition-transform duration-500 hover:rotate-0"
                aria-hidden="true"
              />
              <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 sm:border-8 border-white bg-slate-100 z-10">
                <Image
                  src="/Faye Sifontes.jpeg"
                  alt="Lcda. Faye Sifontes Noriega — Contador Público Independiente"
                  fill
                  priority
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 384px, 448px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
