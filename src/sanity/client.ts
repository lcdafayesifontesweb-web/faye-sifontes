import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../../sanity/env";

/** Cliente de lectura pública (CDN). */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
});

/**
 * Cliente con token de escritura para mutaciones (inscripciones, assets).
 * Requiere SANITY_API_TOKEN en el servidor (Editor o Create permissions).
 */
export function getWriteClient() {
  const token = process.env.SANITY_API_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "SANITY_API_TOKEN no está configurada. Agrega un token con permisos de escritura en .env.local / Vercel."
    );
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
  });
}
