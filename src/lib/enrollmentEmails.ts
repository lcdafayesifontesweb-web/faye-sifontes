import { Resend } from "resend";
import { BRAND } from "@/data/coursesData";

const resend = new Resend(process.env.RESEND_API_KEY);

export const ADMIN_EMAILS = ["admin@lcdafayesifontes.com"] as const;

const MODALITY_LABELS: Record<string, string> = {
  presencial: "Presencial",
  zoom: "En vivo por Zoom",
  mixto: "Presencial y En vivo por Zoom",
};

export type CourseEmailInfo = {
  title: string;
  description?: string;
  date?: string;
  schedule?: string;
  modality?: string;
  instructorName?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() || "admin@lcdafayesifontes.com"
  );
}

function getLogoUrl(siteOrigin: string): string {
  // Logo claro: el encabezado del correo es fondo oscuro (#071b43)
  return `${siteOrigin.replace(/\/$/, "")}/logoblanco.png`;
}

function getPlaceLabel(modality?: string): string {
  if (modality === "zoom") return "En vivo por Zoom (enlace se enviará por WhatsApp/correo)";
  if (modality === "mixto") {
    return `${BRAND.address} / En vivo por Zoom`;
  }
  return BRAND.address;
}

function emailShell(params: {
  logoUrl: string;
  title: string;
  eyebrow: string;
  bodyHtml: string;
}): string {
  const { logoUrl, title, eyebrow, bodyHtml } = params;
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:#071b43;padding:24px 28px;text-align:center;">
              <img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(BRAND.company)}" width="160" style="display:inline-block;max-width:160px;height:auto;margin:0 0 12px;" />
              <p style="margin:0;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;color:#93c5fd;font-weight:600;">${escapeHtml(eyebrow)}</p>
              <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;color:#ffffff;">${escapeHtml(title)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${bodyHtml}
              <p style="margin:28px 0 0;font-size:13px;line-height:1.5;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:20px;">
                ${escapeHtml(BRAND.company)} · ${escapeHtml(BRAND.phone)} · ${escapeHtml(BRAND.email)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string, alt = false): string {
  const bg = alt ? "background:#f8fafc;" : "";
  return `<tr>
    <td style="padding:12px 16px;${bg}border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:12px 16px;${bg}border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;text-align:right;color:#0f172a;">${escapeHtml(value)}</td>
  </tr>`;
}

export function buildAdminPendingHtml(params: {
  studentName: string;
  idCard: string;
  phone: string;
  email: string;
  referenceNumber: string;
  monto: string;
  studioUrl: string;
  logoUrl: string;
}): string {
  const {
    studentName,
    idCard,
    phone,
    email,
    referenceNumber,
    monto,
    studioUrl,
    logoUrl,
  } = params;

  return emailShell({
    logoUrl,
    eyebrow: BRAND.company,
    title: "Nuevo Pago Móvil por validar",
    bodyHtml: `
      <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#475569;">
        Se registró una inscripción pendiente de verificación en el banco.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        ${detailRow("Nombre del Alumno", studentName, true)}
        ${detailRow("Cédula", idCard)}
        ${detailRow("Teléfono", phone, true)}
        ${detailRow("Correo", email)}
        ${detailRow("Número de Referencia", referenceNumber, true)}
        ${detailRow("Monto pagado", monto)}
      </table>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px auto 0;">
        <tr>
          <td align="center" style="border-radius:10px;background:#0a56a6;">
            <a href="${escapeHtml(studioUrl)}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;">
              Ir al Studio para Validar
            </a>
          </td>
        </tr>
      </table>
    `,
  });
}

