import { NextResponse } from "next/server";
import { formatUltimaActualizacion, type TasaResponse } from "@/lib/tasa";

export const runtime = "nodejs";
/**
 * El handler debe ejecutarse en cada request. Si se declara `revalidate`,
 * Next lo prerenderiza en build y la tasa queda congelada con la fecha del
 * despliegue (era el bug: mostraba la tasa del 28/07/2026 indefinidamente).
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

/** Caché en memoria del proceso: evita golpear las APIs en cada visita. */
const TTL_MS = 15 * 60 * 1000;
/** Si todas las fuentes fallan, servimos la última tasa buena hasta 24 h. */
const MAX_STALE_MS = 24 * 60 * 60 * 1000;
/** Rango de cordura para descartar respuestas corruptas. */
const MIN_TASA = 1;
const MAX_TASA = 1_000_000;

type CacheEntry = { value: TasaResponse; at: number };
let cache: CacheEntry | null = null;

type DolarApiPayload = {
  promedio?: number;
  fechaActualizacion?: string;
};

type BcvTodayPayload = {
  USD?: number;
  updated_at?: string;
  effective_date?: string;
};

function buildTasa(
  tasa: number,
  updatedRaw: string | undefined
): TasaResponse | null {
  if (!Number.isFinite(tasa) || tasa < MIN_TASA || tasa > MAX_TASA) return null;

  // Un "YYYY-MM-DD" pelado se interpreta como medianoche UTC y en Caracas
  // (UTC-4) retrocedería un día: lo anclamos a medianoche de Caracas.
  const normalized =
    updatedRaw && /^\d{4}-\d{2}-\d{2}$/.test(updatedRaw)
      ? `${updatedRaw}T00:00:00-04:00`
      : updatedRaw;

  const parsed = normalized ? new Date(normalized) : new Date();
  const updated = Number.isNaN(parsed.getTime()) ? new Date() : parsed;

  return {
    tasa,
    fuente: "BCV",
    ultimaActualizacion: formatUltimaActualizacion(updated),
  };
}

async function getJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err) {
    console.error("[api/tasa] fuente sin respuesta:", url, err);
    return null;
  }
}

async function fetchTasaFromDolarApi(): Promise<TasaResponse | null> {
  const data = await getJson<DolarApiPayload>(
    "https://ve.dolarapi.com/v1/dolares/oficial"
  );
  if (!data) return null;
  return buildTasa(Number(data.promedio), data.fechaActualizacion);
}

async function fetchTasaFromBcvToday(): Promise<TasaResponse | null> {
  const data = await getJson<BcvTodayPayload>(
    "https://bcv.today/api/v1/rate.json"
  );
  if (!data) return null;
  // `effective_date` es la fecha valor BCV; `updated_at` es cuándo scrapearon.
  return buildTasa(Number(data.USD), data.effective_date ?? data.updated_at);
}

export async function GET() {
  const now = Date.now();

  if (cache && now - cache.at < TTL_MS) {
    return jsonNoStore(cache.value);
  }

  try {
    const tasa =
      (await fetchTasaFromDolarApi()) ?? (await fetchTasaFromBcvToday());

    if (tasa) {
      cache = { value: tasa, at: now };
      return jsonNoStore(tasa);
    }
  } catch (err) {
    console.error("[api/tasa]", err);
  }

  // Ninguna fuente respondió: mejor una tasa reciente que ninguna.
  if (cache && now - cache.at < MAX_STALE_MS) {
    return jsonNoStore(cache.value);
  }

  return NextResponse.json(
    { error: "No se pudo obtener la tasa BCV" },
    { status: 502, headers: { "Cache-Control": "no-store" } }
  );
}

function jsonNoStore(value: TasaResponse) {
  return NextResponse.json(value, {
    headers: { "Cache-Control": "no-store, max-age=0, must-revalidate" },
  });
}
