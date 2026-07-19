"use client";

import { usePathname } from "next/navigation";
import { DEFAULT_WHATSAPP_FLOAT_URL } from "@/lib/whatsapp";

/**
 * Burbuja flotante WhatsApp — solo desktop (md+).
 * Oculta en móvil y en /studio.
 */
export default function WhatsAppFloat() {
  const pathname = usePathname();
  if (pathname?.startsWith("/studio")) return null;

  return (
    <a
      href={DEFAULT_WHATSAPP_FLOAT_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className="hidden md:flex fixed bottom-6 right-6 z-40 h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:bg-[#1ebe57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
    >
      <svg
        viewBox="0 0 32 32"
        className="h-7 w-7"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M16.04 3C9.4 3 4 8.25 4 14.72c0 2.1.58 4.08 1.6 5.8L4 29l8.7-1.55c1.64.87 3.5 1.34 5.34 1.34 6.64 0 12.04-5.25 12.04-11.72C30.08 8.25 24.68 3 16.04 3zm0 21.3c-1.6 0-3.17-.4-4.55-1.17l-.33-.18-5.17.92.95-5-.2-.34a9.1 9.1 0 0 1-1.4-4.8c0-5.1 4.3-9.25 9.7-9.25s9.7 4.15 9.7 9.25-4.3 9.25-9.7 9.25zm5.3-6.92c-.29-.14-1.72-.84-1.99-.94-.27-.1-.46-.14-.66.14-.2.29-.76.94-.93 1.13-.17.2-.34.22-.63.07-.29-.14-1.22-.44-2.32-1.4-.86-.75-1.44-1.68-1.61-1.97-.17-.29-.02-.44.13-.58.13-.13.29-.34.43-.5.14-.17.19-.29.29-.48.1-.2.05-.37-.02-.51-.07-.14-.66-1.57-.9-2.15-.24-.58-.48-.5-.66-.5h-.56c-.2 0-.51.07-.78.37-.27.29-1.02.98-1.02 2.4s1.05 2.78 1.19 2.97c.14.2 2.06 3.28 5.07 4.47 2.12.84 2.55.88 3.45.74.53-.08 1.72-.69 1.96-1.36.24-.67.24-1.24.17-1.36-.07-.12-.26-.2-.55-.34z" />
      </svg>
    </a>
  );
}
