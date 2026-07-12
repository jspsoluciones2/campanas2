"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  correoNormalizado,
  textoTitulo,
  textoTituloOpcional,
} from "@/lib/normalize-text";
import {
  configFromBrandFormInput,
  validateBrandFormInput,
} from "@/lib/platform/brand";
import {
  PLATFORM_ASSETS_BUCKET,
  type BrandAssetKind,
  brandAssetStoragePath,
  validateBrandAssetFile,
} from "@/lib/platform/brand-assets";
import {
  campaignFeatureFlagForProvider,
  isConfiguredSecretPlaceholder,
  isPlatformApiProveedor,
  mergeApiConfig,
  parseIntegrationConfig,
  serializeIntegrationConfig,
  validateApiConfig,
  type PlatformApiProveedor,
  type TelegramConfig,
} from "@/lib/platform/api-integrations";
import {
  isHttpsAppOrigin,
  obtenerUsuarioBotTelegram,
  registrarWebhookTelegram,
  resolveAppPublicUrl,
  telegramWebhookUrl,
} from "@/lib/platform/telegram-integration";
import {
  deleteAuthUser,
  generateTemporaryPassword,
  linkClientToUser,
  provisionClientAuthUser,
  requirePlatformOwner,
  syncClientCampaignMembership,
  updateClientAuthUser,
  validateInitialPassword,
} from "@/lib/platform/client-auth";
import { assignCampaignMemberWithCredentials } from "@/lib/campaign/team";

async function appOriginFromRequest(): Promise<string> {
  const requestHeaders = await headers();
  return resolveAppPublicUrl({ headers: requestHeaders });
}

async function syncCampaignFeatureFlag(
  supabase: Awaited<ReturnType<typeof createClient>>,
  idCampana: number,
  proveedor: PlatformApiProveedor,
  activa: boolean
): Promise<string | null> {
  const field = campaignFeatureFlagForProvider(proveedor);
  if (!field) return null;

  const { data: existing } = await supabase
    .from("caracteristicas_campana")
    .select("id_campana")
    .eq("id_campana", idCampana)
    .maybeSingle();

  if (!existing) {
    const { error } = await supabase.from("caracteristicas_campana").insert({
      id_campana: idCampana,
      [field]: activa,
    });
    return error?.message ?? null;
  }

  const { error } = await supabase
    .from("caracteristicas_campana")
    .update({ [field]: activa })
    .eq("id_campana", idCampana);

  return error?.message ?? null;
}

export async function createClientAction(formData: FormData) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const nombre = textoTitulo(
    String(formData.get("nombre") ?? formData.get("name") ?? "")
  );
  const correo = correoNormalizado(
    String(formData.get("correo_contacto") ?? formData.get("contact_email") ?? "")
  );
  const documento = textoTituloOpcional(String(formData.get("documento") ?? ""));
  const telefono = textoTituloOpcional(String(formData.get("telefono") ?? ""));
  const contrasena = String(
    formData.get("contrasena_inicial") ?? formData.get("password") ?? ""
  ).trim();

  if (!nombre) {
    return { error: "El nombre es obligatorio." };
  }
  if (!correo) {
    return { error: "El correo es obligatorio para crear el acceso del cliente." };
  }
  const passwordError = validateInitialPassword(contrasena);
  if (passwordError) return { error: passwordError };

  const { data: inserted, error } = await supabase
    .from("clientes")
    .insert({
      nombre,
      correo_contacto: correo,
      documento,
      telefono,
    })
    .select("id")
    .single();

  if (error || !inserted) return { error: error?.message ?? "Error al crear cliente." };

  const provisioned = await provisionClientAuthUser(correo, contrasena, inserted.id);
  if ("error" in provisioned) {
    await supabase.from("clientes").delete().eq("id", inserted.id);
    return { error: provisioned.error };
  }

  await linkClientToUser(supabase, inserted.id, provisioned.userId);

  revalidatePath("/platform/clients");
  revalidatePath("/platform/maestras");
  return { ok: true, tempPassword: contrasena, email: correo, nombre };
}

