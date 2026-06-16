import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { textoTituloOpcional } from "@/lib/normalize-text";
import {
  validateAuthIdentifier,
} from "@/lib/auth/identity";
import {
  fetchMemberAuthProfiles,
  isCampaignMemberRole,
  provisionCampaignMemberAuthUser,
  type CampaignMemberRole,
  type MemberAuthProfile,
} from "@/lib/campaign/member-auth";
import { userCanManageCampaignTeam } from "@/lib/campaign/access";

export type CampaignMemberRow = {
  id: string;
  id_usuario: string;
  rol: CampaignMemberRole;
  creado_en: string;
};

export type CampaignMemberWithProfile = CampaignMemberRow & MemberAuthProfile;

export async function listCampaignMembersWithProfiles(
  supabase: SupabaseClient,
  campaignId: string
): Promise<CampaignMemberWithProfile[]> {
  const { data: miembros } = await supabase
    .from("miembros_campana")
    .select("id, id_usuario, rol, creado_en")
    .eq("id_campana", campaignId)
    .order("creado_en");

  const rows = (miembros ?? []) as CampaignMemberRow[];
  const profiles = await fetchMemberAuthProfiles(
    rows.map((row) => row.id_usuario)
  );

  return rows.map((row) => {
    const profile = profiles.get(row.id_usuario);
    return {
      ...row,
      usuario: profile?.usuario ?? null,
      nombre: profile?.nombre ?? null,
    };
  });
}

type AssignMemberInput = {
  campaignId: string;
  actorUserId: string;
  usuario: string;
  contrasena: string;
  nombre?: string | null;
  rol: string;
};

type AssignMemberResult =
  | {
      ok: true;
      usuario: string;
      nombre: string;
      tempPassword: string;
    }
  | { error: string };

export async function assignCampaignMemberWithCredentials(
  input: AssignMemberInput
): Promise<AssignMemberResult> {
  const campaignId = input.campaignId.trim();
  const usuario = input.usuario.trim();
  const contrasena = input.contrasena.trim();
  const nombre = textoTituloOpcional(input.nombre ?? "");
  const rol = input.rol.trim();

  if (!campaignId) return { error: "Campaña no indicada." };
  const identifierError = validateAuthIdentifier(usuario);
  if (identifierError) return { error: identifierError };
  if (!contrasena) return { error: "La contraseña inicial es obligatoria." };
  if (!isCampaignMemberRole(rol)) return { error: "Rol no válido." };

  const canManage = await userCanManageCampaignTeam(
    input.actorUserId,
    campaignId
  );
  if (!canManage) {
    return { error: "No tienes permiso para asignar miembros a esta campaña." };
  }

  const admin = createAdminClient();
  if (!admin) {
    return {
      error:
        "Falta SUPABASE_SERVICE_ROLE_KEY en apps/web/.env.local para crear usuarios del equipo.",
    };
  }

  const { data: campana } = await admin
    .from("campanas")
    .select("id")
    .eq("id", campaignId)
    .maybeSingle();

  if (!campana) return { error: "Campaña no encontrada." };

  const provisioned = await provisionCampaignMemberAuthUser(
    usuario,
    contrasena,
    campaignId,
    nombre
  );
  if ("error" in provisioned) return { error: provisioned.error };

  const { error } = await admin.from("miembros_campana").insert({
    id_campana: campaignId,
    id_usuario: provisioned.userId,
    rol,
  });

  if (error) {
    await admin.auth.admin.deleteUser(provisioned.userId);
    return { error: error.message };
  }

  const displayUsuario = usuario.trim().toLowerCase();

  return {
    ok: true,
    usuario: displayUsuario,
    nombre: nombre ?? displayUsuario,
    tempPassword: contrasena,
  };
}
