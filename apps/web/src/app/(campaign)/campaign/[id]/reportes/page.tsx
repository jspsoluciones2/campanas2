import { requireCampaignAccess } from "@/lib/campaign/access";
import { ReportesView } from "@/components/campaign/reportes-view";
import type { VotanteListRow } from "@/components/campaign/votantes-table";
import type { AlcanceValue } from "@/components/campaign/mapa-geografico";
import { createClient } from "@/lib/supabase/server";
import { fetchPuestosPorAlcance } from "@/lib/campaign/comunas";

export default async function ReportesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaignId = Number(id);
  const access = await requireCampaignAccess(campaignId);
  const { supabase } = access;

  const [
    { count: total },
    { data: roles },
     puestos,
    { data: tiposNovedad },
    { data: votantes },
    { data: territorio },
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
     fetchPuestosPorAlcance(supabase, campaignId),
    supabase
      .from("tipos_novedad")
      .select("id, novedad")
      .eq("id_campana", campaignId)
      .order("novedad"),
    supabase
      .from("votantes")
      .select(
        `id, nombres, apellidos, documento, tipo_documento, sexo, telefono, fecha_nacimiento, direccion, mesa, estado, creado_en, id_tipo_novedad, detalle_novedad, roles(nombre), lugares_trabajo(nombre), puestos_votacion(nombre, municipio), lider_directo:votantes(nombres, apellidos)`
      )
      .eq("id_campana", campaignId)
      .order("creado_en", { ascending: false })
      .limit(100),
    // Alcance territorial de la campaña
    supabase
      .from("campana_territorio")
      .select("id_departamento, id_municipio")
      .eq("id_campana", campaignId)
      .maybeSingle(),
  ]);

  // Determinar ámbito territorial
  let initialAlcance: AlcanceValue | undefined;

  if (territorio) {
    if (territorio.id_departamento && !territorio.id_municipio) {
      // Departamental: buscar nombre del departamento
      const { data: depto } = await supabase
        .from("departamentos")
        .select("nombre")
        .eq("id", territorio.id_departamento)
        .single();
      initialAlcance = {
        tipo: "departamental",
        id_departamento: territorio.id_departamento,
        nombre_departamento: depto?.nombre ?? undefined,
      };
    } else if (territorio.id_municipio) {
      // Municipal: buscar nombre del municipio y su departamento
      const { data: mun } = await supabase
        .from("municipios")
        .select("nombre, id_departamento")
        .eq("id", territorio.id_municipio)
        .single();
      initialAlcance = {
        tipo: "municipal",
        id_municipio: territorio.id_municipio,
        nombre_municipio: mun?.nombre ?? undefined,
        id_departamento: mun?.id_departamento ?? undefined,
      };
    }
  }
  // Si no hay fila en campana_territorio → nacional (no se asigna)

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
      initialAlcance={initialAlcance}
    />
  );
}
