import { client } from "./client";
import { urlFor } from "./image";
import type { SanityCourse, SanityInstructor } from "./types";
import { isSanityConfigured } from "../../sanity/env";
import {
  courses as staticCourses,
  instructors as staticInstructors,
  getFeaturedCourses,
  getCourseById,
  getInstructorById,
} from "@/data/coursesData";

export const FEATURED_COURSES_QUERY = `*[_type == "course" && featured == true] | order(_createdAt desc) {
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
  coverImage,
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
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  date: string;
  schedule: string;
  modalityLabel: string;
  features: string[];
  price: number;
  currency: string;
  imageGradient: string;
  coverImageUrl?: string;
  instructorName?: string;
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
  spotsAvailable: number;
  imageGradient: string;
  coverImageUrl?: string;
  instructor?: CoursePageInstructor;
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
    shortDescription: course.description,
    date: course.date,
    schedule: course.schedule,
    modalityLabel: MODALITY_LABELS[course.modality] ?? course.modality,
    features: course.features ?? [],
    price: course.price ?? 0,
    currency: course.currency ?? "USD",
    imageGradient:
      CATEGORY_GRADIENTS[course.category] ??
      "from-brand-700 via-brand-800 to-brand-900",
    coverImageUrl: course.coverImage
      ? urlFor(course.coverImage).width(800).height(400).url()
      : undefined,
    instructorName: course.instructor?.name,
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

function mapStaticCourses(): HomeCourse[] {
  return getFeaturedCourses().map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    shortDescription: c.shortDescription,
    date: c.date,
    schedule: c.schedule,
    modalityLabel: c.modalityLabel,
    features: c.features,
    price: c.price,
    currency: c.currency,
    imageGradient: c.imageGradient,
    instructorName: staticInstructors.find((i) => i.id === c.instructorId)?.name,
  }));
}

function mapStaticInstructors(): HomeInstructor[] {
  return staticInstructors.map((i) => ({
    id: i.id,
    name: i.name,
    role: i.title,
    bio: i.bio,
    avatarInitials: i.avatarInitials,
    avatarColor: i.avatarColor,
  }));
}

export async function getFeaturedCoursesForHome(): Promise<HomeCourse[]> {
  if (!isSanityConfigured()) {
    return mapStaticCourses();
  }
  try {
    const courses = await client.fetch<SanityCourse[]>(FEATURED_COURSES_QUERY);
    if (courses.length === 0) return mapStaticCourses();
    return courses.map(mapSanityCourse);
  } catch {
    return mapStaticCourses();
  }
}

export async function getInstructorsForHome(): Promise<HomeInstructor[]> {
  if (!isSanityConfigured()) {
    return mapStaticInstructors();
  }
  try {
    const instructors = await client.fetch<SanityInstructor[]>(INSTRUCTORS_QUERY);
    if (instructors.length === 0) return mapStaticInstructors();
    return instructors.map(mapSanityInstructor);
  } catch {
    return mapStaticInstructors();
  }
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
    spotsAvailable: 25,
    imageGradient:
      CATEGORY_GRADIENTS[course.category] ??
      "from-brand-700 via-brand-800 to-brand-900",
    coverImageUrl: course.coverImage
      ? urlFor(course.coverImage).width(1200).height(600).url()
      : undefined,
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
  };
}

function mapStaticCoursePage(slug: string): CoursePageData | null {
  const course = getCourseById(slug);
  if (!course) return null;

  const instructor = getInstructorById(course.instructorId);

  return {
    id: course.id,
    slug: course.slug,
    title: course.title,
    description: course.fullDescription,
    date: course.date,
    schedule: course.schedule,
    modalityLabel: course.modalityLabel,
    features: course.features,
    price: course.price,
    currency: course.currency,
    featured: course.featured,
    spotsAvailable: course.spotsAvailable,
    imageGradient: course.imageGradient,
    instructor: instructor
      ? {
          id: instructor.id,
          name: instructor.name,
          role: instructor.title,
          bio: instructor.bio,
          avatarInitials: instructor.avatarInitials,
          avatarColor: instructor.avatarColor,
        }
      : undefined,
  };
}

export async function getCourseBySlug(slug: string): Promise<CoursePageData | null> {
  if (!isSanityConfigured()) {
    return mapStaticCoursePage(slug);
  }
  try {
    const course = await client.fetch<SanityCourse | null>(COURSE_BY_SLUG_QUERY, {
      slug,
    });
    if (!course) return mapStaticCoursePage(slug);
    return mapSanityCoursePage(course);
  } catch {
    return mapStaticCoursePage(slug);
  }
}

export async function getAllCourseSlugs(): Promise<string[]> {
  if (!isSanityConfigured()) {
    return staticCourses.map((c) => c.slug);
  }
  try {
    const slugs = await client.fetch<string[]>(ALL_COURSE_SLUGS_QUERY);
    if (slugs.length === 0) {
      return staticCourses.map((c) => c.slug);
    }
    return slugs;
  } catch {
    return staticCourses.map((c) => c.slug);
  }
}
