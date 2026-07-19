import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeScrollHandler from "@/components/HomeScrollHandler";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <HomeScrollHandler />
      <Header />
      <main className="min-w-0 overflow-x-hidden">{children}</main>
      <Footer />
    </>
  );
}
