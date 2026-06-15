import type { SupabaseClient } from "@supabase/supabase-js";
import { escapeIlikeTerm } from "@/lib/platform/master-list";
import { isNumericSearchTerm } from "@/lib/campaign/catalog-codigo";

const EMPTY_UUID = "00000000-0000-0000-0000-000000000000";

/** null = sin filtro; [] = sin coincidencias */
export async function matchingCampaignIds(
  supabase: SupabaseClient,
  q: string
): Promise<string[] | null> {
  const term = escapeIlikeTerm(q);
  if (!term) return null;

  if (isNumericSearchTerm(term)) {
    const codigo = Number(term);
    const { data: byCodigo } = await supabase
      .from("campanas")
      .select("id")
      .eq("codigo", codigo);
    return (byCodigo ?? []).map((row) => row.id);
  }

  const pattern = `%${term}%`;

  const [
    { data: byNombre },
    { data: clientesMatch },
    { data: procesosMatch },
  ] = await Promise.all([
    supabase.from("campanas").select("id").ilike("nombre", pattern),
    supabase.from("clientes").select("id").ilike("nombre", pattern),
    supabase.from("procesos_electorales").select("id").ilike("nombre", pattern),
  ]);

  const ids = new Set((byNombre ?? []).map((row) => row.id));
  const clientIds = (clientesMatch ?? []).map((c) => c.id);
  const procesoIds = (procesosMatch ?? []).map((p) => p.id);

  const extraQueries = [];
  if (clientIds.length > 0) {
    extraQueries.push(
      supabase.from("campanas").select("id").in("id_cliente", clientIds)
    );
  }
  if (procesoIds.length > 0) {
    extraQueries.push(
      supabase
        .from("campanas")
        .select("id")
        .in("id_proceso_electoral", procesoIds)
    );
  }

  if (extraQueries.length > 0) {
    const extra = await Promise.all(extraQueries);
    for (const { data } of extra) {
      for (const row of data ?? []) ids.add(row.id);
    }
  }

  return [...ids];
}

export function campaignIdsForQuery(ids: string[] | null): string[] | null {
  if (ids === null) return null;
  if (ids.length === 0) return [EMPTY_UUID];
  return ids;
}
