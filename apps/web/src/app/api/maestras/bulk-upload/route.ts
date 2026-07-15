import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";
import { MAESTRAS_BULK_DEFS } from "@/lib/platform/maestras-bulk-config";
import {
  buildHeaderIndexMap,
  validateNoUnknownHeaders,
} from "@/lib/campaign/catalog-bulk-config";
import { textoTitulo } from "@/lib/normalize-text";

function sse(data: object) {
  return `data: ${JSON.stringify(data)}\n\n`;
}

function parseCoordenada(value: FormDataEntryValue | null): number | null {
  if (value == null) return null;
  const s = String(value).trim().replace(",", ".").replace(/\s+/g, "");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response(sse({ type: "error", error: "No autenticado." }), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  const { data: owner } = await supabase
    .from("miembros_plataforma")
    .select("rol")
    .eq("id_usuario", user.id)
    .maybeSingle();
  if (!owner) {
    return new Response(sse({ type: "error", error: "Solo el dueño de plataforma puede importar." }), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  const formData = await request.formData();
  const tipo = String(formData.get("tipo") ?? "");
  const archivo = formData.get("archivo");

  const def = MAESTRAS_BULK_DEFS[tipo];
  if (!def) {
    return new Response(sse({ type: "error", error: "Tipo de catálogo no soportado." }), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  if (!(archivo instanceof File) || archivo.size === 0) {
    return new Response(sse({ type: "error", error: "Selecciona un archivo Excel (.xlsx)." }), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }
  if (archivo.size > 5 * 1024 * 1024) {
    return new Response(sse({ type: "error", error: "El archivo no puede superar 5 MB." }), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(await archivo.arrayBuffer(), { type: "array" });
  } catch {
    return new Response(sse({ type: "error", error: "No se pudo leer el archivo. Usa un Excel .xlsx válido." }), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return new Response(sse({ type: "error", error: "El archivo no tiene hojas de cálculo." }), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1, defval: "", raw: false,
  });

  if (matrix.length < 2) {
    return new Response(sse({ type: "error", error: "El archivo debe tener encabezados y al menos una fila de datos." }), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  const headerRow = matrix[0].map((cell) => String(cell ?? ""));
  const headerMap = buildHeaderIndexMap(headerRow, def as any);
  if ("error" in headerMap) {
    return new Response(sse({ type: "error", error: headerMap.error }), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  const unknownError = validateNoUnknownHeaders(headerRow, def as any);
  if (unknownError) {
    return new Response(sse({ type: "error", error: unknownError }), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  // Build parsed rows
  const parsedRows: { rowNumber: number; values: Record<string, string> }[] = [];
  for (let i = 1; i < matrix.length; i++) {
    const rawRow = matrix[i];
    const raw = rawRow
      ? Array.from({ length: headerRow.length }, (_, ci) => String(rawRow[ci] ?? "").trim())
      : [];
    if (raw.every((cell) => cell === "")) continue;

    const values: Record<string, string> = {};
    for (const column of def.columns) {
      const index = headerMap.get(column.key);
      if (index == null) continue;
      values[column.key] = raw[index] ?? "";
    }
    parsedRows.push({ rowNumber: i + 1, values });
  }

  if (parsedRows.length === 0) {
    return new Response(sse({ type: "error", error: "No hay filas con datos para importar." }), {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  }

  const total = parsedRows.length;
  let created = 0;
  const errors: { row: number; message: string }[] = [];

  // Pre-cargar mapas de referencia segun el tipo
  let deptoMap: Map<string, string> | undefined;
  let municipioMap: Map<string, string> | undefined;
  let comunaMap: Map<string, number> | undefined;

  if (tipo === "municipios") {
    const { data: deptos } = await supabase.from("departamentos").select("id, nombre");
    deptoMap = new Map((deptos ?? []).map((d) => [d.nombre.toLocaleLowerCase("es-CO"), d.id]));
  } else if (tipo === "comunas") {
    const { data: municipios } = await supabase.from("municipios").select("id, nombre");
    municipioMap = new Map((municipios ?? []).map((m) => [m.nombre.toLocaleLowerCase("es-CO"), m.id]));
  } else if (tipo === "barrios" || tipo === "puestos-votacion") {
    const { data: deptos } = await supabase.from("departamentos").select("id, nombre");
    deptoMap = new Map((deptos ?? []).map((d) => [d.nombre.toLocaleLowerCase("es-CO"), d.id]));
    const { data: munis } = await supabase.from("municipios").select("id, nombre, id_departamento");
    municipioMap = new Map((munis ?? []).map((m) => [m.nombre.toLocaleLowerCase("es-CO") + "|" + m.id_departamento, m.id]));
    const { data: comunas } = await supabase.from("comunas").select("id, nombre, id_municipio");
    comunaMap = new Map((comunas ?? []).map((c) => [c.nombre.toLocaleLowerCase("es-CO") + "|" + c.id_municipio, c.id]));
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (const row of parsedRows) {
        const id = row.values.id ?? "";
        const nombre = textoTitulo(row.values.nombre ?? "");

        if (tipo === "departamentos") {
          if (!id) { errors.push({ row: row.rowNumber, message: "El ID es obligatorio." }); }
          else if (!nombre) { errors.push({ row: row.rowNumber, message: "El nombre es obligatorio." }); }
          else {
            const latitud = parseCoordenada(row.values.latitud);
            const longitud = parseCoordenada(row.values.longitud);

            const { error } = await supabase.from("departamentos").insert({ id, nombre, latitud, longitud });
            if (error) {
              errors.push({ row: row.rowNumber, message: error.code === "23505" ? `"${nombre}" ya existe.` : error.message });
            } else {
              created++;
            }
          }
        } else if (tipo === "municipios") {
          const deptoRaw = row.values.departamento ?? "";
          if (!id) { errors.push({ row: row.rowNumber, message: "El ID es obligatorio." }); }
          else if (!nombre) { errors.push({ row: row.rowNumber, message: "El nombre es obligatorio." }); }
          else if (!deptoRaw) { errors.push({ row: row.rowNumber, message: "El departamento es obligatorio." }); }
          else {
            const idDepartamento = deptoMap!.get(deptoRaw.trim().toLocaleLowerCase("es-CO"));
            if (!idDepartamento) {
              errors.push({ row: row.rowNumber, message: `Departamento "${deptoRaw}" no encontrado.` });
            } else {
              const latitud = parseCoordenada(row.values.latitud);
              const longitud = parseCoordenada(row.values.longitud);

              const { error } = await supabase.from("municipios").insert({ id, nombre, id_departamento: idDepartamento, latitud, longitud });
              if (error) {
                errors.push({ row: row.rowNumber, message: error.code === "23505" ? `"${nombre}" ya existe en este departamento.` : error.message });
              } else {
                created++;
              }
            }
          }
        } else if (tipo === "comunas") {
          const municipioRaw = row.values.municipio ?? "";
          if (!nombre) { errors.push({ row: row.rowNumber, message: "El nombre es obligatorio." }); }
          else if (!municipioRaw) { errors.push({ row: row.rowNumber, message: "El municipio es obligatorio." }); }
          else {
            const idMunicipio = municipioMap!.get(municipioRaw.trim().toLocaleLowerCase("es-CO"));
            if (!idMunicipio) {
              errors.push({ row: row.rowNumber, message: `Municipio "${municipioRaw}" no encontrado.` });
            } else {
              const { error } = await supabase.from("comunas").insert({ nombre, id_municipio: idMunicipio });
              if (error) {
                errors.push({ row: row.rowNumber, message: error.code === "23505" ? `"${nombre}" ya existe en este municipio.` : error.message });
              } else {
                created++;
              }
            }
          }
        } else if (tipo === "barrios") {
          const deptoRaw = (row.values.departamento ?? "").trim();
          const municipioRaw = (row.values.municipio ?? "").trim();
          const comunaRaw = (row.values.comuna ?? "").trim();
          if (!nombre) { errors.push({ row: row.rowNumber, message: "El nombre es obligatorio." }); }
          else if (!deptoRaw) { errors.push({ row: row.rowNumber, message: "El departamento es obligatorio." }); }
          else if (!municipioRaw) { errors.push({ row: row.rowNumber, message: "El municipio es obligatorio." }); }
          else if (!comunaRaw) { errors.push({ row: row.rowNumber, message: "La comuna es obligatoria." }); }
          else {
            const idDepto = deptoMap!.get(deptoRaw.toLocaleLowerCase("es-CO"));
            if (!idDepto) { errors.push({ row: row.rowNumber, message: `Departamento "${deptoRaw}" no encontrado.` }); }
            else {
              const idMunicipio = municipioMap!.get(municipioRaw.toLocaleLowerCase("es-CO") + "|" + idDepto);
              if (!idMunicipio) { errors.push({ row: row.rowNumber, message: `Municipio "${municipioRaw}" no encontrado en ${deptoRaw}.` }); }
              else {
                const idComuna = comunaMap!.get(comunaRaw.toLocaleLowerCase("es-CO") + "|" + idMunicipio);
                if (!idComuna) { errors.push({ row: row.rowNumber, message: `Comuna "${comunaRaw}" no encontrada en ese municipio.` }); }
                else {
                  const { error } = await supabase.from("barrios").insert({ id_comuna: idComuna, nombre });
                  if (error) {
                    errors.push({ row: row.rowNumber, message: error.code === "23505" ? `"${nombre}" ya existe en esta comuna.` : error.message });
                  } else {
                    created++;
                  }
                }
              }
            }
          }
        } else if (tipo === "puestos-votacion") {
          const deptoRaw = (row.values.departamento ?? "").trim();
          const municipioRaw = (row.values.municipio ?? "").trim();
          const comunaRaw = (row.values.comuna ?? "").trim();
          const barrioRaw = (row.values.barrio ?? "").trim();
          if (!nombre) { errors.push({ row: row.rowNumber, message: "El nombre es obligatorio." }); }
          else if (!deptoRaw) { errors.push({ row: row.rowNumber, message: "El departamento es obligatorio." }); }
          else if (!municipioRaw) { errors.push({ row: row.rowNumber, message: "El municipio es obligatorio." }); }
          else if (!comunaRaw) { errors.push({ row: row.rowNumber, message: "La comuna es obligatoria." }); }
          else if (!barrioRaw) { errors.push({ row: row.rowNumber, message: "El barrio es obligatorio." }); }
          else {
            const idDepto = deptoMap!.get(deptoRaw.toLocaleLowerCase("es-CO"));
            if (!idDepto) { errors.push({ row: row.rowNumber, message: `Departamento "${deptoRaw}" no encontrado.` }); }
            else {
              const idMunicipio = municipioMap!.get(municipioRaw.toLocaleLowerCase("es-CO") + "|" + idDepto);
              if (!idMunicipio) { errors.push({ row: row.rowNumber, message: `Municipio "${municipioRaw}" no encontrado en ${deptoRaw}.` }); }
              else {
                const idComuna = comunaMap!.get(comunaRaw.toLocaleLowerCase("es-CO") + "|" + idMunicipio);
                if (!idComuna) { errors.push({ row: row.rowNumber, message: `Comuna "${comunaRaw}" no encontrada en ese municipio.` }); }
                else {
                  const { data: barrios } = await supabase
                    .from("barrios")
                    .select("id")
                    .eq("id_comuna", idComuna)
                    .ilike("nombre", barrioRaw.trim());
                  const idBarrio = barrios?.[0]?.id ?? null;
                  if (!idBarrio) {
                    errors.push({ row: row.rowNumber, message: `Barrio "${barrioRaw}" no encontrado en esa comuna.` });
                  } else {
                    const direccion = textoTitulo(row.values.direccion ?? "");
                    const municipio = textoTitulo(row.values.municipio ?? "");
                    const cuposH = parseInt(row.values.cupos_hombres ?? "0", 10) || 0;
                    const cuposM = parseInt(row.values.cupos_mujeres ?? "0", 10) || 0;
                    const mesas = parseInt(row.values.mesas ?? "0", 10) || 0;

                    const { error } = await supabase.from("puestos_votacion").insert({
                      nombre, direccion: direccion || null, municipio: municipio || null,
                      id_comuna: idComuna, id_barrio: idBarrio,
                      votantes_hombres_admite: cuposH, votantes_mujeres_admite: cuposM, cantidad_mesas: mesas,
                    });
                    if (error) {
                      errors.push({ row: row.rowNumber, message: error.code === "23505" ? `"${nombre}" ya existe.` : error.message });
                    } else {
                      created++;
                    }
                  }
                }
              }
            }
          }
        }

        controller.enqueue(encoder.encode(sse({
          type: "progress",
          current: created,
          total,
          row: row.rowNumber,
          errors: errors.length,
        })));
      }

      controller.enqueue(encoder.encode(sse({
        type: "complete",
        created,
        errors,
        total,
        message: `Se importaron ${created} registro(s)${errors.length > 0 ? `, ${errors.length} con errores.` : "."}`,
      })));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
