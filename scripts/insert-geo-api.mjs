#!/usr/bin/env node
/**
 * Inserta los polígonos en geo_poligonos vía REST API de Supabase.
 * No usa SQL Editor, no usa CSV — cada fila va como JSON via HTTP.
 *
 * Uso:
 *   node scripts/insert-geo-api.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

// ─── Cargar .env ────────────────────────────────────────────────────────────
const envPath = join(ROOT, ".env");
let SUPABASE_URL = "";
let SUPABASE_SERVICE_KEY = "";

if (existsSync(envPath)) {
  const envText = readFileSync(envPath, "utf-8");
  for (const line of envText.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const k = trimmed.slice(0, eqIdx).trim();
    const v = trimmed.slice(eqIdx + 1).trim();
    if (k === "NEXT_PUBLIC_SUPABASE_URL") SUPABASE_URL = v;
    if (k === "SUPABASE_SERVICE_ROLE_KEY") SUPABASE_SERVICE_KEY = v;
  }
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("ERROR: No se pudo leer las credenciales del .env");
  process.exit(1);
}

// ─── Archivos GeoJSON ───────────────────────────────────────────────────────
const DPTO_GEOJSON = join(ROOT, "pruebas-estadisticas-master", "interactive", "static", "data", "dptos.geojson");
const MPIO_GEOJSON = join(ROOT, "pruebas-estadisticas-master", "interactive", "static", "data", "mpios.geojson");

if (!existsSync(DPTO_GEOJSON)) { console.error("Falta:", DPTO_GEOJSON); process.exit(1); }
if (!existsSync(MPIO_GEOJSON)) { console.error("Falta:", MPIO_GEOJSON); process.exit(1); }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function calcBbox(geometry) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const rings = geometry.type === "Polygon"
    ? [geometry.coordinates[0]]
    : geometry.coordinates.map(p => p[0]);
  for (const ring of rings) {
    for (const coord of ring) {
      if (coord[0] < minX) minX = coord[0];
      if (coord[1] < minY) minY = coord[1];
      if (coord[0] > maxX) maxX = coord[0];
      if (coord[1] > maxY) maxY = coord[1];
    }
  }
  return [minX, minY, maxX, maxY];
}

// ─── Cargar datos ───────────────────────────────────────────────────────────
const departamentosGeo = JSON.parse(readFileSync(DPTO_GEOJSON, "utf-8"));
const municipiosGeo = JSON.parse(readFileSync(MPIO_GEOJSON, "utf-8"));

const rows = [];

for (const f of departamentosGeo.features) {
  const p = f.properties;
  const codigoDane = String(p.DPTO_CCDGO).trim();
  rows.push({
    codigo_dane: codigoDane,
    tipo: "departamento",
    poligono: f.geometry,
    nombre: p.DPTO_CNMBR,
    id_departamento: codigoDane,
    id_municipio: null,
    simplified: false,
    bbox: calcBbox(f.geometry),
  });
}

for (const f of municipiosGeo.features) {
  const p = f.properties;
  const codigoDane = String(p.MPIO_CDPMP).trim();
  rows.push({
    codigo_dane: codigoDane,
    tipo: "municipio",
    poligono: f.geometry,
    nombre: p.MPIO_CNMBR,
    id_departamento: codigoDane.slice(0, 2),
    id_municipio: codigoDane,
    simplified: false,
    bbox: calcBbox(f.geometry),
  });
}

console.log(`📦 ${rows.length} filas para insertar (${departamentosGeo.features.length} dptos, ${municipiosGeo.features.length} mpios)`);

// ─── Insertar vía REST API ──────────────────────────────────────────────────
const API_URL = `${SUPABASE_URL}/rest/v1/geo_poligonos`;
const HEADERS = {
  "Content-Type": "application/json",
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  Prefer: "resolution=merge-duplicates",
};

let inserted = 0;
let errors = 0;
const BATCH_SIZE = 5; // 5 por request para no sobrecargar

for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE);
  const res = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(batch),
  });

  if (res.ok) {
    inserted += batch.length;
    process.stdout.write(`\r  ✅ ${inserted}/${rows.length} insertados`);
  } else {
    const text = await res.text();
    console.error(`\n  ❌ Error en lote ${i}-${i + batch.length}: ${res.status} — ${text.slice(0, 200)}`);
    errors++;

    // Si es error de la fila, intentar una por una
    if (res.status === 400 || res.status === 409) {
      for (const row of batch) {
        const singleRes = await fetch(API_URL, {
          method: "POST",
          headers: { ...HEADERS, Prefer: "resolution=merge-duplicates" },
          body: JSON.stringify(row),
        });
        if (singleRes.ok) {
          inserted++;
          process.stdout.write(`\r  ✅ ${inserted}/${rows.length} insertados`);
        } else {
          const txt = await singleRes.text();
          console.error(`\n  ❌ ${row.codigo_dane} (${row.nombre}): ${singleRes.status} — ${txt.slice(0, 150)}`);
          errors++;
        }
      }
    }
  }
}

console.log(`\n\n📊 Resumen:`);
console.log(`  Insertados: ${inserted}`);
console.log(`  Errores:    ${errors}`);
if (errors === 0) {
  console.log("✅ Todos los polígonos cargados exitosamente.");
} else {
  console.log("⚠️  Algunos registros fallaron. Revisá los errores arriba.");
}
