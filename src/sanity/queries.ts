import { client } from "./client";
import { urlFor } from "./image";
import type { SanityCourse, SanityInstructor } from "./types";

export const ALL_COURSES_QUERY = `*[_type == "course"] | order(_createdAt desc) {
  _id,
  title,
  "slug": slug.current,
  category,
  description,
  date,
  schedule,
  modality,
  features,
  price,
  currency,
  featured,
  certifiedBy,
  coverImage,
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
  photo
}`;

export const COURSE_BY_SLUG_QUERY = `*[_type == "course" && slug.current == $slug][0] {
  _id,
  title,
  "slug": slug.current,
  category,
  description,
  date,
  schedule,
  modality,
  features,
  price,
  currency,
  featured,
  certifiedBy,
  coverImage,
  gallery[]{
    ...,
    alt
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

export const SEARCH_COURSES_QUERY = `*[_type == "course" && (
  title match $pattern ||
  description match $pattern ||
  category match $pattern
)] | order(_createdAt desc) [0...8] {
  _id,
  title,
  "slug": slug.current,
  date
}`;

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
  currency: string;
  featured: boolean;
  imageGradient: string;
  coverImageUrl?: string;
  instructorName?: string;
  certifiedBy?: string;
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
  avatarInitials: string;
  avatarColor: string;
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
  schedule: string;
  modalityLabel: string;
  features: string[];
  price: number;
  currency: string;
  featured: boolean;
  imageGradient: string;
  coverImageUrl?: string;
  gallery: { url: string; alt: string }[];
  instructor?: CoursePageInstructor;
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

function mapSanityCourse(course: SanityCourse): HomeCourse {
  return {
    id: course._id,
    slug: course.slug,
    title: course.title,
    category: course.category,
    shortDescription: course.description,
    date: course.date,
    schedule: course.schedule,
    modalityLabel: MODALITY_LABELS[course.modality] ?? course.modality,
    features: course.features ?? [],
    price: course.price ?? 0,
    currency: course.currency ?? "USD",
    featured: course.featured ?? false,
    imageGradient:
      CATEGORY_GRADIENTS[course.category] ??
      "from-brand-700 via-brand-800 to-brand-900",
    coverImageUrl: course.coverImage
      ? urlFor(course.coverImage).width(800).height(400).url()
      : undefined,
    instructorName: course.instructor?.name,
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
    avatarInitials: getInitials(instructor.name),
    avatarColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
  };
}

function mapGalleryImages(
  gallery: SanityCourse["gallery"],
  courseTitle: string
): { url: string; alt: string }[] {
  if (!gallery?.length) return [];
  return gallery
    .filter((img) => img?.asset?._ref)
    .map((img, index) => ({
      url: urlFor(img).width(800).height(600).url(),
      alt: img.alt ?? `${courseTitle} — foto ${index + 1}`,
    }));
}

function mapSanityCoursePage(course: SanityCourse): CoursePageData {
  const instructor = course.instructor
    ? mapSanityInstructor(course.instructor, 0)
    : undefined;

  return {
    id: course._id,
    slug: course.slug,
    title: course.title,
    description: course.description,
    date: course.date,
    schedule: course.schedule,
    modalityLabel: MODALITY_LABELS[course.modality] ?? course.modality,
    features: course.features ?? [],
    price: course.price ?? 0,
    currency: course.currency ?? "USD",
    featured: course.featured ?? false,
    imageGradient:
      CATEGORY_GRADIENTS[course.category] ??
      "from-brand-700 via-brand-800 to-brand-900",
    coverImageUrl: course.coverImage
      ? urlFor(course.coverImage).width(1200).height(600).url()
      : undefined,
    gallery: mapGalleryImages(course.gallery, course.title),
    instructor: instructor
      ? {
          id: instructor.id,
          name: instructor.name,
          role: instructor.role,
          bio: instructor.bio,
          photoUrl: instructor.photoUrl,
          avatarInitials: instructor.avatarInitials,
          avatarColor: instructor.avatarColor,
        }
      : undefined,
    certifiedBy: course.certifiedBy,
  };
}

export async function getAllCoursesForHome(): Promise<HomeCourse[]> {
  const courses = await client.fetch<SanityCourse[]>(ALL_COURSES_QUERY);
  return courses.map(mapSanityCourse);
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

export async function searchCoursesFromSanity(
  query: string
): Promise<SearchCourseItem[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const results = await client.fetch<
    { _id: string; slug: string; title: string; date: string }[]
  >(SEARCH_COURSES_QUERY, { pattern: `*${q}*` });

  return results.map((c) => ({
    id: c._id,
    slug: c.slug,
    title: c.title,
    date: c.date,
  }));
}
