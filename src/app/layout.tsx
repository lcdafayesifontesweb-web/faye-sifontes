import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SS Consultores | Formación Profesional Premium",
  description:
    "Plataforma educativa de SS Consultores. Cursos presenciales y online, servicios contables y coworking en Puerto La Cruz, Anzoátegui.",
  keywords: [
    "SS Consultores",
    "cursos",
    "contabilidad",
    "nómina petrolera",
    "derecho laboral",
    "Puerto La Cruz",
  ],
  icons: {
    icon: "/logo-sifontes.jpg",
    apple: "/logo-sifontes.jpg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="overflow-x-hidden">
      <body
        className={`${inter.variable} font-sans antialiased bg-white text-brand-dark overflow-x-hidden`}
      >
        {children}
        <WhatsAppFloat />
      </body>
    </html>
  );
}
