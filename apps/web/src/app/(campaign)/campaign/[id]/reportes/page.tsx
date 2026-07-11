import { requireCampaignAccess } from "@/lib/campaign/access";
import { ReportesView } from "@/components/campaign/reportes-view";
import type { VotanteListRow } from "@/components/campaign/votantes-table";

export default async function ReportesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await requireCampaignAccess(id);

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
      .eq("id_campana", id),
    supabase
      .from("roles")
      .select("id, nombre")
      .eq("id_campana", id)
      .order("nombre"),
    supabase
      .from("puestos_votacion")
      .select("id, nombre")
      .eq("id_campana", id)
      .order("nombre"),
    supabase
      .from("tipos_novedad")
      .select("id, novedad")
      .eq("id_campana", id)
      .order("novedad"),
    supabase
      .from("votantes")
      .select(
        `id, nombres, apellidos, documento, tipo_documento, sexo, telefono, fecha_nacimiento, direccion, estado, creado_en, id_tipo_novedad, detalle_novedad, roles(nombre), lugares_trabajo(nombre)`
      )
      .eq("id_campana", id)
      .order("creado_en", { ascending: false })
      .limit(100),
  ]);

  return (
    <ReportesView
      campaignId={id}
      initialTotal={total ?? 0}
      initialRoles={(roles ?? []) as { id: string; nombre: string }[]}
      initialPuestos={(puestos ?? []) as { id: string; nombre: string }[]}
      initialTiposNovedad={
        (tiposNovedad ?? []) as { id: string; novedad: string }[]
      }
      initialVotantes={(votantes ?? []) as unknown as VotanteListRow[]}
    />
  );
}
