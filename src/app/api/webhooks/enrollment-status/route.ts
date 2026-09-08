import { NextResponse } from "next/server";
import { getWriteClient } from "@/sanity/client";
import {
  notifyStudentApproved,
  notifyStudentRejected,
  resolveSiteOrigin,
  type CourseEmailInfo,
} from "@/lib/enrollmentEmails";
import { resolveInstructorNames } from "@/lib/instructors";

export const runtime = "nodejs";

type EnrollmentWebhookPayload = {
  _id?: string;
  _type?: string;
  studentName?: string;
  email?: string;
  status?: string;
  statusEmailSent?: string | null;
  paymentModality?: "online" | "presencial";
  course?: {
    title?: string;
    description?: string;
    date?: string;
    schedule?: string;
    modality?: string;
    // La proyeccion del webhook se configura en Sanity, fuera del repo:
    // aceptamos el campo nuevo y el antiguo para no depender de ese cambio.
    instructorNames?: string[];
    instructorName?: string;
  } | null;
};

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function isAuthorized(request: Request): boolean {
  const secret = process.env.SANITY_WEBHOOK_SECRET?.trim();
  if (!secret) return false;

  const header =
    request.headers.get("x-sanity-webhook-secret") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (header && header === secret) return true;

  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return unauthorized();
  }

  let payload: EnrollmentWebhookPayload;
  try {
    payload = (await request.json()) as EnrollmentWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Sanity a veces envuelve el documento
  const doc = (
    payload && typeof payload === "object" && "_type" in payload
      ? payload
      : (payload as { document?: EnrollmentWebhookPayload }).document
  ) as EnrollmentWebhookPayload | undefined;

  if (!doc || doc._type !== "enrollment" || !doc._id) {
    return NextResponse.json({ ok: true, skipped: "not_enrollment" });
  }

  const status = doc.status;
  if (status !== "approved" && status !== "rejected") {
    return NextResponse.json({ ok: true, skipped: "status_not_final" });
  }

  if (doc.statusEmailSent === status) {
    return NextResponse.json({ ok: true, skipped: "already_notified" });
  }

  const email = doc.email?.trim().toLowerCase();
  const studentName = doc.studentName?.trim();
  if (!email || !studentName) {
    return NextResponse.json(
      { error: "Missing student email or name" },
      { status: 400 }
    );
  }

  const siteOrigin = resolveSiteOrigin();
  const courseTitle = doc.course?.title;

  let result;
  if (status === "approved") {
    const course: CourseEmailInfo = {
      title: courseTitle || "Curso",
      description: doc.course?.description,
      date: doc.course?.date,
      schedule: doc.course?.schedule,
      modality: doc.course?.modality,
      purchasedModality: doc.paymentModality,
      instructorNames: resolveInstructorNames(
        doc.course?.instructorNames,
        doc.course?.instructorName
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
      courseTitle,
      siteOrigin,
    });
  }

  if (result.ok) {
    try {
      const writeClient = getWriteClient();
      await writeClient
        .patch(doc._id)
        .set({ statusEmailSent: status })
        .commit({ visibility: "sync" });
    } catch (err) {
      console.error(
        "[webhook/enrollment-status] no se pudo marcar statusEmailSent:",
        err
      );
    }
  }

  return NextResponse.json({
    ok: true,
    status,
    emailed: result.ok,
    ...(result.ok ? {} : { error: result.error }),
  });
}
