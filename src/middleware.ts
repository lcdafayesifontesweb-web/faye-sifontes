import { NextResponse, type NextRequest } from "next/server";

/** Código ISO 3166-2 del estado Anzoátegui. */
const ANZOATEGUI = "VE-B";

/** Lo lee CourseLanding para preseleccionar la modalidad. */
export const MODALITY_HINT_COOKIE = "modalidad-sugerida";

/**
 * Sugiere la modalidad presencial a quien navega desde Anzoátegui, que es
 * donde está el salón.
 *
 * Vercel agrega la región a la petición, así que no hace falta consultar un
 * servicio externo ni pedirle la ubicación al visitante. Si la cabecera no
 * llega —plan sin geolocalización por región, desarrollo local, o una IP que
 * el proveedor ubica en otro estado— no se escribe nada y la página se
 * comporta como siempre: online por defecto.
 *
 * Es solo una sugerencia: el visitante puede cambiarla en la propia página.
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const region = request.headers.get("x-vercel-ip-country-region");
  if (!region) return response;

  const esLocal = region.toUpperCase() === ANZOATEGUI;

  response.cookies.set(MODALITY_HINT_COOKIE, esLocal ? "presencial" : "online", {
    path: "/",
    maxAge: 60 * 60 * 12,
    sameSite: "lax",
    // Sin httpOnly a propósito: la lee el componente en el navegador.
    httpOnly: false,
  });

  return response;
}

export const config = {
  // Solo en las páginas de curso, que son las únicas con selector de modalidad.
  matcher: ["/curso/:slug*"],
};
