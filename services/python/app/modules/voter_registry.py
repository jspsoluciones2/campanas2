from __future__ import annotations

from typing import Any, Literal, TypedDict

from supabase import Client

from app.modules.voter_normalize import (
    normalizar_documento,
    normalizar_telefono,
    similitud_nombre,
)

ESTADOS_ACTIVOS = ("activo", "pendiente_verificacion")
UMBRAL_SIMILITUD_NOMBRE = 0.85


class RegisterVoterInput(TypedDict, total=False):
    nombres: str
    apellidos: str
    documento: str
    tipo_documento: str
    sexo: str | None
    telefono: str | None
    direccion: str | None
    id_puesto_votacion: str | None
    mesa: str | None
    id_rol: str | None
    id_lider_directo: str | None
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
    user_id: str,
    payload: RegisterVoterInput,
) -> RegisterVoterResult:
    errors = _validar_campos(payload)
    if errors:
        return {"outcome": "validation_error", "errors": errors}

    documento = normalizar_documento(payload["documento"])
    telefono = normalizar_telefono(payload.get("telefono"))
    tipo_documento = payload.get("tipo_documento") or "CC"
    canal = payload.get("canal_origen") or "manual"

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
    return errors


def _buscar_por_documento(
    client: Client, campaign_id: str, documento: str, tipo_documento: str
) -> dict[str, Any] | None:
    result = (
        client.table("votantes")
        .select("id, nombres, apellidos, documento")
        .eq("id_campana", campaign_id)
        .eq("documento", documento)
        .eq("tipo_documento", tipo_documento)
        .in_("estado", list(ESTADOS_ACTIVOS))
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
        .in_("estado", list(ESTADOS_ACTIVOS))
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
    user_id: str,
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
        "telefono": telefono,
        "direccion": payload.get("direccion"),
        "id_puesto_votacion": payload.get("id_puesto_votacion"),
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
    user_id: str,
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
        "telefono": telefono,
        "direccion": payload.get("direccion"),
        "id_puesto_votacion": payload.get("id_puesto_votacion"),
        "mesa": payload.get("mesa"),
        "id_rol": payload.get("id_rol"),
        "id_lider_directo": payload.get("id_lider_directo"),
        "canal_origen": canal,
        "creado_por": user_id,
        "estado": "pendiente_verificacion",
    }
    result = client.table("votantes").insert(row).execute()
    if not result.data:
        raise RuntimeError("No se pudo registrar el votante.")
    return result.data[0]["id"]
