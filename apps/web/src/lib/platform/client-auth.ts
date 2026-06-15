import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

const MIN_PASSWORD_LENGTH = 8;

export function validateInitialPassword(password: string): string | null {
  const trimmed = password.trim();
  if (trimmed.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }
  return null;
}

export async function requirePlatformOwner(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesión no válida." as const, user: null };
  }

  const { data: member } = await supabase
    .from("miembros_plataforma")
    .select("rol")
    .eq("id_usuario", user.id)
    .maybeSingle();

  if (!member) {
    return { error: "Sin permisos de plataforma." as const, user: null };
  }

  return { user };
}

export async function syncClientCampaignMembership(
  supabase: SupabaseClient,
  clientId: string,
  userId: string
) {
  const { data: campanas } = await supabase
    .from("campanas")
    .select("id")
    .eq("id_cliente", clientId);

  if (!campanas?.length) return;

  await supabase.from("miembros_campana").upsert(
    campanas.map((c) => ({
      id_campana: c.id,
      id_usuario: userId,
      rol: "administrador_campana" as const,
    })),
    { onConflict: "id_campana,id_usuario" }
  );
}

type ProvisionResult =
  | { userId: string }
  | { error: string };

export async function deleteAuthUser(userId: string): Promise<{ error?: string }> {
  const admin = createAdminClient();
  if (!admin) {
    return {
      error:
        "Falta SUPABASE_SERVICE_ROLE_KEY en apps/web/.env.local para eliminar el acceso del cliente.",
    };
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };
  return {};
}

async function findAuthUserByEmail(
  admin: NonNullable<ReturnType<typeof createAdminClient>>,
  email: string
) {
  const normalized = email.toLowerCase();
  let page = 1;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error || !data.users.length) return null;

    const match = data.users.find(
      (u) => u.email?.toLowerCase() === normalized
    );
    if (match) return match;

    if (data.users.length < 200) break;
    page += 1;
  }

  return null;
}

/** Usuario Auth sin cliente vinculado (p. ej. tras eliminar solo la fila en clientes). */
export async function deleteOrphanAuthUserByEmail(
  email: string
): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false;

  const user = await findAuthUserByEmail(admin, email);
  if (!user) return false;

  const { data: linkedClient } = await admin
    .from("clientes")
    .select("id")
    .eq("id_usuario", user.id)
    .maybeSingle();

  if (linkedClient) return false;

  const { data: platformMember } = await admin
    .from("miembros_plataforma")
    .select("id_usuario")
    .eq("id_usuario", user.id)
    .maybeSingle();

  if (platformMember) return false;

  const { error } = await admin.auth.admin.deleteUser(user.id);
  return !error;
}

export async function provisionClientAuthUser(
  email: string,
  password: string,
  clientId: string
): Promise<ProvisionResult> {
  const admin = createAdminClient();
  if (!admin) {
    return {
      error:
        "Falta SUPABASE_SERVICE_ROLE_KEY en apps/web/.env.local. Cópiala desde Supabase → Settings → API → service_role (secret), reinicia npm run dev y vuelve a intentar.",
    };
  }

  const create = () =>
    admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        must_change_password: true,
        tipo_usuario: "cliente",
        id_cliente: clientId,
      },
    });

  let { data, error } = await create();

  if (
    error?.message?.includes("already been registered") ||
    error?.message?.includes("already registered")
  ) {
    const removed = await deleteOrphanAuthUserByEmail(email);
    if (removed) {
      ({ data, error } = await create());
    } else {
      return {
        error:
          "Este correo ya está registrado en otro usuario. Usa otro correo o elimínalo en Supabase → Authentication.",
      };
    }
  }

  if (error || !data.user) {
    return { error: error?.message ?? "No se pudo crear el usuario." };
  }

  return { userId: data.user.id };
}

export async function updateClientAuthUser(
  userId: string,
  options: {
    email?: string;
    password?: string;
    forcePasswordChange?: boolean;
  }
): Promise<{ error?: string }> {
  const admin = createAdminClient();
  if (!admin) {
    return {
      error:
        "Falta SUPABASE_SERVICE_ROLE_KEY en apps/web/.env.local. Cópiala desde Supabase → Settings → API → service_role (secret) y reinicia npm run dev.",
    };
  }

  const patch: {
    email?: string;
    password?: string;
    user_metadata?: Record<string, unknown>;
  } = {};

  if (options.email) patch.email = options.email;
  if (options.password) patch.password = options.password;

  const { data: existingUser } = await admin.auth.admin.getUserById(userId);
  const currentMeta = existingUser?.user?.user_metadata ?? {};

  if (options.forcePasswordChange) {
    patch.user_metadata = {
      ...currentMeta,
      must_change_password: true,
    };
  }

  if (!patch.email && !patch.password && !patch.user_metadata) {
    return {};
  }

  const { error } = await admin.auth.admin.updateUserById(userId, patch);
  if (error) return { error: error.message };
  return {};
}

export async function linkClientToUser(
  supabase: SupabaseClient,
  clientId: string,
  userId: string
) {
  await supabase.from("miembros_cliente").upsert(
    { id_cliente: clientId, id_usuario: userId },
    { onConflict: "id_cliente,id_usuario" }
  );

  await supabase
    .from("clientes")
    .update({ id_usuario: userId })
    .eq("id", clientId);

  await syncClientCampaignMembership(supabase, clientId, userId);
}

export function generateTemporaryPassword(length = 12): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

export function userMustChangePassword(
  metadata: Record<string, unknown> | undefined
): boolean {
  return metadata?.must_change_password === true;
}
