"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createClientAction(formData: FormData) {
  const supabase = await createClient();
  const nombre = String(formData.get("nombre") ?? formData.get("name") ?? "").trim();
  const correo = String(formData.get("correo_contacto") ?? formData.get("contact_email") ?? "").trim();
  const documento = String(formData.get("documento") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();

  if (!nombre) {
    return { error: "El nombre es obligatorio." };
  }

  const { error } = await supabase.from("clientes").insert({
    nombre,
    correo_contacto: correo || null,
    documento: documento || null,
    telefono: telefono || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/platform/clients");
  return { ok: true };
}

export async function createElectoralProcessAction(formData: FormData) {
  const supabase = await createClient();
  const nombre = String(formData.get("nombre") ?? formData.get("name") ?? "").trim();
  const fechaEleccion = String(formData.get("fecha_eleccion") ?? formData.get("election_date") ?? "").trim();

  if (!nombre) return { error: "El nombre del proceso es obligatorio." };

  const { error } = await supabase.from("procesos_electorales").insert({
    nombre,
    fecha_eleccion: fechaEleccion || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/platform/campaigns");
  return { ok: true };
}

export async function createCampaignAction(formData: FormData) {
  const supabase = await createClient();
  const nombre = String(formData.get("nombre") ?? formData.get("name") ?? "").trim();
  const idCliente = String(formData.get("id_cliente") ?? formData.get("client_id") ?? "");
  const idProceso = String(formData.get("id_proceso_electoral") ?? formData.get("electoral_process_id") ?? "");

  if (!nombre || !idCliente || !idProceso) {
    return { error: "Nombre, cliente y proceso electoral son obligatorios." };
  }

  const { error } = await supabase.from("campanas").insert({
    nombre,
    id_cliente: idCliente,
    id_proceso_electoral: idProceso,
    estado: "activa",
    iniciado_en: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath("/platform/campaigns");
  return { ok: true };
}

export type EstadoCampana = "activa" | "pausada" | "finalizada" | "purgada";

const TRANSICIONES_ESTADO: Record<EstadoCampana, EstadoCampana[]> = {
  activa: ["pausada", "finalizada"],
  pausada: ["activa", "finalizada"],
  finalizada: ["purgada"],
  purgada: [],
};

export async function updateCampaignStatusAction(
  campaignId: string,
  nuevoEstado: EstadoCampana
) {
  const supabase = await createClient();

  const { data: campana, error: fetchError } = await supabase
    .from("campanas")
    .select("estado")
    .eq("id", campaignId)
    .single();

  if (fetchError || !campana) {
    return { error: fetchError?.message ?? "Campaña no encontrada." };
  }

  const actual = campana.estado as EstadoCampana;
  if (!TRANSICIONES_ESTADO[actual]?.includes(nuevoEstado)) {
    return {
      error: `No se puede pasar de ${actual} a ${nuevoEstado}.`,
    };
  }

  const patch: Record<string, string | null> = { estado: nuevoEstado };
  if (nuevoEstado === "finalizada") patch.finalizado_en = new Date().toISOString();
  if (nuevoEstado === "purgada") patch.purgado_en = new Date().toISOString();

  const { error } = await supabase
    .from("campanas")
    .update(patch)
    .eq("id", campaignId);

  if (error) return { error: error.message };

  await supabase.from("registro_auditoria").insert({
    accion: `campana.estado.${nuevoEstado}`,
    tipo_entidad: "campana",
    id_entidad: campaignId,
    id_campana: campaignId,
    metadatos: { desde: actual, hacia: nuevoEstado },
  });

  revalidatePath("/platform/campaigns");
  revalidatePath(`/platform/campaigns/${campaignId}`);
  return { ok: true };
}

export async function assignCampaignMemberAction(formData: FormData) {
  const supabase = await createClient();
  const idCampana = String(formData.get("id_campana") ?? formData.get("campaign_id") ?? "");
  const idUsuario = String(formData.get("id_usuario") ?? formData.get("user_id") ?? "").trim();
  const rol = String(formData.get("rol") ?? formData.get("role") ?? "lector");

  if (!idCampana || !idUsuario) {
    return { error: "Campaña y usuario son obligatorios." };
  }

  const { error } = await supabase.from("miembros_campana").insert({
    id_campana: idCampana,
    id_usuario: idUsuario,
    rol,
  });

  if (error) return { error: error.message };

  revalidatePath(`/platform/campaigns/${idCampana}`);
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
  nuevoEstado: EstadoCampana
): Promise<void> {
  await updateCampaignStatusAction(campaignId, nuevoEstado);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// Alias para compatibilidad en páginas
export type CampaignStatus = EstadoCampana;
