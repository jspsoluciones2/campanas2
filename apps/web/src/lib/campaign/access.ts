import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";

export type CampanaBasica = {
  id: string;
  nombre: string;
  estado: string;
};

export async function requireCampaignAccess(campaignId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: campana, error } = await supabase
    .from("campanas")
    .select("id, nombre, estado")
    .eq("id", campaignId)
    .single();

  if (error || !campana) notFound();

  return { supabase, user, campana: campana as CampanaBasica };
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
