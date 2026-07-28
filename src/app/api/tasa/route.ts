import { NextResponse } from "next/server";
import { formatUltimaActualizacion, type TasaResponse } from "@/lib/tasa";

export const runtime = "nodejs";
/** Revalidación del route segment: 15 minutos */
export const revalidate = 900;

type DolarApiPayload = {
  promedio?: number;
  fechaActualizacion?: string;
  fuente?: string;
};

type BcvTodayPayload = {
  USD?: number;
  updated_at?: string;
};

async function fetchTasaFromDolarApi(): Promise<TasaResponse | null> {
  const res = await fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
    next: { revalidate: 900 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as DolarApiPayload;
  const tasa = Number(data.promedio);
  if (!Number.isFinite(tasa) || tasa <= 0) return null;

  const updated = data.fechaActualizacion
    ? new Date(data.fechaActualizacion)
    : new Date();

  return {
    tasa,
    fuente: "BCV",
    ultimaActualizacion: formatUltimaActualizacion(
      Number.isNaN(updated.getTime()) ? new Date() : updated
    ),
  };
}

async function fetchTasaFromBcvToday(): Promise<TasaResponse | null> {
  const res = await fetch("https://bcv.today/api/v1/rate.json", {
    next: { revalidate: 900 },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as BcvTodayPayload;
  const tasa = Number(data.USD);
  if (!Number.isFinite(tasa) || tasa <= 0) return null;

  const updated = data.updated_at ? new Date(data.updated_at) : new Date();

  return {
    tasa,
    fuente: "BCV",
    ultimaActualizacion: formatUltimaActualizacion(
      Number.isNaN(updated.getTime()) ? new Date() : updated
    ),
  };
}

export async function GET() {
  try {
    const tasa =
      (await fetchTasaFromDolarApi()) ?? (await fetchTasaFromBcvToday());

    if (!tasa) {
      return NextResponse.json(
        { error: "No se pudo obtener la tasa BCV" },
        { status: 502 }
      );
    }

    return NextResponse.json(tasa, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error("[api/tasa]", err);
    return NextResponse.json(
      { error: "Error al consultar la tasa BCV" },
      { status: 500 }
    );
  }
}
