import type { SupabaseClient } from "@supabase/supabase-js";

export type ComunaBarrioIds = {
  idComuna: string;
  idBarrio: string;
};

export async function validarComunaBarrioPuesto(
  supabase: SupabaseClient,
  campaignId: string,
  idComuna: string,
  idBarrio: string
): Promise<ComunaBarrioIds | { error: string }> {
  if (!idComuna) {
    return { error: "La comuna es obligatoria para el puesto de votación." };
  }
  if (!idBarrio) {
    return { error: "El barrio es obligatorio para el puesto de votación." };
  }

  const { data: comuna } = await supabase
    .from("comunas")
    .select("id")
    .eq("id", idComuna)
    .eq("id_campana", campaignId)
    .maybeSingle();

  if (!comuna) {
    return { error: "La comuna seleccionada no pertenece a esta campaña." };
  }

  const { data: barrio } = await supabase
    .from("barrios")
    .select("id, id_comuna, comunas!inner(id_campana)")
    .eq("id", idBarrio)
    .eq("comunas.id_campana", campaignId)
    .maybeSingle();

  if (!barrio) {
    return { error: "El barrio seleccionado no pertenece a esta campaña." };
  }

  if (barrio.id_comuna !== idComuna) {
    return {
      error: "El barrio no corresponde a la comuna seleccionada.",
    };
  }

  return { idComuna, idBarrio };
}
