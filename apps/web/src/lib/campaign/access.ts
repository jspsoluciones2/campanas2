import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

export type CampanaBasica = {
  id: string;
  nombre: string;
  estado: string;
  nombreCliente: string | null;
};

function nombreClienteRelacion(
  rel: { nombre: string } | { nombre: string }[] | null | undefined
) {
  if (!rel) return null;
  if (Array.isArray(rel)) return rel[0]?.nombre ?? null;
  return rel.nombre ?? null;
}

export async function requireCampaignAccess(campaignId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: campana, error } = await supabase
    .from("campanas")
    .select("id, nombre, estado, clientes(nombre)")
    .eq("id", campaignId)
    .single();

  if (error || !campana) notFound();

  const basica: CampanaBasica = {
    id: campana.id,
    nombre: campana.nombre,
    estado: campana.estado,
    nombreCliente: nombreClienteRelacion(
      campana.clientes as { nombre: string } | { nombre: string }[] | null
    ),
  };

  return { supabase, user, campana: basica };
}

export async function userCanAccessCampaign(
  userId: string,
  campaignId: string
): Promise<boolean> {
  const supabase = await createClient();

  const [{ data: platform }, { data: member }] = await Promise.all([
    supabase
      .from("miembros_plataforma")
      .select("rol")
      .eq("id_usuario", userId)
      .maybeSingle(),
    supabase
      .from("miembros_campana")
      .select("id")
      .eq("id_usuario", userId)
      .eq("id_campana", campaignId)
      .maybeSingle(),
  ]);

  return Boolean(platform || member);
}

export async function userCanEditCampaign(
  userId: string,
  campaignId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data: platform } = await supabase
    .from("miembros_plataforma")
    .select("rol")
    .eq("id_usuario", userId)
    .maybeSingle();

  if (platform) return true;

  const { data: member } = await supabase
    .from("miembros_campana")
    .select("rol")
    .eq("id_usuario", userId)
    .eq("id_campana", campaignId)
    .maybeSingle();

  if (!member) return false;
  return member.rol === "editor" || member.rol === "administrador_campana";
}

export async function userCanManageCampaignTeam(
  userId: string,
  campaignId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { data: platform } = await supabase
    .from("miembros_plataforma")
    .select("rol")
    .eq("id_usuario", userId)
    .maybeSingle();

  if (platform) return true;

  const { data: member } = await supabase
    .from("miembros_campana")
    .select("rol")
    .eq("id_usuario", userId)
    .eq("id_campana", campaignId)
    .maybeSingle();

  return member?.rol === "administrador_campana";
}

export async function requireCampaignTeamManager(campaignId: string) {
  const access = await requireCampaignAccess(campaignId);
  const canManage = await userCanManageCampaignTeam(
    access.user.id,
    campaignId
  );

  if (!canManage) {
    redirect(`/campaign/${campaignId}`);
  }

  return access;
}
