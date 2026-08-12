import type { SupabaseClient } from "@supabase/supabase-js";
import {
  errorCcMenorEdad,
  errorTelefonoInvalido,
  normalizarDocumento,
  normalizarTelefono,
  similitudNombre,
} from "@/lib/campaign/voter-normalize";
import { JERARQUIA_MIN, liderJerarquiaValida } from "@/lib/campaign/roles";

const ESTADOS_ACTIVOS = ["activo", "pendiente_verificacion"] as const;
const UMBRAL_SIMILITUD_NOMBRE = 0.85;

export type RegisterVoterInput = {
  nombres: string;
  apellidos: string;
  documento: string;
  tipo_documento?: string;
  sexo?: string | null;
  telefono?: string | null;
  fecha_nacimiento?: string | null;
  direccion?: string | null;
  id_puesto_votacion?: number | null;
  id_lugar_trabajo?: number | null;
  id_departamento?: string | null;
  id_municipio?: string | null;
  id_barrio_votante?: number | null;
  mesa?: string | null;
  id_rol?: number | null;
  id_lider_directo?: number | null;
  canal_origen?: string;
};

export type RegisterVoterResult =
  | { outcome: "created"; voter_id: number }
  | { outcome: "quarantined"; quarantine_id: number; match_type: string }
  | { outcome: "validation_error"; errors: string[] };

export async function registerVoter(
  supabase: SupabaseClient,
  campaignId: number,
  userId: string,
  payload: RegisterVoterInput
): Promise<RegisterVoterResult> {
  const errors = validarCampos(payload);
  if (errors.length > 0) {
    return { outcome: "validation_error", errors };
  }

  const documento = normalizarDocumento(payload.documento);
  const telefono = normalizarTelefono(payload.telefono);
  const tipoDocumento = payload.tipo_documento || "CC";
  const canal = payload.canal_origen || "manual";

  if (documento.length < 5) {
    return {
      outcome: "validation_error",
      errors: ["El documento debe tener al menos 5 dígitos."],
    };
  }

  const idLiderDirecto = await resolverLiderDirecto(
    supabase,
    campaignId,
    payload.id_rol,
    payload.id_lider_directo,
    payload.documento
  );
  if (idLiderDirecto.error) {
    return { outcome: "validation_error", errors: [idLiderDirecto.error] };
  }
  const payloadFinal = { ...payload, id_lider_directo: idLiderDirecto.value };

  const conflictoCedula = await buscarPorDocumento(
    supabase,
    campaignId,
    documento,
    tipoDocumento
  );
  if (conflictoCedula) {
    const quarantineId = await crearCuarentena(supabase, {
      campaignId,
      userId,
      payload: payloadFinal,
      documento,
      telefono,
      tipoDocumento,
      canal,
      tipoCoincidencia: "cedula_exacta",
      idVotanteConflicto: conflictoCedula.id,
      similitud: null,
    });
    if (!quarantineId) {
      return {
        outcome: "validation_error",
        errors: ["No se pudo crear el registro en cuarentena."],
      };
    }
    return {
      outcome: "quarantined",
      quarantine_id: quarantineId,
      match_type: "cedula_exacta",
    };
  }

  if (telefono) {
    const conflictoTelefono = await buscarPorTelefonoYNombre(
      supabase,
      campaignId,
      telefono,
      payload.nombres,
      payload.apellidos
    );
    if (conflictoTelefono) {
      const quarantineId = await crearCuarentena(supabase, {
        campaignId,
        userId,
        payload: payloadFinal,
        documento,
        telefono,
        tipoDocumento,
        canal,
        tipoCoincidencia: "telefono_similitud_nombre",
        idVotanteConflicto: conflictoTelefono.id,
        similitud: conflictoTelefono.similitud,
      });
      if (!quarantineId) {
        return {
          outcome: "validation_error",
          errors: ["No se pudo crear el registro en cuarentena."],
        };
      }
      return {
        outcome: "quarantined",
        quarantine_id: quarantineId,
        match_type: "telefono_similitud_nombre",
      };
    }
  }

  const voterId = await insertarVotante(supabase, {
    campaignId,
    userId,
    payload: payloadFinal,
    documento,
    telefono,
    tipoDocumento,
    canal,
  });

  if (typeof voterId === "object") {
    return {
      outcome: "validation_error",
      errors: [voterId.error],
    };
  }

  return { outcome: "created", voter_id: voterId };
}

