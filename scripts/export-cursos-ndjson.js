/**
 * Script temporal: lee PROGRAMAS DE LOS CURSOS Y TALLERES FAYE SIFONTES.xlsx
 * y genera cursos-import.ndjson alineado con sanity/schemaTypes/course.ts
 *
 * Uso: node scripts/export-cursos-ndjson.js
 */

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const ROOT = path.resolve(__dirname, "..");
const XLSX_PATH = path.join(
  ROOT,
  "PROGRAMAS DE LOS CURSOS Y TALLERES FAYE SIFONTES.xlsx"
);
const OUT_PATH = path.join(ROOT, "cursos-import.ndjson");

/** Pestañas a procesar (name exacto en el Excel) */
const SHEETS = [
  "PROCESOS FISCALES",
  "MI PRIMERA CONTABILIDAD FISCAL",
  "ESTRUCTURA DE COSTOS",
  "DIPLOMADO ADMON",
  "OBLIGACIONES LEGALES Y FISCALES",
];

/**
 * category values literales del esquema (course.ts CATEGORIES.value)
 * modality values: presencial | zoom | mixto
 * certifiedBy options: EDUCA | Lcda. Faye Sifontes | Otra institución
 */
const SHEET_META = {
  "PROCESOS FISCALES": {
    category: "contabilidad-tributos",
    modality: "presencial",
  },
  "MI PRIMERA CONTABILIDAD FISCAL": {
    category: "contabilidad-tributos",
    modality: "presencial",
  },
  "ESTRUCTURA DE COSTOS": {
    category: "administracion-costos",
    modality: "presencial",
  },
  "DIPLOMADO ADMON": {
    category: "administracion-costos",
    modality: "presencial",
  },
  "OBLIGACIONES LEGALES Y FISCALES": {
    category: "contabilidad-tributos",
    modality: "presencial",
  },
};

