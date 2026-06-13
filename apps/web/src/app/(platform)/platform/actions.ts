"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createClientAction(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const contactEmail = String(formData.get("contact_email") ?? "").trim();

  if (!name) {
    return { error: "El nombre es obligatorio." };
  }

  const { error } = await supabase.from("clients").insert({
    name,
    contact_email: contactEmail || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/platform/clients");
  return { ok: true };
}

export async function createElectoralProcessAction(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const electionDate = String(formData.get("election_date") ?? "").trim();

  if (!name) return { error: "El nombre del proceso es obligatorio." };

  const { error } = await supabase.from("electoral_processes").insert({
    name,
    election_date: electionDate || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/platform/campaigns");
  return { ok: true };
}

export async function createCampaignAction(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const clientId = String(formData.get("client_id") ?? "");
  const processId = String(formData.get("electoral_process_id") ?? "");

  if (!name || !clientId || !processId) {
    return { error: "Nombre, cliente y proceso electoral son obligatorios." };
  }

  const { error } = await supabase.from("campaigns").insert({
    name,
    client_id: clientId,
    electoral_process_id: processId,
    status: "active",
    started_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath("/platform/campaigns");
  return { ok: true };
}

export type CampaignStatus = "active" | "paused" | "ended" | "purged";

const STATUS_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  active: ["paused", "ended"],
  paused: ["active", "ended"],
  ended: ["purged"],
  purged: [],
};

export async function updateCampaignStatusAction(
  campaignId: string,
  newStatus: CampaignStatus
) {
  const supabase = await createClient();

  const { data: campaign, error: fetchError } = await supabase
    .from("campaigns")
    .select("status")
    .eq("id", campaignId)
    .single();

  if (fetchError || !campaign) {
    return { error: fetchError?.message ?? "Campaña no encontrada." };
  }

  const current = campaign.status as CampaignStatus;
  if (!STATUS_TRANSITIONS[current]?.includes(newStatus)) {
    return {
      error: `No se puede pasar de ${current} a ${newStatus}.`,
    };
  }

  const patch: Record<string, string | null> = { status: newStatus };
  if (newStatus === "ended") patch.ended_at = new Date().toISOString();
  if (newStatus === "purged") patch.purged_at = new Date().toISOString();

  const { error } = await supabase
    .from("campaigns")
    .update(patch)
    .eq("id", campaignId);

  if (error) return { error: error.message };

  await supabase.from("audit_log").insert({
    action: `campaign.status.${newStatus}`,
    entity_type: "campaign",
    entity_id: campaignId,
    campaign_id: campaignId,
    metadata: { from: current, to: newStatus },
  });

  revalidatePath("/platform/campaigns");
  revalidatePath(`/platform/campaigns/${campaignId}`);
  return { ok: true };
}

export async function assignCampaignMemberAction(formData: FormData) {
  const supabase = await createClient();
  const campaignId = String(formData.get("campaign_id") ?? "");
  const userId = String(formData.get("user_id") ?? "").trim();
  const role = String(formData.get("role") ?? "collector");

  if (!campaignId || !userId) {
    return { error: "Campaña y usuario son obligatorios." };
  }

  const { error } = await supabase.from("campaign_members").insert({
    campaign_id: campaignId,
    user_id: userId,
    role,
  });

  if (error) return { error: error.message };

  revalidatePath(`/platform/campaigns/${campaignId}`);
  return { ok: true };
}

export async function createClientFormAction(formData: FormData): Promise<void> {
  await createClientAction(formData);
}

export async function createElectoralProcessFormAction(
  formData: FormData
): Promise<void> {
  await createElectoralProcessAction(formData);
}

export async function createCampaignFormAction(formData: FormData): Promise<void> {
  await createCampaignAction(formData);
}

export async function assignCampaignMemberFormAction(
  formData: FormData
): Promise<void> {
  await assignCampaignMemberAction(formData);
}

export async function submitCampaignStatusUpdate(
  campaignId: string,
  newStatus: CampaignStatus
): Promise<void> {
  await updateCampaignStatusAction(campaignId, newStatus);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
