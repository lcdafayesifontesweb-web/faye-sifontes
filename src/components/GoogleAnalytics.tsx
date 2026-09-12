import Script from "next/script";

/**
 * El id de medición es público: viaja al navegador de todos modos. Se deja
 * configurable por si cambia la propiedad, con el actual por defecto para que
 * funcione sin tocar variables en Vercel.
 */
const GA_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || "G-8WT3HHCJTH";

/**
 * Google Analytics 4.
 *
 * Se monta en el layout de (site), asi que no carga en /studio: las visitas al
 * panel de administracion ensuciarian las metricas del sitio.
 *
 * NO enviar page_view manuales en los cambios de ruta. A diferencia del pixel
 * de Meta, la medicion mejorada de GA4 ya cuenta las navegaciones de una SPA
 * por eventos de historial, y agregarlos a mano duplica cada pagina. Se
 * comprobo midiendo: los hits automaticos llegan sin el parametro `dp` y con
 * algo de retraso, y al mandar tambien el evento manual el boton "atras"
 * registraba dos page_view por una sola navegacion.
 */
export default function GoogleAnalytics() {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
