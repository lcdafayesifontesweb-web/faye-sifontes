import { NextResponse } from "next/server";
import { getWriteClient } from "@/sanity/client";
import {
  notifyStudentApproved,
  notifyStudentRejected,
  resolveSiteOrigin,
  type CourseEmailInfo,
  type SendEmailResult,
} from "@/lib/enrollmentEmails";

export const runtime = "nodejs";

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
    instructorName?: string;
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
        "instructorName": instructor->name
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

  const status = requestedStatus || doc.status;
  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({
      ok: false,
      error:
        "El estado debe ser Pago Confirmado o Rechazado para notificar. Guarda el cambio de estado y vuelve a pulsar Enviar.",
    });
  }

  // Si el Studio pidió un status, forzar published (+ draft si existe)
  if (requestedStatus) {
    try {
      await writeClient
        .patch(publishedId)
        .set({ status: requestedStatus })
        .commit({ visibility: "sync" });
    } catch (err) {
      console.error("[notify-status] patch published:", err);
    }
    try {
      await writeClient
        .patch(draftId)
        .set({ status: requestedStatus })
        .commit({ visibility: "sync" });
    } catch {
      /* draft puede no existir */
    }
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

  const siteOrigin = resolveSiteOrigin(request.url);
  let result: SendEmailResult;

  if (status === "approved") {
    const course: CourseEmailInfo = {
      title: doc.course?.title || "Curso",
      description: doc.course?.description,
      date: doc.course?.date,
      schedule: doc.course?.schedule,
      modality: doc.course?.modality,
      instructorName: doc.course?.instructorName,
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
