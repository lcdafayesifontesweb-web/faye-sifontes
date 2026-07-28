/**
 * One-shot: set price=65 (presencial) and priceOnline=50 on ALL courses.
 * Touches ONLY those two fields on published documents — no other content.
 *
 * Usage: node scripts/set-course-prices.js
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@sanity/client");

const ROOT = path.resolve(__dirname, "..");
const PRICE_PRESENCIAL = 65;
const PRICE_ONLINE = 50;

function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  const out = {};
  if (!fs.existsSync(envPath)) return out;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/i);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

async function main() {
  const env = loadEnvLocal();
  const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = env.SANITY_API_TOKEN;

  if (!projectId) {
    console.error("Falta NEXT_PUBLIC_SANITY_PROJECT_ID en .env.local");
    process.exit(1);
  }
  if (!token) {
    console.error("Falta SANITY_API_TOKEN en .env.local (permiso de escritura)");
    process.exit(1);
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token,
    useCdn: false,
  });

  // Only published course docs (exclude drafts.*)
  const courses = await client.fetch(
    `*[_type == "course" && !(_id in path("drafts.**"))]{ _id, title, price, priceOnline }`
  );

  console.log(`projectId=${projectId} dataset=${dataset}`);
  console.log(`Cursos publicados: ${courses.length}`);
  if (!courses.length) {
    console.error("No hay cursos publicados. Abortando.");
    process.exit(1);
  }

  const beforeSample = courses.slice(0, 3).map((c) => ({
    title: c.title,
    price: c.price,
    priceOnline: c.priceOnline,
  }));
  console.log("Muestra antes:", JSON.stringify(beforeSample, null, 2));

  // Single transaction: set ONLY price + priceOnline
  let tx = client.transaction();
  let count = 0;
  for (const course of courses) {
    tx.patch(course._id, {
      set: {
        price: PRICE_PRESENCIAL,
        priceOnline: PRICE_ONLINE,
      },
    });
    count += 1;
    // Sanity transactions have size limits — batch every 40
    if (count % 40 === 0) {
      await tx.commit({ visibility: "sync" });
      console.log(`Batch commit: ${count} cursos…`);
      tx = client.transaction();
    }
  }
  if (count % 40 !== 0) {
    await tx.commit({ visibility: "sync" });
  }

  console.log(
    `OK: price=${PRICE_PRESENCIAL} y priceOnline=${PRICE_ONLINE} en ${count} cursos (solo esos campos).`
  );

  const verify = await client.fetch(
    `*[_type == "course" && !(_id in path("drafts.**"))]{ title, price, priceOnline } | order(title asc)`
  );
  const bad = verify.filter(
    (c) => c.price !== PRICE_PRESENCIAL || c.priceOnline !== PRICE_ONLINE
  );
  console.log("--- Verificación ---");
  for (const c of verify) {
    console.log(
      `${c.title}: presencial=$${c.price} | online=$${c.priceOnline}`
    );
  }
  if (bad.length) {
    console.error(
      `ERROR: ${bad.length} cursos no quedaron con los precios esperados.`
    );
    process.exit(1);
  }
  console.log(
    `\nListo: ${verify.length} cursos con $65 presencial y $50 online.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
