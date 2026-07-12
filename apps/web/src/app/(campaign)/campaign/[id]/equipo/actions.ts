"use server";

import { revalidatePath } from "next/cache";
import { requireCampaignTeamManager } from "@/lib/campaign/access";
import { assignCampaignMemberWithCredentials } from "@/lib/campaign/team";

export async function assignCampaignTeamMemberAction(formData: FormData) {
  const idCampana = Number(formData.get("id_campana"));
  const { user } = await requireCampaignTeamManager(idCampana);

  const result = await assignCampaignMemberWithCredentials({
    campaignId: idCampana,
    actorUserId: user.id,
    usuario: String(
      formData.get("usuario") ?? formData.get("correo") ?? ""
    ),
    contrasena: String(formData.get("contrasena_inicial") ?? ""),
    nombre: String(formData.get("nombre") ?? ""),
    rol: String(formData.get("rol") ?? "lector"),
  });

  if ("error" in result) return { error: result.error };

  revalidatePath(`/campaign/${idCampana}/equipo`);
  revalidatePath(`/platform/campaigns/${idCampana}`);

  return {
    ok: true,
    email: result.usuario,
    nombre: result.nombre,
    tempPassword: result.tempPassword,
  };
}