export async function updateClientAction(formData: FormData) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const id = Number(formData.get("id") ?? "");
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const correo = correoNormalizado(String(formData.get("correo_contacto") ?? ""));
  const documento = textoTituloOpcional(String(formData.get("documento") ?? ""));
  const telefono = textoTituloOpcional(String(formData.get("telefono") ?? ""));
  const contrasena = String(
    formData.get("contrasena_inicial") ?? formData.get("password") ?? ""
  ).trim();

  if (!id) return { error: "Cliente no identificado." };
  if (!nombre) return { error: "El nombre es obligatorio." };

  const { data: existing } = await supabase
    .from("clientes")
    .select("id, id_usuario, correo_contacto")
    .eq("id", id)
    .single();

  if (!existing) return { error: "Cliente no encontrado." };

  if (contrasena) {
    const passwordError = validateInitialPassword(contrasena);
    if (passwordError) return { error: passwordError };
  }

  const { error } = await supabase
    .from("clientes")
    .update({
      nombre,
      correo_contacto: correo,
      documento,
      telefono,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  if (!existing.id_usuario) {
    if (correo && contrasena) {
      const provisioned = await provisionClientAuthUser(correo, contrasena, id);
      if ("error" in provisioned) return { error: provisioned.error };
      await linkClientToUser(supabase, id, provisioned.userId);
    }
  } else {
    const emailChanged =
      correo && correo !== (existing.correo_contacto ?? "").toLowerCase();
    if (emailChanged || contrasena) {
      const updated = await updateClientAuthUser(existing.id_usuario, {
        email: emailChanged ? correo! : undefined,
        password: contrasena || undefined,
        forcePasswordChange: Boolean(contrasena),
      });
      if (updated.error) return { error: updated.error };
    }
    if (existing.id_usuario) {
      await syncClientCampaignMembership(supabase, id, existing.id_usuario);
    }
  }

  revalidatePath("/platform/clients");
  revalidatePath("/platform/maestras");
  return { ok: true };
}

export async function deleteClientAction(clientId: number) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const id = clientId;

  if (!id) return { error: "Cliente no identificado." };

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, id_usuario, nombre")
    .eq("id", id)
    .single();

  if (!cliente) return { error: "Cliente no encontrado." };

  const { count } = await supabase
    .from("campanas")
    .select("*", { count: "exact", head: true })
    .eq("id_cliente", id);

  if (count && count > 0) {
    return {
      error: "No se puede eliminar: el cliente tiene campañas asociadas.",
    };
  }

  const { error } = await supabase.from("clientes").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        error: "No se puede eliminar: el cliente tiene registros asociados.",
      };
    }
    return { error: error.message };
  }

  if (cliente.id_usuario) {
    const removed = await deleteAuthUser(cliente.id_usuario);
    if (removed.error) {
      return {
        error: `Cliente eliminado, pero no se pudo borrar su acceso: ${removed.error}`,
      };
    }
  }

  revalidatePath("/platform/clients");
  revalidatePath("/platform/maestras");
  return { ok: true };
}

export async function resetClientPasswordAction(clientId: number) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const id = clientId;
  if (!id) return { error: "Cliente no identificado." };

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nombre, id_usuario, correo_contacto")
    .eq("id", id)
    .single();

  if (!cliente) return { error: "Cliente no encontrado." };
  if (!cliente.id_usuario) {
    return { error: "Este cliente aún no tiene acceso. Créalo desde Editar." };
  }
  if (!cliente.correo_contacto) {
    return { error: "El cliente no tiene correo de contacto." };
  }

  const tempPassword = generateTemporaryPassword();
  const updated = await updateClientAuthUser(cliente.id_usuario, {
    password: tempPassword,
    forcePasswordChange: true,
  });

  if (updated.error) return { error: updated.error };

  return {
    ok: true,
    nombre: cliente.nombre,
    email: cliente.correo_contacto,
    tempPassword,
  };
}

export async function createElectoralProcessAction(formData: FormData) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const nombre = textoTitulo(
    String(formData.get("nombre") ?? formData.get("name") ?? "")
  );
  const fechaEleccion = String(formData.get("fecha_eleccion") ?? formData.get("election_date") ?? "").trim();

  if (!nombre) return { error: "El nombre del proceso es obligatorio." };

  const { error } = await supabase.from("procesos_electorales").insert({
    nombre,
    fecha_eleccion: fechaEleccion || null,
  });

  if (error) return { error: error.message };

  revalidatePath("/platform/campaigns");
  revalidatePath("/platform/maestras");
  return { ok: true };
}

export async function updateElectoralProcessAction(formData: FormData) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const id = Number(formData.get("id") ?? "");
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const fechaEleccion = String(formData.get("fecha_eleccion") ?? "").trim();

  if (!id) return { error: "Proceso no identificado." };
  if (!nombre) return { error: "El nombre del proceso es obligatorio." };

  const { error } = await supabase
    .from("procesos_electorales")
    .update({
      nombre,
      fecha_eleccion: fechaEleccion || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/platform/campaigns");
  revalidatePath("/platform/maestras");
  return { ok: true };
}

export async function deleteElectoralProcessAction(processId: number) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const id = processId;
  if (!id) return { error: "Proceso no identificado." };

  const { count } = await supabase
    .from("campanas")
    .select("*", { count: "exact", head: true })
    .eq("id_proceso_electoral", id);

  if (count && count > 0) {
    return {
      error: "No se puede eliminar: el proceso tiene campañas asociadas.",
    };
  }

  const { error } = await supabase
    .from("procesos_electorales")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/platform/campaigns");
  revalidatePath("/platform/maestras");
  return { ok: true };
}

// ── Departamentos ──

export async function createDepartamentoAction(formData: FormData) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const id = String(formData.get("id") ?? "").trim();
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const latitud = parseCoordenada(formData.get("latitud"));
  const longitud = parseCoordenada(formData.get("longitud"));

  if (!id) return { error: "El ID del departamento es obligatorio." };
  if (!nombre) return { error: "El nombre del departamento es obligatorio." };
  if (latitud != null && (latitud < -90 || latitud > 90)) {
    return { error: "Latitud inválida. Debe ser un número entre -90 y 90." };
  }
  if (longitud != null && (longitud < -180 || longitud > 180)) {
    return { error: "Longitud inválida. Debe ser un número entre -180 y 180." };
  }

  const { error } = await supabase.from("departamentos").insert({ id, nombre, latitud, longitud });
  if (error) {
    if (error.code === "23505") return { error: "Ya existe un departamento con ese nombre." };
    return { error: error.message };
  }

  revalidatePath("/platform/maestras/departamentos");
  return { ok: true };
}

