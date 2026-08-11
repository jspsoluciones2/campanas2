#!/usr/bin/env node
/**
 * Exporta los polígonos GeoJSON a CSV para importar en Supabase Studio.
 * 
 * Uso:
 *   node scripts/export-geo-polygons-csv.mjs
 * 
 * Luego en Supabase Studio:
 *   Table Editor > Import Data > seleccionar geo_poligonos_data.csv
 *   (se crea una tabla temporal con ese nombre y columnas text)
 *
 *   SQL Editor > pegar geo_poligonos_data.sql (ver más abajo)
 *
 * ============================================================================
 * SQL POST-IMPORT (pegar en SQL Editor DESPUÉS de importar el CSV):
 * ============================================================================
 *
 * BEGIN;
 * -- Insertar departamentos
 * INSERT INTO geo_poligonos (codigo_dane, tipo, poligono, nombre, id_departamento, id_municipio, simplified, bbox)
 * SELECT codigo_dane, tipo, ST_GeomFromGeoJSON(poligono_geojson), nombre,
 *        id_departamento::int, NULLIF(id_municipio, '')::int,
 *        simplified::boolean, bbox::jsonb
 * FROM geo_poligonos_data
 * WHERE tipo = 'departamento';
 *
 * -- Insertar municipios
 * INSERT INTO geo_poligonos (codigo_dane, tipo, poligono, nombre, id_departamento, id_municipio, simplified, bbox)
 * SELECT codigo_dane, tipo, ST_GeomFromGeoJSON(poligono_geojson), nombre,
 *        id_departamento::int, NULLIF(id_municipio, '')::int,
 *        simplified::boolean, bbox::jsonb
 * FROM geo_poligonos_data
 * WHERE tipo = 'municipio';
 *
 * -- Verificar
 * SELECT codigo_dane, tipo, nombre, ST_AsText(poligono)::varchar(80) AS geom_preview
 * FROM geo_poligonos ORDER BY tipo, codigo_dane;
 *
 * -- Limpiar tabla temporal
 * DROP TABLE IF EXISTS geo_poligonos_data;
 *
 * COMMIT;
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

// ─── Config ─────────────────────────────────────────────────────────────────
const DATA_DIR = "pruebas-estadisticas-master/interactive/static/data";
const OUTPUT = "supabase/seed/geo_poligonos_data.csv";

// ─── Cargar GeoJSON ─────────────────────────────────────────────────────────
const departamentosGeo = JSON.parse(
  readFileSync(resolve(DATA_DIR, "dptos.geojson"), "utf-8")
);
const municipiosGeo = JSON.parse(
  readFileSync(resolve(DATA_DIR, "mpios.geojson"), "utf-8")
);

// ─── Helpers ────────────────────────────────────────────────────────────────
function escaparCSV(valor) {
  if (valor == null || valor === undefined) return "";
  const s = String(valor);
  // Si contiene comillas, newlines o comas, escapar con comillas dobles
  if (/["\n\r,]/.test(s) || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function geojsonToString(geometry) {
  return JSON.stringify(geometry);
}

// Elije entre true/false para simplified según tamaño
function esComplejo(geometry) {
  const json = JSON.stringify(geometry);
  // Polígonos grandes (> 100 KB) los marcamos como no simplificados
  return json.length > 100000 ? "false" : "true";
}

function calcBbox(coordinates, type) {
  if (type === "Polygon") {
    return calcBboxRing(coordinates[0]);
  }
  if (type === "MultiPolygon") {
    let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
    for (const polygon of coordinates) {
      const b = calcBboxRing(polygon[0]);
      minLon = Math.min(minLon, b[0]);
      minLat = Math.min(minLat, b[1]);
      maxLon = Math.max(maxLon, b[2]);
      maxLat = Math.max(maxLat, b[3]);
    }
    return [minLon, minLat, maxLon, maxLat];
  }
  return null;
}

function calcBboxRing(ring) {
  let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;
  for (const coord of ring) {
    minLon = Math.min(minLon, coord[0]);
    minLat = Math.min(minLat, coord[1]);
    maxLon = Math.max(maxLon, coord[0]);
    maxLat = Math.max(maxLat, coord[1]);
  }
  return [minLon, minLat, maxLon, maxLat];
}

// ─── Build departamentos rows ───────────────────────────────────────────────
const filas = [];

// Header — EXACTAMENTE igual a la tabla geo_poligonos (sin id auto y created_at)
const columnas = [
  "codigo_dane",
  "tipo",
  "poligono",
  "nombre",
  "id_departamento",
  "id_municipio",
  "simplified",
  "bbox",
];

for (const f of departamentosGeo.features) {
  const p = f.properties;
  const codigoDane = String(p.DPTO_CCDGO).trim();
  const nombre = p.DPTO_CNMBR;
  const geometry = f.geometry;
  const bbox = calcBbox(geometry.coordinates, geometry.type);

  filas.push({
    codigo_dane: codigoDane,
    tipo: "departamento",
    poligono: geojsonToString(geometry),
    nombre,
    id_departamento: codigoDane,
    id_municipio: "",
    simplified: esComplejo(geometry),
    bbox: JSON.stringify(bbox),
  });
}

// ─── Build municipios rows ──────────────────────────────────────────────────
for (const f of municipiosGeo.features) {
  const p = f.properties;
  const codigoDane = String(p.MPIO_CDPMP).trim();
  const nombre = p.MPIO_CNMBR;
  const idDpto = codigoDane.slice(0, 2);
  const geometry = f.geometry;
  const bbox = calcBbox(geometry.coordinates, geometry.type);

  filas.push({
    codigo_dane: codigoDane,
    tipo: "municipio",
    poligono: geojsonToString(geometry),
    nombre,
    id_departamento: idDpto,
    id_municipio: codigoDane,
    simplified: esComplejo(geometry),
    bbox: JSON.stringify(bbox),
  });
}

// ─── Generate CSV ───────────────────────────────────────────────────────────
const lines = [columnas.join(",")];

for (const fila of filas) {
  const values = columnas.map((col) => escaparCSV(fila[col]));
  lines.push(values.join(","));
}

const csv = lines.join("\n");
writeFileSync(resolve(OUTPUT), csv, "utf-8");

// ─── Summary ────────────────────────────────────────────────────────────────
const deptos = filas.filter((f) => f.tipo === "departamento").length;
const mpios = filas.filter((f) => f.tipo === "municipio").length;
const sizeMB = (Buffer.byteLength(csv, "utf-8") / (1024 * 1024)).toFixed(2);
console.log(`✅ CSV generado: ${OUTPUT}`);
console.log(`   ${deptos} departamentos`);
console.log(`   ${mpios} municipios`);
console.log(`   ${filas.length} filas totales`);
console.log(`   ${sizeMB} MB`);

console.log(`
📋 INSTRUCCIONES:
   1. Abrí Supabase Studio > Table Editor > Import Data
   2. Seleccioná ${OUTPUT}
   3. Elegí "Import into existing table" -> geo_poligonos
   4. Mapeá columnas (deberían coincidir automáticamente)
   5. Listo — poligono se importa como jsonb porque es JSON válido
`);
