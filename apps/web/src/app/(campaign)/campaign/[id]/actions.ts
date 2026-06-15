"use server";

import { revalidatePath } from "next/cache";
import { requireCampaignAccess } from "@/lib/campaign/access";
import { catalogPathsForCampaign } from "@/lib/campaign/catalog-nav";
import { flaskRegisterVoter } from "@/lib/flask/client";
import {
  textoTitulo,
  textoTituloOpcional,
} from "@/lib/normalize-text";

function campaignPaths(id: string) {
  return [
    `/campaign/${id}`,
    `/campaign/${id}/votantes`,
    `/campaign/${id}/quarantine`,
    ...catalogPathsForCampaign(id),
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
  const documento = String(formData.get("documento") ?? "").trim();
  const tipoDocumento = String(formData.get("tipo_documento") ?? "CC");
  const sexo = String(formData.get("sexo") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim() || null;
  const idRol = String(formData.get("id_rol") ?? "").trim();
  const idLider = String(formData.get("id_lider_directo") ?? "").trim();
  const idPuesto = String(formData.get("id_puesto_votacion") ?? "").trim();
  const mesa = textoTituloOpcional(String(formData.get("mesa") ?? ""));

  if (!nombres || !apellidos || !documento) {
    return { error: "Nombres, apellidos y documento son obligatorios." };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { error: "Sesión inválida. Vuelve a iniciar sesión." };
  }

  const result = await flaskRegisterVoter(campaignId, session.access_token, {
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
  });

  if (!result.ok) {
    return { error: result.message };
  }

  revalidateCampaign(campaignId);

  if (result.data.outcome === "quarantined") {
    const etiqueta =
      result.data.match_type === "cedula_exacta"
        ? "cédula duplicada"
        : "teléfono y nombre similares";
    return {
      ok: true,
      quarantined: true,
      message: `Registro enviado a cuarentena (${etiqueta}). Un supervisor debe resolverlo.`,
    };
  }

  if (result.data.outcome === "validation_error") {
    return { error: result.data.errors.join(" ") };
  }

  return {
    ok: true,
    message: "Votante registrado. Estado: pendiente de verificación.",
  };
}

export type QuarantineResolveAction = "fusionar" | "descartar" | "escalar";

export async function resolveQuarantineAction(
  campaignId: string,
  quarantineId: string,
  action: QuarantineResolveAction
) {
  const { supabase, user } = await requireCampaignAccess(campaignId);

  const { data: entry, error: fetchError } = await supabase
    .from("cuarentena_votantes")
    .select(
      "id, estado, id_votante_conflicto, nombres, apellidos, telefono, direccion, id_puesto_votacion, mesa, id_rol, id_lider_directo, sexo"
    )
    .eq("id", quarantineId)
    .eq("id_campana", campaignId)
    .single();

  if (fetchError || !entry) {
    return { error: "Registro de cuarentena no encontrado." };
  }

  if (entry.estado !== "pendiente" && entry.estado !== "escalado") {
    return { error: "Este registro ya fue resuelto." };
  }

  const now = new Date().toISOString();

  if (action === "descartar") {
    const { error } = await supabase
      .from("cuarentena_votantes")
      .update({
        estado: "descartado",
        resuelto_por: user.id,
        resuelto_en: now,
        notas_resolucion: "Duplicado descartado por supervisor.",
      })
      .eq("id", quarantineId);

    if (error) return { error: error.message };
    revalidateCampaign(campaignId);
    return { ok: true };
  }

  if (action === "escalar") {
    const { error } = await supabase
      .from("cuarentena_votantes")
      .update({
        estado: "escalado",
        resuelto_por: user.id,
        resuelto_en: now,
        notas_resolucion: "Escalado a administrador de campaña.",
      })
      .eq("id", quarantineId);

    if (error) return { error: error.message };
    revalidateCampaign(campaignId);
    return { ok: true };
  }

  if (!entry.id_votante_conflicto) {
    return { error: "No hay votante de conflicto para fusionar." };
  }

  const { data: master, error: masterError } = await supabase
    .from("votantes")
    .select("telefono, direccion, id_puesto_votacion, mesa, id_rol, sexo")
    .eq("id", entry.id_votante_conflicto)
    .single();

  if (masterError || !master) {
    return { error: "No se encontró el votante maestro del conflicto." };
  }

  const { error: mergeError } = await supabase
    .from("votantes")
    .update({
      telefono: master.telefono ?? entry.telefono,
      direccion: master.direccion ?? entry.direccion,
      id_puesto_votacion: master.id_puesto_votacion ?? entry.id_puesto_votacion,
      mesa: master.mesa ?? entry.mesa,
      id_rol: master.id_rol ?? entry.id_rol,
      sexo: master.sexo ?? entry.sexo,
    })
    .eq("id", entry.id_votante_conflicto);

  if (mergeError) return { error: mergeError.message };

  const { error: resolveError } = await supabase
    .from("cuarentena_votantes")
    .update({
      estado: "resuelto",
      resuelto_por: user.id,
      resuelto_en: now,
      notas_resolucion: "Fusionado con registro maestro existente.",
    })
    .eq("id", quarantineId);

  if (resolveError) return { error: resolveError.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function updateComunaAction(campaignId: string, formData: FormData) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = String(formData.get("id") ?? "").trim();
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const numero = textoTituloOpcional(String(formData.get("numero") ?? ""));

  if (!id) return { error: "Comuna no identificada." };
  if (!nombre) return { error: "El nombre de la comuna es obligatorio." };

  const { error } = await supabase
    .from("comunas")
    .update({ nombre, numero })
    .eq("id", id)
    .eq("id_campana", campaignId);

  if (error) return { error: error.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function deleteComunaAction(campaignId: string, comunaId: string) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = comunaId.trim();
  if (!id) return { error: "Comuna no identificada." };

  const { count } = await supabase
    .from("barrios")
    .select("*", { count: "exact", head: true })
    .eq("id_comuna", id);

  if (count && count > 0) {
    return {
      error: "No se puede eliminar: la comuna tiene barrios asociados.",
    };
  }

  const { error } = await supabase
    .from("comunas")
    .delete()
    .eq("id", id)
    .eq("id_campana", campaignId);

  if (error) return { error: error.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function updateBarrioAction(campaignId: string, formData: FormData) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = String(formData.get("id") ?? "").trim();
  const idComuna = String(formData.get("id_comuna") ?? "").trim();
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));

  if (!id) return { error: "Barrio no identificado." };
  if (!idComuna || !nombre) {
    return { error: "Comuna y nombre del barrio son obligatorios." };
  }

  const { data: comuna } = await supabase
    .from("comunas")
    .select("id")
    .eq("id", idComuna)
    .eq("id_campana", campaignId)
    .maybeSingle();

  if (!comuna) return { error: "La comuna seleccionada no pertenece a esta campaña." };

  const { error } = await supabase
    .from("barrios")
    .update({ id_comuna: idComuna, nombre })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function deleteBarrioAction(campaignId: string, barrioId: string) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = barrioId.trim();
  if (!id) return { error: "Barrio no identificado." };

  const { error } = await supabase.from("barrios").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function updateRolAction(campaignId: string, formData: FormData) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = String(formData.get("id") ?? "").trim();
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const nivel = Number(formData.get("nivel_jerarquia") ?? 1);

  if (!id) return { error: "Rol no identificado." };
  if (!nombre) return { error: "El nombre del rol es obligatorio." };
  if (nivel < 1 || nivel > 3) return { error: "El nivel debe ser 1, 2 o 3." };

  const { error } = await supabase
    .from("roles")
    .update({ nombre, nivel_jerarquia: nivel })
    .eq("id", id)
    .eq("id_campana", campaignId);

  if (error) return { error: error.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function deleteRolAction(campaignId: string, rolId: string) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = rolId.trim();
  if (!id) return { error: "Rol no identificado." };

  const { count } = await supabase
    .from("votantes")
    .select("*", { count: "exact", head: true })
    .eq("id_rol", id);

  if (count && count > 0) {
    return {
      error: "No se puede eliminar: hay votantes con este rol asignado.",
    };
  }

  const { error } = await supabase
    .from("roles")
    .delete()
    .eq("id", id)
    .eq("id_campana", campaignId);

  if (error) return { error: error.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function updateTipoNovedadAction(
  campaignId: string,
  formData: FormData
) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = String(formData.get("id") ?? "").trim();
  const novedad = textoTitulo(String(formData.get("novedad") ?? ""));

  if (!id) return { error: "Tipo de novedad no identificado." };
  if (!novedad) return { error: "La descripción es obligatoria." };

  const { error } = await supabase
    .from("tipos_novedad")
    .update({ novedad })
    .eq("id", id)
    .eq("id_campana", campaignId);

  if (error) return { error: error.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function deleteTipoNovedadAction(
  campaignId: string,
  tipoId: string
) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = tipoId.trim();
  if (!id) return { error: "Tipo de novedad no identificado." };

  const { count } = await supabase
    .from("novedades")
    .select("*", { count: "exact", head: true })
    .eq("id_tipo_novedad", id);

  if (count && count > 0) {
    return {
      error: "No se puede eliminar: hay novedades registradas con este tipo.",
    };
  }

  const { error } = await supabase
    .from("tipos_novedad")
    .delete()
    .eq("id", id)
    .eq("id_campana", campaignId);

  if (error) return { error: error.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function updatePuestoAction(campaignId: string, formData: FormData) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = String(formData.get("id") ?? "").trim();
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

  if (!id) return { error: "Puesto no identificado." };
  if (!nombre) return { error: "El nombre del puesto es obligatorio." };

  const { error } = await supabase
    .from("puestos_votacion")
    .update({
      nombre,
      municipio,
      direccion,
      codigo_registraduria: codigo,
      id_comuna: idComuna || null,
      votantes_hombres_admite: cuposH,
      votantes_mujeres_admite: cuposM,
      cantidad_mesas: mesas,
    })
    .eq("id", id)
    .eq("id_campana", campaignId);

  if (error) return { error: error.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function deletePuestoAction(campaignId: string, puestoId: string) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = puestoId.trim();
  if (!id) return { error: "Puesto no identificado." };

  const { count } = await supabase
    .from("votantes")
    .select("*", { count: "exact", head: true })
    .eq("id_puesto_votacion", id);

  if (count && count > 0) {
    return {
      error: "No se puede eliminar: hay votantes asignados a este puesto.",
    };
  }

  const { error } = await supabase
    .from("puestos_votacion")
    .delete()
    .eq("id", id)
    .eq("id_campana", campaignId);

  if (error) return { error: error.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function createLugarTrabajoAction(
  campaignId: string,
  formData: FormData
) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const direccion = textoTituloOpcional(String(formData.get("direccion") ?? ""));
  const idComuna = String(formData.get("id_comuna") ?? "").trim();
  const idBarrio = String(formData.get("id_barrio") ?? "").trim();

  if (!nombre) return { error: "El nombre del lugar de trabajo es obligatorio." };

  const { error } = await supabase.from("lugares_trabajo").insert({
    id_campana: campaignId,
    nombre,
    direccion,
    id_comuna: idComuna || null,
    id_barrio: idBarrio || null,
  });

  if (error) return { error: error.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function updateLugarTrabajoAction(
  campaignId: string,
  formData: FormData
) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = String(formData.get("id") ?? "").trim();
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const direccion = textoTituloOpcional(String(formData.get("direccion") ?? ""));
  const idComuna = String(formData.get("id_comuna") ?? "").trim();
  const idBarrio = String(formData.get("id_barrio") ?? "").trim();

  if (!id) return { error: "Lugar de trabajo no identificado." };
  if (!nombre) return { error: "El nombre es obligatorio." };

  const { error } = await supabase
    .from("lugares_trabajo")
    .update({
      nombre,
      direccion,
      id_comuna: idComuna || null,
      id_barrio: idBarrio || null,
    })
    .eq("id", id)
    .eq("id_campana", campaignId);

  if (error) return { error: error.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function deleteLugarTrabajoAction(
  campaignId: string,
  lugarId: string
) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = lugarId.trim();
  if (!id) return { error: "Lugar de trabajo no identificado." };

  const { error } = await supabase
    .from("lugares_trabajo")
    .delete()
    .eq("id", id)
    .eq("id_campana", campaignId);

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

export async function createLugarTrabajoFormAction(
  campaignId: string,
  formData: FormData
): Promise<void> {
  await createLugarTrabajoAction(campaignId, formData);
}

export async function createVotanteFormAction(
  campaignId: string,
  formData: FormData
): Promise<void> {
  await createVotanteAction(campaignId, formData);
}
