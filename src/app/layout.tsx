import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SS Consultores | Formación Profesional Premium",
  description:
    "Plataforma educativa de SS Consultores. Cursos presenciales y online en contabilidad, tributos, derecho laboral y más. Certificados avalados por EDUCA ante el MPPE.",
  keywords: [
    "SS Consultores",
    "cursos",
    "contabilidad",
    "nómina petrolera",
    "derecho laboral",
    "Puerto La Cruz",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased bg-white text-brand-dark`}>
        {children}
      </body>
    </html>
  );
}
