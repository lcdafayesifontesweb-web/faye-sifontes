import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getWriteClient } from "@/sanity/client";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAILS = [
  "lcdafayesifontesweb@gmail.com",
  "sifontessifontesyasociados@gmail.com",
] as const;

type EnrollmentCreateDoc = {
  _type: "enrollment";
  studentName: string;
  idCard: string;
  phone: string;
  email: string;
  course: { _type: "reference"; _ref: string };
  referenceNumber: string;
  paymentProof: {
    _type: "image";
    asset: { _type: "reference"; _ref: string };
  };
  status: "pending";
};

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildAdminEmailHtml(params: {
  studentName: string;
  idCard: string;
  phone: string;
  email: string;
  referenceNumber: string;
  monto: string;
  studioUrl: string;
}): string {
  const {
    studentName,
    idCard,
    phone,
    email,
    referenceNumber,
    monto,
    studioUrl,
  } = params;

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
          <tr>
            <td style="background:#071b43;padding:24px 28px;">
              <p style="margin:0;font-size:13px;letter-spacing:0.04em;text-transform:uppercase;color:#93c5fd;font-weight:600;">SS Consultores</p>
              <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;color:#ffffff;">Nuevo Pago Móvil por validar</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#475569;">
                Se registró una inscripción pendiente de verificación en el banco.
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
                <tr><td style="padding:12px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Nombre del Alumno</td><td style="padding:12px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;text-align:right;">${escapeHtml(studentName)}</td></tr>
                <tr><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Cédula</td><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;text-align:right;">${escapeHtml(idCard)}</td></tr>
                <tr><td style="padding:12px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Teléfono</td><td style="padding:12px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;text-align:right;">${escapeHtml(phone)}</td></tr>
                <tr><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Correo</td><td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;text-align:right;">${escapeHtml(email)}</td></tr>
                <tr><td style="padding:12px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Número de Referencia</td><td style="padding:12px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:600;text-align:right;">${escapeHtml(referenceNumber)}</td></tr>
                <tr><td style="padding:12px 16px;font-size:13px;color:#64748b;">Monto pagado</td><td style="padding:12px 16px;font-size:14px;font-weight:700;color:#0a56a6;text-align:right;">${escapeHtml(monto)}</td></tr>
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
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function notifyAdmins(params: {
  studentName: string;
  idCard: string;
  phone: string;
  email: string;
  referenceNumber: string;
  monto: string;
  requestUrl: string;
}) {
  try {
    if (!process.env.RESEND_API_KEY?.trim()) {
      console.error("[api/enrollment] RESEND_API_KEY ausente; correo no enviado.");
      return;
    }

    const origin = new URL(params.requestUrl).origin;
    const studioUrl = `${origin}/studio`;

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [...ADMIN_EMAILS],
      subject: `🚨 Nuevo Pago Móvil por Validar - ${params.studentName}`,
      html: buildAdminEmailHtml({
        studentName: params.studentName,
        idCard: params.idCard,
        phone: params.phone,
        email: params.email,
        referenceNumber: params.referenceNumber,
        monto: params.monto,
        studioUrl,
      }),
    });
  } catch (err) {
    console.error("[api/enrollment] Resend error:", err);
  }
}

export async function POST(request: Request) {
  let writeClient;
  try {
    writeClient = getWriteClient();
  } catch (err) {
    console.error("[api/enrollment]", err);
    return NextResponse.json(
      {
        error:
          "El servidor no tiene configurado SANITY_API_TOKEN. No se pueden guardar inscripciones.",
      },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return badRequest("Formulario inválido");
  }

  const studentName = String(form.get("studentName") ?? "").trim();
  const idCard = String(form.get("idCard") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const courseId = String(form.get("courseId") ?? "").trim();
  const referenceNumber = String(form.get("referenceNumber") ?? "").trim();
  const montoRaw = String(form.get("monto") ?? "").trim();
  const monto = montoRaw || "$0 USD";
  const proof = form.get("paymentProof");

  if (!studentName || !idCard || !phone || !email) {
    return badRequest("Completa todos los datos del estudiante.");
  }
  if (!courseId) {
    return badRequest("Falta el curso de la inscripción.");
  }
  if (!/^\d{4,}$/.test(referenceNumber.replace(/\s/g, ""))) {
    return badRequest("Ingresa un número de referencia válido (solo dígitos).");
  }
  if (!(proof instanceof File) || proof.size === 0) {
    return badRequest("Adjunta el comprobante de pago.");
  }
  if (proof.size > MAX_FILE_BYTES) {
    return badRequest("El comprobante no puede superar 5 MB.");
  }

  const mime = (proof.type || "").toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    return badRequest(
      "Formato no permitido. Usa una imagen JPG o PNG del comprobante."
    );
  }

  try {
    const buffer = Buffer.from(await proof.arrayBuffer());
    const contentType = mime === "image/jpg" ? "image/jpeg" : mime;

    const asset = await writeClient.assets.upload("image", buffer, {
      filename: proof.name || "comprobante.jpg",
      contentType,
    });

    const enrollmentDoc: EnrollmentCreateDoc = {
      _type: "enrollment",
      studentName,
      idCard,
      phone,
      email: email.toLowerCase(),
      course: {
        _type: "reference",
        _ref: courseId,
      },
      referenceNumber: referenceNumber.replace(/\s/g, ""),
      paymentProof: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
      },
      status: "pending",
    };

    const doc = await writeClient.create(enrollmentDoc);

    // Correo en segundo plano: un fallo de Resend no afecta el 200 al estudiante
    void notifyAdmins({
      studentName,
      idCard,
      phone,
      email: email.toLowerCase(),
      referenceNumber: referenceNumber.replace(/\s/g, ""),
      monto,
      requestUrl: request.url,
    });

    return NextResponse.json({
      ok: true,
      id: doc._id,
      status: "pending",
    });
  } catch (err) {
    console.error("[api/enrollment] create error:", err);
    return NextResponse.json(
      {
        error:
          "No pudimos registrar la inscripción. Intenta de nuevo en unos minutos.",
      },
      { status: 500 }
    );
  }
}
