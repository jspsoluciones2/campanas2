import { readFileSync } from "fs";

const envText = readFileSync(".env", "utf-8");
const env = {};
for (const line of envText.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const i = t.indexOf("=");
  if (i === -1) continue;
  env[t.slice(0, i).trim()] = t.slice(i + 1).trim();
}

const headers = {
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
};
const base = env.NEXT_PUBLIC_SUPABASE_URL;

async function q(url) {
  const r = await fetch(base + url, { headers });
  return r.json();
}

async function qRaw(url) {
  const r = await fetch(base + url, { headers });
  return { status: r.status, text: await r.text() };
}

async function main() {
  // 1. Encontrar un cliente existente
  console.log("=== Clientes existentes ===");
  const clientes = await q("/rest/v1/clientes?select=id,nombre,tipo_documento,numero_documento&limit=5");
  console.log(JSON.stringify(clientes, null, 2));

  // 2. Estructura de campanas
  console.log("\n=== campanas (schema) ===");
  const camp = await q("/rest/v1/campanas?select=*&limit=1");
  if (camp.length > 0) {
    console.log("Columnas:", Object.keys(camp[0]).join(", "));
    console.log(JSON.stringify(camp[0], null, 2));
  } else {
    console.log("No hay campañas");
  }

  // 3. campana_territorio
  console.log("\n=== campana_territorio (schema) ===");
  const ct = await q("/rest/v1/campana_territorio?select=*&limit=3");
  if (ct.length > 0) {
    console.log("Columnas:", Object.keys(ct[0]).join(", "));
    console.log(JSON.stringify(ct[0], null, 2));
  } else {
    console.log("No hay registros en campana_territorio");
  }

  // 4. votantes
  console.log("\n=== votantes (schema) ===");
  const vt = await q("/rest/v1/votantes?select=*&limit=1");
  if (vt.length > 0) {
    console.log("Columnas:", Object.keys(vt[0]).join(", "));
    console.log(JSON.stringify(vt[0], null, 2));
  } else {
    console.log("No hay votantes");
    // Intentar con POST / table info
    const info = await qRaw("/rest/v1/votantes?limit=0");
    console.log("Status:", info.status);
  }

  // 5. puesto_votacion
  console.log("\n=== puesto_votacion (schema) ===");
  const pv = await q("/rest/v1/puesto_votacion?select=*&limit=1");
  if (pv.length > 0) {
    console.log("Columnas:", Object.keys(pv[0]).join(", "));
    console.log(JSON.stringify(pv[0], null, 2));
  } else {
    console.log("No hay puestos de votacion");
    const info = await qRaw("/rest/v1/puesto_votacion?limit=0");
    console.log("Status:", info.status);
  }

  // 6. departamentos y municipios
  console.log("\n=== Departamentos ===");
  const deptos = await q("/rest/v1/departamentos?select=id,nombre&limit=3");
  console.log(JSON.stringify(deptos, null, 2));

  console.log("\n=== Municipios (del primer depto) ===");
  const mpios = await q("/rest/v1/municipios?select=id,nombre,id_departamento&limit=3");
  console.log(JSON.stringify(mpios, null, 2));

  // 7. Tablas de relación campana-cliente?
  console.log("\n=== campana_cliente? ===");
  const cc = await qRaw("/rest/v1/campana_cliente?limit=1");
  console.log("Status:", cc.status);

  // 8. Elecciones / años disponibles
  console.log("\n=== Tipos de campaña disponibles ===");
  const tipos = await qRaw("/rest/v1/?limit=0");
  console.log("Status:", tipos.status);

  // 9. Query votantes columns via information_schema
  console.log("\n=== information_schema: votantes ===");
  const is = await q(`/rest/v1/rpc/get_table_info?table_name=votantes`);
  console.log(JSON.stringify(is, null, 2));
}

main().catch(console.error);