export async function updateDepartamentoAction(formData: FormData) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const id = String(formData.get("id") ?? "");
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const latitud = parseCoordenada(formData.get("latitud"));
  const longitud = parseCoordenada(formData.get("longitud"));

  if (!id) return { error: "Departamento no identificado." };
  if (!nombre) return { error: "El nombre del departamento es obligatorio." };

  const { error } = await supabase
    .from("departamentos")
    .update({ nombre, latitud, longitud })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "Ya existe un departamento con ese nombre." };
    return { error: error.message };
  }

  revalidatePath("/platform/maestras/departamentos");
  return { ok: true };
}

export async function deleteDepartamentoAction(departamentoId: string) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const { error } = await supabase.from("departamentos").delete().eq("id", departamentoId);
  if (error) {
    if (error.code === "23503") return { error: "No se puede eliminar: hay municipios vinculados a este departamento." };
    return { error: error.message };
  }

  revalidatePath("/platform/maestras/departamentos");
  return { ok: true };
}

// ── Municipios ──

export async function createMunicipioAction(formData: FormData) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const id = String(formData.get("id") ?? "").trim();
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const idDepartamento = String(formData.get("id_departamento") ?? "");
  const latitud = parseCoordenada(formData.get("latitud"));
  const longitud = parseCoordenada(formData.get("longitud"));

  if (!id) return { error: "El ID del municipio es obligatorio." };
  if (!nombre) return { error: "El nombre del municipio es obligatorio." };
  if (!idDepartamento) return { error: "El departamento es obligatorio." };

  const { error } = await supabase.from("municipios").insert({
    id,
    nombre,
    id_departamento: idDepartamento,
    latitud,
    longitud,
  });

  if (error) {
    if (error.code === "23505") return { error: "Ya existe un municipio con ese nombre en este departamento." };
    return { error: error.message };
  }

  revalidatePath("/platform/maestras/municipios");
  return { ok: true };
}

export async function updateMunicipioAction(formData: FormData) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const id = String(formData.get("id") ?? "");
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));
  const idDepartamento = String(formData.get("id_departamento") ?? "");
  const latitud = parseCoordenada(formData.get("latitud"));
  const longitud = parseCoordenada(formData.get("longitud"));

  if (!id) return { error: "Municipio no identificado." };
  if (!nombre) return { error: "El nombre del municipio es obligatorio." };
  if (!idDepartamento) return { error: "El departamento es obligatorio." };

  const { error } = await supabase
    .from("municipios")
    .update({ nombre, id_departamento: idDepartamento, latitud, longitud })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") return { error: "Ya existe un municipio con ese nombre en este departamento." };
    return { error: error.message };
  }

  revalidatePath("/platform/maestras/municipios");
  return { ok: true };
}

export async function deleteMunicipioAction(municipioId: string) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const { error } = await supabase.from("municipios").delete().eq("id", municipioId);
  if (error) {
    if (error.code === "23503") return { error: "No se puede eliminar: hay comunas vinculadas a este municipio." };
    return { error: error.message };
  }

  revalidatePath("/platform/maestras/municipios");
  return { ok: true };
}

export async function createCampaignAction(formData: FormData) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const nombre = textoTitulo(
    String(formData.get("nombre") ?? formData.get("name") ?? "")
  );
  const idCliente = Number(formData.get("id_cliente") ?? formData.get("client_id") ?? "");
  const idProceso = Number(formData.get("id_proceso_electoral") ?? formData.get("electoral_process_id") ?? "");

  if (!nombre || !idCliente || !idProceso) {
    return { error: "Nombre, cliente y proceso electoral son obligatorios." };
  }

  const { data: existente } = await supabase
    .from("campanas")
    .select("id")
    .eq("id_cliente", idCliente)
    .eq("id_proceso_electoral", idProceso)
    .maybeSingle();

  if (existente) {
    return {
      error:
        "Ya existe una campaña para ese cliente en este proceso electoral.",
    };
  }

  const { data: campana, error } = await supabase
    .from("campanas")
    .insert({
      nombre,
      id_cliente: idCliente,
      id_proceso_electoral: idProceso,
      estado: "activa",
      iniciado_en: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (error || !campana) {
    if (error?.code === "23505") {
      return {
        error:
          "Ya existe una campaña para ese cliente en este proceso electoral.",
      };
    }
    return { error: error?.message ?? "Error al crear campaña." };
  }

  const { data: cliente } = await supabase
    .from("clientes")
    .select("id_usuario")
    .eq("id", idCliente)
    .maybeSingle();

  if (cliente?.id_usuario) {
    await supabase.from("miembros_campana").upsert(
      {
        id_campana: campana.id,
        id_usuario: cliente.id_usuario,
        rol: "administrador_campana",
      },
      { onConflict: "id_campana,id_usuario" }
    );
  }

  revalidatePath("/platform/campaigns");
  revalidatePath("/platform/maestras/campanas");
  revalidatePath("/platform/maestras");

  await syncCampaignAlcance(supabase, campana.id, formData);

  return { ok: true };
}

async function syncCampaignAlcance(
  supabase: Awaited<ReturnType<typeof createClient>>,
  campaignId: number,
  formData: FormData
) {
  const raw = String(formData.get("alcance") ?? "");
  if (!raw) return;

  let parsed: { tipo: string; entries?: { id_departamento: string; id_municipio?: string }[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return;
  }

  if (parsed.tipo !== "especifico" || !parsed.entries?.length) {
    await supabase.from("campana_territorio").delete().eq("id_campana", campaignId);
    return;
  }

  const rows = parsed.entries.map((e) => ({
    id_campana: campaignId,
    id_departamento: e.id_departamento,
    id_municipio: e.id_municipio ?? null,
  }));

  await supabase.from("campana_territorio").delete().eq("id_campana", campaignId);
  if (rows.length > 0) {
    await supabase.from("campana_territorio").insert(rows);
  }
}

export async function updateCampaignAlcanceAction(formData: FormData) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const campaignId = Number(formData.get("id_campana") ?? 0);
  if (!campaignId) return { error: "Campaña no identificada." };

  await syncCampaignAlcance(supabase, campaignId, formData);

  revalidatePath(`/platform/campaigns/${campaignId}`);
  return { ok: true };
}

export async function updateCampaignAlcanceFormAction(formData: FormData): Promise<void> {
  await updateCampaignAlcanceAction(formData);
}

export async function updateCampaignAction(formData: FormData) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const id = Number(formData.get("id") ?? "");
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));

  if (!id) return { error: "Campaña no identificada." };
  if (!nombre) return { error: "El nombre de la campaña es obligatorio." };

  const { error } = await supabase
    .from("campanas")
    .update({ nombre })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/platform/campaigns");
  revalidatePath("/platform/maestras/campanas");
  revalidatePath("/platform");
  revalidatePath(`/platform/campaigns/${id}`);
  return { ok: true };
}

