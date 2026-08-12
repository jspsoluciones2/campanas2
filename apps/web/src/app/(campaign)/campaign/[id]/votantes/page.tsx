import { requireCampaignAccess } from "@/lib/campaign/access";
import { VotantesPanel } from "@/components/campaign/votantes-panel";
import {
  fetchDepartamentos,
  fetchMunicipios,
  fetchPuestosPorAlcance,
} from "@/lib/campaign/comunas";
import type { AlcanceValue } from "@/components/campaign/mapa-geografico";
import type { SupabaseClient } from "@supabase/supabase-js";

type BarrioConComuna = {
  id: number;
  nombre: string;
  id_comuna: number;
  id_municipio: string;
};

type Comuna = { id: number; nombre: string; id_municipio: string | null };

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
    puestos,
    { data: lugaresTrabajo },
    { data: lideres },
    { data: tiposNovedad },
    departamentos,
    municipios,
    barrios,
    { data: comunas },
    { data: territorio },
  ] = await Promise.all([
    supabase
      .from("votantes")
      .select(
        `id, nombres, apellidos, documento, tipo_documento, sexo, telefono,
         fecha_nacimiento, direccion, estado, creado_en,
         id_tipo_novedad, detalle_novedad,
         roles(nombre), lugares_trabajo(nombre),
         puestos_votacion(nombre, municipio),
         lider_directo:votantes(nombres, apellidos)`
      )
      .eq("id_campana", campaignId)
      .order("creado_en", { ascending: false })
      .limit(100),
    supabase
      .from("roles")
      .select("id, nombre, nivel_jerarquia")
      .eq("id_campana", campaignId)
      .order("nivel_jerarquia"),
    fetchPuestosPorAlcance(supabase, campaignId),
    supabase
      .from("lugares_trabajo")
      .select("id, nombre")
      .eq("id_campana", campaignId)
      .order("nombre"),
    supabase
      .from("votantes")
      .select("id, nombres, apellidos, documento, id_rol, roles(nivel_jerarquia)")
      .eq("id_campana", campaignId)
      .in("estado", ["activo", "pendiente_verificacion"])
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
    supabase.from("comunas").select("id, nombre, id_municipio").order("nombre"),
    supabase
      .from("campana_territorio")
      .select("id_departamento, id_municipio")
      .eq("id_campana", campaignId)
      .maybeSingle(),
  ]);

  const rows = votantes ?? [];

  // Determinar ámbito territorial para preseleccionar residencia
  let alcance: AlcanceValue | undefined;
  if (territorio) {
    if (territorio.id_departamento && !territorio.id_municipio) {
      const { data: depto } = await supabase
        .from("departamentos")
        .select("nombre")
        .eq("id", territorio.id_departamento)
        .single();
      alcance = {
        tipo: "departamental",
        id_departamento: territorio.id_departamento,
        nombre_departamento: depto?.nombre ?? undefined,
      };
    } else if (territorio.id_municipio) {
      const { data: mun } = await supabase
        .from("municipios")
        .select("nombre, id_departamento")
        .eq("id", territorio.id_municipio)
        .single();
      alcance = {
        tipo: "municipal",
        id_municipio: territorio.id_municipio,
        nombre_municipio: mun?.nombre ?? undefined,
        id_departamento: mun?.id_departamento ?? undefined,
      };
    }
  }

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
    <VotantesPanel
      campaignId={campaignId}
      votantes={rows}
      tiposNovedad={tiposNovedad ?? []}
      roles={roles ?? []}
      puestos={puestos ?? []}
      lugaresTrabajo={lugaresTrabajo ?? []}
      lideres={lideresConJerarquia}
      departamentos={departamentos}
      municipios={municipios}
      barrios={barrios}
      comunas={comunas ?? []}
      alcance={alcance}
    />
  );
}
