"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireCampaignAccess } from "@/lib/campaign/access";
import {
  catalogPathsForCampaign,
  catalogSegmentPath,
  type CatalogSegment,
} from "@/lib/campaign/catalog-nav";
import {
  catalogSaveError,
  isActionError,
} from "@/lib/campaign/catalog-codigo";
import { isBulkCatalogSegment } from "@/lib/campaign/catalog-bulk-config";
import { importCatalogRows } from "@/lib/campaign/catalog-bulk-import";
import {
  parseCatalogWorkbook,
  buildErrorWorkbook,
} from "@/lib/campaign/catalog-bulk-xlsx";
import { userCanEditCampaign } from "@/lib/campaign/access";
import { insertPuestoRow, updatePuestoRow } from "@/lib/campaign/puestos";
import { validarComunaBarrioPuesto } from "@/lib/campaign/comuna-barrio";
import { validarNivelJerarquia } from "@/lib/campaign/roles";
import { registerVoter } from "@/lib/campaign/voter-registry";
import {
  textoTitulo,
  textoTituloOpcional,
} from "@/lib/normalize-text";

function campaignPaths(id: number) {
  return [
    `/campaign/${id}`,
    `/campaign/${id}/votantes`,
    `/campaign/${id}/quarantine`,
    ...catalogPathsForCampaign(id),
  ];
}

function revalidateCampaign(id: number) {
  for (const path of campaignPaths(id)) {
    revalidatePath(path);
  }
}

