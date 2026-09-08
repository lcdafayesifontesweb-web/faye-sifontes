import { NextResponse } from "next/server";
import { getWriteClient } from "@/sanity/client";
import {
  notifyStudentApproved,
  notifyStudentRejected,
  resolveSiteOrigin,
  type CourseEmailInfo,
  type SendEmailResult,
} from "@/lib/enrollmentEmails";
import { resolveInstructorNames } from "@/lib/instructors";

import {
  checkRateLimit,
  getClientIp,
  tooManyRequests,
} from "@/lib/rateLimit";

export const runtime = "nodejs";

/** Solo la usan editores desde el Studio: 30 por hora por IP. */
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60 * 60 * 1000;

type EnrollmentDoc = {
  _id: string;
  studentName?: string;
  email?: string;
  status?: string;
  statusEmailSent?: string | null;
  course?: {
    title?: string;
    description?: string;
    date?: string;
    schedule?: string;
    modality?: string;
    instructorNames?: string[];
    legacyInstructorName?: string | null;
  } | null;
};

type NotifyBody = {
  enrollmentId?: string;
  /** Estado a notificar; si viene del Studio, evita carrera draft vs published */
  status?: "approved" | "rejected";
};

/**
 * Envía el correo al alumno según el estado de la inscripción.
 * Usado por el botón «Enviar» del Studio.
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(
    `notify-status:${getClientIp(request)}`,
    RATE_LIMIT,
    RATE_WINDOW_MS
  );
  if (!limit.allowed) {
    return tooManyRequests(limit.retryAfter, "Demasiadas solicitudes.");
  }

  let body: NotifyBody;
  try {
    body = (await request.json()) as NotifyBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const enrollmentId = body.enrollmentId?.trim();
  if (!enrollmentId) {
    return NextResponse.json({ error: "enrollmentId requerido" }, { status: 400 });
  }

  let writeClient;
  try {
    writeClient = getWriteClient();
  } catch (err) {
    console.error("[api/enrollment/notify-status]", err);
    return NextResponse.json(
      { error: "SANITY_API_TOKEN no configurado" },
      { status: 500 }
    );
  }

  const publishedId = enrollmentId.replace(/^drafts\./, "");
  const draftId = `drafts.${publishedId}`;

  // Preferir el doc con estado final (approved/rejected) para no leer
  // un published "pending" mientras el draft ya está confirmado.
  const docs = await writeClient.fetch<EnrollmentDoc[]>(
    `*[_type == "enrollment" && (_id == $id || _id == $draftId)]{
      _id,
      studentName,
      email,
      status,
      statusEmailSent,
      course->{
        title,
        description,
        date,
        schedule,
        modality,
        "instructorNames": instructors[]->name,
        "legacyInstructorName": instructor->name
      }
    }`,
    { id: publishedId, draftId }
  );

  if (!docs?.length) {
    return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 });
  }

  const requestedStatus =
    body.status === "approved" || body.status === "rejected"
      ? body.status
      : undefined;

  const withFinal = docs.filter(
    (d) => d.status === "approved" || d.status === "rejected"
  );
  const doc =
    (requestedStatus
      ? docs.find((d) => d.status === requestedStatus)
      : undefined) ||
    withFinal[0] ||
    docs.find((d) => d._id === publishedId) ||
    docs[0];

  // El estado sale SIEMPRE del documento en Sanity, nunca del body.
  //
  // Esta ruta no tiene sesión de usuario: la llama el navegador desde el
  // Studio. Si aceptara el estado del body y lo escribiera, cualquiera podría
  // marcar una inscripción como "Pago Confirmado" sin haber pagado. El Studio
  // ya guarda el estado con las credenciales del editor (commit sync) antes de
  // llamar aquí, así que este endpoint solo necesita leerlo y enviar el correo.
  const status = doc.status;
  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({
      ok: false,
      error:
        "El estado debe ser Pago Confirmado o Rechazado para notificar. Guarda el cambio de estado y vuelve a pulsar Enviar.",
    });
  }

  const alreadySent =
    doc.statusEmailSent === status ||
    docs.some((d) => d.statusEmailSent === status);
  if (alreadySent) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      message: "El alumno ya fue notificado de este estado.",
    });
  }

  const email = doc.email?.trim().toLowerCase();
  const studentName = doc.studentName?.trim();
  if (!email || !studentName) {
    return NextResponse.json(
      { error: "Falta nombre o correo del alumno" },
      { status: 400 }
    );
  }

  const siteOrigin = resolveSiteOrigin();
  let result: SendEmailResult;

  if (status === "approved") {
    const course: CourseEmailInfo = {
      title: doc.course?.title || "Curso",
      description: doc.course?.description,
      date: doc.course?.date,
      schedule: doc.course?.schedule,
      modality: doc.course?.modality,
      instructorNames: resolveInstructorNames(
        doc.course?.instructorNames,
        doc.course?.legacyInstructorName
      ),
    };
    result = await notifyStudentApproved({
      studentName,
      email,
      course,
      siteOrigin,
    });
  } else {
    result = await notifyStudentRejected({
      studentName,
      email,
      courseTitle: doc.course?.title,
      siteOrigin,
    });
  }

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `No se pudo enviar el correo: ${result.error}`,
      },
      { status: 502 }
    );
  }

  for (const targetId of [publishedId, draftId]) {
    try {
      await writeClient
        .patch(targetId)
        .set({ statusEmailSent: status })
        .commit({ visibility: "sync" });
    } catch {
      /* puede no existir */
    }
  }

  return NextResponse.json({ ok: true, status, emailed: true });
}
