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

/** Solo UI: la tabla en BD sigue siendo `comunas`. */
export const COMUNA_LABEL_CREACION = "Comuna / subdivisión administrativa";

export async function fetchComunasList(
  supabase: SupabaseClient,
  campaignId: number,
  options: { q: string; from: number; to: number }
) {
  const term = options.q.trim();

  let query = supabase
    .from("comunas")
    .select("id, nombre, creado_en, id_municipio, municipios!left(nombre)", { count: "exact" })
    .eq("id_campana", campaignId)
    .order("id");

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

