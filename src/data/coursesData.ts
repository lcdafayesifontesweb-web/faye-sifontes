export type CourseArea =
  | "contabilidad-tributos"
  | "administracion-costos"
  | "marco-legal-laboral"
  | "desarrollo-personal-liderazgo"
  | "herramientas-tecnicas";

export type CourseModality = "presencial" | "online" | "hibrido";

export interface Instructor {
  id: string;
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  avatarInitials: string;
  avatarColor: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  area: CourseArea;
  shortDescription: string;
  fullDescription: string;
  date: string;
  schedule: string;
  modality: CourseModality;
  modalityLabel: string;
  instructorId: string;
  features: string[];
  price: number;
  currency: string;
  featured: boolean;
  imageGradient: string;
  tags: string[];
  spotsAvailable: number;
  certifiedBy?: string;
}

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

export const instructors: Instructor[] = [
  {
    id: "omar-martinez",
    name: "Abog. Omar Martínez",
    title: "Ex Juez del Trabajo",
    bio: "Especialista en derecho procesal laboral con más de 20 años de experiencia en tribunales y litigios laborales de alto impacto.",
    specialties: ["Derecho Laboral", "Procesal Laboral", "Litigios"],
    avatarInitials: "OM",
    avatarColor: "from-blue-700 to-blue-900",
  },
  {
    id: "faye-sifontes",
    name: "Lcda. Faye Carolina Sifontes",
    title: "Directora — SS Consultores",
    bio: "Contadora pública y consultora empresarial. Experta en nómina petrolera, tributos y gestión administrativa para empresas venezolanas.",
    specialties: ["Nómina Petrolera", "Contabilidad", "Tributos"],
    avatarInitials: "FS",
    avatarColor: "from-amber-500 to-orange-600",
  },
  {
    id: "carlos-mendoza",
    name: "Lic. Carlos Mendoza",
    title: "Especialista en Costos y Finanzas",
    bio: "Consultor en administración de costos y control presupuestario para el sector industrial y petrolero.",
    specialties: ["Costos", "Presupuestos", "Finanzas"],
    avatarInitials: "CM",
    avatarColor: "from-emerald-600 to-teal-700",
  },
  {
    id: "ana-rivas",
    name: "Lic. Ana Rivas",
    title: "Coach en Liderazgo y Oratoria",
    bio: "Formadora en habilidades blandas, comunicación efectiva y liderazgo transformacional para equipos de alto rendimiento.",
    specialties: ["Oratoria", "Liderazgo", "Comunicación"],
    avatarInitials: "AR",
    avatarColor: "from-violet-600 to-purple-700",
  },
];

export const categories: Category[] = [
  {
    id: "contabilidad-tributos",
    name: "Contabilidad y Tributos",
    description: "Nómina, retenciones, conciliaciones y normativa fiscal actualizada.",
    icon: "Calculator",
    courseCount: 3,
    color: "from-blue-600 to-blue-800",
  },
  {
    id: "administracion-costos",
    name: "Administración y Costos",
    description: "Control presupuestario, costos industriales y gestión empresarial.",
    icon: "BarChart3",
    courseCount: 1,
    color: "from-emerald-600 to-teal-700",
  },
  {
    id: "marco-legal-laboral",
    name: "Marco Legal y Laboral",
    description: "Derecho laboral, procesal y contingencias legales empresariales.",
    icon: "Scale",
    courseCount: 1,
    color: "from-indigo-600 to-indigo-800",
  },
  {
    id: "desarrollo-personal-liderazgo",
    name: "Desarrollo Personal y Liderazgo",
    description: "Oratoria, comunicación y habilidades directivas de alto impacto.",
    icon: "Users",
    courseCount: 1,
    color: "from-violet-600 to-purple-700",
  },
  {
    id: "herramientas-tecnicas",
    name: "Herramientas Técnicas",
    description: "Excel, plantillas y herramientas digitales para la productividad.",
    icon: "Monitor",
    courseCount: 1,
    color: "from-cyan-600 to-blue-600",
  },
];

