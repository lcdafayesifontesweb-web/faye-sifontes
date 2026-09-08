/**
 * Copia el facilitador único del campo antiguo `instructor` al nuevo array
 * `instructors`, para los cursos que todavía no fueron migrados.
 *
 * El sitio funciona con o sin esta migración: `resolveCourseInstructors` cae
 * al campo antiguo cuando `instructors` está vacío. Correrla solo deja los
 * datos limpios y permite retirar el campo antiguo más adelante.
 *
 * Uso:
 *   node scripts/migrar-facilitadores.js          # muestra qué haría
 *   node scripts/migrar-facilitadores.js --apply  # aplica los cambios
 */
const { createClient } = require("@sanity/client");
const fs = require("fs");
const path = require("path");

function loadEnv() {
  const file = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^([A-Z_][A-Z0-9_]*)=(.*)$/.exec(line.trim());
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

loadEnv();

const apply = process.argv.includes("--apply");

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function main() {
  if (!process.env.SANITY_API_TOKEN) {
    throw new Error("Falta SANITY_API_TOKEN en .env.local");
  }

  // Incluye borradores: si un curso tiene draft, hay que migrar ambos.
  const pending = await client.fetch(
    // count(instructors) sobre un campo ausente devuelve null, no 0: hay que
    // preguntar primero por defined() o el filtro no encuentra nada.
    `*[_type == "course" && defined(instructor) &&
       (!defined(instructors) || count(instructors) == 0)]{
      _id, title, "instructorId": instructor._ref
    }`
  );

  if (pending.length === 0) {
    console.log("No hay cursos por migrar.");
    return;
  }

  console.log(`Cursos por migrar: ${pending.length}`);
  for (const course of pending) {
    console.log(`  - ${course.title}`);
  }

  if (!apply) {
    console.log("\nSimulación. Vuelve a correrlo con --apply para aplicar.");
    return;
  }

  let tx = client.transaction();
  for (const course of pending) {
    tx = tx.patch(course._id, (patch) =>
      patch.setIfMissing({ instructors: [] }).append("instructors", [
        {
          _type: "reference",
          _ref: course.instructorId,
          _key: `mig-${course.instructorId}`,
        },
      ])
    );
  }

  await tx.commit();
  console.log(`\nListo: ${pending.length} cursos migrados.`);
}

main().catch((err) => {
  console.error("Error en la migración:", err.message);
  process.exit(1);
});
