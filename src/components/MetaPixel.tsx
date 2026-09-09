"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

/**
 * El identificador del pixel es público: viaja al navegador de todos modos.
 * Se deja configurable por si cambia la cuenta publicitaria, con el actual
 * como valor por defecto para que funcione sin tocar variables en Vercel.
 */
const PIXEL_ID =
  process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || "1043065821886498";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Meta Pixel.
 *
 * Se monta en el layout de (site), asi que no carga en /studio: no tiene
 * sentido rastrear el panel de administracion.
 */
export default function MetaPixel() {
  const pathname = usePathname();
  const primeraCarga = useRef(true);

  useEffect(() => {
    // El snippet de arranque ya dispara el PageView inicial. Este efecto
    // cubre las navegaciones siguientes: Next cambia de pagina sin recargar,
    // asi que sin esto solo se contaria la primera visita de cada sesion.
    if (primeraCarga.current) {
      primeraCarga.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname]);

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
