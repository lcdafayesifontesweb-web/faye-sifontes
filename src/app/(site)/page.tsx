import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import FeaturedCourses from "@/components/FeaturedCourses";
import InstructorsSection from "@/components/InstructorsSection";
import SocialProofSection from "@/components/SocialProofSection";
import {
  getFeaturedCoursesForHome,
  getInstructorsForHome,
} from "@/sanity/queries";

export const revalidate = 60;

export default async function HomePage() {
  const [featuredCourses, instructors] = await Promise.all([
    getFeaturedCoursesForHome(),
    getInstructorsForHome(),
  ]);

  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedCourses courses={featuredCourses} />
      <InstructorsSection instructors={instructors} />
      <SocialProofSection />
    </>
  );
}
