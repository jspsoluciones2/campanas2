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

export type PuestoOption = {
  id: number;
  nombre: string;
  municipio: string | null;
  id_comuna: number | null;
  id_barrio: number | null;
  votantes_mujeres_admite: number;
  votantes_hombres_admite: number;
  comunas: { nombre: string } | { nombre: string }[] | null;
};

/**
 * Puestos de votación del territorio cubierto por la campaña.
 * puestos_votacion dejó de tener id_campana (migración 033), así que
 * se filtra por la cadena territorial: puestos → comuna → municipio/departamento
 * según el alcance definido en campana_territorio.
 */
export async function fetchPuestosPorAlcance(
  supabase: SupabaseClient,
  campaignId: number
): Promise<PuestoOption[]> {
  const comunas = await fetchComunasPorAlcance(supabase, campaignId);
  const comunaIds = comunas.map((c) => c.id);

  let q = supabase
    .from("puestos_votacion")
    .select(
      "id, nombre, municipio, id_comuna, id_barrio, votantes_mujeres_admite, votantes_hombres_admite, comunas(nombre)"
    )
    .order("nombre") as any;

  if (comunaIds.length > 0) {
    q = q.in("id_comuna", comunaIds);
  } else {
    q = q.limit(0);
  }

  const { data } = await q;
  return (data ?? []) as PuestoOption[];
}

export async function fetchComunasPorAlcance(
  supabase: SupabaseClient,
  campaignId: number
): Promise<{ id: number; nombre: string }[]> {
  const alcance = await fetchTerritorioAlcance(supabase, campaignId);

  // Comunas dentro del territorio de la campaña.
  // - Si el alcance define municipios → filtro directo por comunas.id_municipio.
  // - Si el alcance define departamentos → filtro anidado vía municipios
  //   (requiere incluir el embedding municipios en el select).
  let columns = "id, nombre";
  let query = supabase.from("comunas").select(columns).order("nombre") as any;

  if (alcance.municipios.length > 0) {
    query = query.in("id_municipio", alcance.municipios);
  } else if (alcance.departamentos.length > 0) {
    query = supabase
      .from("comunas")
      .select("id, nombre, municipios(id_departamento)")
      .order("nombre")
      .in("municipios.id_departamento", alcance.departamentos) as any;
  }

  const { data } = await query;
  return data ?? [];
}

