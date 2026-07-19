import { Suspense } from "react";
import HeroSection from "@/components/HeroSection";
import DirectorBioSection from "@/components/DirectorBioSection";
import CategoriesSection from "@/components/CategoriesSection";
import ServicesSection from "@/components/ServicesSection";
import FeaturedCourses from "@/components/FeaturedCourses";
import InstructorsSection from "@/components/InstructorsSection";
import SocialProofSection from "@/components/SocialProofSection";
import {
  getAllCoursesForHome,
  getInstructorsForHome,
} from "@/sanity/queries";
import {
  categoriesWithCounts,
  countCoursesByCategory,
  type CourseArea,
} from "@/data/coursesData";

export const revalidate = 60;

type HomeSearchParams = Promise<{ categoria?: string }>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: HomeSearchParams;
}) {
  const params = await searchParams;
  const [courses, instructors] = await Promise.all([
    getAllCoursesForHome(),
    getInstructorsForHome(),
  ]);

  const searchCourses = courses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    date: c.date,
  }));

  const categoryCards = categoriesWithCounts(countCoursesByCategory(courses));
  const activeCategory =
    params.categoria &&
    categoryCards.some((c) => c.id === params.categoria)
      ? (params.categoria as CourseArea)
      : null;

  return (
    <>
      <DirectorBioSection />
      <HeroSection courseCount={courses.length} searchCourses={searchCourses} />
      <CategoriesSection
        categories={categoryCards}
        activeCategory={activeCategory}
      />
      <ServicesSection />
      <Suspense
        fallback={
          <section id="cursos" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 text-center text-slate-400">
              Cargando cursos…
            </div>
          </section>
        }
      >
        <FeaturedCourses courses={courses} />
      </Suspense>
      <InstructorsSection instructors={instructors} />
      <SocialProofSection />
    </>
  );
}
