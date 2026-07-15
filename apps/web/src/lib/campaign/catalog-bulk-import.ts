import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CATALOG_BULK_MAX_ROWS,
} from "@/lib/campaign/catalog-bulk-config";
import type { CatalogSegment } from "@/lib/campaign/catalog-nav";
import { insertPuestoRow } from "@/lib/campaign/puestos";
import { fetchTerritorioAlcance } from "@/lib/campaign/comunas";
import { textoTitulo, textoTituloOpcional } from "@/lib/normalize-text";
import type { ParsedBulkRow } from "@/lib/campaign/catalog-bulk-xlsx";

export type BulkImportResult = {
  ok: boolean;
  created: number;
  skipped: number;
  errors: { row: number; message: string }[];
  message: string;
};

function claveNombre(value: string) {
  return textoTitulo(value).toLocaleLowerCase("es-CO");
}

function enteroNoNegativo(value: string, label: string) {
  if (!value.trim()) return 0;
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n < 0) {
    return { error: `${label} debe ser un número entero mayor o igual a 0.` };
  }
  return n;
}

export async function importCatalogRows(
  supabase: SupabaseClient,
  campaignId: number,
  segment: CatalogSegment,
  rows: ParsedBulkRow[]
): Promise<BulkImportResult> {
  if (rows.length > CATALOG_BULK_MAX_ROWS) {
    return {
      ok: false,
      created: 0,
      skipped: 0,
      errors: [],
      message: `Máximo ${CATALOG_BULK_MAX_ROWS} filas por archivo.`,
    };
  }

  switch (segment) {
    case "puestos":
      return importPuestos(supabase, campaignId, rows);
    case "roles":
      return importRoles(supabase, campaignId, rows);
    case "tipos-novedad":
      return importTiposNovedad(supabase, campaignId, rows);
    case "lugares-trabajo":
      return importLugaresTrabajo(supabase, campaignId, rows);
    default:
      return {
        ok: false,
        created: 0,
        skipped: 0,
        errors: [],
        message: "Catálogo no soportado para carga masiva.",
      };
  }
}

function buildResult(
  created: number,
  skipped: number,
  errors: { row: number; message: string }[]
): BulkImportResult {
  const parts: string[] = [];
  if (created > 0) parts.push(`${created} creado(s)`);
  if (skipped > 0) parts.push(`${skipped} omitido(s) por duplicado`);
  if (errors.length > 0) parts.push(`${errors.length} con error`);

  return {
    ok: created > 0 || (skipped > 0 && errors.length === 0),
    created,
    skipped,
    errors,
    message:
      parts.length > 0
        ? `Importación finalizada: ${parts.join(", ")}.`
        : "No se importó ningún registro.",
  };
}

