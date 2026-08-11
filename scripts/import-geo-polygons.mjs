#!/usr/bin/env node
/**
 * import-geo-polygons.mjs
 *
 * Lee los GeoJSON de la demo (dptos.geojson + mpios.geojson),
 * consulta departamentos y municipios existentes en Supabase,
 * y genera un archivo SQL con INSERTs válidos para geo_poligonos.
 *
 * Uso:
 *   node scripts/import-geo-polygons.mjs
 *
 * Resultado:
 *   supabase/seed/geo_poligonos_data.sql
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
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
  console.error("ERROR: No se pudo leer NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY del .env");
  process.exit(1);
}

// ─── Archivos GeoJSON ───────────────────────────────────────────────────────
const DPTO_GEOJSON = join(ROOT, "pruebas-estadisticas-master", "interactive", "static", "data", "dptos.geojson");
const MPIO_GEOJSON = join(ROOT, "pruebas-estadisticas-master", "interactive", "static", "data", "mpios.geojson");

if (!existsSync(DPTO_GEOJSON)) { console.error("Falta:", DPTO_GEOJSON); process.exit(1); }
if (!existsSync(MPIO_GEOJSON)) { console.error("Falta:", MPIO_GEOJSON); process.exit(1); }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function computeBbox(geometry) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  const rings =
    geometry.type === "Polygon"
      ? geometry.coordinates
      : geometry.coordinates.flat();

  for (const ring of rings) {
    for (const coord of ring) {
      const [x, y] = coord;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  return [minX, minY, maxX, maxY];
}

function esc(val) {
  if (val == null) return "NULL";
  return `'${String(val).replace(/'/g, "''")}'`;
}

/**
 * Usa dollar-quoting ($GEO$...$GEO$) para el JSON de geometría.
 * Así evitamos escapar single quotes y caracteres especiales dentro del JSON.
 */
function sqlValue(v) {
  if (v == null) return "NULL";
  return `$GEO$${v}$GEO$`;
}

// ─── Cargar GeoJSON ─────────────────────────────────────────────────────────
console.log("📂 Leyendo GeoJSON...");
const dptosRaw = JSON.parse(readFileSync(DPTO_GEOJSON, "utf-8"));
const mpiosRaw = JSON.parse(readFileSync(MPIO_GEOJSON, "utf-8"));

console.log(`   ${dptosRaw.features.length} departamentos (GeoJSON)`);
console.log(`   ${mpiosRaw.features.length} municipios (GeoJSON)`);

// ─── Consultar Supabase ──────────────────────────────────────────────────────
console.log("🔍 Consultando Supabase (service_role)...");

async function supabaseQueryAll(table, select) {
  // La API REST de Supabase devuelve máximo 1000 filas por defecto.
  // Usamos paginación con range() para obtener todas.
  const allRows = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}&offset=${offset}&limit=${pageSize}`;
    const res = await fetch(url, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Supabase ${table} (offset=${offset}): ${res.status} — ${text}`);
    }
    const rows = await res.json();
    if (!rows || rows.length === 0) break;
    allRows.push(...rows);
    if (rows.length < pageSize) break;
    offset += pageSize;
  }

  return allRows;
}

const [departamentosExistentes, municipiosExistentes] = await Promise.all([
  supabaseQueryAll("departamentos", "id,nombre"),
  supabaseQueryAll("municipios", "id,nombre,id_departamento"),
]);

const deptosExistentesSet = new Set(departamentosExistentes.map((d) => d.id));
// Supabase almacena municipios.id como código DANE completo de 5 dígitos (ej. "05001")
// que coincide exactamente con MPIO_CDPMP del GeoJSON.
const municipiosExistentesMap = new Map(
  municipiosExistentes.map((m) => [m.id, m])
);

console.log(`   ${departamentosExistentes.length} departamentos en Supabase`);
console.log(`   ${municipiosExistentes.length} municipios en Supabase`);

// ─── Generar SQL ─────────────────────────────────────────────────────────────
const lines = [];
let deptosOk = 0;
let deptosSkip = 0;
let municipiosOk = 0;
let municipiosSkip = 0;

lines.push("-- ============================================================================");
lines.push("-- Carga inicial de polígonos GeoJSON en geo_poligonos");
lines.push("-- Generado por scripts/import-geo-polygons.mjs");
lines.push(`-- Fecha: ${new Date().toISOString().split("T")[0]}`);
lines.push(`-- Departamentos en Supabase: ${departamentosExistentes.length}`);
lines.push(`-- Municipios en Supabase: ${municipiosExistentes.length}`);
lines.push("-- ============================================================================");
lines.push("");
lines.push("BEGIN;");
lines.push("");

