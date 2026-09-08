import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad para todo el sitio.
 *
 * No se define Content-Security-Policy: el Studio de Sanity carga scripts y
 * estilos en línea, y una CSP restrictiva lo rompe. Si más adelante se quiere
 * añadir, hay que aplicarla solo a las rutas públicas y dejar /studio fuera.
 */
const securityHeaders = [
  // Evita que el navegador adivine el tipo de un archivo servido.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Nadie puede incrustar el sitio en un iframe (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  // No filtrar la URL completa al navegar a sitios externos.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // El sitio no usa cámara, micrófono ni ubicación.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Fuerza HTTPS en visitas posteriores.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  transpilePackages: ["next-sanity"],
  // No revelar la version de Next en las respuestas.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
