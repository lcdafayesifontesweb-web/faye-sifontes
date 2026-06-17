import { defineArrayMember, defineField, defineType } from "sanity";

const CATEGORIES = [
  { title: "Contabilidad y Tributos", value: "contabilidad-tributos" },
  { title: "Administración y Costos", value: "administracion-costos" },
  { title: "Marco Legal y Laboral", value: "marco-legal-laboral" },
  {
    title: "Desarrollo Personal y Liderazgo",
    value: "desarrollo-personal-liderazgo",
  },
  { title: "Herramientas Técnicas", value: "herramientas-tecnicas" },
];

const MODALITIES = [
  { title: "Presencial", value: "presencial" },
  { title: "En vivo por Zoom", value: "zoom" },
  { title: "Mixto", value: "mixto" },
];

export const course = defineType({
  name: "course",
  title: "Curso",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Categoría",
      type: "string",
      options: { list: CATEGORIES, layout: "dropdown" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descripción",
      type: "text",
      rows: 5,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "date",
      title: "Fecha",
      type: "string",
      description: 'Ej: "Sábado 20 de Junio"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "schedule",
      title: "Horario",
      type: "string",
      description: 'Ej: "9:00 am a 5:00 pm"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "modality",
      title: "Modalidad",
      type: "string",
      options: { list: MODALITIES, layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "features",
      title: "Características / Beneficios",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "instructor",
      title: "Facilitador",
      type: "reference",
      to: [{ type: "instructor" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Imagen de portada",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Texto alternativo",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "featured",
      title: "Curso destacado",
      type: "boolean",
      description: "Mostrar en la sección de Cursos Destacados del Home",
      initialValue: false,
    }),
    defineField({
      name: "price",
      title: "Precio",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "currency",
      title: "Moneda",
      type: "string",
      initialValue: "USD",
      options: {
        list: [
          { title: "USD", value: "USD" },
          { title: "Bs.", value: "VES" },
        ],
      },
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "date",
      media: "coverImage",
    },
  },
});
