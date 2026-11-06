import { client } from "./client";
import { urlFor } from "./image";
import type { SanityCourse, SanityInstructor } from "./types";
import { normalizeFeaturesList } from "@/lib/features";
import { cursoYaComenzo, TEXTO_SIN_FECHA } from "@/lib/vigencia";

export const ALL_COURSES_QUERY = `*[_type == "course"]
  | order(coalesce(featured, false) desc, _createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  category,
  description,
  date,
  startsAt,
  schedule,
  modality,
  features,
  price,
  priceOnline,
  currency,
  featured,
  certifiedBy,
  coverImage,
  instructors[]->{
    _id,
    name,
    role,
    bio,
    photo
  },
  instructor->{
    _id,
    name,
    role,
    bio,
    photo
  }
}`;

export const INSTRUCTORS_QUERY = `*[_type == "instructor"] | order(name asc) {
  _id,
  name,
  role,
  bio,
  photo,
  "courses": *[_type == "course" && references(^._id)] | order(title asc) {
    title,
    "slug": slug.current
  }
}`;

export const COURSE_BY_SLUG_QUERY = `*[_type == "course" && slug.current == $slug][0] {
  _id,
  seatsPresencial,
  title,
  "slug": slug.current,
  category,
  description,
  date,
  startsAt,
  schedule,
  modality,
  features,
  price,
  priceOnline,
  currency,
  permiteReserva,
  featured,
  certifiedBy,
  coverImage,
  gallery[]{
    ...,
    alt
  },
  instructors[]->{
    _id,
    name,
    role,
    bio,
    photo
  },
  instructor->{
    _id,
    name,
    role,
    bio,
    photo
  }
}`;

export const ALL_COURSE_SLUGS_QUERY = `*[_type == "course" && defined(slug.current)].slug.current`;

const MODALITY_LABELS: Record<string, string> = {
  presencial: "Presencial",
  zoom: "En vivo por Zoom",
  mixto: "Presencial y En vivo por Zoom",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  "contabilidad-tributos": "from-blue-700 via-blue-800 to-indigo-900",
  "administracion-costos": "from-emerald-600 to-teal-700",
  "marco-legal-laboral": "from-indigo-700 via-indigo-800 to-slate-900",
  "desarrollo-personal-liderazgo": "from-purple-600 to-violet-800",
  "herramientas-tecnicas": "from-cyan-600 to-blue-600",
};

export interface HomeCourse {
  /**
   * Si el curso se puede vender ahora: tiene fecha de inicio y no paso.
   * Sin esto la tarjeta sale a color y puede ir de primera aunque diga
   * «Por confirmar».
   */
  activo: boolean;
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  date: string;
  schedule: string;
  modalityLabel: string;
  features: string[];
  price: number;
  priceOnline: number;
  currency: string;
  featured: boolean;
  /** Instante ISO de inicio; ausente si la fecha no esta confirmada. */
  startsAt?: string;
  imageGradient: string;
  coverImageUrl?: string;
  instructorNames: string[];
  certifiedBy?: string;
}

export interface GalleryImage {
  /** Miniatura recortada para la cuadricula. */
  url: string;
  /** Imagen completa, sin recortar, para verla ampliada. */
  fullUrl: string;
  alt: string;
}

export interface SearchCourseItem {
  id: string;
  slug: string;
  title: string;
  date: string;
}

export interface HomeInstructor {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl?: string;
  photoUrlLarge?: string;
  avatarInitials: string;
  avatarColor: string;
  courses: { title: string; slug: string }[];
}

export interface CoursePageInstructor {
  id: string;
  name: string;
  role: string;
  bio: string;
  photoUrl?: string;
  avatarInitials: string;
  avatarColor: string;
}

