import { NextResponse } from "next/server";
import { getWriteClient } from "@/sanity/client";
import {
  notifyStudentAbono,
  resolveSiteOrigin,
  type AbonoEmailInfo,
} from "@/lib/enrollmentEmails";
import {
  abonosSinNotificar,
  resumirAbonos,
  type Abono,
} from "@/lib/abonos";
import {
  checkRateLimit,
  getClientIp,
  tooManyRequests,
} from "@/lib/rateLimit";

export const runtime = "nodejs";

/** Solo la usan editores desde el Studio. */
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 60 * 1000;

type EnrollmentDoc = {
  _id: string;
  studentName?: string;
  email?: string;
  paymentType?: string;
  balanceDueUsd?: number | null;
  balanceDueDate?: string | null;
  abonos?: Abono[] | null;
  courseTitle?: string | null;
};

/**
 * Envía al alumno el recibo de los abonos que aún no se le han notificado,
 * indicándole cuánto le queda por pagar.
 *
 * Lo dispara el botón «Enviar recibo de abono» del Studio.
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(
    `notify-abono:${getClientIp(request)}`,
    RATE_LIMIT,
    RATE_WINDOW_MS
  );
  if (!limit.allowed) {
    return tooManyRequests(limit.retryAfter, "Demasiadas solicitudes.");
  }

  let body: { enrollmentId?: string };
  try {
    body = (await request.json()) as { enrollmentId?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const enrollmentId = body.enrollmentId?.trim();
  if (!enrollmentId) {
    return NextResponse.json(
      { error: "enrollmentId requerido" },
      { status: 400 }
    );
  }

  let writeClient;
  try {
    writeClient = getWriteClient();
  } catch (err) {
    console.error("[api/enrollment/notify-abono]", err);
    return NextResponse.json(
      { error: "SANITY_API_TOKEN no configurado" },
      { status: 500 }
    );
  }

  const publishedId = enrollmentId.replace(/^drafts\./, "");
  const draftId = `drafts.${publishedId}`;

  // Los abonos se leen de Sanity, nunca del cliente: esta ruta no tiene sesión
  // de usuario y aceptar montos del body permitiría inventar recibos.
  const docs = await writeClient.fetch<EnrollmentDoc[]>(
    `*[_type == "enrollment" && (_id == $id || _id == $draftId)]{
      _id,
      studentName,
      email,
      paymentType,
      balanceDueUsd,
      balanceDueDate,
      abonos,
      "courseTitle": course->title
    }`,
    { id: publishedId, draftId }
  );

  if (!docs?.length) {
    return NextResponse.json(
      { error: "Inscripción no encontrada" },
      { status: 404 }
    );
  }

  // Se prefiere el publicado, pero si el que tiene abonos pendientes es el
  // borrador se usa ese: de lo contrario un desfase entre publicar y consultar
  // haria que el boton apareciera y el envio dijera que no hay nada nuevo.
  const publicado = docs.find((d) => d._id === publishedId);
  const borrador = docs.find((d) => d._id === draftId);
  const doc =
    (publicado && abonosSinNotificar(publicado.abonos).length > 0
      ? publicado
      : undefined) ??
    (borrador && abonosSinNotificar(borrador.abonos).length > 0
      ? borrador
      : undefined) ??
    publicado ??
    docs[0];

  const email = doc.email?.trim().toLowerCase();
  const studentName = doc.studentName?.trim();
  if (!email || !studentName) {
    return NextResponse.json(
      { error: "Falta nombre o correo del alumno" },
      { status: 400 }
    );
  }

  const pendientes = abonosSinNotificar(doc.abonos);
  if (pendientes.length === 0) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      message:
        "No hay abonos nuevos por notificar: todos los registrados ya tienen su recibo enviado.",
    });
  }

  const resumen = resumirAbonos(doc.balanceDueUsd, doc.abonos);

  const info: AbonoEmailInfo = {
    abonos: pendientes,
    totalAbonado: resumen.totalAbonado,
    saldoRestante: resumen.saldoRestante,
    saldado: resumen.saldado,
    excedente: resumen.excedente,
    balanceDueDate: doc.balanceDueDate ?? undefined,
    courseTitle: doc.courseTitle ?? undefined,
  };

  const result = await notifyStudentAbono({
    studentName,
    email,
    info,
    siteOrigin: resolveSiteOrigin(),
  });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: `No se pudo enviar el correo: ${result.error}` },
      { status: 502 }
    );
  }

  // Marcar solo los abonos que se acaban de anunciar, para que un reenvío no
  // vuelva a listarlos y el alumno no reciba dos veces el mismo recibo.
  const anunciados = new Set(pendientes.map((a) => a._key).filter(Boolean));

  for (const targetId of [publishedId, draftId]) {
    try {
      const actuales = await writeClient.fetch<Abono[] | null>(
        `*[_type == "enrollment" && _id == $id][0].abonos`,
        { id: targetId }
      );
      if (!actuales?.length) continue;

      await writeClient
        .patch(targetId)
        .set({
          abonos: actuales.map((a) =>
            a._key && anunciados.has(a._key) ? { ...a, notificado: true } : a
          ),
        })
        .commit({ visibility: "sync" });
    } catch {
      /* el borrador puede no existir */
    }
  }

  return NextResponse.json({
    ok: true,
    notificados: pendientes.length,
    saldoRestante: resumen.saldoRestante,
    saldado: resumen.saldado,
  });
}
