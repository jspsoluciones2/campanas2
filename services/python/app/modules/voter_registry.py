from __future__ import annotations

from typing import Any, Literal, TypedDict

from supabase import Client

from app.modules.voter_normalize import (
    error_cc_menor_edad,
    error_telefono_invalido,
    normalizar_documento,
    normalizar_telefono,
    similitud_nombre,
)

ESTADOS_ACTIVOS = ("activo", "registrado", "pendiente_verificacion")
UMBRAL_SIMILITUD_NOMBRE = 0.85

_estados_consulta_cache: list[str] | None = None
_estado_insert_cache: str | None = None


def estados_votante_para_consulta(client: Client) -> list[str]:
    """Lista de estados válidos en la BD (sin 'registrado' si falta migración 017)."""
    global _estados_consulta_cache
    if _estados_consulta_cache is not None:
        return _estados_consulta_cache
    candidatos = list(ESTADOS_ACTIVOS)
    try:
        client.table("votantes").select("id").in_("estado", candidatos).limit(1).execute()
        _estados_consulta_cache = candidatos
    except Exception:
        _estados_consulta_cache = ["activo", "pendiente_verificacion"]
    return _estados_consulta_cache


def estado_inicial_votante(client: Client) -> str:
    global _estado_insert_cache
    if _estado_insert_cache is not None:
        return _estado_insert_cache
    try:
        client.table("votantes").select("id").eq("estado", "registrado").limit(1).execute()
        _estado_insert_cache = "registrado"
    except Exception:
        _estado_insert_cache = "pendiente_verificacion"
    return _estado_insert_cache


class RegisterVoterInput(TypedDict, total=False):
    nombres: str
    apellidos: str
    documento: str
    tipo_documento: str
    sexo: str | None
    fecha_nacimiento: str | None
    telefono: str | None
    direccion: str | None
    id_lugar_trabajo: str | None
    id_puesto_votacion: str | None
    id_departamento: str | None
    id_municipio: str | None
    id_barrio_votante: str | None
    mesa: str | None
    id_rol: str | None
    id_lider_directo: str | None
    id_tipo_novedad: str | None
    detalle_novedad: str | None
    canal_origen: str


class RegisterVoterResult(TypedDict, total=False):
    outcome: Literal["created", "quarantined", "validation_error"]
    voter_id: str
    quarantine_id: str
    match_type: str
    errors: list[str]


def register_voter(
    client: Client,
    campaign_id: str,
    user_id: str | None,
    payload: RegisterVoterInput,
) -> RegisterVoterResult:
    errors = _validar_campos(payload)
    if errors:
        return {"outcome": "validation_error", "errors": errors}

    canal = payload.get("canal_origen") or "manual"
    obligatorio_lider = canal == "telegram" and not _rol_sin_lider_directo(
        client, campaign_id, payload.get("id_rol")
    )
    error_lider = _validar_lider_directo(
        client,
        campaign_id,
        payload.get("id_lider_directo"),
        id_rol=payload.get("id_rol"),
        documento_votante=payload.get("documento"),
        obligatorio=obligatorio_lider,
    )
    if error_lider:
        return {"outcome": "validation_error", "errors": [error_lider]}

    documento = normalizar_documento(payload["documento"])
    telefono = normalizar_telefono(payload.get("telefono"))
    tipo_documento = payload.get("tipo_documento") or "CC"

    if len(documento) < 5:
        return {
            "outcome": "validation_error",
            "errors": ["El documento debe tener al menos 5 dígitos."],
        }

    conflicto_cedula = _buscar_por_documento(
        client, campaign_id, documento, tipo_documento
    )
    if conflicto_cedula:
        quarantine_id = _crear_cuarentena(
            client,
            campaign_id=campaign_id,
            user_id=user_id,
            payload=payload,
            documento=documento,
            telefono=telefono,
            tipo_documento=tipo_documento,
            canal=canal,
            tipo_coincidencia="cedula_exacta",
            id_votante_conflicto=conflicto_cedula["id"],
            similitud=None,
        )
        return {
            "outcome": "quarantined",
            "quarantine_id": quarantine_id,
            "match_type": "cedula_exacta",
        }

    if telefono:
        conflicto_telefono = _buscar_por_telefono_y_nombre(
            client,
            campaign_id,
            telefono,
            payload["nombres"],
            payload["apellidos"],
        )
        if conflicto_telefono:
            quarantine_id = _crear_cuarentena(
                client,
                campaign_id=campaign_id,
                user_id=user_id,
                payload=payload,
                documento=documento,
                telefono=telefono,
                tipo_documento=tipo_documento,
                canal=canal,
                tipo_coincidencia="telefono_similitud_nombre",
                id_votante_conflicto=conflicto_telefono["id"],
                similitud=conflicto_telefono["similitud"],
            )
            return {
                "outcome": "quarantined",
                "quarantine_id": quarantine_id,
                "match_type": "telefono_similitud_nombre",
            }

    voter_id = _insertar_votante(
        client,
        campaign_id=campaign_id,
        user_id=user_id,
        payload=payload,
        documento=documento,
        telefono=telefono,
        tipo_documento=tipo_documento,
        canal=canal,
    )
    return {"outcome": "created", "voter_id": voter_id}


