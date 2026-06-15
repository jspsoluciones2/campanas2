"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  correoNormalizado,
  textoTitulo,
  textoTituloOpcional,
} from "@/lib/normalize-text";
import { isValidHexColor } from "@/lib/platform/brand";
import {
  isPlatformApiProveedor,
  type PlatformApiProveedor,
} from "@/lib/platform/api-integrations";
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

  const id = String(formData.get("id") ?? "").trim();
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

export async function deleteClientAction(clientId: string) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const id = clientId.trim();

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

export async function resetClientPasswordAction(clientId: string) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const id = clientId.trim();
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

  const id = String(formData.get("id") ?? "").trim();
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

export async function deleteElectoralProcessAction(processId: string) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const id = processId.trim();
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

export async function createCampaignAction(formData: FormData) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const nombre = textoTitulo(
    String(formData.get("nombre") ?? formData.get("name") ?? "")
  );
  const idCliente = String(formData.get("id_cliente") ?? formData.get("client_id") ?? "");
  const idProceso = String(formData.get("id_proceso_electoral") ?? formData.get("electoral_process_id") ?? "");

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
  revalidatePath("/platform/maestras");
  return { ok: true };
}

export async function updateCampaignAction(formData: FormData) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const id = String(formData.get("id") ?? "").trim();
  const nombre = textoTitulo(String(formData.get("nombre") ?? ""));

  if (!id) return { error: "Campaña no identificada." };
  if (!nombre) return { error: "El nombre de la campaña es obligatorio." };

  const { error } = await supabase
    .from("campanas")
    .update({ nombre })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/platform/campaigns");
  revalidatePath("/platform");
  revalidatePath(`/platform/campaigns/${id}`);
  return { ok: true };
}

export async function deleteCampaignAction(campaignId: string) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const id = campaignId.trim();
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

function mergeApiConfig(
  proveedor: PlatformApiProveedor,
  existing: Record<string, unknown>,
  formData: FormData
): Record<string, unknown> {
  const next = { ...existing };
  const str = (key: string) => String(formData.get(key) ?? "").trim();

  if (proveedor === "twilio") {
    const accountSid = str("account_sid");
    const authToken = str("auth_token");
    const messagingSid = str("messaging_service_sid");
    const whatsappFrom = str("whatsapp_from");
    if (accountSid) next.account_sid = accountSid;
    if (authToken) next.auth_token = authToken;
    next.messaging_service_sid = messagingSid || undefined;
    next.whatsapp_from = whatsappFrom || undefined;
  }

  if (proveedor === "resolutor_captcha") {
    const apiKey = str("api_key");
    const baseUrl = str("base_url");
    if (apiKey) next.api_key = apiKey;
    next.base_url = baseUrl || undefined;
  }

  if (proveedor === "ia_e14") {
    const apiKey = str("api_key");
    const modelo = str("modelo");
    const baseUrl = str("base_url");
    if (apiKey) next.api_key = apiKey;
    next.modelo = modelo || undefined;
    next.base_url = baseUrl || undefined;
  }

  for (const key of Object.keys(next)) {
    if (next[key] === undefined) delete next[key];
  }

  return next;
}

function validateApiConfig(
  proveedor: PlatformApiProveedor,
  config: Record<string, unknown>
): string | null {
  if (proveedor === "twilio") {
    if (!config.account_sid) return "El Account SID es obligatorio.";
    if (!config.auth_token) return "El Auth Token es obligatorio.";
  }
  if (
    (proveedor === "resolutor_captcha" || proveedor === "ia_e14") &&
    !config.api_key
  ) {
    return "La API key es obligatoria.";
  }
  return null;
}

export async function savePlatformApiIntegrationAction(formData: FormData) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const proveedor = String(formData.get("proveedor") ?? "").trim();
  if (!isPlatformApiProveedor(proveedor)) {
    return { error: "Proveedor de API no válido." };
  }

  const activa = formData.get("activa") === "on";

  const { data: existing } = await supabase
    .from("configuracion_integracion_plataforma")
    .select("configuracion")
    .eq("proveedor", proveedor)
    .maybeSingle();

  const prevConfig = (existing?.configuracion ?? {}) as Record<string, unknown>;
  const configuracion = mergeApiConfig(proveedor, prevConfig, formData);

  const validationError = validateApiConfig(proveedor, configuracion);
  if (validationError) return { error: validationError };

  const { error } = await supabase
    .from("configuracion_integracion_plataforma")
    .upsert(
      {
        proveedor,
        configuracion,
        activa,
      },
      { onConflict: "proveedor" }
    );

  if (error) return { error: error.message };

  revalidatePath("/platform/maestras/apis");
  return { ok: true };
}

export async function deletePlatformApiIntegrationAction(
  proveedorRaw: string
) {
  const supabase = await createClient();
  const auth = await requirePlatformOwner(supabase);
  if ("error" in auth && auth.error) return { error: auth.error };

  const proveedor = proveedorRaw.trim();
  if (!isPlatformApiProveedor(proveedor)) {
    return { error: "Proveedor de API no válido." };
  }

  const { error } = await supabase
    .from("configuracion_integracion_plataforma")
    .delete()
    .eq("proveedor", proveedor);

  if (error) return { error: error.message };

  revalidatePath("/platform/maestras/apis");
  return { ok: true };
}

export async function updatePlatformBrandAction(formData: FormData) {
  const supabase = await createClient();
  const colorPrimario = String(formData.get("color_primario") ?? "").trim();
  const colorSecundario = String(formData.get("color_secundario") ?? "").trim();
  const urlLogo = String(formData.get("url_logo") ?? "").trim() || null;
  const familiaFuente = String(formData.get("familia_fuente") ?? "").trim() || "Inter";

  if (!isValidHexColor(colorPrimario) || !isValidHexColor(colorSecundario)) {
    return { error: "Los colores deben estar en formato #RRGGBB." };
  }

  const { error } = await supabase
    .from("configuracion_marca_plataforma")
    .update({
      color_primario: colorPrimario,
      color_secundario: colorSecundario,
      url_logo: urlLogo,
      familia_fuente: familiaFuente,
    })
    .eq("id", 1);

  if (error) return { error: error.message };

  revalidatePath("/platform");
  revalidatePath("/platform/settings/brand");
  return { ok: true };
}

export async function updatePlatformBrandFormAction(
  formData: FormData
): Promise<void> {
  await updatePlatformBrandAction(formData);
}

// Alias para compatibilidad en páginas
export type CampaignStatus = EstadoCampana;
