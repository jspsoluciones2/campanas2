import { createAdminClient } from "@/lib/supabase/admin";
import { validateInitialPassword } from "@/lib/platform/client-auth";
import {
  formatAuthLoginDisplay,
  resolveAuthEmail,
  validateAuthIdentifier,
} from "@/lib/auth/identity";

export type CampaignMemberRole =
  | "lector"
  | "editor"
  | "administrador_campana";

export const CAMPAIGN_MEMBER_ROLES: CampaignMemberRole[] = [
  "lector",
  "editor",
  "administrador_campana",
];

export const CAMPAIGN_MEMBER_ROLE_LABELS: Record<CampaignMemberRole, string> = {
  lector: "Lector",
  editor: "Editor",
  administrador_campana: "Administrador campaña",
};

export function isCampaignMemberRole(value: string): value is CampaignMemberRole {
  return CAMPAIGN_MEMBER_ROLES.includes(value as CampaignMemberRole);
}

export type MemberAuthProfile = {
  usuario: string | null;
  nombre: string | null;
};

type ProvisionResult = { userId: string } | { error: string };

export async function provisionCampaignMemberAuthUser(
  identifier: string,
  password: string,
  campaignId: string,
  nombre?: string | null
): Promise<ProvisionResult> {
  const identifierError = validateAuthIdentifier(identifier);
  if (identifierError) return { error: identifierError };

  const passwordError = validateInitialPassword(password);
  if (passwordError) return { error: passwordError };

  const authEmail = resolveAuthEmail(identifier);
  const loginName = identifier.trim().toLowerCase();
  const usesUsername = !identifier.trim().includes("@");

  const admin = createAdminClient();
  if (!admin) {
    return {
      error:
        "Falta SUPABASE_SERVICE_ROLE_KEY en apps/web/.env.local. Cópiala desde Supabase → Settings → API → service_role (secret), reinicia npm run dev y vuelve a intentar.",
    };
  }

  const { data: existingMember } = await admin
    .from("miembros_campana")
    .select("id_usuario")
    .eq("id_campana", campaignId);

  const existingIds = new Set(
    (existingMember ?? []).map((row) => row.id_usuario)
  );

  let page = 1;
  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error || !data.users.length) break;

    const match = data.users.find((u) => {
      const emailMatch = u.email?.toLowerCase() === authEmail;
      const meta = u.user_metadata ?? {};
      const usernameMatch =
        typeof meta.nombre_usuario === "string" &&
        meta.nombre_usuario.toLowerCase() === loginName;
      return emailMatch || usernameMatch;
    });

    if (match) {
      if (existingIds.has(match.id)) {
        return { error: "Este usuario ya está asignado a esta campaña." };
      }
      return {
        error: "Este usuario ya está registrado. Usa otro nombre de usuario.",
      };
    }

    if (data.users.length < 200) break;
    page += 1;
  }

  const metadata: Record<string, unknown> = {
    must_change_password: true,
    tipo_usuario: "miembro_campana",
    id_campana: campaignId,
  };
  if (nombre) metadata.nombre = nombre;
  if (usesUsername) metadata.nombre_usuario = loginName;

  const { data, error } = await admin.auth.admin.createUser({
    email: authEmail,
    password,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (error || !data.user) {
    return { error: error?.message ?? "No se pudo crear el usuario." };
  }

  return { userId: data.user.id };
}

export async function fetchMemberAuthProfiles(
  userIds: string[]
): Promise<Map<string, MemberAuthProfile>> {
  const result = new Map<string, MemberAuthProfile>();
  if (!userIds.length) return result;

  const admin = createAdminClient();
  if (!admin) return result;

  const pending = new Set(userIds);

  let page = 1;
  while (pending.size > 0 && page <= 20) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error || !data.users.length) break;

    for (const user of data.users) {
      if (!pending.has(user.id)) continue;
      const meta = user.user_metadata ?? {};
      result.set(user.id, {
        usuario: formatAuthLoginDisplay(user.email, meta),
        nombre:
          typeof meta.nombre === "string"
            ? meta.nombre
            : typeof meta.full_name === "string"
              ? meta.full_name
              : null,
      });
      pending.delete(user.id);
    }

    if (data.users.length < 200) break;
    page += 1;
  }

  return result;
}
