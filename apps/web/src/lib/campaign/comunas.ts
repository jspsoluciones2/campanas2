import type { SupabaseClient } from "@supabase/supabase-js";
import { isNumericSearchTerm } from "@/lib/campaign/catalog-codigo";

export type ComunaListRow = {
  id: number;
  nombre: string;
  creado_en: string;
  id_municipio: number | null;
  municipios: { nombre: string } | { nombre: string }[] | null;
};

export type MunicipioOption = { id: number; nombre: string; id_departamento: number };
export type DepartamentoOption = { id: number; nombre: string };

export async function fetchDepartamentos(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("departamentos")
    .select("id, nombre")
    .order("nombre");
  return (data ?? []) as DepartamentoOption[];
}

export async function fetchMunicipios(supabase: SupabaseClient) {
  const { data } = await supabase
    .from("municipios")
    .select("id, nombre, id_departamento")
    .order("nombre");
  return (data ?? []) as MunicipioOption[];
}

export async function fetchTerritorioAlcance(
  supabase: SupabaseClient,
  campaignId: number
): Promise<{ departamentos: number[]; municipios: number[] }> {
  const { data } = await supabase
    .from("campana_territorio")
    .select("id_departamento, id_municipio")
    .eq("id_campana", campaignId);

  const deptos = new Set<number>();
  const munis = new Set<number>();
  for (const row of data ?? []) {
    if (row.id_departamento) deptos.add(row.id_departamento);
    if (row.id_municipio) munis.add(row.id_municipio);
  }
  return { departamentos: [...deptos], municipios: [...munis] };
}

/** Solo UI: la tabla en BD sigue siendo `comunas`. */
export const COMUNA_LABEL_CREACION = "Comuna / subdivisión administrativa";

export async function fetchComunasList(
  supabase: SupabaseClient,
  campaignId: number,
  options: { q: string; from: number; to: number }
) {
  const term = options.q.trim();
  const alcance = await fetchTerritorioAlcance(supabase, campaignId);

  let query = supabase
    .from("comunas")
    .select("id, nombre, creado_en, id_municipio, municipios!left(nombre)", { count: "exact" })
    .order("id");

  if (alcance.departamentos.length > 0) {
    query = query.in("municipios.id_departamento", alcance.departamentos);
  }
  if (alcance.municipios.length > 0) {
    query = query.in("id_municipio", alcance.municipios);
  }

  if (term) {
    if (isNumericSearchTerm(term)) {
      query = query.eq("id", Number(term));
    } else {
      query = query.ilike("nombre", `%${term}%`);
    }
  }

  const { data, count, error } = await query.range(options.from, options.to);

  return {
    rows: (data ?? []) as ComunaListRow[],
    count: count ?? 0,
    error: error?.message ?? null,
  };
}

