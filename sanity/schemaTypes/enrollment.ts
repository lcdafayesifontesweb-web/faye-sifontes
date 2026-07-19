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
      name: "course",
      title: "Curso",
      type: "reference",
      to: [{ type: "course" }],
      validation: (rule) => rule.required(),
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
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as {
            paymentProofFile?: { asset?: unknown };
          };
          if (value?.asset || parent?.paymentProofFile?.asset) return true;
          return "Adjunta el comprobante de pago (imagen o PDF)";
        }),
    }),
    defineField({
      name: "paymentProofFile",
      title: "Comprobante (PDF)",
      type: "file",
      description:
        "Se completa automáticamente cuando el alumno sube un PDF desde la web.",
      hidden: ({ parent }) => !parent?.paymentProofFile,
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
    }),
  ],
  preview: {
    select: {
      title: "studentName",
      status: "status",
      courseTitle: "course.title",
      media: "paymentProof",
    },
    prepare({ title, status, courseTitle, media }) {
      const statusLabel =
        status === "approved"
          ? "Pago Confirmado"
          : status === "rejected"
            ? "Rechazado"
            : "En Revisión";
      return {
        title: title || "Sin nombre",
        subtitle: [statusLabel, courseTitle].filter(Boolean).join(" · "),
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
