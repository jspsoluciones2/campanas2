import { requireCampaignAccess } from "@/lib/campaign/access";
import { VotanteRegisterForm } from "@/components/campaign/votante-register-form";
import { VotantesTable } from "@/components/campaign/votantes-table";
import { Card, PageHeader } from "@/components/platform/platform-ui";
import { fetchDepartamentos, fetchMunicipios } from "@/lib/campaign/comunas";
import type { SupabaseClient } from "@supabase/supabase-js";

type BarrioConComuna = {
  id: number;
  nombre: string;
  id_comuna: number;
  id_municipio: string;
};

async function fetchBarriosConMunicipio(
  supabase: SupabaseClient
): Promise<BarrioConComuna[]> {
  const { data } = await supabase
    .from("barrios")
    .select("id, nombre, id_comuna, comunas!inner(id_municipio)")
    .order("nombre");

  if (!data) return [];

  return data.map((b) => {
    const comunaRel = Array.isArray(b.comunas) ? b.comunas[0] : b.comunas;
    return {
      id: b.id,
      nombre: b.nombre,
      id_comuna: b.id_comuna,
      id_municipio: String(comunaRel?.id_municipio ?? ""),
    };
  }).filter((b) => b.id_municipio);
}

export default async function CampaignVotantesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaignId = Number(id);
  const { supabase } = await requireCampaignAccess(campaignId);

  const [
    { data: votantes },
    { data: roles },
    { data: puestos },
    { data: lugaresTrabajo },
    { data: lideres },
    { data: tiposNovedad },
    departamentos,
    municipios,
    barrios,
  ] = await Promise.all([
    supabase
      .from("votantes")
      .select(
        `id, nombres, apellidos, documento, tipo_documento, sexo, telefono,
         fecha_nacimiento, direccion, estado, creado_en,
         id_tipo_novedad, detalle_novedad,
         roles(nombre), lugares_trabajo(nombre)`
      )
      .eq("id_campana", campaignId)
      .order("creado_en", { ascending: false })
      .limit(100),
    supabase
      .from("roles")
      .select("id, nombre, nivel_jerarquia")
      .eq("id_campana", campaignId)
      .order("nivel_jerarquia"),
    supabase
      .from("puestos_votacion")
      .select("id, nombre, municipio, comunas(nombre)")
      .eq("id_campana", campaignId)
      .order("nombre"),
    supabase
      .from("lugares_trabajo")
      .select("id, nombre")
      .eq("id_campana", campaignId)
      .order("nombre"),
    supabase
      .from("votantes")
      .select("id, nombres, apellidos, documento, id_rol, roles(nivel_jerarquia)")
      .eq("id_campana", campaignId)
      .in("estado", ["activo", "registrado", "pendiente_verificacion"])
      .order("apellidos")
      .limit(200),
    supabase
      .from("tipos_novedad")
      .select("id, novedad")
      .eq("id_campana", campaignId)
      .order("novedad"),
    fetchDepartamentos(supabase),
    fetchMunicipios(supabase),
    fetchBarriosConMunicipio(supabase),
  ]);

  const rows = votantes ?? [];

  const lideresConJerarquia = (lideres ?? []).map((l) => {
    const rel = l.roles as
      | { nivel_jerarquia: number | null }
      | { nivel_jerarquia: number | null }[]
      | null;
    const rol = Array.isArray(rel) ? rel[0] : rel;
    return {
      id: l.id,
      nombres: l.nombres,
      apellidos: l.apellidos,
      documento: l.documento,
      nivel_jerarquia: rol?.nivel_jerarquia ?? null,
    };
  });

  return (
    <>
      <PageHeader
        title="Votantes"
        description="Registro manual de votantes. Las novedades las completa el equipo al detectar irregularidades."
      />

      <VotanteRegisterForm
        campaignId={campaignId}
        roles={roles ?? []}
        puestos={puestos ?? []}
        lugaresTrabajo={lugaresTrabajo ?? []}
        lideres={lideresConJerarquia}
        departamentos={departamentos}
        municipios={municipios}
        barrios={barrios}
      />

      <Card
        title="Listado"
        description={`${rows.length} votante(s) mostrados (máx. 100)`}
      >
        <VotantesTable
          campaignId={campaignId}
          rows={rows}
          tiposNovedad={tiposNovedad ?? []}
          emptyMessage="Sin votantes. Configura catálogos y registra el primero arriba."
        />
      </Card>
    </>
  );
}
