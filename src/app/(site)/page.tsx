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

export const revalidate = 60;

export default async function HomePage() {
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

  return (
    <>
      <DirectorBioSection />
      <HeroSection courseCount={courses.length} searchCourses={searchCourses} />
      <CategoriesSection />
      <ServicesSection />
      <FeaturedCourses courses={courses} />
      <InstructorsSection instructors={instructors} />
      <SocialProofSection />
    </>
  );
}