export const courses: Course[] = [
  {
    id: "nomina-petrolera-modulo-ii",
    title: "Domina la Nómina Petrolera - Módulo II: Taller Práctico",
    slug: "nomina-petrolera-modulo-ii",
    area: "contabilidad-tributos",
    shortDescription:
      "Taller práctico intensivo para dominar la nómina del sector petrolero con plantillas reales y casos de incidencias.",
    fullDescription:
      "Este módulo avanzado te llevará de la teoría a la práctica con plantillas en Excel listas para usar, gestión integral de incidencias laborales petroleras y acompañamiento de facilitadores expertos del sector. Ideal para contadores, administradores de nómina y profesionales del área financiera que trabajan o aspiran a trabajar en empresas del sector hidrocarburos.",
    date: "Sábado 20 de Junio, 2026",
    schedule: "9:00 am a 5:00 pm",
    modality: "hibrido",
    modalityLabel: "Presencial y En vivo por Zoom",
    instructorId: "faye-sifontes",
    features: [
      "Plantillas en Excel profesionales",
      "Gestión de incidencias petroleras",
      "Facilitadores expertos del sector",
      "Material descargable post-curso",
    ],
    price: 85,
    currency: "USD",
    featured: true,
    certifiedBy: "EDUCA",
    imageGradient: "from-blue-700 via-blue-800 to-indigo-900",
    tags: ["nómina", "petrolera", "excel", "incidencias", "taller"],
    spotsAvailable: 25,
  },
  {
    id: "derecho-procesal-laboral",
    title: "Derecho Procesal Laboral Actualizado",
    slug: "derecho-procesal-laboral",
    area: "marco-legal-laboral",
    shortDescription:
      "Domina las fases del proceso laboral, medios probatorios y contingencias legales con un ex juez del trabajo.",
    fullDescription:
      "Curso especializado impartido por el Abog. Omar Martínez, Ex Juez del Trabajo, que aborda de forma práctica y actualizada todas las fases del proceso laboral venezolano. Aprenderás a manejar medios probatorios, anticipar contingencias legales y proteger los intereses de tu empresa o clientes en litigios laborales.",
    date: "Sábado 27 de Junio, 2026",
    schedule: "9:00 am a 5:00 pm",
    modality: "hibrido",
    modalityLabel: "Presencial y En vivo por Zoom",
    instructorId: "omar-martinez",
    features: [
      "Fases del proceso laboral",
      "Medios probatorios en litigios",
      "Contingencias legales empresariales",
      "Casos reales analizados en sala",
    ],
    price: 95,
    currency: "USD",
    featured: true,
    certifiedBy: "EDUCA",
    imageGradient: "from-indigo-700 via-indigo-800 to-slate-900",
    tags: ["derecho", "laboral", "procesal", "litigios", "abogado"],
    spotsAvailable: 30,
  },
  {
    id: "conciliaciones-bancarias",
    title: "Conciliaciones Bancarias: De Cero a Experto",
    slug: "conciliaciones-bancarias",
    area: "contabilidad-tributos",
    shortDescription:
      "Aprende a conciliar cuentas bancarias con precisión, detectar diferencias y cerrar meses sin errores.",
    fullDescription:
      "Taller práctico enfocado en las técnicas de conciliación bancaria más utilizadas en empresas venezolanas. Incluye plantillas, casos de diferencias frecuentes y metodología paso a paso para garantizar estados financieros confiables.",
    date: "Sábado 4 de Julio, 2026",
    schedule: "9:00 am a 1:00 pm",
    modality: "online",
    modalityLabel: "En vivo por Zoom",
    instructorId: "faye-sifontes",
    features: [
      "Metodología paso a paso",
      "Plantillas de conciliación",
      "Casos prácticos reales",
      "Detección de diferencias",
    ],
    price: 45,
    currency: "USD",
    featured: false,
    imageGradient: "from-sky-600 to-blue-700",
    tags: ["conciliación", "bancaria", "contabilidad", "finanzas"],
    spotsAvailable: 40,
  },
  {
    id: "retenciones-iva-islr",
    title: "Retenciones de IVA e ISLR: Guía Práctica 2026",
    slug: "retenciones-iva-islr",
    area: "contabilidad-tributos",
    shortDescription:
      "Domina el cálculo, registro y declaración de retenciones de IVA e ISLR según la normativa vigente.",
    fullDescription:
      "Curso actualizado que cubre todos los aspectos prácticos de las retenciones de IVA e ISLR en Venezuela: tarifas, agentes de retención, libros de compras y ventas, y declaraciones mensuales sin errores.",
    date: "Sábado 11 de Julio, 2026",
    schedule: "9:00 am a 5:00 pm",
    modality: "hibrido",
    modalityLabel: "Presencial y En vivo por Zoom",
    instructorId: "faye-sifontes",
    features: [
      "Normativa vigente 2026",
      "Cálculo de retenciones",
      "Libros de compras y ventas",
      "Casos prácticos SENIAT",
    ],
    price: 65,
    currency: "USD",
    featured: false,
    imageGradient: "from-blue-600 to-cyan-700",
    tags: ["iva", "islr", "retenciones", "seniat", "tributos"],
    spotsAvailable: 35,
  },
  {
    id: "excel-basico-cero",
    title: "EXCEL BÁSICO desde Cero",
    slug: "excel-basico-cero",
    area: "herramientas-tecnicas",
    shortDescription:
      "Iníciate en Excel con funciones, fórmulas y tablas dinámicas para el entorno laboral profesional.",
    fullDescription:
      "Curso diseñado para quienes parten de cero o necesitan reforzar fundamentos. Aprenderás a crear hojas de cálculo, usar fórmulas esenciales, dar formato profesional y generar reportes básicos aplicables a contabilidad y administración.",
    date: "Sábado 18 de Julio, 2026",
    schedule: "9:00 am a 1:00 pm",
    modality: "online",
    modalityLabel: "En vivo por Zoom",
    instructorId: "carlos-mendoza",
    features: [
      "Desde nivel cero",
      "Fórmulas esenciales",
      "Formato profesional",
      "Ejercicios guiados",
    ],
    price: 35,
    currency: "USD",
    featured: false,
    imageGradient: "from-green-600 to-emerald-700",
    tags: ["excel", "herramientas", "ofimática", "básico"],
    spotsAvailable: 50,
  },
  {
    id: "oratoria-liderazgo",
    title: "Oratoria y Liderazgo para Profesionales",
    slug: "oratoria-liderazgo",
    area: "desarrollo-personal-liderazgo",
    shortDescription:
      "Desarrolla tu voz, presencia escénica y capacidad de liderar equipos con impacto y autenticidad.",
    fullDescription:
      "Taller vivencial que combina técnicas de oratoria, comunicación no verbal y liderazgo transformacional. Ideal para gerentes, emprendedores y profesionales que desean proyectar seguridad y motivar a sus equipos.",
    date: "Sábado 25 de Julio, 2026",
    schedule: "9:00 am a 5:00 pm",
    modality: "presencial",
    modalityLabel: "Presencial",
    instructorId: "ana-rivas",
    features: [
      "Técnicas de oratoria",
      "Comunicación no verbal",
      "Liderazgo transformacional",
      "Prácticas en vivo con feedback",
    ],
    price: 55,
    currency: "USD",
    featured: false,
    imageGradient: "from-purple-600 to-violet-800",
    tags: ["oratoria", "liderazgo", "comunicación", "soft skills"],
    spotsAvailable: 20,
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

export function getCourseById(id: string): Course | undefined {
  return courses.find((c) => c.id === id || c.slug === id);
}

export function getInstructorById(id: string): Instructor | undefined {
  return instructors.find((i) => i.id === id);
}

export function getFeaturedCourses(): Course[] {
  return courses.filter((c) => c.featured);
}

export function getCoursesByArea(area: CourseArea): Course[] {
  return courses.filter((c) => c.area === area);
}

export function searchCourses(query: string): Course[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return courses.filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.shortDescription.toLowerCase().includes(q) ||
      c.tags.some((t) => t.includes(q)) ||
      categories
        .find((cat) => cat.id === c.area)
        ?.name.toLowerCase()
        .includes(q)
  );
}