async function resolverLiderDirecto(
  supabase: SupabaseClient,
  campaignId: number,
  idRol: number | null | undefined,
  idLider: number | null | undefined,
  documentoVotante?: string | null
): Promise<{ value: number | null; error?: string }> {
  if (!idRol) {
    return { value: idLider || null };
  }

  const { data: rol } = await supabase
    .from("roles")
    .select("nivel_jerarquia")
    .eq("id", idRol)
    .eq("id_campana", campaignId)
    .maybeSingle();

  if (rol?.nivel_jerarquia === JERARQUIA_MIN) {
    if (idLider) {
      return {
        value: null,
        error: "Los votantes de jerarquía 1 no tienen líder directo.",
      };
    }
    return { value: null };
  }

  if (!idLider) {
    return { value: null };
  }

  const { data: lider } = await supabase
    .from("votantes")
    .select("id, documento, id_rol, roles(nivel_jerarquia)")
    .eq("id", idLider)
    .eq("id_campana", campaignId)
    .in("estado", [...ESTADOS_ACTIVOS])
    .maybeSingle();

  if (!lider) {
    return {
      value: null,
      error: "El líder directo debe estar registrado en la campaña.",
    };
  }

  if (
    documentoVotante &&
    normalizarDocumento(lider.documento) === normalizarDocumento(documentoVotante)
  ) {
    return { value: null, error: "El líder directo no puede ser la misma persona." };
  }

  const nivelVotante = rol?.nivel_jerarquia;
  if (nivelVotante != null) {
    const rel = lider.roles;
    const rolLider = Array.isArray(rel) ? rel[0] : rel;
    let nivelLider = rolLider?.nivel_jerarquia ?? null;
    if (nivelLider == null && lider.id_rol) {
      const { data: rolLiderRow } = await supabase
        .from("roles")
        .select("nivel_jerarquia")
        .eq("id", lider.id_rol)
        .eq("id_campana", campaignId)
        .maybeSingle();
      nivelLider = rolLiderRow?.nivel_jerarquia ?? null;
    }
    if (
      nivelLider == null ||
      !liderJerarquiaValida(nivelLider, nivelVotante)
    ) {
      return {
        value: null,
        error:
          "Verifica el líder directo o el cargo del votante: el líder debe tener un cargo superior.",
      };
    }
  }

  return { value: idLider };
}

function validarCampos(payload: RegisterVoterInput) {
  const errors: string[] = [];
  if (!payload.nombres?.trim()) errors.push("Nombres es obligatorio.");
  if (!payload.apellidos?.trim()) errors.push("Apellidos es obligatorio.");
  if (!payload.documento?.trim()) errors.push("Documento es obligatorio.");
  if (payload.sexo && !["Masculino", "Femenino"].includes(payload.sexo)) {
    errors.push("Sexo inválido.");
  }
  const errorTel = errorTelefonoInvalido(payload.telefono);
  if (errorTel) errors.push(errorTel);
  const errorCc = errorCcMenorEdad(
    payload.tipo_documento,
    payload.fecha_nacimiento
  );
  if (errorCc) errors.push(errorCc);
  return errors;
}

async function buscarPorDocumento(
  supabase: SupabaseClient,
  campaignId: number,
  documento: string,
  tipoDocumento: string
) {
  const { data } = await supabase
    .from("votantes")
    .select("id, nombres, apellidos, documento")
    .eq("id_campana", campaignId)
    .eq("documento", documento)
    .eq("tipo_documento", tipoDocumento)
    .in("estado", [...ESTADOS_ACTIVOS])
    .limit(1)
    .maybeSingle();

  return data;
}

