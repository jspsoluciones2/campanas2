"use server";

import { revalidatePath } from "next/cache";
import { requireCampaignAccess } from "@/lib/campaign/access";
import {
  textoTitulo,
  textoTituloOpcional,
} from "@/lib/normalize-text";

function campaignPaths(id: string) {
  return [
    `/campaign/${id}`,
    `/campaign/${id}/votantes`,
    `/campaign/${id}/catalogos`,
  ];
}

function revalidateCampaign(id: string) {
  for (const path of campaignPaths(id)) {
    revalidatePath(path);
  }
}

export async function createComunaAction(campaignId: string, formData: FormData) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const numero = textoTituloOpcional(String(formData.get("numero") ?? ""));

  if (!nombre) return { error: "El nombre de la comuna es obligatorio." };

  const { error } = await supabase.from("comunas").insert({
    id_campana: campaignId,
    nombre,
    numero,
  });

  if (error) return { error: error.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function createBarrioAction(campaignId: string, formData: FormData) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const idComuna = String(formData.get("id_comuna") ?? "");
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));

  if (!idComuna || !nombre) {
    return { error: "Comuna y nombre del barrio son obligatorios." };
  }

  const { error } = await supabase.from("barrios").insert({
    id_comuna: idComuna,
    nombre,
  });

  if (error) return { error: error.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function createRolAction(campaignId: string, formData: FormData) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const nivel = Number(formData.get("nivel_jerarquia") ?? 1);

  if (!nombre) return { error: "El nombre del rol es obligatorio." };
  if (nivel < 1 || nivel > 3) return { error: "El nivel debe ser 1, 2 o 3." };

  const { error } = await supabase.from("roles").insert({
    id_campana: campaignId,
    nombre,
    nivel_jerarquia: nivel,
  });

  if (error) return { error: error.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function createPuestoAction(campaignId: string, formData: FormData) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const municipio = textoTituloOpcional(String(formData.get("municipio") ?? ""));
  const direccion = textoTituloOpcional(String(formData.get("direccion") ?? ""));
  const codigo = textoTituloOpcional(
    String(formData.get("codigo_registraduria") ?? "")
  );
  const idComuna = String(formData.get("id_comuna") ?? "").trim();
  const cuposH = Number(formData.get("votantes_hombres_admite") ?? 0);
  const cuposM = Number(formData.get("votantes_mujeres_admite") ?? 0);
  const mesas = Number(formData.get("cantidad_mesas") ?? 0);

  if (!nombre) return { error: "El nombre del puesto es obligatorio." };

  const { error } = await supabase.from("puestos_votacion").insert({
    id_campana: campaignId,
    nombre,
    municipio,
    direccion,
    codigo_registraduria: codigo,
    id_comuna: idComuna || null,
    votantes_hombres_admite: cuposH,
    votantes_mujeres_admite: cuposM,
    cantidad_mesas: mesas,
  });

  if (error) return { error: error.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function createTipoNovedadAction(
  campaignId: string,
  formData: FormData
) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const novedad = textoTitulo(String(formData.get("novedad") ?? ""));

  if (!novedad) return { error: "La descripción de la novedad es obligatoria." };

  const { error } = await supabase.from("tipos_novedad").insert({
    id_campana: campaignId,
    novedad,
  });

  if (error) return { error: error.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function createVotanteAction(campaignId: string, formData: FormData) {
  const { supabase, user } = await requireCampaignAccess(campaignId);

  const nombres = textoTitulo(String(formData.get("nombres") ?? ""));
  const apellidos = textoTitulo(String(formData.get("apellidos") ?? ""));
  const documento = textoTitulo(String(formData.get("documento") ?? ""));
  const tipoDocumento = String(formData.get("tipo_documento") ?? "CC");
  const sexo = String(formData.get("sexo") ?? "").trim();
  const telefono = textoTituloOpcional(String(formData.get("telefono") ?? ""));
  const idRol = String(formData.get("id_rol") ?? "").trim();
  const idLider = String(formData.get("id_lider_directo") ?? "").trim();
  const idPuesto = String(formData.get("id_puesto_votacion") ?? "").trim();
  const mesa = textoTituloOpcional(String(formData.get("mesa") ?? ""));

  if (!nombres || !apellidos || !documento) {
    return { error: "Nombres, apellidos y documento son obligatorios." };
  }

  const { error } = await supabase.from("votantes").insert({
    id_campana: campaignId,
    nombres,
    apellidos,
    documento,
    tipo_documento: tipoDocumento,
    sexo: sexo === "Masculino" || sexo === "Femenino" ? sexo : null,
    telefono,
    id_rol: idRol || null,
    id_lider_directo: idLider || null,
    id_puesto_votacion: idPuesto || null,
    mesa,
    canal_origen: "manual",
    creado_por: user.id,
    estado: "pendiente_verificacion",
  });

  if (error) return { error: error.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function createComunaFormAction(
  campaignId: string,
  formData: FormData
): Promise<void> {
  await createComunaAction(campaignId, formData);
}

export async function createBarrioFormAction(
  campaignId: string,
  formData: FormData
): Promise<void> {
  await createBarrioAction(campaignId, formData);
}

export async function createRolFormAction(
  campaignId: string,
  formData: FormData
): Promise<void> {
  await createRolAction(campaignId, formData);
}

export async function createPuestoFormAction(
  campaignId: string,
  formData: FormData
): Promise<void> {
  await createPuestoAction(campaignId, formData);
}

export async function createTipoNovedadFormAction(
  campaignId: string,
  formData: FormData
): Promise<void> {
  await createTipoNovedadAction(campaignId, formData);
}

export async function createVotanteFormAction(
  campaignId: string,
  formData: FormData
): Promise<void> {
  await createVotanteAction(campaignId, formData);
}