function cleanCell(value) {
  if (value == null) return "";
  return String(value)
    .replace(/\u00a0/g, " ") // NBSP
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function toTitleCase(str) {
  const small = new Set([
    "de",
    "del",
    "la",
    "las",
    "el",
    "los",
    "y",
    "e",
    "o",
    "u",
    "en",
    "a",
    "al",
    "para",
    "por",
    "con",
  ]);
  return str
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word, i) => {
      if (i > 0 && small.has(word)) return word;
      if (word.includes(":")) {
        const [a, ...rest] = word.split(":");
        const head = a.charAt(0).toUpperCase() + a.slice(1);
        const tail = rest
          .map((p) => (p ? p.charAt(0).toUpperCase() + p.slice(1) : ""))
          .join(":");
        return tail ? `${head}:${tail}` : `${head}:`;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function slugify(title) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function stripLeadingNumber(text) {
  return text.replace(/^\d+[\.)]\s*/, "").trim();
}

function isSectionHeader(text) {
  const t = text.toLowerCase().replace(/\s+/g, " ");
  return (
    /^dirigido a:?$/.test(t) ||
    /^objetivo general:?$/.test(t) ||
    /^contenido program[aá]tico:?$/.test(t) ||
    /^duraci[oó]n(\s*\/\s*horario)?:?$/.test(t) ||
    /^incluye:?$/.test(t) ||
    /^conceptos y ejemplos:?$/.test(t) ||
    /^leyes:?$/.test(t) ||
    /^tel[eé]fono:/.test(t)
  );
}

function isModuleLabel(text) {
  return /^m[oó]dulo\s+[ivx\d]+$/i.test(text.trim());
}

function findTitle(rows) {
  for (const row of rows) {
    for (const cell of row) {
      const t = cleanCell(cell);
      if (
        /^(CERTIFICACION|CERTIFICACIÓN|CURSO|DIPLOMADO|CONFERENCIA)\s*:/i.test(
          t
        )
      ) {
        return toTitleCase(t);
      }
    }
  }
  throw new Error("No se encontró título (CERTIFICACION/CURSO/DIPLOMADO/CONFERENCIA)");
}

function findSectionIndex(rows, predicate) {
  for (let i = 0; i < rows.length; i++) {
    const first = cleanCell(rows[i][0]);
    if (predicate(first)) return i;
  }
  return -1;
}

function findSectionText(rows, headerRegex) {
  const idx = findSectionIndex(rows, (t) => headerRegex.test(t.toLowerCase()));
  if (idx === -1) return "";
  // Texto en la misma celda tras el header, o en la fila siguiente
  const same = cleanCell(rows[idx][0]).replace(headerRegex, "").trim();
  if (same) return same;
  for (let j = idx + 1; j < rows.length; j++) {
    const vals = rows[j].map(cleanCell).filter(Boolean);
    if (vals.length === 0) continue;
    const joined = vals.join(" ");
    if (isSectionHeader(joined)) break;
    return vals[0];
  }
  return "";
}

function extractDuration(rows) {
  const idx = findSectionIndex(rows, (t) =>
    /^duraci[oó]n(\s*\/\s*horario)?/.test(t.toLowerCase())
  );
  if (idx === -1) return "Por confirmar";
  const parts = [];
  for (let j = idx + 1; j < Math.min(idx + 5, rows.length); j++) {
    const vals = rows[j].map(cleanCell).filter(Boolean);
    if (vals.length === 0) {
      if (parts.length) break;
      continue;
    }
    const first = vals[0];
    if (isSectionHeader(first) || /^incluye/i.test(first)) break;
    parts.push(...vals);
  }
  return parts.join(" / ") || "Por confirmar";
}

function extractFeatures(rows) {
  const contentIdx = findSectionIndex(rows, (t) =>
    /^contenido program[aá]tico/.test(t.toLowerCase())
  );
  const durationIdx = findSectionIndex(rows, (t) =>
    /^duraci[oó]n(\s*\/\s*horario)?/.test(t.toLowerCase())
  );
  const incluyeIdx = findSectionIndex(rows, (t) => /^incluye/.test(t.toLowerCase()));

  const features = [];
  const seen = new Set();

  const pushFeature = (raw) => {
    let text = stripLeadingNumber(cleanCell(raw));
    if (!text) return;
    if (isSectionHeader(text)) return;
    if (isModuleLabel(text)) {
      // Conservar módulos como viñetas de agrupación
      text = text.replace(/^m[oó]dulo/i, "Módulo");
    }
    // Filtrar etiquetas de día ("1. SABADO", "SABADO", etc.)
    if (/^(\d+\.?\s*)?s[aá]bado$/i.test(text)) return;
    const key = text.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    features.push(text);
  };

  const endContent = durationIdx !== -1 ? durationIdx : incluyeIdx !== -1 ? incluyeIdx : rows.length;
  if (contentIdx !== -1) {
    for (let i = contentIdx + 1; i < endContent; i++) {
      for (const cell of rows[i]) {
        pushFeature(cell);
      }
    }
  }

  if (incluyeIdx !== -1) {
    for (let i = incluyeIdx + 1; i < rows.length; i++) {
      const vals = rows[i].map(cleanCell).filter(Boolean);
      if (vals.length === 0) continue;
      if (/^tel[eé]fono:/i.test(vals[0])) break;
      if (isSectionHeader(vals[0])) break;
      pushFeature(vals[0]);
    }
  }

  return features;
}

function buildDescription(rows) {
  const objetivo = findSectionText(rows, /^objetivo general:?\s*/i);
  const dirigido = findSectionText(rows, /^dirigido a:?\s*/i);
  const parts = [];
  if (objetivo) parts.push(objetivo);
  if (dirigido) parts.push(`Dirigido a: ${dirigido}`);
  return parts.join(" ") || "Sin descripción";
}

function sheetToCourse(sheetName, ws) {
  const rows = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: "",
    raw: false,
  });

  const meta = SHEET_META[sheetName];
  const title = findTitle(rows);
  const schedule = extractDuration(rows);
  const features = extractFeatures(rows);

  if (features.length === 0) {
    throw new Error(`[${sheetName}] features vacío (mínimo 1 requerido por el esquema)`);
  }

  // Campos omitidos a propósito: coverImage, gallery, instructor
  // date es required en el esquema; el Excel no trae fecha concreta
  const doc = {
    _type: "course",
    title,
    slug: { _type: "slug", current: slugify(title) },
    category: meta.category,
    description: buildDescription(rows),
    date: "Por confirmar",
    schedule,
    modality: meta.modality,
    features,
    featured: false,
    price: 0,
    currency: "USD",
    // Valor válido del listado en course.ts (options.list)
    certifiedBy: "EDUCA",
  };

  return doc;
}

function main() {
  if (!fs.existsSync(XLSX_PATH)) {
    console.error("No se encontró el Excel:", XLSX_PATH);
    process.exit(1);
  }

  const wb = XLSX.readFile(XLSX_PATH);
  const docs = [];

  for (const name of SHEETS) {
    if (!wb.Sheets[name]) {
      console.error(`Pestaña no encontrada: ${name}`);
      process.exit(1);
    }
    const doc = sheetToCourse(name, wb.Sheets[name]);
    docs.push(doc);
    console.log(`✓ ${name}`);
    console.log(`  title: ${doc.title}`);
    console.log(`  slug:  ${doc.slug.current}`);
    console.log(`  category/modality: ${doc.category} / ${doc.modality}`);
    console.log(`  schedule: ${doc.schedule}`);
    console.log(`  features: ${doc.features.length}`);
  }

  // Validación NDJSON: una línea JSON por documento, sin saltos internos
  const lines = docs.map((doc) => {
    const line = JSON.stringify(doc);
    if (line.includes("\n") || line.includes("\r")) {
      throw new Error("JSON.stringify produjo saltos de línea inesperados");
    }
    return line;
  });

  fs.writeFileSync(OUT_PATH, lines.join("\n") + "\n", "utf8");

  // Verificación de parseo línea a línea
  const raw = fs.readFileSync(OUT_PATH, "utf8").trimEnd();
  const parsed = raw.split("\n").map((l, i) => {
    try {
      return JSON.parse(l);
    } catch (e) {
      throw new Error(`Línea ${i + 1} no es JSON válido: ${e.message}`);
    }
  });

  console.log(`\nGenerado: ${OUT_PATH}`);
  console.log(`Documentos: ${parsed.length}`);
  console.log("Listo para: npx sanity dataset import cursos-import.ndjson <dataset>");
}

main();
