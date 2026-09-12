import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeScrollHandler from "@/components/HomeScrollHandler";
import MetaPixel from "@/components/MetaPixel";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GoogleAnalytics />
      <MetaPixel />
      <HomeScrollHandler />
      <Header />
      <main className="min-w-0 overflow-x-hidden">{children}</main>
      <Footer />
    </>
  );
}