export interface CoursePageData {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  /** Instante ISO de inicio; ausente si la fecha no esta confirmada. */
  startsAt?: string;
  schedule: string;
  /** Valor crudo de Sanity: presencial | zoom | mixto */
  modality: string;
  modalityLabel: string;
  features: string[];
  price: number;
  priceOnline: number;
  currency: string;
  /** Si el curso acepta reserva con el 20%. Se enciende por curso en Sanity. */
  permiteReserva: boolean;
  featured: boolean;
  imageGradient: string;
  coverImageUrl?: string;
  /**
   * Cupos presenciales que quedan. `undefined` cuando el curso no lleva
   * control de cupos, que no es lo mismo que 0 (agotado).
   */
  seatsLeft?: number;
  gallery: GalleryImage[];
  instructors: CoursePageInstructor[];
  certifiedBy?: string;
}

const AVATAR_COLORS = [
  "from-blue-700 to-blue-900",
  "from-amber-500 to-orange-600",
  "from-emerald-600 to-teal-700",
  "from-violet-600 to-purple-700",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter((w) => w.length > 1 && !w.endsWith("."))
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * Facilitadores del curso. Prefiere `instructors`; si el curso todavía no fue
 * migrado, cae al campo `instructor` de un solo facilitador.
 */
function resolveCourseInstructors(course: SanityCourse): SanityInstructor[] {
  const list = (course.instructors ?? []).filter(
    (entry): entry is SanityInstructor => Boolean(entry?._id)
  );
  if (list.length > 0) return list;
  return course.instructor?._id ? [course.instructor] : [];
}

function mapSanityCourse(course: SanityCourse): HomeCourse {
  // Pasada la fecha de inicio la edicion deja de estar vigente: el curso
  // vuelve a «Por confirmar» hasta que le carguen la proxima. Las paginas
  // revalidan cada 60 s, asi que el cambio ocurre solo.
  const vencido = cursoYaComenzo(course.startsAt);
  const activo = Boolean(course.startsAt) && !vencido;

  return {
    activo,
    id: course._id,
    slug: course.slug,
    title: course.title,
    category: course.category,
    shortDescription: course.description,
    date: vencido ? TEXTO_SIN_FECHA : course.date,
    schedule: course.schedule,
    modalityLabel: MODALITY_LABELS[course.modality] ?? course.modality,
    features: normalizeFeaturesList(course.features),
    price: course.price ?? 0,
    priceOnline: course.priceOnline ?? 0,
    currency: course.currency ?? "USD",
    // Un curso «Por confirmar» no puede ir destacado: encabezaba la lista
    // sin tener nada que vender.
    featured: activo && (course.featured ?? false),
    startsAt: vencido ? undefined : course.startsAt,
    imageGradient:
      CATEGORY_GRADIENTS[course.category] ??
      "from-brand-700 via-brand-800 to-brand-900",
    coverImageUrl: course.coverImage
      ? urlFor(course.coverImage).width(800).height(400).url()
      : undefined,
    instructorNames: resolveCourseInstructors(course).map((i) => i.name),
    certifiedBy: course.certifiedBy,
  };
}

function mapSanityInstructor(
  instructor: SanityInstructor,
  index: number
): HomeInstructor {
  return {
    id: instructor._id,
    name: instructor.name,
    role: instructor.role,
    bio: instructor.bio,
    photoUrl: instructor.photo
      ? urlFor(instructor.photo).width(224).height(224).url()
      : undefined,
    photoUrlLarge: instructor.photo
      ? urlFor(instructor.photo).width(480).height(480).url()
      : undefined,
    avatarInitials: getInitials(instructor.name),
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
    courses: (instructor.courses ?? [])
      .filter((c) => c?.title && c?.slug)
      .map((c) => ({ title: c.title, slug: c.slug })),
  };
}

function mapGalleryImages(
  gallery: SanityCourse["gallery"],
  courseTitle: string
): GalleryImage[] {
  if (!gallery?.length) return [];
  return gallery
    .filter((img) => img?.asset?._ref)
    .map((img, index) => ({
      // Miniatura recortada para la cuadricula.
      url: urlFor(img).width(800).height(600).url(),
      // Version ampliada: `fit("max")` respeta la proporcion, asi que al
      // abrirla se ve la foto completa y no el recorte de la miniatura.
      fullUrl: urlFor(img).width(1600).fit("max").url(),
      alt: img.alt ?? `${courseTitle} — foto ${index + 1}`,
    }));
}

function mapSanityCoursePage(course: SanityCourse): CoursePageData {
  const instructors = resolveCourseInstructors(course).map((entry, index) =>
    mapSanityInstructor(entry, index)
  );

  // El campo de Sanity ES el numero que se muestra: lo que la administradora
  // ve en el panel es lo que ve el visitante. Las aprobaciones web lo
  // descuentan solas al confirmar el pago.
  const seatsLeft =
    typeof course.seatsPresencial === "number" &&
    Number.isFinite(course.seatsPresencial)
      ? Math.max(0, course.seatsPresencial)
      : undefined;

  // Pasada la fecha de inicio la edicion deja de estar vigente: el curso
  // vuelve a «Por confirmar» hasta que le carguen la proxima. Las paginas
  // revalidan cada 60 s, asi que el cambio ocurre solo.
  const vencido = cursoYaComenzo(course.startsAt);

  return {
    id: course._id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    date: vencido ? TEXTO_SIN_FECHA : course.date,
    startsAt: vencido ? undefined : course.startsAt,
    schedule: course.schedule,
    modality: course.modality ?? "",
    modalityLabel: MODALITY_LABELS[course.modality] ?? course.modality,
    features: normalizeFeaturesList(course.features),
    price: course.price ?? 0,
    priceOnline: course.priceOnline ?? 0,
    currency: course.currency ?? "USD",
    permiteReserva: course.permiteReserva === true,
    featured: course.featured ?? false,
    imageGradient:
      CATEGORY_GRADIENTS[course.category] ??
      "from-brand-700 via-brand-800 to-brand-900",
    coverImageUrl: course.coverImage
      ? urlFor(course.coverImage).width(1200).height(600).url()
      : undefined,
    seatsLeft: vencido ? undefined : seatsLeft,
    gallery: mapGalleryImages(course.gallery, course.title),
    instructors: instructors.map((instructor) => ({
      id: instructor.id,
      name: instructor.name,
      role: instructor.role,
      bio: instructor.bio,
      photoUrl: instructor.photoUrl,
      avatarInitials: instructor.avatarInitials,
      avatarColor: instructor.avatarColor,
    })),
    certifiedBy: course.certifiedBy,
  };
}

export async function getAllCoursesForHome(): Promise<HomeCourse[]> {
  const courses = await client.fetch<SanityCourse[]>(ALL_COURSES_QUERY);

  // El orden de la consulta pone los destacados primero mirando el campo
  // crudo de Sanity, que no sabe si la fecha ya paso. Se reordena aqui, ya
  // resuelto que esta vigente: primero lo destacado y vendible, luego el
  // resto de lo vendible, y al final lo que esta «Por confirmar».
  const rango = (c: HomeCourse) => (c.activo ? (c.featured ? 0 : 1) : 2);

  return courses
    .map(mapSanityCourse)
    .sort((a, b) => rango(a) - rango(b));
}

export async function getInstructorsForHome(): Promise<HomeInstructor[]> {
  const instructors = await client.fetch<SanityInstructor[]>(INSTRUCTORS_QUERY);
  return instructors.map(mapSanityInstructor);
}

export async function getCourseBySlug(
  slug: string
): Promise<CoursePageData | null> {
  const course = await client.fetch<SanityCourse | null>(COURSE_BY_SLUG_QUERY, {
    slug,
  });
  if (!course) return null;
  return mapSanityCoursePage(course);
}

export async function getAllCourseSlugs(): Promise<string[]> {
  return client.fetch<string[]>(ALL_COURSE_SLUGS_QUERY);
}
