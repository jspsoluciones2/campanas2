import type { SupabaseClient } from "@supabase/supabase-js";
import { formatCatalogId, isNumericSearchTerm } from "@/lib/campaign/catalog-codigo";

export type ComunaListRow = {
  id: number;
  nombre: string;
  codigo: number | null;
  creado_en: string;
};

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
    .select("id, nombre, codigo, creado_en", { count: "exact" })
    .eq("id_campana", campaignId)
    .order("codigo");

  if (term) {
    if (isNumericSearchTerm(term)) {
      query = query.eq("codigo", Number(term));
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

export function renderComunaCodigo(comuna: ComunaListRow) {
  return formatCatalogId(comuna.codigo);
}