export async function createComunaAction(campaignId: number, formData: FormData) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const idMunicipio = Number(formData.get("id_municipio") ?? 0);

  if (!nombre) return { error: "El nombre de la comuna es obligatorio." };
  if (!idMunicipio) return { error: "El municipio es obligatorio." };

  const { error } = await supabase.from("comunas").insert({
    nombre,
    id_municipio: idMunicipio,
  });

  const saveError = catalogSaveError(error, "comuna");
  if (saveError) return saveError;
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function createBarrioAction(campaignId: number, formData: FormData) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const idComuna = Number(formData.get("id_comuna") ?? 0);
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));

  if (!idComuna || !nombre) {
    return { error: "Comuna y nombre del barrio son obligatorios." };
  }

  const { error } = await supabase.from("barrios").insert({
    id_comuna: idComuna,
    nombre,
  });

  const saveError = catalogSaveError(error, "barrio");
  if (saveError) return saveError;
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function createRolAction(campaignId: number, formData: FormData) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const nivel = Number(formData.get("nivel_jerarquia") ?? 1);

  if (!nombre) return { error: "El nombre del rol es obligatorio." };

  const errorJerarquia = validarNivelJerarquia(nivel);
  if (errorJerarquia) return { error: errorJerarquia };

  const { error } = await supabase.from("roles").insert({
    id_campana: campaignId,
    nombre,
    nivel_jerarquia: nivel,
  });

  const saveError = catalogSaveError(error, "rol");
  if (saveError) return saveError;
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function createPuestoAction(campaignId: number, formData: FormData) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const municipio = textoTituloOpcional(String(formData.get("municipio") ?? ""));
  const direccion = textoTituloOpcional(String(formData.get("direccion") ?? ""));
  const idComuna = Number(formData.get("id_comuna") ?? 0);
  const idBarrio = Number(formData.get("id_barrio") ?? 0);
  const cuposH = Number(formData.get("votantes_hombres_admite") ?? 0);
  const cuposM = Number(formData.get("votantes_mujeres_admite") ?? 0);
  const mesas = Number(formData.get("cantidad_mesas") ?? 0);

  if (!nombre) return { error: "El nombre del puesto es obligatorio." };

  const ubicacion = await validarComunaBarrioPuesto(
    supabase,
    campaignId,
    idComuna,
    idBarrio
  );
  if ("error" in ubicacion) return ubicacion;

  const error = await insertPuestoRow(supabase, {
    nombre,
    municipio,
    direccion,
    id_comuna: ubicacion.idComuna,
    id_barrio: ubicacion.idBarrio,
    votantes_hombres_admite: cuposH,
    votantes_mujeres_admite: cuposM,
    cantidad_mesas: mesas,
  });

  const saveError = catalogSaveError(error, "puesto de votación");
  if (saveError) return saveError;
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function createTipoNovedadAction(
  campaignId: number,
  formData: FormData
) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const novedad = textoTitulo(String(formData.get("novedad") ?? ""));

  if (!novedad) return { error: "La descripción de la novedad es obligatoria." };

  const { error } = await supabase.from("tipos_novedad").insert({
    id_campana: campaignId,
    novedad,
  });

  const saveError = catalogSaveError(error, "tipo de novedad");
  if (saveError) return saveError;
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function createVotanteAction(campaignId: number, formData: FormData) {
  const { supabase, user } = await requireCampaignAccess(campaignId);

  const puedeEditar = await userCanEditCampaign(user.id, campaignId);
  if (!puedeEditar) {
    return {
      error:
        "No tienes permiso para registrar votantes. Se requiere rol editor o administrador de campaña.",
    };
  }

  const nombres = textoTitulo(String(formData.get("nombres") ?? ""));
  const apellidos = textoTitulo(String(formData.get("apellidos") ?? ""));
  const documento = String(formData.get("documento") ?? "").trim();
  const tipoDocumento = String(formData.get("tipo_documento") ?? "CC");
  const sexo = String(formData.get("sexo") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim() || null;
  const idRol = Number(formData.get("id_rol") ?? 0);
  const idLider = Number(formData.get("id_lider_directo") ?? 0);
  const idPuesto = Number(formData.get("id_puesto_votacion") ?? 0);
  const mesa = textoTituloOpcional(String(formData.get("mesa") ?? ""));
  const fechaNacimiento = String(formData.get("fecha_nacimiento") ?? "").trim();
  const direccion = textoTituloOpcional(String(formData.get("direccion") ?? ""));
  const idLugarTrabajo = Number(formData.get("id_lugar_trabajo") ?? 0);

  if (!nombres || !apellidos || !documento) {
    return { error: "Nombres, apellidos y documento son obligatorios." };
  }

  const result = await registerVoter(supabase, campaignId, user.id, {
    nombres,
    apellidos,
    documento,
    tipo_documento: tipoDocumento,
    sexo: sexo === "Masculino" || sexo === "Femenino" ? sexo : null,
    telefono,
    fecha_nacimiento: fechaNacimiento || null,
    direccion,
    id_rol: idRol || null,
    id_lider_directo: !idLider ? null : idLider,
    id_puesto_votacion: idPuesto || null,
    id_lugar_trabajo: idLugarTrabajo || null,
    mesa,
    canal_origen: "manual",
  });

  if (result.outcome === "validation_error") {
    return { error: result.errors.join(" ") };
  }

  revalidateCampaign(campaignId);

  if (result.outcome === "quarantined") {
    const etiqueta =
      result.match_type === "cedula_exacta"
        ? "cédula duplicada"
        : "teléfono y nombre similares";
    return {
      ok: true,
      quarantined: true,
      message: `Registro enviado a cuarentena (${etiqueta}). Un supervisor debe resolverlo.`,
    };
  }

  return {
    ok: true,
    message: "Votante registrado correctamente.",
  };
}

export async function updateVotanteNovedadAction(
  campaignId: number,
  votanteId: number,
  payload: {
    id_tipo_novedad: number | null;
    detalle_novedad: string | null;
  }
) {
  const { supabase, user } = await requireCampaignAccess(campaignId);

  const puedeEditar = await userCanEditCampaign(user.id, campaignId);
  if (!puedeEditar) {
    return {
      error:
        "No tienes permiso para gestionar novedades. Se requiere rol editor o administrador de campaña.",
    };
  }

  if (!votanteId) {
    return { error: "Votante no identificado." };
  }

  const idTipo = payload.id_tipo_novedad || null;
  const detalle = payload.detalle_novedad?.trim() || null;

  if (idTipo) {
    const { data: tipo } = await supabase
      .from("tipos_novedad")
      .select("id")
      .eq("id", idTipo)
      .eq("id_campana", campaignId)
      .maybeSingle();

    if (!tipo) {
      return { error: "El tipo de novedad no pertenece a esta campaña." };
    }
  }

  const { data: votante, error: fetchError } = await supabase
    .from("votantes")
    .select("id")
    .eq("id", votanteId)
    .eq("id_campana", campaignId)
    .maybeSingle();

  if (fetchError || !votante) {
    return { error: "Votante no encontrado en esta campaña." };
  }

  const { error } = await supabase
    .from("votantes")
    .update({
      id_tipo_novedad: idTipo,
      detalle_novedad: detalle,
    })
    .eq("id", votanteId)
    .eq("id_campana", campaignId);

  if (error) {
    return { error: "No se pudo guardar la novedad del votante." };
  }

  revalidateCampaign(campaignId);
  return { ok: true };
}

export type QuarantineResolveAction = "fusionar" | "descartar" | "escalar";

export async function resolveQuarantineAction(
  campaignId: number,
  quarantineId: number,
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

export async function updateComunaAction(campaignId: number, formData: FormData) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = Number(formData.get("id") ?? 0);
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const idMunicipio = Number(formData.get("id_municipio") ?? 0);

  if (!id) return { error: "Comuna no identificada." };
  if (!nombre) return { error: "El nombre de la comuna es obligatorio." };
  if (!idMunicipio) return { error: "El municipio es obligatorio." };

  const { error } = await supabase
    .from("comunas")
    .update({ nombre, id_municipio: idMunicipio })
    .eq("id", id)
    .eq("id_campana", campaignId);

  const saveError = catalogSaveError(error, "comuna");
  if (saveError) return saveError;
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function deleteComunaAction(campaignId: number, comunaId: number) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = comunaId;
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

export async function updateBarrioAction(campaignId: number, formData: FormData) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = Number(formData.get("id") ?? 0);
  const idComuna = Number(formData.get("id_comuna") ?? 0);
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

  const saveError = catalogSaveError(error, "barrio");
  if (saveError) return saveError;
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function deleteBarrioAction(campaignId: number, barrioId: number) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = barrioId;
  if (!id) return { error: "Barrio no identificado." };

  const { error } = await supabase.from("barrios").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function updateRolAction(campaignId: number, formData: FormData) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = Number(formData.get("id") ?? 0);
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const nivel = Number(formData.get("nivel_jerarquia") ?? 1);

  if (!id) return { error: "Rol no identificado." };
  if (!nombre) return { error: "El nombre del rol es obligatorio." };

  const errorJerarquia = validarNivelJerarquia(nivel);
  if (errorJerarquia) return { error: errorJerarquia };

  const { error } = await supabase
    .from("roles")
    .update({ nombre, nivel_jerarquia: nivel })
    .eq("id", id)
    .eq("id_campana", campaignId);

  const saveError = catalogSaveError(error, "rol");
  if (saveError) return saveError;
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function deleteRolAction(campaignId: number, rolId: number) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = rolId;
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
  campaignId: number,
  formData: FormData
) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = Number(formData.get("id") ?? 0);
  const novedad = textoTitulo(String(formData.get("novedad") ?? ""));

  if (!id) return { error: "Tipo de novedad no identificado." };
  if (!novedad) return { error: "La descripción es obligatoria." };

  const { error } = await supabase
    .from("tipos_novedad")
    .update({ novedad })
    .eq("id", id)
    .eq("id_campana", campaignId);

  const saveError = catalogSaveError(error, "tipo de novedad");
  if (saveError) return saveError;
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function deleteTipoNovedadAction(
  campaignId: number,
  tipoId: number
) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = tipoId;
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

export async function updatePuestoAction(campaignId: number, formData: FormData) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = Number(formData.get("id") ?? 0);
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const municipio = textoTituloOpcional(String(formData.get("municipio") ?? ""));
  const direccion = textoTituloOpcional(String(formData.get("direccion") ?? ""));
  const idComuna = Number(formData.get("id_comuna") ?? 0);
  const idBarrio = Number(formData.get("id_barrio") ?? 0);
  const cuposH = Number(formData.get("votantes_hombres_admite") ?? 0);
  const cuposM = Number(formData.get("votantes_mujeres_admite") ?? 0);
  const mesas = Number(formData.get("cantidad_mesas") ?? 0);

  if (!id) return { error: "Puesto no identificado." };
  if (!nombre) return { error: "El nombre del puesto es obligatorio." };

  const ubicacion = await validarComunaBarrioPuesto(
    supabase,
    campaignId,
    idComuna,
    idBarrio
  );
  if ("error" in ubicacion) return ubicacion;

  const error = await updatePuestoRow(supabase, campaignId, id, {
    nombre,
    municipio,
    direccion,
    id_comuna: ubicacion.idComuna,
    id_barrio: ubicacion.idBarrio,
    votantes_hombres_admite: cuposH,
    votantes_mujeres_admite: cuposM,
    cantidad_mesas: mesas,
  });

  const saveError = catalogSaveError(error, "puesto de votación");
  if (saveError) return saveError;
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function deletePuestoAction(campaignId: number, puestoId: number) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = puestoId;
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
  campaignId: number,
  formData: FormData
) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const direccion = textoTituloOpcional(String(formData.get("direccion") ?? ""));
  const idComuna = Number(formData.get("id_comuna") ?? 0);
  const idBarrio = Number(formData.get("id_barrio") ?? 0);

  if (!nombre) return { error: "El nombre del lugar de trabajo es obligatorio." };

  const { error } = await supabase.from("lugares_trabajo").insert({
    id_campana: campaignId,
    nombre,
    direccion,
    id_comuna: idComuna || null,
    id_barrio: idBarrio || null,
  });

  const saveError = catalogSaveError(error, "lugar de trabajo");
  if (saveError) return saveError;
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function updateLugarTrabajoAction(
  campaignId: number,
  formData: FormData
) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = Number(formData.get("id") ?? 0);
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const direccion = textoTituloOpcional(String(formData.get("direccion") ?? ""));
  const idComuna = Number(formData.get("id_comuna") ?? 0);
  const idBarrio = Number(formData.get("id_barrio") ?? 0);

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

  const saveError = catalogSaveError(error, "lugar de trabajo");
  if (saveError) return saveError;
  revalidateCampaign(campaignId);
  return { ok: true };
}

