import { defineField, defineType } from "sanity";

export const instructor = defineType({
  name: "instructor",
  title: "Instructor",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      type: "string",
      description: 'Ej: "Abog. Omar Martínez"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "role",
      title: "Cargo / Rol",
      type: "string",
      description: 'Ej: "Ex Juez del Trabajo"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "bio",
      title: "Biografía",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "photo",
      title: "Foto",
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
  ],
  preview: {
    select: { title: "name", subtitle: "role", media: "photo" },
  },
});