def _validar_campos(payload: RegisterVoterInput) -> list[str]:
    errors: list[str] = []
    if not (payload.get("nombres") or "").strip():
        errors.append("Nombres es obligatorio.")
    if not (payload.get("apellidos") or "").strip():
        errors.append("Apellidos es obligatorio.")
    if not (payload.get("documento") or "").strip():
        errors.append("Documento es obligatorio.")
    sexo = payload.get("sexo")
    if sexo and sexo not in ("Masculino", "Femenino"):
        errors.append("Sexo inválido.")
    error_tel = error_telefono_invalido(payload.get("telefono"))
    if error_tel:
        errors.append(error_tel)
    error_cc = error_cc_menor_edad(
        payload.get("tipo_documento") or "CC",
        payload.get("fecha_nacimiento"),
    )
    if error_cc:
        errors.append(error_cc)
    return errors


def _rol_sin_lider_directo(
    client: Client, campaign_id: str, id_rol: str | None
) -> bool:
    nivel = _nivel_jerarquia_rol(client, campaign_id, id_rol)
    return nivel == 1


def _nivel_jerarquia_rol(
    client: Client, campaign_id: str, id_rol: str | None
) -> int | None:
    if not id_rol:
        return None
    result = (
        client.table("roles")
        .select("nivel_jerarquia")
        .eq("id", id_rol)
        .eq("id_campana", campaign_id)
        .limit(1)
        .execute()
    )
    row = (result.data or [None])[0]
    if not row or row.get("nivel_jerarquia") is None:
        return None
    return int(row["nivel_jerarquia"])


def _nivel_jerarquia_votante(
    client: Client, campaign_id: str, voter_id: str
) -> int | None:
    result = (
        client.table("votantes")
        .select("id_rol, roles(nivel_jerarquia)")
        .eq("id", voter_id)
        .eq("id_campana", campaign_id)
        .limit(1)
        .execute()
    )
    row = (result.data or [None])[0]
    if not row:
        return None
    rel = row.get("roles")
    if isinstance(rel, list):
        rel = rel[0] if rel else None
    if rel and rel.get("nivel_jerarquia") is not None:
        return int(rel["nivel_jerarquia"])
    return _nivel_jerarquia_rol(client, campaign_id, row.get("id_rol"))


def _jerarquia_lider_valida(nivel_lider: int, nivel_votante: int) -> bool:
    """Jerarquía 1 = más alto. El líder debe estar por encima del votante."""
    return nivel_lider < nivel_votante


def _validar_lider_directo(
    client: Client,
    campaign_id: str,
    id_lider: str | None,
    *,
    id_rol: str | None = None,
    documento_votante: str | None = None,
    obligatorio: bool = False,
) -> str | None:
    if id_rol and _rol_sin_lider_directo(client, campaign_id, id_rol):
        if id_lider:
            return "Los votantes de jerarquía 1 no tienen líder directo."
        return None

    if not id_lider:
        if obligatorio:
            return "Líder directo es obligatorio."
        return None

    result = (
        client.table("votantes")
        .select("id, documento, id_rol, roles(nivel_jerarquia)")
        .eq("id", id_lider)
        .eq("id_campana", campaign_id)
        .in_("estado", estados_votante_para_consulta(client))
        .limit(1)
        .execute()
    )
    lider = (result.data or [None])[0]
    if not lider:
        return "El líder directo debe estar registrado en la campaña."

    if documento_votante and normalizar_documento(lider["documento"]) == normalizar_documento(
        documento_votante
    ):
        return "El líder directo no puede ser la misma persona."

    if id_rol:
        nivel_votante = _nivel_jerarquia_rol(client, campaign_id, id_rol)
        if nivel_votante is not None:
            rel = lider.get("roles")
            if isinstance(rel, list):
                rel = rel[0] if rel else None
            nivel_lider = (
                int(rel["nivel_jerarquia"])
                if rel and rel.get("nivel_jerarquia") is not None
                else _nivel_jerarquia_rol(client, campaign_id, lider.get("id_rol"))
            )
            if nivel_lider is None or not _jerarquia_lider_valida(nivel_lider, nivel_votante):
                return (
                    "Verifica el líder directo o el cargo del votante: "
                    "el líder debe tener un cargo superior."
                )

    return None