async function buscarPorTelefonoYNombre(
  supabase: SupabaseClient,
  campaignId: number,
  telefono: string,
  nombres: string,
  apellidos: string
) {
  const { data } = await supabase
    .from("votantes")
    .select("id, nombres, apellidos, telefono")
    .eq("id_campana", campaignId)
    .eq("telefono", telefono)
    .in("estado", [...ESTADOS_ACTIVOS]);

  for (const row of data ?? []) {
    const ratio = similitudNombre(
      nombres,
      apellidos,
      row.nombres,
      row.apellidos
    );
    if (ratio >= UMBRAL_SIMILITUD_NOMBRE) {
      return { id: row.id, similitud: ratio };
    }
  }

  return null;
}

async function crearCuarentena(
  supabase: SupabaseClient,
  options: {
    campaignId: number;
    userId: string;
    payload: RegisterVoterInput;
    documento: string;
    telefono: string | null;
    tipoDocumento: string;
    canal: string;
    tipoCoincidencia: string;
    idVotanteConflicto: number;
    similitud: number | null;
  }
) {
  const { error, data } = await supabase
    .from("cuarentena_votantes")
    .insert({
      id_campana: options.campaignId,
      nombres: options.payload.nombres.trim(),
      apellidos: options.payload.apellidos.trim(),
      documento: options.documento,
      tipo_documento: options.tipoDocumento,
      sexo: options.payload.sexo || null,
      telefono: options.telefono,
      fecha_nacimiento: options.payload.fecha_nacimiento || null,
      direccion: options.payload.direccion || null,
      id_puesto_votacion: options.payload.id_puesto_votacion || null,
      id_lugar_trabajo: options.payload.id_lugar_trabajo || null,
      id_departamento: options.payload.id_departamento || null,
      id_municipio: options.payload.id_municipio || null,
      id_barrio_votante: options.payload.id_barrio_votante || null,
      mesa: options.payload.mesa || null,
      id_rol: options.payload.id_rol || null,
      id_lider_directo: options.payload.id_lider_directo || null,
      id_votante_conflicto: options.idVotanteConflicto,
      tipo_coincidencia: options.tipoCoincidencia,
      similitud_nombre: options.similitud,
      canal_origen: options.canal,
      creado_por: options.userId,
      estado: "pendiente",
    })
    .select("id")
    .single();

  if (error) return null;
  return data.id as number;
}

async function insertarVotante(
  supabase: SupabaseClient,
  options: {
    campaignId: number;
    userId: string;
    payload: RegisterVoterInput;
    documento: string;
    telefono: string | null;
    tipoDocumento: string;
    canal: string;
  }
): Promise<number | { error: string }> {
  const { error, data } = await supabase
    .from("votantes")
    .insert({
      id_campana: options.campaignId,
      nombres: options.payload.nombres.trim(),
      apellidos: options.payload.apellidos.trim(),
      documento: options.documento,
      tipo_documento: options.tipoDocumento,
      sexo: options.payload.sexo || null,
      telefono: options.telefono,
      fecha_nacimiento: options.payload.fecha_nacimiento || null,
      direccion: options.payload.direccion || null,
      id_puesto_votacion: options.payload.id_puesto_votacion || null,
      id_lugar_trabajo: options.payload.id_lugar_trabajo || null,
      id_departamento: options.payload.id_departamento || null,
      id_municipio: options.payload.id_municipio || null,
      id_barrio_votante: options.payload.id_barrio_votante || null,
      mesa: options.payload.mesa || null,
      id_rol: options.payload.id_rol || null,
      id_lider_directo: options.payload.id_lider_directo || null,
      canal_origen: options.canal,
      creado_por: options.userId,
      estado: "pendiente_verificacion",
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "42501") {
      return {
        error:
          "No tienes permiso para registrar votantes en esta campaña.",
      };
    }
    if (error.message.includes("votantes_documento_activo_unico")) {
      return {
        error: "Ya existe un votante activo con ese documento en la campaña.",
      };
    }
    return { error: error.message };
  }

  return data.id as number;
}
