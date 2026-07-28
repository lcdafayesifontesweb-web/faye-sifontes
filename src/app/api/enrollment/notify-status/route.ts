import { NextResponse } from "next/server";
import { getWriteClient } from "@/sanity/client";
import {
  notifyStudentApproved,
  notifyStudentRejected,
  resolveSiteOrigin,
  type CourseEmailInfo,
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

/**
 * Envía el correo al alumno según el estado actual de la inscripción en Sanity.
 * Usado por las acciones del Studio (Confirmar / Rechazar) y como respaldo del webhook.
 */
export async function POST(request: Request) {
  let body: { enrollmentId?: string };
  try {
    body = (await request.json()) as { enrollmentId?: string };
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
  const doc = await writeClient.fetch<EnrollmentDoc | null>(
    `*[_type == "enrollment" && (_id == $id || _id == $draftId)]|order(_updatedAt desc)[0]{
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
    { id: publishedId, draftId: `drafts.${publishedId}` }
  );

  if (!doc) {
    return NextResponse.json({ error: "Inscripción no encontrada" }, { status: 404 });
  }

  const status = doc.status;
  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({
      ok: false,
      error: "El estado debe ser Pago Confirmado o Rechazado para notificar.",
    });
  }

  if (doc.statusEmailSent === status) {
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
  let sent = false;

  if (status === "approved") {
    const course: CourseEmailInfo = {
      title: doc.course?.title || "Curso",
      description: doc.course?.description,
      date: doc.course?.date,
      schedule: doc.course?.schedule,
      modality: doc.course?.modality,
      instructorName: doc.course?.instructorName,
    };
    sent = await notifyStudentApproved({
      studentName,
      email,
      course,
      siteOrigin,
    });
  } else {
    sent = await notifyStudentRejected({
      studentName,
      email,
      courseTitle: doc.course?.title,
      siteOrigin,
    });
  }

  if (!sent) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "No se pudo enviar el correo (revisa RESEND_API_KEY / dominio verificado).",
      },
      { status: 502 }
    );
  }

  // Marca en published y draft si existen
  try {
    await writeClient
      .patch(publishedId)
      .set({ statusEmailSent: status })
      .commit({ visibility: "sync" });
  } catch {
    /* published puede no existir aún */
  }
  try {
    await writeClient
      .patch(`drafts.${publishedId}`)
      .set({ statusEmailSent: status })
      .commit({ visibility: "sync" });
  } catch {
    /* draft puede no existir */
  }

  return NextResponse.json({ ok: true, status, emailed: true });
}