function moduloActivo(formData: FormData, campo: string): boolean {
  const valor = formData.get(campo);
  return valor === "1" || valor === "on" || valor === "true";
}

export async function updateCampaignModulesAction(
  campaignId: number,
  formData: FormData
) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const id = campaignId;
  if (!id) return { error: "Campaña no identificada." };

  const payload = {
    resolutor_captcha: moduloActivo(formData, "resolutor_captcha"),
    auditoria_e14: moduloActivo(formData, "auditoria_e14"),
    whatsapp: moduloActivo(formData, "whatsapp"),
    telegram: moduloActivo(formData, "telegram"),
    captura_web: moduloActivo(formData, "captura_web"),
  };

  const { data: existing } = await supabase
    .from("caracteristicas_campana")
    .select("id_campana")
    .eq("id_campana", id)
    .maybeSingle();

  const { error } = existing
    ? await supabase
        .from("caracteristicas_campana")
        .update(payload)
        .eq("id_campana", id)
    : await supabase.from("caracteristicas_campana").insert({
        id_campana: id,
        ...payload,
      });

  if (error) {
    return { error: error.message ?? "No se pudieron guardar los módulos." };
  }

  revalidatePath("/platform/campaigns");
  revalidatePath(`/platform/campaigns/${id}`);
  revalidatePath(`/platform/campaigns/${id}/integrations`);
  revalidatePath(`/campaign/${id}`);
  return { ok: true };
}

export async function deleteCampaignAction(campaignId: number) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const id = campaignId;
  if (!id) return { error: "Campaña no identificada." };

  const { data: campana } = await supabase
    .from("campanas")
    .select("id, nombre")
    .eq("id", id)
    .maybeSingle();

  if (!campana) return { error: "Campaña no encontrada." };

  const { error } = await supabase.from("campanas").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        error: "No se puede eliminar: la campaña tiene registros asociados.",
      };
    }
    return { error: error.message };
  }

  revalidatePath("/platform/campaigns");
  revalidatePath("/platform/maestras/campanas");
  revalidatePath("/platform");
  revalidatePath("/platform/maestras");
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
  campaignId: number,
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
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const idCampana = Number(
    formData.get("id_campana") ?? formData.get("campaign_id") ?? ""
  );
  const correo = String(
    formData.get("usuario") ??
      formData.get("correo") ??
      formData.get("email") ??
      ""
  );
  const contrasena = String(
    formData.get("contrasena_inicial") ?? formData.get("password") ?? ""
  );
  const nombre = String(formData.get("nombre") ?? formData.get("name") ?? "");
  const rol = String(formData.get("rol") ?? formData.get("role") ?? "lector");

  const result = await assignCampaignMemberWithCredentials({
    campaignId: idCampana,
    actorUserId: auth.user!.id,
    usuario: correo,
    contrasena,
    nombre,
    rol,
  });

  if ("error" in result) return { error: result.error };

  revalidatePath(`/platform/campaigns/${idCampana}`);
  revalidatePath(`/campaign/${idCampana}/equipo`);
  return {
    ok: true,
    email: result.usuario,
    nombre: result.nombre,
    tempPassword: result.tempPassword,
  };
}

export async function createClientFormAction(formData: FormData): Promise<void> {
  await createClientAction(formData);
}

export async function updateClientFormAction(formData: FormData): Promise<void> {
  await updateClientAction(formData);
}

export async function createElectoralProcessFormAction(
  formData: FormData
): Promise<void> {
  await createElectoralProcessAction(formData);
}