async function importPuestos(
  supabase: SupabaseClient,
  campaignId: number,
  rows: ParsedBulkRow[]
): Promise<BulkImportResult> {
  const alcance = await fetchTerritorioAlcance(supabase, campaignId);

  let comunaQ = supabase.from("comunas").select("id, nombre").order("nombre");
  if (alcance.departamentos.length > 0) {
    comunaQ = comunaQ.in("municipios.id_departamento", alcance.departamentos);
  }
  if (alcance.municipios.length > 0) {
    comunaQ = comunaQ.in("id_municipio", alcance.municipios);
  }
  const { data: comunaData } = await comunaQ;
  const comunaMap = new Map<string, number>(
    (comunaData ?? []).map((c) => [claveNombre(c.nombre), c.id])
  );

  const comunaIds = [...comunaMap.values()];
  const { data: barrioData } = await supabase
    .from("barrios")
    .select("id, nombre, id_comuna")
    .in("id_comuna", comunaIds.length > 0 ? comunaIds : [0])
    .order("nombre");
  const barrioMap = new Map<string, number>();
  for (const b of barrioData ?? []) {
    barrioMap.set(`${b.id_comuna}::${claveNombre(b.nombre)}`, b.id);
  }

  const { data: existentes } = await supabase
    .from("puestos_votacion")
    .select("nombre")
    .eq("id_campana", campaignId);

  const usados = new Set(
    (existentes ?? []).map((row) => claveNombre(row.nombre))
  );
  const enArchivo = new Set<string>();
  const errors: { row: number; message: string }[] = [];
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const nombre = textoTitulo(row.values.nombre ?? "");
    if (!nombre) {
      errors.push({ row: row.rowNumber, message: "El nombre es obligatorio." });
      continue;
    }

    const clave = claveNombre(nombre);
    if (usados.has(clave) || enArchivo.has(clave)) {
      skipped++;
      continue;
    }

    const comunaNombre = row.values.comuna ?? "";
    const barrioNombre = row.values.barrio ?? "";

    if (!comunaNombre.trim()) {
      errors.push({ row: row.rowNumber, message: "La comuna es obligatoria." });
      continue;
    }
    if (!barrioNombre.trim()) {
      errors.push({ row: row.rowNumber, message: "El barrio es obligatorio." });
      continue;
    }

    const idComuna = comunaMap.get(claveNombre(comunaNombre));
    if (!idComuna) {
      errors.push({
        row: row.rowNumber,
        message: `No existe la comuna "${comunaNombre}" en esta campaña.`,
      });
      continue;
    }

    const idBarrio =
      barrioMap.get(`${idComuna}::${claveNombre(barrioNombre)}`) ?? null;
    if (!idBarrio) {
      errors.push({
        row: row.rowNumber,
        message: `El barrio "${barrioNombre}" no pertenece a la comuna "${comunaNombre}".`,
      });
      continue;
    }

    const cuposH = enteroNoNegativo(
      row.values.cupos_hombres ?? "",
      "Cupos hombres"
    );
    if (typeof cuposH === "object" && "error" in cuposH) {
      errors.push({ row: row.rowNumber, message: cuposH.error });
      continue;
    }

    const cuposM = enteroNoNegativo(
      row.values.cupos_mujeres ?? "",
      "Cupos mujeres"
    );
    if (typeof cuposM === "object" && "error" in cuposM) {
      errors.push({ row: row.rowNumber, message: cuposM.error });
      continue;
    }

    const mesas = enteroNoNegativo(row.values.mesas ?? "", "Mesas");
    if (typeof mesas === "object" && "error" in mesas) {
      errors.push({ row: row.rowNumber, message: mesas.error });
      continue;
    }

    const error = await insertPuestoRow(supabase, {
      nombre,
      municipio: textoTituloOpcional(row.values.municipio ?? ""),
      direccion: textoTituloOpcional(row.values.direccion ?? ""),
      id_comuna: idComuna,
      id_barrio: idBarrio,
      votantes_hombres_admite: cuposH,
      votantes_mujeres_admite: cuposM,
      cantidad_mesas: mesas,
    });

    if (error) {
      errors.push({ row: row.rowNumber, message: error.message });
      continue;
    }

    usados.add(clave);
    enArchivo.add(clave);
    created++;
  }

  return buildResult(created, skipped, errors);
}

async function importRoles(
  supabase: SupabaseClient,
  campaignId: number,
  rows: ParsedBulkRow[]
): Promise<BulkImportResult> {
  const { data: existentes } = await supabase
    .from("roles")
    .select("nombre")
    .eq("id_campana", campaignId);

  const usados = new Set(
    (existentes ?? []).map((row) => claveNombre(row.nombre))
  );
  const enArchivo = new Set<string>();
  const errors: { row: number; message: string }[] = [];
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const nombre = textoTitulo(row.values.nombre ?? "");
    const nivelRaw = row.values.nivel ?? "";

    if (!nombre) {
      errors.push({ row: row.rowNumber, message: "El nombre es obligatorio." });
      continue;
    }
    if (!nivelRaw.trim()) {
      errors.push({ row: row.rowNumber, message: "La jerarquía es obligatoria." });
      continue;
    }

    const nivel = Number.parseInt(nivelRaw, 10);
    if (Number.isNaN(nivel) || nivel < 1) {
      errors.push({
        row: row.rowNumber,
        message: "La jerarquía debe ser un número entero mayor o igual a 1.",
      });
      continue;
    }

    const clave = claveNombre(nombre);
    if (usados.has(clave) || enArchivo.has(clave)) {
      skipped++;
      continue;
    }

    const { error } = await supabase.from("roles").insert({
      id_campana: campaignId,
      nombre,
      nivel_jerarquia: nivel,
    });

    if (error) {
      errors.push({ row: row.rowNumber, message: error.message });
      continue;
    }

    usados.add(clave);
    enArchivo.add(clave);
    created++;
  }

  return buildResult(created, skipped, errors);
}