export async function deleteLugarTrabajoAction(
  campaignId: number,
  lugarId: number
) {
  const { supabase } = await requireCampaignAccess(campaignId);
  const id = lugarId;
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

export async function bulkUploadCatalogAction(
  campaignId: number,
  segment: CatalogSegment,
  formData: FormData
) {
  if (!isBulkCatalogSegment(segment)) {
    return { error: "Catálogo no soportado para carga masiva.", message: "Catálogo no soportado para carga masiva." };
  }

  const { supabase, user } = await requireCampaignAccess(campaignId);
  const puedeEditar = await userCanEditCampaign(user.id, campaignId);
  if (!puedeEditar) {
    return {
      error:
        "No tienes permiso para importar catálogos. Se requiere rol editor o administrador.",
      message:
        "No tienes permiso para importar catálogos. Se requiere rol editor o administrador.",
    };
  }

  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { error: "Selecciona un archivo Excel (.xlsx).", message: "Selecciona un archivo Excel (.xlsx)." };
  }

  if (archivo.size > 5 * 1024 * 1024) {
    return { error: "El archivo no puede superar 5 MB.", message: "El archivo no puede superar 5 MB." };
  }

  const parsed = parseCatalogWorkbook(await archivo.arrayBuffer(), segment);
  if ("error" in parsed) {
    return { error: parsed.error, message: parsed.error };
  }

  const result = await importCatalogRows(
    supabase,
    campaignId,
    segment,
    parsed.rows
  );

  if (result.created > 0) {
    revalidateCampaign(campaignId);
  }

  let archivoError: string | undefined;
  if (result.errors.length > 0) {
    const errorBuf = buildErrorWorkbook(
      parsed.headerRow,
      result.errors,
      parsed.rows
    );
    archivoError = errorBuf.toString("base64");
  }

  return {
    ok: result.ok,
    message: result.message,
    created: result.created,
    skipped: result.skipped,
    errors: result.errors,
    archivo_error: archivoError,
    error: result.created === 0 && result.errors.length > 0 ? result.message : undefined,
  };
}

