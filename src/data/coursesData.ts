export type CourseArea =
  | "contabilidad-tributos"
  | "administracion-costos"
  | "marco-legal-laboral"
  | "desarrollo-personal-liderazgo"
  | "herramientas-tecnicas";

export interface Category {
  id: CourseArea;
  name: string;
  description: string;
  icon: string;
  courseCount: number;
  color: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
}

export const BRAND = {
  company: "SS Consultores",
  handle: "@ssconsultores.ve",
  director: "Lcda. Faye Carolina Sifontes Noriega",
  address: "CC Centinela PB local 2. Puerto La Cruz, Anzoátegui, Venezuela.",
  phone: "0424-8979101",
  email: "sifontessifontesyasiocados@gmail.com",
  pagoMovil: {
    banco: "Banesco",
    telefono: "0424-8979101",
    cedula: "V-12.345.678",
  },
};

export const categories: Category[] = [
  {
    id: "contabilidad-tributos",
    name: "Contabilidad y Tributos",
    description: "Nómina, retenciones, conciliaciones y normativa fiscal actualizada.",
    icon: "Calculator",
    courseCount: 0,
    color: "from-blue-600 to-blue-800",
  },
  {
    id: "administracion-costos",
    name: "Administración y Costos",
    description: "Control presupuestario, costos industriales y gestión empresarial.",
    icon: "BarChart3",
    courseCount: 0,
    color: "from-emerald-600 to-teal-700",
  },
  {
    id: "marco-legal-laboral",
    name: "Marco Legal y Laboral",
    description: "Derecho laboral, procesal y contingencias legales empresariales.",
    icon: "Scale",
    courseCount: 0,
    color: "from-indigo-600 to-indigo-800",
  },
  {
    id: "desarrollo-personal-liderazgo",
    name: "Desarrollo Personal y Liderazgo",
    description: "Oratoria, comunicación y habilidades directivas de alto impacto.",
    icon: "Users",
    courseCount: 0,
    color: "from-violet-600 to-purple-700",
  },
  {
    id: "herramientas-tecnicas",
    name: "Herramientas Técnicas",
    description: "Excel, plantillas y herramientas digitales para la productividad.",
    icon: "Monitor",
    courseCount: 0,
    color: "from-cyan-600 to-blue-600",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "María González",
    role: "Contadora Senior",
    company: "PDVSA Contratista",
    quote:
      "El taller de nómina petrolera cambió completamente mi forma de gestionar incidencias. Las plantillas en Excel son oro puro.",
    rating: 5,
  },
  {
    id: "t2",
    name: "Luis Herrera",
    role: "Gerente de RRHH",
    company: "Empresa Petrolera",
    quote:
      "El curso de derecho procesal laboral con el Abog. Martínez es imprescindible. Casos reales y conocimiento de primera mano.",
    rating: 5,
  },
  {
    id: "t3",
    name: "Carmen Ruiz",
    role: "Emprendedora",
    company: "Consultora Independiente",
    quote:
      "SS Consultores combina formación de calidad con certificación avalada. Mis clientes confían más en mis servicios.",
    rating: 5,
  },
];