def _buscar_por_documento(
    client: Client, campaign_id: str, documento: str, tipo_documento: str
) -> dict[str, Any] | None:
    result = (
        client.table("votantes")
        .select("id, nombres, apellidos, documento")
        .eq("id_campana", campaign_id)
        .eq("documento", documento)
        .eq("tipo_documento", tipo_documento)
        .in_("estado", estados_votante_para_consulta(client))
        .limit(1)
        .execute()
    )
    rows = result.data or []
    return rows[0] if rows else None


def _buscar_por_telefono_y_nombre(
    client: Client,
    campaign_id: str,
    telefono: str,
    nombres: str,
    apellidos: str,
) -> dict[str, Any] | None:
    result = (
        client.table("votantes")
        .select("id, nombres, apellidos, telefono")
        .eq("id_campana", campaign_id)
        .eq("telefono", telefono)
        .in_("estado", estados_votante_para_consulta(client))
        .execute()
    )
    for row in result.data or []:
        ratio = similitud_nombre(
            nombres, apellidos, row["nombres"], row["apellidos"]
        )
        if ratio >= UMBRAL_SIMILITUD_NOMBRE:
            return {**row, "similitud": ratio}
    return None


def _crear_cuarentena(
    client: Client,
    *,
    campaign_id: str,
    user_id: str | None,
    payload: RegisterVoterInput,
    documento: str,
    telefono: str | None,
    tipo_documento: str,
    canal: str,
    tipo_coincidencia: str,
    id_votante_conflicto: str,
    similitud: float | None,
) -> str:
    row = {
        "id_campana": campaign_id,
        "nombres": payload["nombres"].strip(),
        "apellidos": payload["apellidos"].strip(),
        "documento": documento,
        "tipo_documento": tipo_documento,
        "sexo": payload.get("sexo"),
        "fecha_nacimiento": payload.get("fecha_nacimiento"),
        "telefono": telefono,
        "direccion": payload.get("direccion"),
        "id_lugar_trabajo": payload.get("id_lugar_trabajo"),
        "id_puesto_votacion": payload.get("id_puesto_votacion"),
        "id_departamento": payload.get("id_departamento"),
        "id_municipio": payload.get("id_municipio"),
        "id_barrio_votante": payload.get("id_barrio_votante"),
        "mesa": payload.get("mesa"),
        "id_rol": payload.get("id_rol"),
        "id_lider_directo": payload.get("id_lider_directo"),
        "id_votante_conflicto": id_votante_conflicto,
        "tipo_coincidencia": tipo_coincidencia,
        "similitud_nombre": similitud,
        "canal_origen": canal,
        "creado_por": user_id,
        "estado": "pendiente",
    }
    result = client.table("cuarentena_votantes").insert(row).execute()
    if not result.data:
        raise RuntimeError("No se pudo crear el registro en cuarentena.")
    return result.data[0]["id"]


def _insertar_votante(
    client: Client,
    *,
    campaign_id: str,
    user_id: str | None,
    payload: RegisterVoterInput,
    documento: str,
    telefono: str | None,
    tipo_documento: str,
    canal: str,
) -> str:
    row = {
        "id_campana": campaign_id,
        "nombres": payload["nombres"].strip(),
        "apellidos": payload["apellidos"].strip(),
        "documento": documento,
        "tipo_documento": tipo_documento,
        "sexo": payload.get("sexo"),
        "fecha_nacimiento": payload.get("fecha_nacimiento"),
        "telefono": telefono,
        "direccion": payload.get("direccion"),
        "id_lugar_trabajo": payload.get("id_lugar_trabajo"),
        "id_puesto_votacion": payload.get("id_puesto_votacion"),
        "id_departamento": payload.get("id_departamento"),
        "id_municipio": payload.get("id_municipio"),
        "id_barrio_votante": payload.get("id_barrio_votante"),
        "mesa": payload.get("mesa"),
        "id_rol": payload.get("id_rol"),
        "id_lider_directo": payload.get("id_lider_directo"),
        "canal_origen": canal,
        "creado_por": user_id,
        "estado": estado_inicial_votante(client),
    }
    if payload.get("id_tipo_novedad"):
        row["id_tipo_novedad"] = payload["id_tipo_novedad"]
    if payload.get("detalle_novedad"):
        row["detalle_novedad"] = payload["detalle_novedad"]
    result = client.table("votantes").insert(row).execute()
    if not result.data:
        raise RuntimeError("No se pudo registrar el votante.")
    return result.data[0]["id"]