export async function updateElectoralProcessFormAction(
  formData: FormData
): Promise<void> {
  await updateElectoralProcessAction(formData);
}

export async function updateCampaignFormAction(formData: FormData): Promise<void> {
  await updateCampaignAction(formData);
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
  campaignId: number,
  nuevoEstado: EstadoCampana
): Promise<void> {
  await updateCampaignStatusAction(campaignId, nuevoEstado);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function saveCampaignIntegrationAction(formData: FormData) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const idCampana = Number(formData.get("id_campana") ?? "");
  if (!idCampana) return { error: "Campaña no indicada." };

  const proveedor = String(formData.get("proveedor") ?? "").trim();
  if (!isPlatformApiProveedor(proveedor)) {
    return { error: "Proveedor de API no válido." };
  }

  const activa = formData.get("activa") === "on";

  const { data: campana } = await supabase
    .from("campanas")
    .select("id")
    .eq("id", idCampana)
    .maybeSingle();

  if (!campana) return { error: "Campaña no encontrada." };

  const { data: existing } = await supabase
    .from("integraciones_campana")
    .select("configuracion_cifrada")
    .eq("id_campana", idCampana)
    .eq("proveedor", proveedor)
    .maybeSingle();

  const prevConfig = parseIntegrationConfig(existing?.configuracion_cifrada);
  const configuracion = mergeApiConfig(proveedor, prevConfig, formData);

  const validationError = validateApiConfig(proveedor, configuracion);
  if (validationError) return { error: validationError };

  if (proveedor === "telegram") {
    const botToken = String(configuracion.bot_token ?? "");
    if (isConfiguredSecretPlaceholder(botToken)) {
      return { error: "Pega el token real del bot (no los asteriscos) y guarda." };
    }
    const botInfo = await obtenerUsuarioBotTelegram(botToken);
    if (!botInfo) {
      return {
        error:
          "Token del bot inválido. Copia el token completo desde @BotFather y guarda de nuevo.",
      };
    }
    configuracion.bot_username = botInfo.username;
  }

  const { error } = await supabase.from("integraciones_campana").upsert(
    {
      id_campana: idCampana,
      proveedor,
      configuracion_cifrada: serializeIntegrationConfig(configuracion),
      activa,
    },
    { onConflict: "id_campana,proveedor" }
  );

  if (error) return { error: error.message };

  const featureError = await syncCampaignFeatureFlag(
    supabase,
    idCampana,
    proveedor,
    activa
  );
  if (featureError) {
    return {
      error: `Integración guardada, pero no se pudo sincronizar módulos: ${featureError}`,
    };
  }

  if (proveedor === "telegram") {
    const tgConfig = configuracion as TelegramConfig;
    const shouldRegister =
      activa &&
      formData.get("registrar_webhook") === "on" &&
      tgConfig.bot_token &&
      tgConfig.webhook_secret;

    if (shouldRegister) {
      const appOrigin = await appOriginFromRequest();
      const webhook = telegramWebhookUrl(idCampana, appOrigin);
      if (!isHttpsAppOrigin(appOrigin)) {
        return {
          ok: true,
          warning:
            "Configuración guardada. Abre la app por HTTPS para registrar el webhook.",
        };
      }
      const webhookResult = await registrarWebhookTelegram(
        tgConfig.bot_token!,
        webhook,
        tgConfig.webhook_secret!
      );
      if ("error" in webhookResult) {
        return {
          ok: true,
          warning: `Configuración guardada, pero el webhook falló: ${webhookResult.error}`,
        };
      }

      const updatedConfig = {
        ...tgConfig,
        webhook_registrado_en: new Date().toISOString(),
      };
      await supabase
        .from("integraciones_campana")
        .update({
          configuracion_cifrada: serializeIntegrationConfig(updatedConfig),
        })
        .eq("id_campana", idCampana)
        .eq("proveedor", "telegram");
    }
  }

  revalidatePath(`/platform/campaigns/${idCampana}/integrations`);
  revalidatePath(`/platform/campaigns/${idCampana}`);
  revalidatePath("/platform/maestras/apis");
  revalidatePath("/platform");
  return { ok: true };
}

