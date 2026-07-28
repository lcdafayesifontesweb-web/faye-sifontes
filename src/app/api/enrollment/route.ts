import { NextResponse } from "next/server";
import { getWriteClient, client as readClient } from "@/sanity/client";
import {
  notifyAdminsNewEnrollment,
  notifyStudentReceived,
  resolveSiteOrigin,
} from "@/lib/enrollmentEmails";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(["image/jpeg", "image/jpg", "image/png"]);

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

    let courseTitle: string | undefined;
    try {
      courseTitle = await readClient.fetch(
        `*[_type == "course" && _id == $id][0].title`,
        { id: courseId }
      );
    } catch {
      /* optional for email copy */
    }

    const siteOrigin = resolveSiteOrigin(request.url);

    // IMPORTANTE: await (no void). En Vercel, el work en background tras el
    // response se corta y los correos no llegan aunque la inscripción sí se guarde.
    const [adminMail, studentMail] = await Promise.all([
      notifyAdminsNewEnrollment({
        studentName,
        idCard,
        phone,
        email: email.toLowerCase(),
        referenceNumber: referenceNumber.replace(/\s/g, ""),
        monto,
        siteOrigin,
      }),
      notifyStudentReceived({
        studentName,
        email: email.toLowerCase(),
        courseTitle,
        siteOrigin,
      }),
    ]);

    if (!adminMail.ok) {
      console.error("[api/enrollment] correo admin falló:", adminMail.error);
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