async function importTiposNovedad(
  supabase: SupabaseClient,
  campaignId: number,
  rows: ParsedBulkRow[]
): Promise<BulkImportResult> {
  const { data: existentes } = await supabase
    .from("tipos_novedad")
    .select("novedad")
    .eq("id_campana", campaignId);

  const usados = new Set(
    (existentes ?? []).map((row) => claveNombre(row.novedad))
  );
  const enArchivo = new Set<string>();
  const errors: { row: number; message: string }[] = [];
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const novedad = textoTitulo(row.values.novedad ?? "");
    if (!novedad) {
      errors.push({
        row: row.rowNumber,
        message: "La descripción de la novedad es obligatoria.",
      });
      continue;
    }

    const clave = claveNombre(novedad);
    if (usados.has(clave) || enArchivo.has(clave)) {
      skipped++;
      continue;
    }

    const { error } = await supabase.from("tipos_novedad").insert({
      id_campana: campaignId,
      novedad,
    });

    if (error) {
      errors.push({ row: row.rowNumber, message: error.message });
      continue;
    }

    usados.add(clave);
    enArchivo.add(clave);
    created++;
  }

  return buildResult(created, skipped, errors);
}

async function importLugaresTrabajo(
  supabase: SupabaseClient,
  campaignId: number,
  rows: ParsedBulkRow[]
): Promise<BulkImportResult> {
  const alcance = await fetchTerritorioAlcance(supabase, campaignId);

  let comunaQ = supabase.from("comunas").select("id, nombre").order("nombre");
  if (alcance.departamentos.length > 0) {
    comunaQ = comunaQ.in("municipios.id_departamento", alcance.departamentos);
  }
  if (alcance.municipios.length > 0) {
    comunaQ = comunaQ.in("id_municipio", alcance.municipios);
  }
  const { data: comunaData } = await comunaQ;
  const comunaMap = new Map<string, number>(
    (comunaData ?? []).map((c) => [claveNombre(c.nombre), c.id])
  );

  const comunaIds = [...comunaMap.values()];
  const { data: barrioData } = await supabase
    .from("barrios")
    .select("id, nombre, id_comuna")
    .in("id_comuna", comunaIds.length > 0 ? comunaIds : [0])
    .order("nombre");
  const barrioMap = new Map<string, number>();
  for (const b of barrioData ?? []) {
    barrioMap.set(`${b.id_comuna}::${claveNombre(b.nombre)}`, b.id);
  }

  const { data: existentes } = await supabase
    .from("lugares_trabajo")
    .select("nombre")
    .eq("id_campana", campaignId);

  const usados = new Set(
    (existentes ?? []).map((row) => claveNombre(row.nombre))
  );
  const enArchivo = new Set<string>();
  const errors: { row: number; message: string }[] = [];
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const nombre = textoTitulo(row.values.nombre ?? "");
    if (!nombre) {
      errors.push({ row: row.rowNumber, message: "El nombre es obligatorio." });
      continue;
    }

    const clave = claveNombre(nombre);
    if (usados.has(clave) || enArchivo.has(clave)) {
      skipped++;
      continue;
    }

    const comunaNombre = row.values.comuna ?? "";
    const barrioNombre = row.values.barrio ?? "";
    let idComuna: number | null = null;
    let idBarrio: number | null = null;

    if (comunaNombre.trim()) {
      idComuna = comunaMap.get(claveNombre(comunaNombre)) ?? null;
      if (!idComuna) {
        errors.push({
          row: row.rowNumber,
          message: `No existe la comuna "${comunaNombre}" en esta campaña.`,
        });
        continue;
      }
    }

    if (barrioNombre.trim()) {
      if (!idComuna) {
        errors.push({
          row: row.rowNumber,
          message: "Indica la comuna cuando asignas un barrio.",
        });
        continue;
      }
      idBarrio =
        barrioMap.get(`${idComuna}::${claveNombre(barrioNombre)}`) ?? null;
      if (!idBarrio) {
        errors.push({
          row: row.rowNumber,
          message: `No existe el barrio "${barrioNombre}" en esa comuna.`,
        });
        continue;
      }
    }

    const { error } = await supabase.from("lugares_trabajo").insert({
      id_campana: campaignId,
      nombre,
      direccion: textoTituloOpcional(row.values.direccion ?? ""),
      id_comuna: idComuna,
      id_barrio: idBarrio,
    });

    if (error) {
      errors.push({ row: row.rowNumber, message: error.message });
      continue;
    }

    usados.add(clave);
    enArchivo.add(clave);
    created++;
  }

  return buildResult(created, skipped, errors);
}