export async function registerCampaignTelegramWebhookAction(idCampanaRaw: number) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const idCampana = idCampanaRaw;
  if (!idCampana) return { error: "Campaña no indicada." };

  const { data: row } = await supabase
    .from("integraciones_campana")
    .select("configuracion_cifrada, activa")
    .eq("id_campana", idCampana)
    .eq("proveedor", "telegram")
    .maybeSingle();

  if (!row) {
    return { error: "Configura primero el token del bot de Telegram." };
  }

  const configuracion = parseIntegrationConfig(
    row.configuracion_cifrada
  ) as TelegramConfig;

  if (!row.activa) {
    return { error: "La integración de Telegram está inactiva." };
  }
  if (!configuracion.bot_token || !configuracion.webhook_secret) {
    return { error: "Falta el token del bot o el secreto del webhook." };
  }
  if (isConfiguredSecretPlaceholder(configuracion.bot_token)) {
    return {
      error:
        "Pega el token real del bot (reemplaza los asteriscos) y guarda antes de registrar el webhook.",
    };
  }

  const botInfo = await obtenerUsuarioBotTelegram(configuracion.bot_token);
  if (!botInfo) {
    const storedInvalid =
      isConfiguredSecretPlaceholder(configuracion.bot_token) ||
      configuracion.bot_token.length < 30;
    return {
      error: storedInvalid
        ? "El token guardado no es válido. Pégalo en el campo «Pega el token aquí solo para cambiarlo», pulsa Guardar y luego Registrar webhook."
        : "Token del bot inválido. Abre @BotFather → tu bot → API Token, pégalo en el formulario y guarda.",
    };
  }

  const appOrigin = await appOriginFromRequest();
  const webhook = telegramWebhookUrl(idCampana, appOrigin);
  if (!isHttpsAppOrigin(appOrigin)) {
    return {
      error: "La app debe estar accesible por HTTPS para registrar el webhook.",
    };
  }

  const webhookResult = await registrarWebhookTelegram(
    configuracion.bot_token,
    webhook,
    configuracion.webhook_secret
  );

  if ("error" in webhookResult) {
    return { error: webhookResult.error };
  }

  const updatedConfig = {
    ...configuracion,
    webhook_registrado_en: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("integraciones_campana")
    .update({
      configuracion_cifrada: serializeIntegrationConfig(updatedConfig),
    })
    .eq("id_campana", idCampana)
    .eq("proveedor", "telegram");

  if (error) return { error: error.message };

  revalidatePath(`/platform/campaigns/${idCampana}/integrations`);
  revalidatePath(`/platform/campaigns/${idCampana}`);
  revalidatePath("/platform/maestras/apis");
  revalidatePath("/platform");

  return {
    ok: true,
    message: `Webhook registrado: ${webhook}`,
  };
}

export async function deleteCampaignIntegrationAction(
  idCampanaRaw: number,
  proveedorRaw: string
) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const idCampana = idCampanaRaw;
  const proveedor = proveedorRaw.trim();
  if (!idCampana) return { error: "Campaña no indicada." };
  if (!isPlatformApiProveedor(proveedor)) {
    return { error: "Proveedor de API no válido." };
  }

  const { error } = await supabase
    .from("integraciones_campana")
    .delete()
    .eq("id_campana", idCampana)
    .eq("proveedor", proveedor);

  if (error) return { error: error.message };

  const featureError = await syncCampaignFeatureFlag(
    supabase,
    idCampana,
    proveedor,
    false
  );
  if (featureError) {
    return {
      error: `Integración eliminada, pero no se pudo actualizar módulos: ${featureError}`,
    };
  }

  revalidatePath(`/platform/campaigns/${idCampana}/integrations`);
  revalidatePath(`/platform/campaigns/${idCampana}`);
  revalidatePath("/platform/maestras/apis");
  revalidatePath("/platform");
  return { ok: true };
}

export async function updatePlatformBrandAction(formData: FormData) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const input = {
    color_primario: String(formData.get("color_primario") ?? "").trim(),
    color_secundario: String(formData.get("color_secundario") ?? "").trim(),
    color_acento: String(formData.get("color_acento") ?? "").trim(),
    color_fondo_sidebar: String(formData.get("color_fondo_sidebar") ?? "").trim(),
    color_fondo_pagina: String(formData.get("color_fondo_pagina") ?? "").trim(),
    url_logo: String(formData.get("url_logo") ?? "").trim(),
    url_favicon: String(formData.get("url_favicon") ?? "").trim(),
    familia_fuente: String(formData.get("familia_fuente") ?? "").trim(),
    nombre_plataforma: String(formData.get("nombre_plataforma") ?? "").trim(),
    etiqueta_panel: String(formData.get("etiqueta_panel") ?? "").trim(),
    texto_alt_logo: String(formData.get("texto_alt_logo") ?? "").trim(),
    subtitulo_login: String(formData.get("subtitulo_login") ?? "").trim(),
    texto_boton_login: String(formData.get("texto_boton_login") ?? "").trim(),
    login_fondo_exterior: String(formData.get("login_fondo_exterior") ?? "").trim(),
    login_fondo_centro: String(formData.get("login_fondo_centro") ?? "").trim(),
    login_panel_fondo: String(formData.get("login_panel_fondo") ?? "").trim(),
    login_boton_fondo: String(formData.get("login_boton_fondo") ?? "").trim(),
    fuente_titulos: String(formData.get("fuente_titulos") ?? "").trim(),
    fuente_subtitulos: String(formData.get("fuente_subtitulos") ?? "").trim(),
    fuente_cuerpo: String(formData.get("fuente_cuerpo") ?? "").trim(),
    color_titulo: String(formData.get("color_titulo") ?? "").trim(),
    color_subtitulo: String(formData.get("color_subtitulo") ?? "").trim(),
    color_texto: String(formData.get("color_texto") ?? "").trim(),
    color_etiqueta: String(formData.get("color_etiqueta") ?? "").trim(),
    peso_titulo: String(formData.get("peso_titulo") ?? "").trim(),
    peso_subtitulo: String(formData.get("peso_subtitulo") ?? "").trim(),
    peso_texto: String(formData.get("peso_texto") ?? "").trim(),
    peso_etiqueta: String(formData.get("peso_etiqueta") ?? "").trim(),
  };

  const validationError = validateBrandFormInput(input);
  if (validationError) return { error: validationError };

  const config = configFromBrandFormInput(input);

  const { error } = await supabase
    .from("configuracion_marca_plataforma")
    .update({
      color_primario: config.colorPrimario,
      color_secundario: config.colorSecundario,
      color_acento: config.colorAcento,
      color_fondo_sidebar: config.colorFondoSidebar,
      color_fondo_pagina: config.colorFondoPagina,
      url_logo: config.logoUrl,
      url_favicon: config.faviconUrl,
      familia_fuente: config.fuenteCuerpo,
      fuente_titulos: config.fuenteTitulos,
      fuente_subtitulos: config.fuenteSubtitulos,
      fuente_cuerpo: config.fuenteCuerpo,
      color_titulo: config.colorTitulo,
      color_subtitulo: config.colorSubtitulo,
      color_texto: config.colorTexto,
      color_etiqueta: config.colorEtiqueta,
      peso_titulo: config.pesoTitulo,
      peso_subtitulo: config.pesoSubtitulo,
      peso_texto: config.pesoTexto,
      peso_etiqueta: config.pesoEtiqueta,
      nombre_plataforma: config.nombrePlataforma,
      etiqueta_panel: config.etiquetaPanel,
      texto_alt_logo: config.textoAltLogo,
      subtitulo_login: config.subtituloLogin,
      texto_boton_login: config.textoBotonLogin,
      login_fondo_exterior: config.loginFondoExterior,
      login_fondo_centro: config.loginFondoCentro,
      login_panel_fondo: config.loginPanelFondo,
      login_boton_fondo: config.loginBotonFondo,
    })
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidateBrandPaths();
  return { ok: true };
}

