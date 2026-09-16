import { NextResponse } from "next/server";
import { getWriteClient } from "@/sanity/client";
import {
  getAdminEmails,
  notifyAdminsNewEnrollment,
  notifyStudentReceived,
  resolveSiteOrigin,
} from "@/lib/enrollmentEmails";

import {
  fechaTopePago,
  formatFechaTope,
  montoInicial,
  montoSaldo,
  permiteInicial,
  type PaymentType,
} from "@/lib/pagos";
import {
  checkRateLimit,
  getClientIp,
  tooManyRequests,
} from "@/lib/rateLimit";

export const runtime = "nodejs";

/** Inscribirse es una accion deliberada: 5 por hora por IP sobra. */
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png"]);

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

/**
 * `proof.type` lo declara el navegador: se puede falsificar. Comprobamos los
 * primeros bytes para confirmar que el comprobante es de verdad un JPG o PNG
 * y no otro contenido subido al CDN publico de Sanity con extension de imagen.
 */
function hasImageSignature(buffer: Buffer): boolean {
  const isJpeg =
    buffer.length > 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff;

  const isPng =
    buffer.length > 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a;

  return isJpeg || isPng;
}

type EnrollmentCreateDoc = {
  _type: "enrollment";
  studentName: string;
  idCard: string;
  phone: string;
  email: string;
  profession: string;
  company?: string;
  city: string;
  course: { _type: "reference"; _ref: string };
  paymentModality: "online" | "presencial";
  paymentType: PaymentType;
  balanceDueUsd?: number;
  balanceDueDate?: string;
  termsAccepted: boolean;
  amountUsd: number;
  amountBs?: number;
  monto: string;
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

export async function POST(request: Request) {
  const limit = checkRateLimit(
    `enrollment:${getClientIp(request)}`,
    RATE_LIMIT,
    RATE_WINDOW_MS
  );
  if (!limit.allowed) {
    return tooManyRequests(
      limit.retryAfter,
      "Demasiados intentos de inscripcion. Espera un momento e intenta de nuevo."
    );
  }

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
  const profession = String(form.get("profession") ?? "").trim();
  const company = String(form.get("company") ?? "").trim();
  const city = String(form.get("city") ?? "").trim();
  const courseId = String(form.get("courseId") ?? "").trim();
  const referenceNumber = String(form.get("referenceNumber") ?? "").trim();
  const montoRaw = String(form.get("monto") ?? "").trim();
  const monto = montoRaw || "$0 USD";
  const modalityRaw = String(form.get("paymentModality") ?? "").trim();
  const paymentModality =
    modalityRaw === "presencial" ? "presencial" : "online";
  const amountUsd = Number(form.get("amountUsd"));
  const amountBsRaw = form.get("amountBs");
  const amountBs =
    amountBsRaw != null && String(amountBsRaw).trim() !== ""
      ? Number(amountBsRaw)
      : undefined;
  const paymentTypeRaw = String(form.get("paymentType") ?? "total").trim();
  const termsAccepted = String(form.get("termsAccepted") ?? "") === "true";
  const proof = form.get("paymentProof");

  if (!studentName || !idCard || !phone || !email) {
    return badRequest("Completa todos los datos del estudiante.");
  }
  if (!profession || !city) {
    return badRequest("Indica tu profesión u ocupación y tu ciudad.");
  }
  if (!EMAIL_PATTERN.test(email)) {
    return badRequest("Ingresa un correo electrónico válido.");
  }
  if (!courseId) {
    return badRequest("Falta el curso de la inscripción.");
  }
  if (modalityRaw !== "online" && modalityRaw !== "presencial") {
    return badRequest("Selecciona la modalidad Online o Presencial.");
  }
  if (!Number.isFinite(amountUsd) || amountUsd < 0) {
    return badRequest("Monto USD inválido.");
  }
  if (!termsAccepted) {
    return badRequest("Debes aceptar los términos y condiciones.");
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

  // Una sola lectura del curso con datos frescos (writeClient no usa CDN) para
  // todo lo que depende de el: cupos, precios y fecha de inicio.
  type CursoInfo = {
    title?: string;
    startsAt?: string | null;
    price?: number | null;
    priceOnline?: number | null;
    seatsPresencial?: number | null;
  };

  let curso: CursoInfo | null = null;
  try {
    curso = await writeClient.fetch<CursoInfo | null>(
      `*[_type == "course" && _id == $id][0]{
        title, startsAt, price, priceOnline, seatsPresencial
      }`,
      { id: courseId }
    );
  } catch (err) {
    console.error("[api/enrollment] no se pudo leer el curso:", err);
  }

  // El boton deshabilitado en la pagina se puede saltar, asi que el limite de
  // cupos se comprueba tambien aqui.
  if (
    paymentModality === "presencial" &&
    typeof curso?.seatsPresencial === "number" &&
    curso.seatsPresencial <= 0
  ) {
    return badRequest(
      "Ya no quedan cupos presenciales para este curso. Puedes inscribirte en la modalidad online."
    );
  }

  // El tipo de pago y sus montos se resuelven aqui, no se aceptan del cliente:
  // si no, cualquiera podria declarar "inicial" sobre un curso sin fecha, o
  // inventarse el saldo.
  //
  // Si no se pudo leer el curso se cae a pago total: es el caso seguro, porque
  // no deja una reserva registrada sin fecha tope que reclamar.
  const admiteInicial = permiteInicial(curso?.startsAt);
  const paymentType: PaymentType =
    paymentTypeRaw === "inicial" && admiteInicial ? "inicial" : "total";

  if (paymentTypeRaw === "inicial" && !admiteInicial) {
    return badRequest(
      "Este curso ya no admite reserva con inicial. Debes pagar el monto completo."
    );
  }

  const precioCurso =
    paymentModality === "presencial" ? curso?.price : curso?.priceOnline;

  let balanceDueUsd: number | undefined;
  let balanceDueDate: string | undefined;

  if (paymentType === "inicial" && typeof precioCurso === "number") {
    balanceDueUsd = montoSaldo(precioCurso);
    const tope = fechaTopePago(curso?.startsAt);
    if (tope) balanceDueDate = formatFechaTope(tope);

    // El monto que llega del formulario debe coincidir con el 20% real.
    const esperado = montoInicial(precioCurso);
    if (Math.abs(amountUsd - esperado) > 0.01) {
      return badRequest(
        "El monto de la inicial no coincide con el precio del curso. Recarga la página e intenta de nuevo."
      );
    }
  }

  try {
    const buffer = Buffer.from(await proof.arrayBuffer());
    if (!hasImageSignature(buffer)) {
      return badRequest(
        "El comprobante no es una imagen JPG o PNG válida. Vuelve a adjuntarlo."
      );
    }
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
      profession,
      ...(company ? { company } : {}),
      city,
      course: {
        _type: "reference",
        _ref: courseId,
      },
      paymentModality,
      paymentType,
      ...(balanceDueUsd != null ? { balanceDueUsd } : {}),
      ...(balanceDueDate ? { balanceDueDate } : {}),
      termsAccepted,
      amountUsd,
      ...(Number.isFinite(amountBs) ? { amountBs: amountBs as number } : {}),
      monto,
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

    const courseTitle = curso?.title;

    const siteOrigin = resolveSiteOrigin();

    // IMPORTANTE: await (no void). En Vercel, el work en background tras el
    // response se corta y los correos no llegan aunque la inscripción sí se guarde.
    const [adminMail, studentMail] = await Promise.all([
      notifyAdminsNewEnrollment({
        studentName,
        idCard,
        phone,
        email: email.toLowerCase(),
        profession,
        company,
        city,
        paymentTypeLabel:
          paymentType === "inicial" ? "Inicial 20% (reserva)" : "Pago completo",
        balanceDueUsd,
        balanceDueDate,
        referenceNumber: referenceNumber.replace(/\s/g, ""),
        monto,
        modalityLabel:
          paymentModality === "online" ? "Online" : "Presencial",
        siteOrigin,
      }),
      notifyStudentReceived({
        studentName,
        email: email.toLowerCase(),
        courseTitle,
        purchasedModality: paymentModality,
        balanceDueUsd,
        balanceDueDate,
        siteOrigin,
      }),
    ]);

    if (!adminMail.ok) {
      console.error(
        `[api/enrollment] AVISO INTERNO NO ENVIADO — inscripción ${doc._id} de ${studentName} quedó sin notificar a ${getAdminEmails().join(", ")}:`,
        adminMail.error
      );
    }
    if (!studentMail.ok) {
      console.error("[api/enrollment] correo alumno falló:", studentMail.error);
    }

    return NextResponse.json({
      ok: true,
      id: doc._id,
      status: "pending",
      emails: {
        admin: adminMail.ok,
        student: studentMail.ok,
      },
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