export async function createComunaFormAction(
  campaignId: number,
  formData: FormData
): Promise<void> {
  const result = await createComunaAction(campaignId, formData);
  if (isActionError(result)) {
    redirect(
      `${catalogSegmentPath(campaignId, "comunas")}?error=${encodeURIComponent(result.error)}`
    );
  }
}

export async function createBarrioFormAction(
  campaignId: number,
  formData: FormData
): Promise<void> {
  await createBarrioAction(campaignId, formData);
}

export async function createRolFormAction(
  campaignId: number,
  formData: FormData
): Promise<void> {
  await createRolAction(campaignId, formData);
}

export async function createPuestoFormAction(
  campaignId: number,
  formData: FormData
): Promise<void> {
  const result = await createPuestoAction(campaignId, formData);
  if (isActionError(result)) {
    redirect(
      `${catalogSegmentPath(campaignId, "puestos")}?error=${encodeURIComponent(result.error)}`
    );
  }
}

export async function createTipoNovedadFormAction(
  campaignId: number,
  formData: FormData
): Promise<void> {
  await createTipoNovedadAction(campaignId, formData);
}

export async function createLugarTrabajoFormAction(
  campaignId: number,
  formData: FormData
): Promise<void> {
  await createLugarTrabajoAction(campaignId, formData);
}

export async function createVotanteFormAction(
  campaignId: number,
  formData: FormData
): Promise<void> {
  await createVotanteAction(campaignId, formData);
}