function revalidateBrandPaths() {
  revalidatePath("/", "layout");
  revalidatePath("/brand-icon");
  revalidatePath("/platform", "layout");
  revalidatePath("/platform/settings/brand");
  revalidatePath("/login", "layout");
  revalidatePath("/cambiar-contrasena");
  revalidatePath("/campaign", "layout");
}

async function storageClientForBrand() {
  const admin = createAdminClient();
  if (admin) return admin;
  return createClient();
}

export async function uploadBrandAssetAction(formData: FormData) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const kindRaw = String(formData.get("asset_type") ?? "").trim();
  if (kindRaw !== "logo" && kindRaw !== "favicon") {
    return { error: "Tipo de imagen no válido." };
  }
  const kind = kindRaw as BrandAssetKind;

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona una imagen para subir." };
  }

  const fileError = validateBrandAssetFile(file, kind);
  if (fileError) return { error: fileError };

  const storagePath = brandAssetStoragePath(kind, file.type);
  const storage = await storageClientForBrand();

  const { error: uploadError } = await storage.storage
    .from(PLATFORM_ASSETS_BUCKET)
    .upload(storagePath, file, {
      upsert: true,
      contentType: file.type,
      cacheControl: kind === "favicon" ? "60" : "3600",
    });

  if (uploadError) {
    return {
      error:
        uploadError.message.includes("Bucket not found")
          ? "Bucket platform-assets no encontrado. Aplica la migración 008 en Supabase."
          : uploadError.message,
    };
  }

  const { data: publicData } = storage.storage
    .from(PLATFORM_ASSETS_BUCKET)
    .getPublicUrl(storagePath);

  const publicUrl = `${publicData.publicUrl}?v=${Date.now()}`;
  const column = kind === "logo" ? "url_logo" : "url_favicon";

  const { error: dbError } = await supabase
    .from("configuracion_marca_plataforma")
    .update({ [column]: publicUrl })
    .eq("id", 1);

  if (dbError) return { error: dbError.message };

  revalidateBrandPaths();
  return { ok: true, url: publicUrl, kind };
}

export async function removeBrandAssetAction(kindRaw: string) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const kind: BrandAssetKind = kindRaw === "favicon" ? "favicon" : "logo";
  const column = kind === "logo" ? "url_logo" : "url_favicon";

  const { error } = await supabase
    .from("configuracion_marca_plataforma")
    .update({ [column]: null })
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidateBrandPaths();
  return { ok: true, kind };
}

export async function updatePlatformBrandFormAction(
  formData: FormData
): Promise<void> {
  await updatePlatformBrandAction(formData);
}

// Alias para compatibilidad en páginas
export type CampaignStatus = EstadoCampana;

// ── Bulk Upload Maestras ──

import * as XLSX from "xlsx";
import { MAESTRAS_BULK_DEFS } from "@/lib/platform/maestras-bulk-config";
import {
  normalizeBulkHeader,
  validateNoUnknownHeaders,
  buildHeaderIndexMap,
} from "@/lib/campaign/catalog-bulk-config";

