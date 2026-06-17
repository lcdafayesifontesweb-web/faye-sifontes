import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CourseLanding from "@/components/CourseLanding";
import { getAllCourseSlugs, getCourseBySlug } from "@/sanity/queries";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllCourseSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Curso no encontrado" };
  return {
    title: `${course.title} | SS Consultores`,
    description: course.description.slice(0, 160),
  };
}

export default async function CursoPage({ params }: PageProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  return <CourseLanding course={course} />;
}
