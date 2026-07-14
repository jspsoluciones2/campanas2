import type { SupabaseClient } from "@supabase/supabase-js";

export type MunicipioOption = { id: string; nombre: string; id_departamento: string };
export type DepartamentoOption = { id: string; nombre: string };

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
): Promise<{ departamentos: string[]; municipios: string[] }> {
  const { data } = await supabase
    .from("campana_territorio")
    .select("id_departamento, id_municipio")
    .eq("id_campana", campaignId);

  const deptos = new Set<string>();
  const munis = new Set<string>();
  for (const row of data ?? []) {
    if (row.id_departamento) deptos.add(row.id_departamento);
    if (row.id_municipio) munis.add(row.id_municipio);
  }
  return { departamentos: [...deptos], municipios: [...munis] };
}

export async function fetchMunicipiosPorDepartamento(
  supabase: SupabaseClient,
  idDepartamento: string
): Promise<MunicipioOption[]> {
  const { data } = await supabase
    .from("municipios")
    .select("id, nombre, id_departamento")
    .eq("id_departamento", idDepartamento)
    .order("nombre");
  return (data ?? []) as MunicipioOption[];
}

export async function fetchComunasPorAlcance(
  supabase: SupabaseClient,
  campaignId: number
): Promise<{ id: number; nombre: string }[]> {
  const alcance = await fetchTerritorioAlcance(supabase, campaignId);

  let query = supabase
    .from("comunas")
    .select("id, nombre")
    .order("nombre");

  if (alcance.departamentos.length > 0) {
    query = query.in("municipios.id_departamento", alcance.departamentos);
  }
  if (alcance.municipios.length > 0) {
    query = query.in("id_municipio", alcance.municipios);
  }

  const { data } = await query;
  return data ?? [];
}

