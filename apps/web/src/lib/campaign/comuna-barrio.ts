import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchTerritorioAlcance } from "@/lib/campaign/comunas";

export type ComunaBarrioIds = {
  idComuna: number;
  idBarrio: number;
};

export async function validarComunaBarrioPuesto(
  supabase: SupabaseClient,
  campaignId: number,
  idComuna: number,
  idBarrio: number
): Promise<ComunaBarrioIds | { error: string }> {
  if (!idComuna) {
    return { error: "La comuna es obligatoria para el puesto de votación." };
  }
  if (!idBarrio) {
    return { error: "El barrio es obligatorio para el puesto de votación." };
  }

  const alcance = await fetchTerritorioAlcance(supabase, campaignId);

  let comunaQ = supabase.from("comunas").select("id").eq("id", idComuna);
  if (alcance.departamentos.length > 0) {
    comunaQ = comunaQ.in("municipios.id_departamento", alcance.departamentos);
  }
  if (alcance.municipios.length > 0) {
    comunaQ = comunaQ.in("id_municipio", alcance.municipios);
  }
  const { data: comuna } = await comunaQ.maybeSingle();

  if (!comuna) {
    return { error: "La comuna seleccionada no pertenece a esta campaña." };
  }

  let barrioQ = supabase
    .from("barrios")
    .select("id, id_comuna")
    .eq("id", idBarrio);
  if (alcance.departamentos.length > 0) {
    barrioQ = barrioQ.in("comunas.municipios.id_departamento", alcance.departamentos);
  }
  if (alcance.municipios.length > 0) {
    barrioQ = barrioQ.in("comunas.id_municipio", alcance.municipios);
  }
  const { data: barrio } = await barrioQ.maybeSingle();

  if (!barrio) {
    return { error: "El barrio seleccionado no pertenece a esta campaña." };
  }

  if (barrio.id_comuna !== Number(idComuna)) {
    return {
      error: "El barrio no corresponde a la comuna seleccionada.",
    };
  }

  return { idComuna, idBarrio };
}