async function parseMaestrasWorkbook(
  buffer: ArrayBuffer,
  tipo: "departamentos" | "municipios"
): Promise<{ rows: { rowNumber: number; values: Record<string, string> }[] } | { error: string }> {
  const def = MAESTRAS_BULK_DEFS[tipo];
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "array" });
  } catch {
    return { error: "No se pudo leer el archivo. Usa un Excel .xlsx válido." };
  }

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { error: "El archivo no tiene hojas de cálculo." };

  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1, defval: "", raw: false,
  });

  if (matrix.length < 2) {
    return { error: "El archivo debe tener encabezados y al menos una fila de datos." };
  }

  const headerRow = matrix[0].map((cell) => String(cell ?? ""));
  const headerMap = buildHeaderIndexMap(headerRow, def as any);
  if ("error" in headerMap) return { error: headerMap.error };

  const unknownError = validateNoUnknownHeaders(headerRow, def as any);
  if (unknownError) return { error: unknownError };

  const rows: { rowNumber: number; values: Record<string, string>; raw: string[] }[] = [];

  for (let i = 1; i < matrix.length; i++) {
    const rawRow = matrix[i];
    const raw = rawRow
      ? Array.from({ length: headerRow.length }, (_, ci) => String(rawRow[ci] ?? "").trim())
      : [];
    if (raw.every((cell) => cell === "")) continue;

    const values: Record<string, string> = {};
    for (const column of def.columns) {
      const index = headerMap.get(column.key);
      if (index == null) continue;
      values[column.key] = raw[index] ?? "";
    }

    rows.push({ rowNumber: i + 1, values, raw });
  }

  if (rows.length === 0) return { error: "No hay filas con datos para importar." };
  return { rows };
}

function parseCoordenada(value: FormDataEntryValue | null): number | null {
  if (value == null) return null;
  const s = String(value).trim().replace(",", ".").replace(/\s+/g, "");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function bulkUploadDepartamentosAction(formData: FormData) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { error: "Selecciona un archivo Excel (.xlsx)." };
  }
  if (archivo.size > 5 * 1024 * 1024) {
    return { error: "El archivo no puede superar 5 MB." };
  }

  const parsed = await parseMaestrasWorkbook(await archivo.arrayBuffer(), "departamentos");
  if ("error" in parsed) return { error: parsed.error };

  let created = 0;
  let skipped = 0;
  const errors: { row: number; message: string }[] = [];

  for (const row of parsed.rows) {
    const id = row.values.id ?? "";
    if (!id) {
      errors.push({ row: row.rowNumber, message: "El ID es obligatorio." });
      continue;
    }
    const nombre = textoTitulo(row.values.nombre ?? "");
    if (!nombre) {
      errors.push({ row: row.rowNumber, message: "El nombre es obligatorio." });
      continue;
    }

    const latitud = parseCoordenada(row.values.latitud ?? "");
    const longitud = parseCoordenada(row.values.longitud ?? "");

    const { error } = await supabase.from("departamentos").insert({ id, nombre, latitud, longitud });
    if (error) {
      if (error.code === "23505") {
        errors.push({ row: row.rowNumber, message: `"${nombre}" ya existe.` });
        continue;
      }
      errors.push({ row: row.rowNumber, message: error.message });
      continue;
    }
    created++;
  }

  const message = `Se importaron ${created} departamento(s)${errors.length > 0 ? `, ${errors.length} con errores.` : "."}`;
  return { ok: errors.length === 0, message, created, skipped, errors };
}

export async function bulkUploadMunicipiosAction(formData: FormData) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const archivo = formData.get("archivo");
  if (!(archivo instanceof File) || archivo.size === 0) {
    return { error: "Selecciona un archivo Excel (.xlsx)." };
  }
  if (archivo.size > 5 * 1024 * 1024) {
    return { error: "El archivo no puede superar 5 MB." };
  }

  const parsed = await parseMaestrasWorkbook(await archivo.arrayBuffer(), "municipios");
  if ("error" in parsed) return { error: parsed.error };

  const { data: deptos } = await supabase.from("departamentos").select("id, nombre");
  const deptoMap = new Map((deptos ?? []).map((d) => [d.nombre.toLocaleLowerCase("es-CO"), d.id]));

  let created = 0;
  let skipped = 0;
  const errors: { row: number; message: string }[] = [];

  for (const row of parsed.rows) {
    const id = row.values.id ?? "";
    if (!id) {
      errors.push({ row: row.rowNumber, message: "El ID es obligatorio." });
      continue;
    }
    const nombre = textoTitulo(row.values.nombre ?? "");
    const deptoRaw = row.values.departamento ?? "";

    if (!nombre) {
      errors.push({ row: row.rowNumber, message: "El nombre es obligatorio." });
      continue;
    }
    if (!deptoRaw) {
      errors.push({ row: row.rowNumber, message: "El departamento es obligatorio." });
      continue;
    }

    const idDepartamento = deptoMap.get(deptoRaw.trim().toLocaleLowerCase("es-CO"));
    if (!idDepartamento) {
      errors.push({ row: row.rowNumber, message: `Departamento "${deptoRaw}" no encontrado.` });
      continue;
    }

    const latitud = parseCoordenada(row.values.latitud ?? "");
    const longitud = parseCoordenada(row.values.longitud ?? "");

    const { error } = await supabase.from("municipios").insert({
      id, nombre, id_departamento: idDepartamento, latitud, longitud,
    });
    if (error) {
      if (error.code === "23505") {
        errors.push({ row: row.rowNumber, message: `"${nombre}" ya existe en este departamento.` });
        continue;
      }
      errors.push({ row: row.rowNumber, message: error.message });
      continue;
    }
    created++;
  }

  const message = `Se importaron ${created} municipio(s)${errors.length > 0 ? `, ${errors.length} con errores.` : "."}`;
  return { ok: errors.length === 0, message, created, skipped, errors };
}
