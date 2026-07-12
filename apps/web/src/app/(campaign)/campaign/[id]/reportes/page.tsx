import { requireCampaignAccess } from "@/lib/campaign/access";
import { ReportesView } from "@/components/campaign/reportes-view";
import type { VotanteListRow } from "@/components/campaign/votantes-table";

export default async function ReportesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaignId = Number(id);
  const { supabase } = await requireCampaignAccess(campaignId);

  const [
    { count: total },
    { data: roles },
    { data: puestos },
    { data: tiposNovedad },
    { data: votantes },
  ] = await Promise.all([
    supabase
      .from("votantes")
      .select("*", { count: "exact", head: true })
      .eq("id_campana", campaignId),
    supabase
      .from("roles")
      .select("id, nombre")
      .eq("id_campana", campaignId)
      .order("nombre"),
    supabase
      .from("puestos_votacion")
      .select("id, nombre")
      .eq("id_campana", campaignId)
      .order("nombre"),
    supabase
      .from("tipos_novedad")
      .select("id, novedad")
      .eq("id_campana", campaignId)
      .order("novedad"),
    supabase
      .from("votantes")
      .select(
        `id, nombres, apellidos, documento, tipo_documento, sexo, telefono, fecha_nacimiento, direccion, estado, creado_en, id_tipo_novedad, detalle_novedad, roles(nombre), lugares_trabajo(nombre)`
      )
      .eq("id_campana", campaignId)
      .order("creado_en", { ascending: false })
      .limit(100),
  ]);

  return (
    <ReportesView
      campaignId={Number(id)}
      initialTotal={total ?? 0}
      initialRoles={(roles ?? []) as { id: number; nombre: string }[]}
      initialPuestos={(puestos ?? []) as { id: number; nombre: string }[]}
      initialTiposNovedad={
        (tiposNovedad ?? []) as { id: number; novedad: string }[]
      }
      initialVotantes={(votantes ?? []) as unknown as VotanteListRow[]}
    />
  );
}