// ── Departamentos ────────────────────────────────────────────────────────────
lines.push("-- ============================================================================");
lines.push("-- Departamentos");
lines.push("-- ============================================================================");
lines.push("");

for (const feature of dptosRaw.features) {
  const p = feature.properties;
  const codigo = String(p.DPTO_CCDGO ?? "").trim();
  const nombre = (p.DPTO_CNMBR ?? "").trim().toUpperCase();

  if (!deptosExistentesSet.has(codigo)) {
    lines.push(`-- SKIP: departamento "${nombre}" (${codigo}) no existe en Supabase`);
    deptosSkip++;
    continue;
  }

  const geometryJson = JSON.stringify(feature.geometry);
  const bbox = computeBbox(feature.geometry);
  const bboxJson = JSON.stringify(bbox);

  lines.push(`INSERT INTO geo_poligonos (codigo_dane, tipo, poligono, nombre, id_departamento, id_municipio, simplified, bbox)`);
  lines.push(`VALUES (${esc(codigo)}, 'departamento', ${sqlValue(geometryJson)}::jsonb, ${esc(nombre)}, ${esc(codigo)}, NULL, true, ${esc(bboxJson)}::jsonb);`);
  deptosOk++;
}

lines.push("");

// ── Municipios ───────────────────────────────────────────────────────────────
lines.push("-- ============================================================================");
lines.push("-- Municipios");
lines.push("-- ============================================================================");
lines.push("");

for (const feature of mpiosRaw.features) {
  const p = feature.properties;
  const codigoDane = String(p.MPIO_CDPMP ?? "").trim();   // "05001"
  const idDept = String(p.DPTO_CCDGO ?? "").trim();        // "05"
  const idMun = String(p.MPIO_CCDGO ?? "").trim();         // "001"
  const nombre = (p.MPIO_CNMBR ?? "").trim().toUpperCase();

  // Verificar que el departamento existe
  if (!deptosExistentesSet.has(idDept)) {
    lines.push(`-- SKIP: municipio "${nombre}" (${codigoDane}) — departamento ${idDept} no existe`);
    municipiosSkip++;
    continue;
  }

  // Verificar que el municipio existe en Supabase.
  // municipios.id en Supabase = código DANE completo de 5 dígitos (ej. "54003"),
  // que coincide exactamente con MPIO_CDPMP del GeoJSON.
  if (!municipiosExistentesMap.has(codigoDane)) {
    lines.push(`-- SKIP: municipio "${nombre}" (${codigoDane}) — no existe en Supabase. Cargalo primero en Maestras > Municipios.`);
    municipiosSkip++;
    continue;
  }

  const geometryJson = JSON.stringify(feature.geometry);
  const bbox = computeBbox(feature.geometry);
  const bboxJson = JSON.stringify(bbox);

  lines.push(`INSERT INTO geo_poligonos (codigo_dane, tipo, poligono, nombre, id_departamento, id_municipio, simplified, bbox)`);
  lines.push(`VALUES (${esc(codigoDane)}, 'municipio', ${sqlValue(geometryJson)}::jsonb, ${esc(nombre)}, ${esc(idDept)}, ${esc(codigoDane)}, true, ${esc(bboxJson)}::jsonb);`);
  municipiosOk++;
}

lines.push("");
lines.push("COMMIT;");
lines.push("");
lines.push("-- ============================================================================");
lines.push(`-- Resumen: ${deptosOk} departamentos insertados, ${deptosSkip} omitidos`);
lines.push(`--          ${municipiosOk} municipios insertados, ${municipiosSkip} omitidos`);
lines.push("-- ============================================================================");

// ─── Escribir archivo ────────────────────────────────────────────────────────
const outputDir = join(ROOT, "supabase", "seed");
import { mkdirSync } from "node:fs";
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });

const outputPath = join(outputDir, "geo_poligonos_data.sql");
writeFileSync(outputPath, lines.join("\n"), "utf-8");

console.log("");
console.log("✅ SQL generado:", outputPath);
console.log(`   ${deptosOk} departamentos insertados, ${deptosSkip} omitidos`);
console.log(`   ${municipiosOk} municipios insertados, ${municipiosSkip} omitidos`);
console.log("");
console.log("📋 Para ejecutar:");
console.log(`   Supabase Studio > SQL Editor > pegar contenido de ${outputPath}`);
console.log("   O via psql si tienes acceso directo a la BD.");
