import type { SupabaseClient } from "@supabase/supabase-js";
import { isNumericSearchTerm } from "@/lib/campaign/catalog-codigo";

export type PuestoListRow = {
  id: string;
  nombre: string;
  municipio: string | null;
  direccion: string | null;
  codigo: number | null;
  id_comuna: string | null;
  votantes_hombres_admite: number;
  votantes_mujeres_admite: number;
  cantidad_mesas: number;
  creado_en: string;
};

const PUESTO_SELECT =
  "id, nombre, municipio, direccion, codigo, id_comuna, votantes_hombres_admite, votantes_mujeres_admite, cantidad_mesas, creado_en";

export async function fetchPuestosList(
  supabase: SupabaseClient,
  campaignId: string,
  options: { q: string; from: number; to: number }
) {
  const term = options.q.trim();

  let query = supabase
    .from("puestos_votacion")
    .select(PUESTO_SELECT, { count: "exact" })
    .eq("id_campana", campaignId)
    .order("codigo");

  if (term) {
    if (isNumericSearchTerm(term)) {
      query = query.eq("codigo", Number(term));
    } else {
      query = query.or(
        `nombre.ilike.%${term}%,municipio.ilike.%${term}%,direccion.ilike.%${term}%`
      );
    }
  }

  const { data, count, error } = await query.range(options.from, options.to);

  return {
    rows: (data ?? []) as PuestoListRow[],
    count: count ?? 0,
    error: error?.message ?? null,
  };
}

export async function insertPuestoRow(
  supabase: SupabaseClient,
  row: Record<string, unknown>
) {
  const { error } = await supabase.from("puestos_votacion").insert(row);
  return error;
}

export async function updatePuestoRow(
  supabase: SupabaseClient,
  campaignId: string,
  id: string,
  row: Record<string, unknown>
) {
  const { error } = await supabase
    .from("puestos_votacion")
    .update(row)
    .eq("id", id)
    .eq("id_campana", campaignId);
  return error;
}
