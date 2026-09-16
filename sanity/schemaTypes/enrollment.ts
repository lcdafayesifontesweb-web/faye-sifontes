import { defineField, defineType } from "sanity";

export const enrollment = defineType({
  name: "enrollment",
  title: "Inscripciones",
  type: "document",
  fields: [
    defineField({
      name: "studentName",
      title: "Nombre completo",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "idCard",
      title: "Cédula de identidad",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "phone",
      title: "Teléfono de contacto",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "email",
      title: "Correo electrónico",
      type: "string",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "profession",
      title: "Profesión u ocupación",
      type: "string",
      description: 'Profesión del inscrito, o "Estudiante".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "company",
      title: "Empresa",
      type: "string",
      description:
        "Opcional: los estudiantes e independientes no tienen empresa.",
    }),
    defineField({
      name: "city",
      title: "Ciudad",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "seatDeducted",
      title: "Cupo ya descontado",
      type: "boolean",
      description:
        "Control interno: evita restar dos veces el mismo cupo si la aprobación se procesa por más de una vía.",
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: "course",
      title: "Curso",
      type: "reference",
      to: [{ type: "course" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "paymentModality",
      title: "Modalidad pagada",
      type: "string",
      options: {
        list: [
          { title: "Online", value: "online" },
          { title: "Presencial", value: "presencial" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "paymentType",
      title: "Tipo de pago",
      type: "string",
      options: {
        list: [
          { title: "Pago total", value: "total" },
          { title: "Inicial 20% (reserva)", value: "inicial" },
        ],
        layout: "radio",
      },
      initialValue: "total",
    }),
    defineField({
      name: "balanceDueUsd",
      title: "Saldo pendiente (USD)",
      type: "number",
      description: "Solo en reservas con inicial. 0 si pagó completo.",
      readOnly: true,
      hidden: ({ document }) => document?.paymentType !== "inicial",
    }),
    defineField({
      name: "balanceDueDate",
      title: "Fecha tope para el saldo",
      type: "string",
      description:
        "5 días hábiles antes del inicio del curso. Se calcula al inscribirse.",
      readOnly: true,
      hidden: ({ document }) => document?.paymentType !== "inicial",
    }),
    defineField({
      name: "termsAccepted",
      title: "Aceptó términos y condiciones",
      type: "boolean",
      readOnly: true,
    }),
    defineField({
      name: "amountUsd",
      title: "Monto USD",
      type: "number",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "amountBs",
      title: "Monto Bs.",
      type: "number",
      description: "Equivalente en bolívares según tasa BCV al momento del pago",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "monto",
      title: "Monto (detalle)",
      type: "string",
      description: "Resumen legible del monto y tasa usados en el pago",
    }),
    defineField({
      name: "referenceNumber",
      title: "Número de referencia (Pago Móvil)",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "paymentProof",
      title: "Comprobante de pago",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Estado",
      type: "string",
      options: {
        list: [
          { title: "En Revisión", value: "pending" },
          { title: "Pago Confirmado", value: "approved" },
          { title: "Rechazado", value: "rejected" },
        ],
        layout: "dropdown",
      },
      initialValue: "pending",
      validation: (rule) => rule.required(),
      description:
        "Elige Pago Confirmado o Rechazado y pulsa el botón «Enviar» para notificar al alumno por correo.",
    }),
    defineField({
      name: "statusEmailSent",
      title: "Último correo de estado enviado",
      type: "string",
      readOnly: true,
      hidden: true,
      description: "Evita reenviar el mismo correo de confirmación/rechazo.",
    }),
  ],
  preview: {
    select: {
      title: "studentName",
      status: "status",
      courseTitle: "course.title",
      media: "paymentProof",
      modality: "paymentModality",
    },
    prepare({ title, status, courseTitle, media, modality }) {
      const statusLabel =
        status === "approved"
          ? "Pago Confirmado"
          : status === "rejected"
            ? "Rechazado"
            : "En Revisión";
      const modalityLabel =
        modality === "online"
          ? "Online"
          : modality === "presencial"
            ? "Presencial"
            : null;
      return {
        title: title || "Sin nombre",
        subtitle: [statusLabel, modalityLabel, courseTitle]
          .filter(Boolean)
          .join(" · "),
        media,
      };
    },
  },
  orderings: [
    {
      title: "Más recientes",
      name: "createdAtDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
  ],
});