export function buildStudentReceivedHtml(params: {
  studentName: string;
  logoUrl: string;
  courseTitle?: string;
}): string {
  const firstName = params.studentName.split(/\s+/)[0] || params.studentName;
  const courseLine = params.courseTitle
    ? ` para el curso <strong>${escapeHtml(params.courseTitle)}</strong>`
    : "";

  return emailShell({
    logoUrl: params.logoUrl,
    eyebrow: BRAND.company,
    title: "Recibimos tu inscripción",
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
        Hola <strong>${escapeHtml(firstName)}</strong>,
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
        Confirmamos que recibimos tu comprobante de pago${courseLine}.
        Nuestro equipo lo está revisando y te notificaremos por este correo
        cuando el pago quede confirmado o si necesitamos verificar algo.
      </p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#475569;">
        Si tienes dudas, escríbenos al WhatsApp
        <strong>${escapeHtml(BRAND.phone)}</strong>.
      </p>
    `,
  });
}

export function buildStudentApprovedHtml(params: {
  studentName: string;
  logoUrl: string;
  course: CourseEmailInfo;
}): string {
  const { studentName, logoUrl, course } = params;
  const firstName = studentName.split(/\s+/)[0] || studentName;
  const modalityLabel =
    MODALITY_LABELS[course.modality ?? ""] ?? course.modality ?? "—";
  const place = getPlaceLabel(course.modality);

  return emailShell({
    logoUrl,
    eyebrow: BRAND.company,
    title: "¡Inscripción confirmada!",
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
        Hola <strong>${escapeHtml(firstName)}</strong>,
      </p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#475569;">
        ¡Gracias por inscribirte! Tu pago fue confirmado y tu cupo está reservado.
        Aquí tienes los detalles de tu inscripción:
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:20px;">
        ${detailRow("Curso", course.title || "—", true)}
        ${detailRow("Fecha", course.date || "—")}
        ${detailRow("Horario", course.schedule || "—", true)}
        ${detailRow("Modalidad", modalityLabel)}
        ${detailRow("Lugar", place, true)}
        ${detailRow("Facilitador", course.instructorName || "—")}
      </table>
      ${
        course.description
          ? `<p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:0.04em;">Descripción</p>
             <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#475569;white-space:pre-wrap;">${escapeHtml(course.description)}</p>`
          : ""
      }
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:16px 18px;">
        <p style="margin:0;font-size:14px;line-height:1.55;color:#1e3a8a;">
          <strong>Recomendación:</strong> llega con <strong>20 minutos de anticipación</strong>
          para registro y organización. Te esperamos.
        </p>
      </div>
      <p style="margin:20px 0 0;font-size:15px;line-height:1.6;color:#475569;">
        Cualquier consulta: WhatsApp <strong>${escapeHtml(BRAND.phone)}</strong>.
      </p>
    `,
  });
}

export function buildStudentRejectedHtml(params: {
  studentName: string;
  logoUrl: string;
  courseTitle?: string;
}): string {
  const firstName = params.studentName.split(/\s+/)[0] || params.studentName;
  const courseLine = params.courseTitle
    ? ` del curso <strong>${escapeHtml(params.courseTitle)}</strong>`
    : "";

  return emailShell({
    logoUrl: params.logoUrl,
    eyebrow: BRAND.company,
    title: "No pudimos confirmar tu pago",
    bodyHtml: `
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
        Hola <strong>${escapeHtml(firstName)}</strong>,
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
        Revisamos tu inscripción${courseLine} y, por el momento,
        <strong>no pudimos confirmar el pago</strong>. Esto puede deberse a una
        referencia incorrecta, un comprobante ilegible o un monto que no coincide.
      </p>
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#475569;">
        Por favor contáctanos para verificar tu pago y completar tu inscripción:
      </p>
      <p style="margin:0;font-size:15px;line-height:1.6;color:#475569;">
        WhatsApp: <strong>${escapeHtml(BRAND.phone)}</strong><br />
        Correo: <strong>${escapeHtml(BRAND.email)}</strong>
      </p>
    `,
  });
}

async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY?.trim()) {
    console.error("[enrollmentEmails] RESEND_API_KEY ausente; correo no enviado.");
    return false;
  }
  try {
    const result = await resend.emails.send({
      from: getFromAddress(),
      to: Array.isArray(params.to) ? params.to : [params.to],
      subject: params.subject,
      html: params.html,
    });
    if (result.error) {
      console.error("[enrollmentEmails] Resend error:", result.error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[enrollmentEmails] Resend exception:", err);
    return false;
  }
}

const DEFAULT_SITE_ORIGIN = "https://www.lcdafayesifontes.com";

export function resolveSiteOrigin(_requestUrl?: string): string {
  // Siempre preferir el dominio público. Nunca usar VERCEL_URL en correos:
  // en previews es una URL efímera (*.vercel.app) que rompe el botón y el logo.
  // Usar www: el apex redirige con 308 y muchos clientes de correo no siguen
  // redirects en <img>, lo que deja el logo roto.
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (envUrl) return envUrl.replace(/\/$/, "");
  return DEFAULT_SITE_ORIGIN;
}

export async function notifyAdminsNewEnrollment(params: {
  studentName: string;
  idCard: string;
  phone: string;
  email: string;
  referenceNumber: string;
  monto: string;
  siteOrigin: string;
}): Promise<void> {
  const logoUrl = getLogoUrl(params.siteOrigin);
  const studioUrl = `${params.siteOrigin}/studio`;
  await sendEmail({
    to: [...ADMIN_EMAILS],
    subject: `🚨 Nuevo Pago Móvil por Validar - ${params.studentName}`,
    html: buildAdminPendingHtml({
      ...params,
      studioUrl,
      logoUrl,
    }),
  });
}

export async function notifyStudentReceived(params: {
  studentName: string;
  email: string;
  courseTitle?: string;
  siteOrigin: string;
}): Promise<void> {
  await sendEmail({
    to: params.email,
    subject: `Recibimos tu inscripción — ${BRAND.company}`,
    html: buildStudentReceivedHtml({
      studentName: params.studentName,
      courseTitle: params.courseTitle,
      logoUrl: getLogoUrl(params.siteOrigin),
    }),
  });
}

export async function notifyStudentApproved(params: {
  studentName: string;
  email: string;
  course: CourseEmailInfo;
  siteOrigin: string;
}): Promise<boolean> {
  return sendEmail({
    to: params.email,
    subject: `Inscripción confirmada: ${params.course.title} — ${BRAND.company}`,
    html: buildStudentApprovedHtml({
      studentName: params.studentName,
      course: params.course,
      logoUrl: getLogoUrl(params.siteOrigin),
    }),
  });
}

export async function notifyStudentRejected(params: {
  studentName: string;
  email: string;
  courseTitle?: string;
  siteOrigin: string;
}): Promise<boolean> {
  return sendEmail({
    to: params.email,
    subject: `Importante: no pudimos confirmar tu pago — ${BRAND.company}`,
    html: buildStudentRejectedHtml({
      studentName: params.studentName,
      courseTitle: params.courseTitle,
      logoUrl: getLogoUrl(params.siteOrigin),
    }),
  });
}
