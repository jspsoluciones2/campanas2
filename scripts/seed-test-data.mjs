#!/usr/bin/env node
/**
 * Crea datos de prueba: 3 campañas, 30 puestos (~100 votantes).
 * Usa la REST API de Supabase con service_role key (bypasea RLS).
 *
 * Uso:
 *   node scripts/seed-test-data.mjs
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
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    if (k === "NEXT_PUBLIC_SUPABASE_URL") SUPABASE_URL = v;
    if (k === "SUPABASE_SERVICE_ROLE_KEY") SUPABASE_SERVICE_KEY = v;
  }
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("ERROR: No se pudieron leer credenciales del .env");
  process.exit(1);
}

const API = `${SUPABASE_URL}/rest/v1`;
const HEADERS = {
  "Content-Type": "application/json",
  apikey: SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
  Prefer: "return=representation",
};

async function get(url) {
  const res = await fetch(`${API}${url}`, { headers: HEADERS });
  const text = await res.text();
  if (!res.ok) throw new Error(`GET ${url}: ${res.status} — ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

async function post(url, body) {
  const res = await fetch(`${API}${url}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`POST ${url}: ${res.status} — ${text.slice(0, 300)}`);
  return JSON.parse(text);
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const nombres = [
  "Carlos","María","José","Ana","Luis","Carmen","Jorge","Sofía","Pedro","Laura",
  "Andrés","Valentina","Diego","Camila","Felipe","Natalia","Santiago","Daniela",
  "Juan","Isabella","Ricardo","Paula","Oscar","Gabriela","Fernando","Ximena",
  "Alberto","Liliana","Rafael","Andrea","Mauricio","Diana","Héctor","Mónica",
  "Guillermo","Adriana","Alejandro","Patricia","Manuel","Viviana",
];
const apellidos = [
  "García","Rodríguez","Martínez","López","Álvarez","Gómez","Hernández",
  "Torres","Ramírez","Castro","Vargas","Jiménez","Moreno","Rojas",
  "Muñoz","Medina","Córdoba","Restrepo","Ospina","Zapata","Londoño",
  "Jaramillo","Arango","Valencia","Rendón","Giraldo","Orrego","Pérez","Duque","Salazar",
];
const tiposDoc = ["CC","CE","TI"];
const sexos = ["Masculino","Femenino"];
const estados = ["activo","activo","activo","activo","pendiente_verificacion"];

function random(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomDoc() { return String(randomInt(1000000, 115000000)); }
function randomDate(s, e) {
  const d = new Date(s, 0, 1).getTime() + Math.random() * (new Date(e, 11, 31).getTime() - new Date(s, 0, 1).getTime());
  return new Date(d).toISOString().split("T")[0];
}
function randomPhone() { return `3${String(randomInt(100, 399))}${String(randomInt(100000, 999999))}`; }

// ─── 1. IDs existentes ──────────────────────────────────────────────────────
console.log("🔍 Consultando datos existentes...");
const [clientes, procesosExistentes] = await Promise.all([
  get("/clientes?select=id,nombre&limit=1"),
  get("/procesos_electorales?select=id,nombre&limit=1"),
]);
if (!clientes.length) { console.error("ERROR: No hay clientes."); process.exit(1); }
const idCliente = clientes[0].id;
console.log(`  Cliente: ${clientes[0].nombre} (id=${idCliente})`);
console.log(`  Proceso existente: ${procesosExistentes[0]?.nombre} (no se toca)`);

// ─── 2. Crear procesos electorales para las 3 campañas ──────────────────────
console.log("\n📅 Creando procesos electorales...");
const procesosData = [
  { nombre: "Presidenciales 2026", fecha_eleccion: "2026-05-31" },
  { nombre: "Gobernación Antioquia 2026", fecha_eleccion: "2026-05-31" },
  { nombre: "Alcaldía Medellín 2026", fecha_eleccion: "2026-05-31" },
];
const idProcesos = [];
for (const p of procesosData) {
  const r = await post("/procesos_electorales", p);
  idProcesos.push(r[0]?.id ?? r?.id);
  console.log(`  ✅ ${p.nombre} -> id=${idProcesos.at(-1)}`);
}

// ─── 3. Crear 3 campañas ────────────────────────────────────────────────────
console.log("\n📦 Creando campañas...");
const campanasData = [
  { id_cliente: idCliente, id_proceso_electoral: idProcesos[0], nombre: "Campaña Nacional - Presidenciales 2026", estado: "activa" },
  { id_cliente: idCliente, id_proceso_electoral: idProcesos[1], nombre: "Campaña Departamental - Antioquia 2026", estado: "activa" },
  { id_cliente: idCliente, id_proceso_electoral: idProcesos[2], nombre: "Campaña Municipal - Medellín 2026", estado: "activa" },
];
const campanas = [];
for (const c of campanasData) {
  const r = await post("/campanas", c);
  campanas.push(r[0] ?? r);
  console.log(`  ✅ ${r[0]?.nombre || c.nombre} -> id=${r[0]?.id || r?.id}`);
}
const [campNac, campDept, campMun] = campanas;

// ─── 4. Campaña territorio ──────────────────────────────────────────────────
console.log("\n🗺️  Asignando territorios...");
await post("/campana_territorio", { id_campana: campDept.id, id_departamento: "05", id_municipio: null });
console.log(`  ✅ Campaña departamental -> Antioquia`);
await post("/campana_territorio", { id_campana: campMun.id, id_departamento: null, id_municipio: "05001" });
console.log(`  ✅ Campaña municipal -> Medellín`);
console.log(`  ✅ Campaña nacional -> todo el país (sin fila)`);

// ─── 5. Roles ───────────────────────────────────────────────────────────────
console.log("\n📦 Creando roles...");
const rolesData = [
  { id_campana: campNac.id, nombre: "Coordinador Nacional", nivel_jerarquia: 1 },
  { id_campana: campNac.id, nombre: "Coordinador Regional", nivel_jerarquia: 2 },
  { id_campana: campNac.id, nombre: "Líder Local", nivel_jerarquia: 3 },
  { id_campana: campDept.id, nombre: "Coordinador Departamental", nivel_jerarquia: 1 },
  { id_campana: campDept.id, nombre: "Líder Municipal", nivel_jerarquia: 2 },
  { id_campana: campDept.id, nombre: "Promotor", nivel_jerarquia: 3 },
  { id_campana: campMun.id, nombre: "Jefe de Campaña", nivel_jerarquia: 1 },
  { id_campana: campMun.id, nombre: "Coordinador de Zona", nivel_jerarquia: 2 },
  { id_campana: campMun.id, nombre: "Líder de Manzana", nivel_jerarquia: 3 },
];
const roles = {};
for (const r of rolesData) {
  const created = await post("/roles", r);
  const role = created[0] ?? created;
  roles[`${r.id_campana}_${r.nivel_jerarquia}`] = role;
  console.log(`  ✅ ${r.nombre} (nivel ${r.nivel_jerarquia}) -> id=${role.id}`);
}

// ─── 6. Puestos de votación (globales, SIN id_campana) ──────────────────────
console.log("\n📦 Creando 30 puestos de votación...");
const puestosList = [];
const puestosData = [
  // Nacional — varias ciudades
  { nombre: "Colegio Nacional Bogotá",          municipio: "Bogotá",       direccion: "Cra 7 # 32-10",  votantes_hombres_admite: 2000, votantes_mujeres_admite: 2000, cantidad_mesas: 15 },
  { nombre: "IE La Salle Medellín",             municipio: "Medellín",     direccion: "Cl 50 # 45-20",   votantes_hombres_admite: 1500, votantes_mujeres_admite: 1500, cantidad_mesas: 12 },
  { nombre: "Colegio San José Cali",            municipio: "Cali",         direccion: "Av 3N # 20-50",   votantes_hombres_admite: 1800, votantes_mujeres_admite: 1800, cantidad_mesas: 14 },
  { nombre: "IE INEM Barranquilla",             municipio: "Barranquilla", direccion: "Cra 51 # 80-30",   votantes_hombres_admite: 2000, votantes_mujeres_admite: 2000, cantidad_mesas: 16 },
  { nombre: "Colegio San Juan Cartagena",       municipio: "Cartagena",    direccion: "Av Pedro Heredia",votantes_hombres_admite: 1200, votantes_mujeres_admite: 1200, cantidad_mesas: 10 },
  { nombre: "IE Normal Bucaramanga",            municipio: "Bucaramanga",  direccion: "Cl 36 # 20-40",   votantes_hombres_admite: 1500, votantes_mujeres_admite: 1500, cantidad_mesas: 11 },
  { nombre: "Colegio Santa Teresa Manizales",   municipio: "Manizales",    direccion: "Cra 23 # 60-30",  votantes_hombres_admite: 1000, votantes_mujeres_admite: 1000, cantidad_mesas: 8  },
  { nombre: "IE Pablo VI Pereira",              municipio: "Pereira",      direccion: "Av Circunvalar",  votantes_hombres_admite: 1000, votantes_mujeres_admite: 1000, cantidad_mesas: 8  },
  { nombre: "Colegio San Miguel Cúcuta",       municipio: "Cúcuta",       direccion: "Av 5 # 20-30",    votantes_hombres_admite: 1400, votantes_mujeres_admite: 1400, cantidad_mesas: 11 },
  { nombre: "IE Jorge Isaacs Sincelejo",        municipio: "Sincelejo",    direccion: "Cl 25 # 15-50",   votantes_hombres_admite: 800,  votantes_mujeres_admite: 800,  cantidad_mesas: 6  },
  // Departamental — Antioquia
  { nombre: "IE Marco Fidel Suárez Medellín",   municipio: "Medellín",     direccion: "Cl 44 # 70-30",   votantes_hombres_admite: 1500, votantes_mujeres_admite: 1500, cantidad_mesas: 12 },
  { nombre: "Colegio San Ignacio Medellín",     municipio: "Medellín",     direccion: "Cra 50 # 40-20",  votantes_hombres_admite: 1200, votantes_mujeres_admite: 1200, cantidad_mesas: 10 },
  { nombre: "IE Rafael Uribe Envigado",         municipio: "Envigado",     direccion: "Cl 38 Sur",       votantes_hombres_admite: 1000, votantes_mujeres_admite: 1000, cantidad_mesas: 8  },
  { nombre: "Colegio La Salle Bello",           municipio: "Bello",        direccion: "Av 42 # 55-30",   votantes_hombres_admite: 900,  votantes_mujeres_admite: 900,  cantidad_mesas: 7  },
  { nombre: "IE San José Itagüí",              municipio: "Itagüí",       direccion: "Cl 50 # 55-20",   votantes_hombres_admite: 700,  votantes_mujeres_admite: 700,  cantidad_mesas: 6  },
  { nombre: "Colegio Santa María Rionegro",     municipio: "Rionegro",     direccion: "Cra 52 # 40-10",  votantes_hombres_admite: 800,  votantes_mujeres_admite: 800,  cantidad_mesas: 6  },
  { nombre: "IE La Paz Marinilla",              municipio: "Marinilla",    direccion: "Cra 30 # 30-20",  votantes_hombres_admite: 600,  votantes_mujeres_admite: 600,  cantidad_mesas: 5  },
  { nombre: "Colegio San Sebastián Yarumal",   municipio: "Yarumal",      direccion: "Cl 20 # 15-40",   votantes_hombres_admite: 500,  votantes_mujeres_admite: 500,  cantidad_mesas: 4  },
  { nombre: "IE José María Córdoba Apartadó",  municipio: "Apartadó",     direccion: "Av Las Américas", votantes_hombres_admite: 1000, votantes_mujeres_admite: 1000, cantidad_mesas: 8  },
  { nombre: "Colegio San Luis Turbo",           municipio: "Turbo",        direccion: "Cl 90 # 30-20",   votantes_hombres_admite: 700,  votantes_mujeres_admite: 700,  cantidad_mesas: 5  },
  // Municipal — Medellín
  { nombre: "IE Alfonso López Pumarejo",        municipio: "Medellín",     direccion: "Cl 75 # 80-50",   votantes_hombres_admite: 1000, votantes_mujeres_admite: 1000, cantidad_mesas: 8  },
  { nombre: "Colegio San Carlos Medellín",      municipio: "Medellín",     direccion: "Cra 65 # 44-10",  votantes_hombres_admite: 1200, votantes_mujeres_admite: 1200, cantidad_mesas: 10 },
  { nombre: "IE Monseñor Gerardo Valencia",     municipio: "Medellín",     direccion: "Cra 74 # 95-20",  votantes_hombres_admite: 800,  votantes_mujeres_admite: 800,  cantidad_mesas: 6  },
  { nombre: "Colegio Jesús María Medellín",     municipio: "Medellín",     direccion: "Cl 56 # 50-40",   votantes_hombres_admite: 900,  votantes_mujeres_admite: 900,  cantidad_mesas: 7  },
  { nombre: "IE Pedro Justo Berrío",            municipio: "Medellín",     direccion: "Av 76 # 35-60",   votantes_hombres_admite: 700,  votantes_mujeres_admite: 700,  cantidad_mesas: 6  },
  { nombre: "Colegio La Enseñanza Medellín",    municipio: "Medellín",     direccion: "Cl 50 # 65-30",   votantes_hombres_admite: 800,  votantes_mujeres_admite: 800,  cantidad_mesas: 7  },
  { nombre: "IE Héctor Abad Gómez",             municipio: "Medellín",     direccion: "Cra 97 # 45-70",  votantes_hombres_admite: 600,  votantes_mujeres_admite: 600,  cantidad_mesas: 5  },
  { nombre: "Colegio San Lorenzo Medellín",     municipio: "Medellín",     direccion: "Av 80 # 60-50",   votantes_hombres_admite: 700,  votantes_mujeres_admite: 700,  cantidad_mesas: 6  },
  { nombre: "IE Horacio Muñoz Suescún",         municipio: "Medellín",     direccion: "Cl 106 # 65-30",  votantes_hombres_admite: 500,  votantes_mujeres_admite: 500,  cantidad_mesas: 4  },
  { nombre: "Colegio Hermano Miguel Medellín",  municipio: "Medellín",     direccion: "Cra 49 # 36-50",  votantes_hombres_admite: 600,  votantes_mujeres_admite: 600,  cantidad_mesas: 5  },
];
for (const p of puestosData) {
  const r = await post("/puestos_votacion", { ...p, fuente: "registraduria" });
  puestosList.push(r[0] ?? r);
}
console.log(`  ✅ ${puestosList.length} puestos de votación creados`);

// ─── 7. Votantes (~100) ─────────────────────────────────────────────────────
console.log("\n📦 Creando votantes...");

function makeVotante(base) {
  const nombresVal = random(nombres);
  return {
    nombres: nombresVal,
    apellidos: `${random(apellidos)} ${random(apellidos)}`,
    documento: randomDoc(),
    tipo_documento: random(base.tiposDoc ?? tiposDoc),
    sexo: random(sexos),
    fecha_nacimiento: randomDate(base.edadMin ?? 1945, base.edadMax ?? 2005),
    telefono: randomPhone(),
    direccion: base.direccion || `${random(["Cra","Cl","Av"])} ${randomInt(1,120)} # ${randomInt(1,80)}-${randomInt(1,100)}`,
    id_campana: base.id_campana,
    id_departamento: base.id_departamento ?? null,
    id_municipio: base.id_municipio ?? null,
    id_rol: base.id_rol ?? null,
    id_lider_directo: base.id_lider_directo ?? null,
    id_puesto_votacion: base.id_puesto_votacion ?? null,
    mesa: base.mesa ?? null,
    estado: base.estado ?? "activo",
    canal_origen: "manual",
  };
}

let totalVotantes = 0;

// Campaña Nacional: 35 votantes dispersos en varias ciudades
const puestosNac = puestosList.slice(0, 10);
const lideresNac = [];
for (let i = 0; i < 2; i++) {
  const v = makeVotante({
    id_campana: campNac.id, id_departamento: "11", id_municipio: "11001",
    id_rol: roles[`${campNac.id}_1`].id, edadMin: 1975, edadMax: 1995,
    tiposDoc: ["CC"],
    estado: "activo",
  });
  const r = await post("/votantes", v);
  lideresNac.push(r[0] ?? r);
  totalVotantes++;
}
const intermediosNac = [];
for (let i = 0; i < 3; i++) {
  const v = makeVotante({
    id_campana: campNac.id, id_departamento: "11", id_municipio: "11001",
    id_rol: roles[`${campNac.id}_2`].id,
    id_lider_directo: random(lideresNac).id,
    edadMin: 1980, edadMax: 2000, tiposDoc: ["CC"], estado: "activo",
  });
  const r = await post("/votantes", v);
  intermediosNac.push(r[0] ?? r);
  totalVotantes++;
}
for (let i = 0; i < 30; i++) {
  const puesto = random(puestosNac);
  const dept = puesto.municipio === "Bogotá" ? "11" : "50"; // simplificado
  const mun  = puesto.municipio === "Bogotá" ? "11001" : "50001";
  const v = makeVotante({
    id_campana: campNac.id,
    id_departamento: dept, id_municipio: mun,
    id_rol: roles[`${campNac.id}_3`].id,
    id_lider_directo: random(intermediosNac).id,
    id_puesto_votacion: puesto.id,
    mesa: String(randomInt(1, puesto.cantidad_mesas)),
    edadMin: 1945, edadMax: 2005,
  });
  await post("/votantes", v);
  totalVotantes++;
}
console.log(`  ✅ Campaña Nacional: ${totalVotantes} votantes`);

// Campaña Departamental: 33 votantes en Antioquia
const puestosDept = puestosList.slice(10, 20);
const lideresDept = [];
for (let i = 0; i < 2; i++) {
  const v = makeVotante({
    id_campana: campDept.id, id_departamento: "05", id_municipio: "05001",
    id_rol: roles[`${campDept.id}_1`].id, edadMin: 1975, edadMax: 1995,
    tiposDoc: ["CC"], estado: "activo",
  });
  const r = await post("/votantes", v);
  lideresDept.push(r[0] ?? r);
}
const intermediosDept = [];
for (let i = 0; i < 3; i++) {
  const v = makeVotante({
    id_campana: campDept.id, id_departamento: "05", id_municipio: "05001",
    id_rol: roles[`${campDept.id}_2`].id,
    id_lider_directo: random(lideresDept).id,
    edadMin: 1980, edadMax: 2000, tiposDoc: ["CC"], estado: "activo",
  });
  const r = await post("/votantes", v);
  intermediosDept.push(r[0] ?? r);
}
for (let i = 0; i < 28; i++) {
  const puesto = random(puestosDept);
  const v = makeVotante({
    id_campana: campDept.id, id_departamento: "05", id_municipio: "05001",
    id_rol: roles[`${campDept.id}_3`].id,
    id_lider_directo: random(intermediosDept).id,
    id_puesto_votacion: puesto.id,
    mesa: String(randomInt(1, puesto.cantidad_mesas)),
    edadMin: 1945, edadMax: 2005,
  });
  await post("/votantes", v);
}
const totalDept = 2 + 3 + 28;
totalVotantes += totalDept;
console.log(`  ✅ Campaña Departamental: ${totalDept} votantes`);

// Campaña Municipal: 32 votantes en Medellín
const puestosMun = puestosList.slice(20, 30);
const lideresMun = [];
for (let i = 0; i < 2; i++) {
  const v = makeVotante({
    id_campana: campMun.id, id_departamento: "05", id_municipio: "05001",
    id_rol: roles[`${campMun.id}_1`].id, edadMin: 1975, edadMax: 1995,
    tiposDoc: ["CC"], estado: "activo",
  });
  const r = await post("/votantes", v);
  lideresMun.push(r[0] ?? r);
}
const intermediosMun = [];
for (let i = 0; i < 3; i++) {
  const v = makeVotante({
    id_campana: campMun.id, id_departamento: "05", id_municipio: "05001",
    id_rol: roles[`${campMun.id}_2`].id,
    id_lider_directo: random(lideresMun).id,
    edadMin: 1980, edadMax: 2000, tiposDoc: ["CC"], estado: "activo",
  });
  const r = await post("/votantes", v);
  intermediosMun.push(r[0] ?? r);
}
for (let i = 0; i < 27; i++) {
  const puesto = random(puestosMun);
  const v = makeVotante({
    id_campana: campMun.id, id_departamento: "05", id_municipio: "05001",
    id_rol: roles[`${campMun.id}_3`].id,
    id_lider_directo: random(intermediosMun).id,
    id_puesto_votacion: puesto.id,
    mesa: String(randomInt(1, puesto.cantidad_mesas)),
    edadMin: 1945, edadMax: 2005,
  });
  await post("/votantes", v);
}
const totalMun = 2 + 3 + 27;
totalVotantes += totalMun;
console.log(`  ✅ Campaña Municipal: ${totalMun} votantes`);

// ─── Resumen ────────────────────────────────────────────────────────────────
console.log(`\n📊  RESUMEN`);
console.log(`  ┌──────────────────────────────┬──────┬──────────┬──────────┐`);
console.log(`  │ Campaña                      │ Pcte │ Votantes │ Roles    │`);
console.log(`  ├──────────────────────────────┼──────┼──────────┼──────────┤`);
console.log(`  │ Nacional                     │  10  │  35      │  3       │`);
console.log(`  │ Departamental (Antioquia)    │  10  │  33      │  3       │`);
console.log(`  │ Municipal (Medellín)         │  10  │  32      │  3       │`);
console.log(`  ├──────────────────────────────┼──────┼──────────┼──────────┤`);
console.log(`  │ TOTAL                        │  30  │  ${String(totalVotantes).padStart(7)}│  9       │`);
console.log(`  └──────────────────────────────┴──────┴──────────┴──────────┘`);
console.log(`  ✅ Datos de prueba creados exitosamente.`);
