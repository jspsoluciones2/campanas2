from __future__ import annotations

import json
from typing import Any, Callable

from supabase import Client

from app.adapters.supabase_client import row_or_none
from app.modules.telegram_api import MAIN_MENU_KEYBOARD, send_message
from app.modules.telegram_catalogs import (
    CATALOGO_LISTA_DIRECTA_MAX,
    TIPOS_DOCUMENTO,
    buscar_por_coincidencia,
    buscar_puestos_relevantes,
    es_omitir,
    etiqueta_rol,
    buscar_lider_por_documento,
    fetch_lugares_trabajo,
    fetch_municipios,
    fetch_puestos,
    fetch_roles,
    lista_numerada,
    parse_fecha_nacimiento,
    prompt_tipo_documento,
    resolver_por_numero_o_texto,
    resolver_sexo,
    resolver_tipo_documento,
    roles_bajo_jerarquia,
    rol_por_id,
)
from app.modules.voter_registry import register_voter
from app.modules.voter_normalize import error_cc_menor_edad, error_telefono_invalido, normalizar_telefono

PASO_INICIO = "inicio"
PASO_RECOLECTOR_ROL = "recolector_rol"
PASO_NOMBRES = "nombres"
PASO_APELLIDOS = "apellidos"
PASO_TIPO_DOCUMENTO = "tipo_documento"
PASO_DOCUMENTO = "documento"
PASO_FECHA_NACIMIENTO = "fecha_nacimiento"
PASO_SEXO = "sexo"
PASO_TELEFONO = "telefono"
PASO_DIRECCION = "direccion"
PASO_MUNICIPIO = "municipio"
PASO_PUESTO = "puesto_votacion"
PASO_MESA = "mesa"
PASO_LUGAR_TRABAJO = "lugar_trabajo"
PASO_ROL = "rol"
PASO_LIDER = "lider_directo"
PASO_CONFIRMAR = "confirmar"

ORDEN_PASOS = [
    PASO_NOMBRES,
    PASO_APELLIDOS,
    PASO_TIPO_DOCUMENTO,
    PASO_DOCUMENTO,
    PASO_FECHA_NACIMIENTO,
    PASO_SEXO,
    PASO_TELEFONO,
    PASO_DIRECCION,
    PASO_MUNICIPIO,
    PASO_PUESTO,
    PASO_MESA,
    PASO_LUGAR_TRABAJO,
    PASO_ROL,
    PASO_LIDER,
    PASO_CONFIRMAR,
]

TOTAL_PREGUNTAS = len(ORDEN_PASOS) - 1
NIVEL_JERARQUIA_SIN_LIDER = 1
MODO_PROPIO = "propio"
MODO_OTROS = "otros"

CAMPOS_RECOLECTOR_SESION = frozenset(
    {
        "_nivel_recolector",
        "_recolector_rol_nombre",
        "_recolector_id_rol",
    }
)


def _reply(
    bot_token: str,
    chat_id: int,
    text: str,
    *,
    menu: bool = False,
) -> None:
    send_message(
        bot_token,
        chat_id,
        text,
        parse_mode="Markdown",
        reply_markup=MAIN_MENU_KEYBOARD if menu else None,
    )


def _encabezado(paso: str, titulo: str) -> str:
    if paso == PASO_CONFIRMAR:
        return f"📋 Revisa los datos\n\n{titulo}"
    try:
        n = ORDEN_PASOS.index(paso) + 1
    except ValueError:
        n = 1
    return f"📝 Pregunta {n} de {TOTAL_PREGUNTAS}\n\n{titulo}"


def _siguiente_paso(paso_actual: str) -> str | None:
    try:
        idx = ORDEN_PASOS.index(paso_actual)
    except ValueError:
        return None
    if idx + 1 >= len(ORDEN_PASOS):
        return None
    return ORDEN_PASOS[idx + 1]


def _registro_propio(datos: dict[str, Any]) -> bool:
    return datos.get("_modo_registro") == MODO_PROPIO


def _votante_sin_lider_directo(datos: dict[str, Any]) -> bool:
    nivel = datos.get("_voter_rol_nivel")
    if nivel is None:
        return False
    return int(nivel) == NIVEL_JERARQUIA_SIN_LIDER


def _limpiar_lider_directo(datos: dict[str, Any]) -> None:
    datos.pop("id_lider_directo", None)
    datos.pop("_lider_nombre", None)


def _aplicar_rol_propio(datos: dict[str, Any]) -> None:
    rol_id = datos.get("_recolector_id_rol")
    if not rol_id:
        return
    datos["id_rol"] = rol_id
    datos["_rol_nombre"] = datos.get("_recolector_rol_nombre")
    datos["_voter_rol_nivel"] = datos.get("_nivel_recolector")


def _resolver_paso_destino(paso: str, datos: dict[str, Any]) -> str | None:
    while paso:
        if paso == PASO_ROL and _registro_propio(datos):
            _aplicar_rol_propio(datos)
            paso = _siguiente_paso(PASO_ROL)
            continue
        if paso == PASO_LIDER and _votante_sin_lider_directo(datos):
            _limpiar_lider_directo(datos)
            return PASO_CONFIRMAR
        return paso
    return None


def _siguiente_paso_votante(paso_actual: str, datos: dict[str, Any]) -> str | None:
    siguiente = _siguiente_paso(paso_actual)
    if not siguiente:
        return None
    return _resolver_paso_destino(siguiente, datos)


def _datos_sesion_recolector(datos: dict[str, Any]) -> dict[str, Any]:
    return {k: datos[k] for k in CAMPOS_RECOLECTOR_SESION if k in datos}


def _mensaje_inicio_registro(modo: str) -> str:
    if modo == MODO_PROPIO:
        return (
            "Vamos a registrar *tus* datos en la campaña.\n\n"
            "¿Cuáles son tus *nombres*?\n"
            "(Ejemplo: Juan Carlos)"
        )
    return (
        "Vamos a registrar a *otra persona*.\n\n"
        "¿Cuáles son sus *nombres*?\n"
        "(Ejemplo: Juan Carlos)"
    )


def _normalizar_comando(text: str) -> str:
    limpio = text.strip().lower()
    if limpio.startswith("/"):
        return limpio.split()[0]

    mapa = {
        "hola": "start",
        "buenos dias": "start",
        "buenos días": "start",
        "ayuda": "ayuda",
        "❓ ayuda": "ayuda",
        "cancelar": "cancelar",
        "❌ cancelar": "cancelar",
        "mi propio registro": "propio",
        "📝 mi propio registro": "propio",
        "registrar otra persona": "otros",
        "📝 registrar otra persona": "otros",
        "registrar persona": "otros",
        "📝 registrar persona": "otros",
        "registrar": "otros",
        "otra persona": "otros",
        "nuevo": "otros",
        "si": "si",
        "sí": "si",
        "s": "si",
        "no": "no",
        "n": "no",
    }
    return mapa.get(limpio, limpio)


def _get_session(client: Client, campaign_id: str, chat_id: int) -> dict[str, Any] | None:
    result = (
        client.table("sesiones_captura_telegram")
        .select("*")
        .eq("id_campana", campaign_id)
        .eq("chat_id", chat_id)
        .maybe_single()
        .execute()
    )
    return row_or_none(result)


def _upsert_session(
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    paso: str,
    datos: dict[str, Any],
    id_usuario: str | None,
) -> None:
    client.table("sesiones_captura_telegram").upsert(
        {
            "id_campana": campaign_id,
            "chat_id": chat_id,
            "telegram_user_id": telegram_user_id,
            "paso": paso,
            "datos_parciales": datos,
            "id_usuario": id_usuario,
        },
        on_conflict="id_campana,chat_id",
    ).execute()


def _delete_session(client: Client, campaign_id: str, chat_id: int) -> None:
    client.table("sesiones_captura_telegram").delete().eq(
        "id_campana", campaign_id
    ).eq("chat_id", chat_id).execute()


def _recolector_listo_en_sesion(datos: dict[str, Any] | None) -> bool:
    return bool(datos and datos.get("_nivel_recolector") is not None)


def _mensaje_bienvenida(datos: dict[str, Any] | None) -> str:
    if _recolector_listo_en_sesion(datos):
        cargo = datos.get("_recolector_rol_nombre", "—")
        return (
            "¡Hola! 👋\n\n"
            f"Tu cargo en esta sesión: *{cargo}*\n\n"
            "Elige una opción:\n"
            "• *Mi propio registro* — registrarte con tu cargo\n"
            "• *Registrar otra persona* — solo cargos *por debajo* de tu jerarquía\n\n"
            "• *Ayuda* — instrucciones\n"
            "• *Cancelar* — detener el registro en curso"
        )
    return (
        "¡Hola! 👋\n\n"
        "Bienvenido al bot de registro de la campaña.\n\n"
        "Primero dime *cuál es tu cargo* en la organización. "
        "Te mostraré una lista para que elijas."
    )


def _preguntar_rol_recolector(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    *,
    datos_iniciales: dict[str, Any] | None = None,
) -> None:
    roles = fetch_roles(client, campaign_id)
    if not roles:
        _reply(
            bot_token,
            chat_id,
            "Aún no hay cargos configurados en la campaña.\n"
            "Pide a tu coordinador que cargue los *roles* en la plataforma.",
        )
        return
    _upsert_session(
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        PASO_RECOLECTOR_ROL,
        dict(datos_iniciales or {}),
        None,
    )
    _reply(
        bot_token,
        chat_id,
        "👤 *¿Cuál es tu cargo en la campaña?*\n\n"
        f"{lista_numerada(roles, etiqueta='rol')}\n\n"
        "Responde con el *número* de la lista.\n"
        "Solo podrás registrar personas *por debajo* de tu jerarquía.",
    )


def _campaign_telegram_enabled(client: Client, campaign_id: str) -> bool:
    features = (
        client.table("caracteristicas_campana")
        .select("telegram")
        .eq("id_campana", campaign_id)
        .maybe_single()
        .execute()
    )
    data = row_or_none(features)
    if not data:
        return False
    return bool(data.get("telegram"))


def _integration_config(client: Client, campaign_id: str) -> dict[str, Any] | None:
    result = (
        client.table("integraciones_campana")
        .select("configuracion_cifrada, activa")
        .eq("id_campana", campaign_id)
        .eq("proveedor", "telegram")
        .maybe_single()
        .execute()
    )
    data = row_or_none(result)
    if not data or not data.get("activa"):
        return None
    raw = data.get("configuracion_cifrada") or "{}"
    if isinstance(raw, dict):
        return raw
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {}


def _procesar_seleccion_rol_recolector(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    text: str,
) -> None:
    session = _get_session(client, campaign_id, chat_id)
    datos_previos = dict(session.get("datos_parciales") or {}) if session else {}
    tras_rol = datos_previos.pop("_tras_rol", None)

    roles = fetch_roles(client, campaign_id)
    estado, rol_id, etiqueta = resolver_por_numero_o_texto(
        roles, text, campo_busqueda="nombre"
    )
    if estado == "ambiguo":
        _reply(bot_token, chat_id, "Hay varias opciones parecidas. Responde con el número exacto.")
        return
    if estado != "ok" or not rol_id:
        _reply(
            bot_token,
            chat_id,
            "No entendí tu respuesta. Elige el número de tu cargo en la lista.",
        )
        return

    rol = next((item for item in roles if item["id"] == rol_id), None)
    if not rol or rol.get("nivel_jerarquia") is None:
        _reply(bot_token, chat_id, "Ese cargo no está disponible. Intenta de nuevo.")
        return

    datos = {
        **datos_previos,
        "_nivel_recolector": int(rol["nivel_jerarquia"]),
        "_recolector_rol_nombre": etiqueta,
        "_recolector_id_rol": rol_id,
    }

    if tras_rol in (MODO_PROPIO, MODO_OTROS):
        _iniciar_flujo_registro(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            datos,
            modo=tras_rol,
        )
        return

    _upsert_session(
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        PASO_INICIO,
        datos,
        None,
    )
    _reply(
        bot_token,
        chat_id,
        f"✅ Perfecto. Quedaste como *{etiqueta}* en esta sesión.\n\n"
        "Elige *Mi propio registro* o *Registrar otra persona*.",
        menu=True,
    )


def _iniciar_flujo_registro(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    datos_recolector: dict[str, Any],
    *,
    modo: str,
) -> None:
    datos = {
        **_datos_sesion_recolector(datos_recolector),
        "_modo_registro": modo,
    }
    if modo == MODO_PROPIO:
        _aplicar_rol_propio(datos)
    _upsert_session(
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        PASO_NOMBRES,
        datos,
        None,
    )
    _reply(
        bot_token,
        chat_id,
        _encabezado(PASO_NOMBRES, _mensaje_inicio_registro(modo)),
    )


def _pedir_cargo_y_registro(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    *,
    modo: str,
) -> None:
    _preguntar_rol_recolector(
        bot_token,
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        datos_iniciales={"_tras_rol": modo},
    )


def _iniciar_registro(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    datos_sesion: dict[str, Any],
    *,
    modo: str,
) -> None:
    if _recolector_listo_en_sesion(datos_sesion):
        _iniciar_flujo_registro(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            datos_sesion,
            modo=modo,
        )
        return
    _pedir_cargo_y_registro(
        bot_token,
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        modo=modo,
    )


def _saltar_catalogo_vacio(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str,
    paso_destino: str,
    datos: dict[str, Any],
    mensaje: str,
) -> str:
    _upsert_session(
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        paso_destino,
        datos,
        user_id,
    )
    _reply(bot_token, chat_id, mensaje)
    return paso_destino


def _pregunta_catalogo(
    paso: str,
    titulo: str,
    lista: str,
) -> str:
    return _encabezado(
        paso,
        f"{titulo}\n\n{lista}\n\n"
        "Responde con el *número* de la lista "
        "o escribe parte del nombre.",
    )


def _puestos_filtrados(
    client: Client,
    campaign_id: str,
    datos: dict[str, Any],
) -> list[dict[str, Any]]:
    municipio = datos.get("_municipio_nombre") or datos.get("_municipio")
    return fetch_puestos(
        client,
        campaign_id,
        municipio=str(municipio) if municipio else None,
    )


def _comuna_desde_puesto(puesto: dict[str, Any] | None) -> str | None:
    if not puesto:
        return None
    rel = puesto.get("comunas")
    if isinstance(rel, list):
        rel = rel[0] if rel else None
    if isinstance(rel, dict):
        nombre = rel.get("nombre")
        return str(nombre) if nombre else None
    return None


def _limpiar_busqueda_municipio(datos: dict[str, Any]) -> None:
    datos.pop("_municipio_modo", None)
    datos.pop("_municipio_opciones", None)


def _preguntar_municipio(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str,
    datos: dict[str, Any],
) -> None:
    _limpiar_busqueda_municipio(datos)
    municipios = fetch_municipios(client, campaign_id)
    if not municipios:
        siguiente = _siguiente_paso(PASO_MUNICIPIO) or PASO_CONFIRMAR
        _saltar_catalogo_vacio(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            siguiente,
            datos,
            "No hay municipios cargados en los puestos de votación. Continuamos…",
        )
        if siguiente != PASO_CONFIRMAR:
            _avanzar_con_pregunta(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                siguiente,
                datos,
            )
        else:
            _mostrar_confirmacion(
                bot_token, client, campaign_id, chat_id, telegram_user_id, user_id, datos
            )
        return

    if len(municipios) <= CATALOGO_LISTA_DIRECTA_MAX:
        datos["_municipio_modo"] = "lista"
        _upsert_session(
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            PASO_MUNICIPIO,
            datos,
            user_id,
        )
        _reply(
            bot_token,
            chat_id,
            _pregunta_catalogo(
                PASO_MUNICIPIO,
                "¿En qué *municipio* vota?\n"
                "(Así acotamos el puesto de votación)",
                lista_numerada(municipios),
            )
            + "\n\nTambién puedes escribir *parte del nombre* del municipio.",
        )
        return

    datos["_municipio_modo"] = "buscar"
    _upsert_session(
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        PASO_MUNICIPIO,
        datos,
        user_id,
    )
    _reply(
        bot_token,
        chat_id,
        _encabezado(
            PASO_MUNICIPIO,
            "¿En qué *municipio* vota?\n\n"
            "Hay muchos municipios cargados.\n"
            "Escribe *palabras del nombre* (ej: medellín, envigado).\n"
            "Te mostraré las opciones más parecidas.",
        ),
    )


def _mostrar_opciones_municipio(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str,
    datos: dict[str, Any],
    opciones: list[dict[str, Any]],
) -> None:
    datos["_municipio_opciones"] = [
        {"id": item["id"], "nombre": item.get("nombre", "")} for item in opciones
    ]
    _upsert_session(
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        PASO_MUNICIPIO,
        datos,
        user_id,
    )
    _reply(
        bot_token,
        chat_id,
        _encabezado(
            PASO_MUNICIPIO,
            "Estos municipios se parecen a lo que escribiste:\n\n"
            f"{lista_numerada(opciones)}\n\n"
            "Responde con el *número* de la lista.\n"
            "Si no aparece el tuyo, escribe otras palabras para buscar de nuevo.",
        ),
    )


def _avanzar_tras_municipio(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str,
    datos: dict[str, Any],
    municipio: str,
    etiqueta: str,
) -> None:
    datos["_municipio"] = municipio
    datos["_municipio_nombre"] = etiqueta
    _limpiar_busqueda_municipio(datos)
    siguiente = _siguiente_paso(PASO_MUNICIPIO)
    if siguiente:
        _avanzar_con_pregunta(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            siguiente,
            datos,
        )


def _procesar_paso_municipio(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str,
    datos: dict[str, Any],
    text: str,
) -> None:
    if es_omitir(text):
        _reply(
            bot_token,
            chat_id,
            "Indica el municipio con el número de la lista "
            "o escribiendo parte del nombre.",
        )
        return

    opciones = datos.get("_municipio_opciones") or []
    if opciones:
        estado, item_id, etiqueta = resolver_por_numero_o_texto(
            opciones, text, campo_busqueda="nombre"
        )
        if estado == "ok" and item_id:
            _avanzar_tras_municipio(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                datos,
                str(item_id),
                etiqueta or "",
            )
            return
        if estado == "ambiguo":
            _reply(
                bot_token,
                chat_id,
                "Hay varias opciones parecidas. Responde con el *número* exacto.",
            )
            return
        if len(text.strip()) >= 2:
            _limpiar_busqueda_municipio(datos)
        else:
            _reply(
                bot_token,
                chat_id,
                "Elige el *número* de la lista o escribe otras palabras para buscar.",
            )
            return

    municipios = fetch_municipios(client, campaign_id)
    if not municipios:
        _reply(
            bot_token,
            chat_id,
            "No hay municipios disponibles. Toca *Cancelar* y avisa al coordinador.",
            menu=True,
        )
        return

    modo = datos.get("_municipio_modo", "buscar")
    if modo == "lista":
        estado, item_id, etiqueta = resolver_por_numero_o_texto(
            municipios, text, campo_busqueda="nombre"
        )
        if estado == "ok" and item_id:
            _avanzar_tras_municipio(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                datos,
                str(item_id),
                etiqueta or "",
            )
            return
        if estado == "ambiguo":
            _reply(
                bot_token,
                chat_id,
                "Hay varias opciones parecidas. Responde con el *número* exacto.",
            )
            return
        if len(text.strip()) < 2:
            _reply(
                bot_token,
                chat_id,
                "Escribe el número de la lista o al menos 2 letras del municipio.",
            )
            return

    if len(text.strip()) < 2:
        _reply(
            bot_token,
            chat_id,
            "Escribe al menos 2 letras del municipio.",
        )
        return

    candidatos = buscar_por_coincidencia(municipios, text)
    if not candidatos:
        _reply(
            bot_token,
            chat_id,
            "No encontré municipios parecidos.\n"
            "Prueba con otras palabras (ej: nombre del municipio).",
        )
        return

    if len(candidatos) == 1:
        unico = candidatos[0]
        _avanzar_tras_municipio(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            datos,
            str(unico["id"]),
            str(unico.get("nombre", "")),
        )
        return

    _mostrar_opciones_municipio(
        bot_token,
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        user_id,
        datos,
        candidatos,
    )


def _limpiar_busqueda_puesto(datos: dict[str, Any]) -> None:
    datos.pop("_puesto_modo", None)
    datos.pop("_puesto_opciones", None)


def _preguntar_puesto(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str,
    datos: dict[str, Any],
) -> None:
    _limpiar_busqueda_puesto(datos)
    puestos = _puestos_filtrados(client, campaign_id, datos)
    if not puestos:
        siguiente = _siguiente_paso(PASO_PUESTO) or PASO_CONFIRMAR
        municipio = datos.get("_municipio_nombre")
        aviso = (
            f"No hay puestos cargados en *{municipio}*. Continuamos…"
            if municipio
            else "No hay puestos de votación cargados. Continuamos…"
        )
        _saltar_catalogo_vacio(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            siguiente,
            datos,
            aviso,
        )
        if siguiente != PASO_CONFIRMAR:
            _avanzar_con_pregunta(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                siguiente,
                datos,
            )
        else:
            _mostrar_confirmacion(
                bot_token, client, campaign_id, chat_id, telegram_user_id, user_id, datos
            )
        return

    municipio_txt = datos.get("_municipio_nombre")
    sufijo_municipio = f" en *{municipio_txt}*" if municipio_txt else ""

    if len(puestos) <= CATALOGO_LISTA_DIRECTA_MAX:
        datos["_puesto_modo"] = "lista"
        _upsert_session(
            client, campaign_id, chat_id, telegram_user_id, PASO_PUESTO, datos, user_id
        )
        _reply(
            bot_token,
            chat_id,
            _pregunta_catalogo(
                PASO_PUESTO,
                f"¿En qué *puesto de votación*{sufijo_municipio} vota?",
                lista_numerada(puestos),
            )
            + "\n\nTambién puedes escribir *palabras del nombre o dirección* "
            "(ej: colegio, san josé) y te mostraré coincidencias.",
        )
        return

    datos["_puesto_modo"] = "buscar"
    _upsert_session(
        client, campaign_id, chat_id, telegram_user_id, PASO_PUESTO, datos, user_id
    )
    _reply(
        bot_token,
        chat_id,
        _encabezado(
            PASO_PUESTO,
            f"¿En qué *puesto de votación*{sufijo_municipio} vota?\n\n"
            "Hay muchos puestos en este municipio.\n"
            "Escribe *palabras del nombre o dirección* (ej: colegio, san josé, biblioteca).\n"
            "Te mostraré las opciones más parecidas.",
        ),
    )


def _mostrar_opciones_puesto(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str,
    datos: dict[str, Any],
    opciones: list[dict[str, Any]],
) -> None:
    datos["_puesto_opciones"] = opciones
    _upsert_session(
        client, campaign_id, chat_id, telegram_user_id, PASO_PUESTO, datos, user_id
    )
    _reply(
        bot_token,
        chat_id,
        _encabezado(
            PASO_PUESTO,
            "Estas son las opciones más parecidas:\n\n"
            f"{lista_numerada(opciones)}\n\n"
            "Responde con el *número* de la lista.\n"
            "Si no aparece tu puesto, escribe otras palabras para buscar de nuevo.",
        ),
    )


def _avanzar_tras_puesto(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str,
    datos: dict[str, Any],
    item_id: str,
    etiqueta: str,
    *,
    puesto: dict[str, Any] | None = None,
) -> None:
    datos["id_puesto_votacion"] = item_id
    datos["_puesto_nombre"] = etiqueta
    comuna = _comuna_desde_puesto(puesto)
    if comuna:
        datos["_comuna_nombre"] = comuna
    else:
        datos.pop("_comuna_nombre", None)
    _limpiar_busqueda_puesto(datos)
    siguiente = _siguiente_paso(PASO_PUESTO)
    if siguiente:
        _avanzar_con_pregunta(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            siguiente,
            datos,
        )


def _procesar_paso_puesto(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str,
    datos: dict[str, Any],
    text: str,
) -> None:
    if es_omitir(text):
        _reply(
            bot_token,
            chat_id,
            "Indica el puesto de votación con el número de la lista "
            "o escribiendo parte del nombre.",
        )
        return

    opciones = datos.get("_puesto_opciones") or []
    if opciones:
        estado, item_id, etiqueta = resolver_por_numero_o_texto(
            opciones, text, campo_busqueda="nombre"
        )
        if estado == "ok" and item_id:
            puesto = next((p for p in opciones if p["id"] == item_id), None)
            _avanzar_tras_puesto(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                datos,
                item_id,
                etiqueta or "",
                puesto=puesto,
            )
            return
        if estado == "ambiguo":
            _reply(
                bot_token,
                chat_id,
                "Hay varias opciones parecidas. Responde con el *número* exacto.",
            )
            return
        if len(text.strip()) >= 2:
            _limpiar_busqueda_puesto(datos)
        else:
            _reply(
                bot_token,
                chat_id,
                "Elige el *número* de la lista o escribe otras palabras para buscar.",
            )
            return

    puestos = _puestos_filtrados(client, campaign_id, datos)
    if not puestos:
        _reply(
            bot_token,
            chat_id,
            "No hay puestos disponibles en este municipio. Toca *Cancelar* y avisa al coordinador.",
            menu=True,
        )
        return

    modo = datos.get("_puesto_modo", "buscar")
    if modo == "lista":
        estado, item_id, etiqueta = resolver_por_numero_o_texto(
            puestos, text, campo_busqueda="nombre"
        )
        if estado == "ok" and item_id:
            puesto = next((p for p in puestos if p["id"] == item_id), None)
            _avanzar_tras_puesto(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                datos,
                item_id,
                etiqueta or "",
                puesto=puesto,
            )
            return
        if estado == "ambiguo":
            _reply(
                bot_token,
                chat_id,
                "Hay varias opciones parecidas.\n"
                "Por favor responde con el *número* exacto de la lista.",
            )
            return
        if len(text.strip()) < 2:
            _reply(
                bot_token,
                chat_id,
                "Escribe el número de la lista o al menos 2 letras del puesto.",
            )
            return

    if len(text.strip()) < 2:
        _reply(
            bot_token,
            chat_id,
            "Escribe al menos 2 letras del nombre del puesto.",
        )
        return

    candidatos = buscar_puestos_relevantes(puestos, text)
    if not candidatos:
        _reply(
            bot_token,
            chat_id,
            "No encontré puestos parecidos.\n"
            "Prueba con otras palabras (colegio, institución, barrio, etc.).",
        )
        return

    if len(candidatos) == 1:
        unico = candidatos[0]
        _avanzar_tras_puesto(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            datos,
            unico["id"],
            str(unico.get("nombre", "")),
            puesto=unico,
        )
        return

    _mostrar_opciones_puesto(
        bot_token,
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        user_id,
        datos,
        candidatos,
    )


def _lugares_campana(client: Client, campaign_id: str) -> list[dict[str, Any]]:
    return fetch_lugares_trabajo(client, campaign_id)


def _limpiar_busqueda_lugar(datos: dict[str, Any]) -> None:
    datos.pop("_lugar_modo", None)
    datos.pop("_lugar_opciones", None)


def _preguntar_lugar_trabajo(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str,
    datos: dict[str, Any],
) -> None:
    _limpiar_busqueda_lugar(datos)
    lugares = _lugares_campana(client, campaign_id)
    if not lugares:
        siguiente = _siguiente_paso(PASO_LUGAR_TRABAJO) or PASO_CONFIRMAR
        aviso = "No hay lugares de trabajo cargados en la campaña. Continuamos…"
        _saltar_catalogo_vacio(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            siguiente,
            datos,
            aviso,
        )
        if siguiente != PASO_CONFIRMAR:
            _avanzar_con_pregunta(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                siguiente,
                datos,
            )
        else:
            _mostrar_confirmacion(
                bot_token, client, campaign_id, chat_id, telegram_user_id, user_id, datos
            )
        return

    if len(lugares) <= CATALOGO_LISTA_DIRECTA_MAX:
        datos["_lugar_modo"] = "lista"
        _upsert_session(
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            PASO_LUGAR_TRABAJO,
            datos,
            user_id,
        )
        _reply(
            bot_token,
            chat_id,
            _pregunta_catalogo(
                PASO_LUGAR_TRABAJO,
                "¿Cuál es su *lugar de trabajo*?",
                lista_numerada(lugares),
            )
            + "\n\nTambién puedes escribir *palabras del nombre* "
            "(ej: fábrica, hospital) y te mostraré coincidencias.",
        )
        return

    datos["_lugar_modo"] = "buscar"
    _upsert_session(
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        PASO_LUGAR_TRABAJO,
        datos,
        user_id,
    )
    _reply(
        bot_token,
        chat_id,
        _encabezado(
            PASO_LUGAR_TRABAJO,
            "¿Cuál es su *lugar de trabajo*?\n\n"
            "Hay muchos lugares cargados.\n"
            "Escribe *palabras del nombre* (ej: fábrica, hospital, centro comercial).\n"
            "Te mostraré las opciones más parecidas.",
        ),
    )


def _mostrar_opciones_lugar(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str,
    datos: dict[str, Any],
    opciones: list[dict[str, Any]],
) -> None:
    datos["_lugar_opciones"] = [
        {"id": item["id"], "nombre": item.get("nombre", "")} for item in opciones
    ]
    _upsert_session(
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        PASO_LUGAR_TRABAJO,
        datos,
        user_id,
    )
    _reply(
        bot_token,
        chat_id,
        _encabezado(
            PASO_LUGAR_TRABAJO,
            "Estas son las opciones más parecidas:\n\n"
            f"{lista_numerada(opciones)}\n\n"
            "Responde con el *número* de la lista.\n"
            "Si no aparece tu lugar, escribe otras palabras para buscar de nuevo.",
        ),
    )


def _avanzar_tras_lugar(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str,
    datos: dict[str, Any],
    item_id: str,
    etiqueta: str,
) -> None:
    datos["id_lugar_trabajo"] = item_id
    datos["_lugar_nombre"] = etiqueta
    _limpiar_busqueda_lugar(datos)
    siguiente = _siguiente_paso_votante(PASO_LUGAR_TRABAJO, datos)
    if siguiente:
        _avanzar_con_pregunta(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            siguiente,
            datos,
        )


def _procesar_paso_lugar_trabajo(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str,
    datos: dict[str, Any],
    text: str,
) -> None:
    if es_omitir(text):
        _reply(
            bot_token,
            chat_id,
            "Indica el lugar de trabajo con el número de la lista "
            "o escribiendo parte del nombre.",
        )
        return

    opciones = datos.get("_lugar_opciones") or []
    if opciones:
        estado, item_id, etiqueta = resolver_por_numero_o_texto(
            opciones, text, campo_busqueda="nombre"
        )
        if estado == "ok" and item_id:
            _avanzar_tras_lugar(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                datos,
                item_id,
                etiqueta or "",
            )
            return
        if estado == "ambiguo":
            _reply(
                bot_token,
                chat_id,
                "Hay varias opciones parecidas. Responde con el *número* exacto.",
            )
            return
        if len(text.strip()) >= 2:
            _limpiar_busqueda_lugar(datos)
        else:
            _reply(
                bot_token,
                chat_id,
                "Elige el *número* de la lista o escribe otras palabras para buscar.",
            )
            return

    lugares = _lugares_campana(client, campaign_id)
    if not lugares:
        _reply(
            bot_token,
            chat_id,
            "No hay lugares de trabajo cargados en la campaña. "
            "Toca *Cancelar* y avisa al coordinador.",
            menu=True,
        )
        return

    modo = datos.get("_lugar_modo", "buscar")
    if modo == "lista":
        estado, item_id, etiqueta = resolver_por_numero_o_texto(
            lugares, text, campo_busqueda="nombre"
        )
        if estado == "ambiguo":
            _reply(
                bot_token,
                chat_id,
                "Hay varias opciones parecidas.\n"
                "Por favor responde con el *número* exacto de la lista.",
            )
            return
        if estado == "ok" and item_id:
            _avanzar_tras_lugar(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                datos,
                item_id,
                etiqueta or "",
            )
            return
        if estado == "omitir":
            _reply(
                bot_token,
                chat_id,
                "No entendí tu respuesta.\n"
                "Escribe el número de la lista o palabras del nombre del lugar.",
            )
            return
        # Sin coincidencia exacta en la lista: intentar búsqueda por palabras.

    if len(text.strip()) < 2:
        _reply(
            bot_token,
            chat_id,
            "Escribe al menos 2 letras del nombre del lugar de trabajo.",
        )
        return

    candidatos = buscar_por_coincidencia(lugares, text)
    if not candidatos:
        _reply(
            bot_token,
            chat_id,
            "No encontré lugares parecidos.\n"
            "Prueba con otras palabras (empresa, institución, barrio, etc.).",
        )
        return

    if len(candidatos) == 1:
        unico = candidatos[0]
        _avanzar_tras_lugar(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            datos,
            unico["id"],
            str(unico.get("nombre", "")),
        )
        return

    _mostrar_opciones_lugar(
        bot_token,
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        user_id,
        datos,
        candidatos,
    )


def _avanzar_con_pregunta(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str,
    paso: str,
    datos: dict[str, Any],
) -> None:
    paso = _resolver_paso_destino(paso, datos) or PASO_CONFIRMAR
    if paso == PASO_LIDER and _votante_sin_lider_directo(datos):
        _mostrar_confirmacion(
            bot_token, client, campaign_id, chat_id, telegram_user_id, user_id, datos
        )
        return
    if paso == PASO_CONFIRMAR:
        _mostrar_confirmacion(
            bot_token, client, campaign_id, chat_id, telegram_user_id, user_id, datos
        )
        return

    if paso == PASO_TIPO_DOCUMENTO:
        _upsert_session(
            client, campaign_id, chat_id, telegram_user_id, paso, datos, user_id
        )
        _reply(
            bot_token,
            chat_id,
            _encabezado(
                paso,
                "¿Qué tipo de documento tiene?\n\n"
                f"{prompt_tipo_documento()}\n\n"
                "Responde con el número o las siglas (ej: CC).",
            ),
        )
        return

    if paso == PASO_FECHA_NACIMIENTO:
        _upsert_session(
            client, campaign_id, chat_id, telegram_user_id, paso, datos, user_id
        )
        _reply(
            bot_token,
            chat_id,
            _encabezado(
                paso,
                "¿Cuál es su fecha de nacimiento?\n\n"
                "Escribe día/mes/año (ej: 15/03/1990).",
            ),
        )
        return

    if paso == PASO_SEXO:
        _upsert_session(
            client, campaign_id, chat_id, telegram_user_id, paso, datos, user_id
        )
        _reply(
            bot_token,
            chat_id,
            _encabezado(
                paso,
                "¿Cuál es su sexo?\n\n"
                "1. Hombre\n"
                "2. Mujer\n\n"
                "*Responde con 1 o 2.*",
            ),
        )
        return

    if paso == PASO_TELEFONO:
        _upsert_session(
            client, campaign_id, chat_id, telegram_user_id, paso, datos, user_id
        )
        _reply(
            bot_token,
            chat_id,
            _encabezado(
                paso,
                "¿Cuál es su número de celular?\n\n"
                "Escribe los 10 dígitos (ej: 3001234567).",
            ),
        )
        return

    if paso == PASO_DIRECCION:
        _upsert_session(
            client, campaign_id, chat_id, telegram_user_id, paso, datos, user_id
        )
        _reply(
            bot_token,
            chat_id,
            _encabezado(
                paso,
                "¿Cuál es su dirección de residencia?\n\n"
                "Escribe la dirección completa.",
            ),
        )
        return

    if paso == PASO_MUNICIPIO:
        _preguntar_municipio(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            datos,
        )
        return

    if paso == PASO_PUESTO:
        _preguntar_puesto(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            datos,
        )
        return

    if paso == PASO_MESA:
        _upsert_session(
            client, campaign_id, chat_id, telegram_user_id, paso, datos, user_id
        )
        _reply(
            bot_token,
            chat_id,
            _encabezado(
                paso,
                "¿En qué *mesa* vota?\n\n"
                "Escribe el número de mesa.",
            ),
        )
        return

    if paso == PASO_LUGAR_TRABAJO:
        _preguntar_lugar_trabajo(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            datos,
        )
        return

    if paso == PASO_ROL:
        if _registro_propio(datos):
            siguiente = _siguiente_paso_votante(PASO_ROL, datos)
            if siguiente:
                _avanzar_con_pregunta(
                    bot_token,
                    client,
                    campaign_id,
                    chat_id,
                    telegram_user_id,
                    user_id,
                    siguiente,
                    datos,
                )
            return
        nivel_recolector = datos.get("_nivel_recolector")
        todos_roles = fetch_roles(client, campaign_id)
        roles = (
            roles_bajo_jerarquia(todos_roles, int(nivel_recolector))
            if nivel_recolector is not None
            else todos_roles
        )
        if not roles:
            siguiente = _siguiente_paso_votante(PASO_ROL, datos) or PASO_CONFIRMAR
            _saltar_catalogo_vacio(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                siguiente,
                datos,
                "En tu jerarquía no hay cargos inferiores que asignar. Continuamos…",
            )
            if siguiente != PASO_CONFIRMAR:
                _avanzar_con_pregunta(
                    bot_token,
                    client,
                    campaign_id,
                    chat_id,
                    telegram_user_id,
                    user_id,
                    siguiente,
                    datos,
                )
            else:
                _mostrar_confirmacion(bot_token, client, campaign_id, chat_id, telegram_user_id, user_id, datos)
            return
        lista = lista_numerada(roles, etiqueta="rol")
        _upsert_session(
            client, campaign_id, chat_id, telegram_user_id, paso, datos, user_id
        )
        _reply(
            bot_token,
            chat_id,
            _pregunta_catalogo(
                paso,
                "¿Qué *cargo organizacional* tiene esta persona?\n"
                "(Solo cargos *por debajo* del tuyo)",
                lista,
            ),
        )
        return

    if paso == PASO_LIDER:
        _upsert_session(
            client, campaign_id, chat_id, telegram_user_id, paso, datos, user_id
        )
        _reply(
            bot_token,
            chat_id,
            _encabezado(
                paso,
                "¿Cuál es el *documento* de su líder directo?\n\n"
                "Debe ser una persona *ya registrada* en la campaña.\n"
                "Escribe solo números, sin puntos ni espacios.",
            ),
        )
        return

    if paso == PASO_CONFIRMAR:
        _mostrar_confirmacion(
            bot_token, client, campaign_id, chat_id, telegram_user_id, user_id, datos
        )


def _valor_resumen(valor: Any) -> str:
    if valor is None or valor == "":
        return "—"
    return str(valor)


def _mostrar_confirmacion(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str,
    datos: dict[str, Any],
) -> None:
    tipo = datos.get("tipo_documento", "CC")
    tipo_label = next(
        (label for code, label in TIPOS_DOCUMENTO if code == tipo),
        tipo,
    )
    resumen = (
        "Por favor revisa que todo esté correcto:\n\n"
        f"• Nombres: {_valor_resumen(datos.get('nombres'))}\n"
        f"• Apellidos: {_valor_resumen(datos.get('apellidos'))}\n"
        f"• Documento: {tipo} ({tipo_label}) {_valor_resumen(datos.get('documento'))}\n"
        f"• Fecha nacimiento: {_valor_resumen(datos.get('fecha_nacimiento'))}\n"
        f"• Sexo: {_valor_resumen(datos.get('sexo'))}\n"
        f"• Teléfono: {_valor_resumen(datos.get('telefono'))}\n"
        f"• Dirección: {_valor_resumen(datos.get('direccion'))}\n"
        f"• Municipio: {_valor_resumen(datos.get('_municipio_nombre'))}\n"
        f"• Puesto de votación: {_valor_resumen(datos.get('_puesto_nombre'))}\n"
        f"• Comuna (del puesto): {_valor_resumen(datos.get('_comuna_nombre'))}\n"
        f"• Mesa: {_valor_resumen(datos.get('mesa'))}\n"
        f"• Lugar de trabajo: {_valor_resumen(datos.get('_lugar_nombre'))}\n"
        f"• Rol: {_valor_resumen(datos.get('_rol_nombre'))}\n"
        f"• Líder directo: {_valor_resumen(datos.get('_lider_nombre'))}\n\n"
        "¿Los datos están bien?\n"
        "Responde *SÍ* para guardar o *NO* para cancelar."
    )
    _upsert_session(
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        PASO_CONFIRMAR,
        datos,
        user_id,
    )
    _reply(bot_token, chat_id, _encabezado(PASO_CONFIRMAR, resumen))


def _guardar_y_responder(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    user_id: str | None,
    datos: dict[str, Any],
) -> None:
    nivel_recolector = datos.get("_nivel_recolector")
    if datos.get("id_rol") and nivel_recolector is not None:
        rol = rol_por_id(client, campaign_id, str(datos["id_rol"]))
        nivel_votante = int(rol.get("nivel_jerarquia", 99)) if rol else 99
        nivel_rec = int(nivel_recolector)
        if _registro_propio(datos):
            if (
                not rol
                or str(datos["id_rol"]) != str(datos.get("_recolector_id_rol", ""))
                or nivel_votante != nivel_rec
            ):
                _reply(
                    bot_token,
                    chat_id,
                    "❌ En tu propio registro el cargo debe ser el tuyo en esta sesión. "
                    "Toca *Mi propio registro* para intentar de nuevo.",
                    menu=True,
                )
                _delete_session(client, campaign_id, chat_id)
                return
        elif nivel_votante <= nivel_rec:
            _reply(
                bot_token,
                chat_id,
                "❌ No puedes asignar un cargo igual o superior al tuyo. "
                "Corrige el registro tocando *Registrar otra persona* de nuevo.",
                menu=True,
            )
            _delete_session(client, campaign_id, chat_id)
            return

    if _votante_sin_lider_directo(datos):
        _limpiar_lider_directo(datos)

    result = register_voter(
        client,
        campaign_id,
        user_id,
        {
            "nombres": datos.get("nombres", ""),
            "apellidos": datos.get("apellidos", ""),
            "documento": datos.get("documento", ""),
            "tipo_documento": datos.get("tipo_documento", "CC"),
            "sexo": datos.get("sexo"),
            "fecha_nacimiento": datos.get("fecha_nacimiento"),
            "telefono": datos.get("telefono"),
            "direccion": datos.get("direccion"),
            "id_lugar_trabajo": datos.get("id_lugar_trabajo"),
            "id_rol": datos.get("id_rol"),
            "id_lider_directo": datos.get("id_lider_directo"),
            "id_puesto_votacion": datos.get("id_puesto_votacion"),
            "mesa": datos.get("mesa"),
            "canal_origen": "telegram",
        },
    )

    _delete_session(client, campaign_id, chat_id)

    nombre = f"{datos.get('nombres', '')} {datos.get('apellidos', '')}".strip()

    if result.get("outcome") == "created":
        _reply(
            bot_token,
            chat_id,
            f"✅ ¡Listo! *{nombre}* quedó registrado(a).\n\n"
            "¿Quieres hacer otro registro?\n"
            "Elige *Mi propio registro* o *Registrar otra persona*.",
            menu=True,
        )
    elif result.get("outcome") == "quarantined":
        _reply(
            bot_token,
            chat_id,
            f"⚠️ Los datos de *{nombre}* se enviaron a revisión "
            "porque podrían estar repetidos.\n\n"
            "Un supervisor los revisará en la plataforma.\n\n"
            "¿Quieres registrar a alguien más? "
            "Elige *Mi propio registro* o *Registrar otra persona*.",
            menu=True,
        )
    else:
        errors = result.get("errors") or ["No se pudo guardar."]
        _reply(
            bot_token,
            chat_id,
            f"❌ No se pudo registrar:\n{' '.join(errors)}\n\n"
            "Elige *Mi propio registro* o *Registrar otra persona* para intentar de nuevo.",
            menu=True,
        )


def _procesar_catalogo(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str,
    paso: str,
    datos: dict[str, Any],
    texto: str,
    fetcher: Callable[[Client, str], list[dict[str, Any]]],
    campo_id: str,
    campo_label: str,
    campo_busqueda: str,
) -> None:
    items = fetcher(client, campaign_id)
    estado, item_id, etiqueta = resolver_por_numero_o_texto(
        items, texto, campo_busqueda=campo_busqueda
    )

    if estado == "invalido" or estado == "omitir":
        _reply(
            bot_token,
            chat_id,
            "No entendí tu respuesta.\n"
            "Escribe el número de la lista o parte del nombre.",
        )
        return

    if estado == "ambiguo":
        _reply(
            bot_token,
            chat_id,
            "Hay varias opciones parecidas.\n"
            "Por favor responde con el *número* exacto de la lista.",
        )
        return

    datos[campo_id] = item_id
    datos[campo_label] = etiqueta

    siguiente = _siguiente_paso(paso)
    if siguiente:
        _avanzar_con_pregunta(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            siguiente,
            datos,
        )


def _procesar_paso_registro(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str,
    paso: str,
    datos: dict[str, Any],
    text: str,
) -> None:
    if paso == PASO_NOMBRES:
        if len(text) < 2:
            _reply(bot_token, chat_id, "Escribe al menos 2 letras en los nombres.")
            return
        datos["nombres"] = text.strip()
        _upsert_session(
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            PASO_APELLIDOS,
            datos,
            user_id,
        )
        _reply(
            bot_token,
            chat_id,
            _encabezado(
                PASO_APELLIDOS,
                "¿Cuáles son sus *apellidos*?\n(Ejemplo: Pérez Gómez)",
            ),
        )
        return

    if paso == PASO_APELLIDOS:
        if len(text) < 2:
            _reply(bot_token, chat_id, "Escribe al menos 2 letras en los apellidos.")
            return
        datos["apellidos"] = text.strip()
        _avanzar_con_pregunta(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            PASO_TIPO_DOCUMENTO,
            datos,
        )
        return

    if paso == PASO_TIPO_DOCUMENTO:
        estado, codigo = resolver_tipo_documento(text)
        if estado != "ok" or not codigo:
            _reply(
                bot_token,
                chat_id,
                "Tipo de documento no reconocido.\n"
                f"Elige un número del 1 al {len(TIPOS_DOCUMENTO)} o escribe CC, TI, etc.",
            )
            return
        datos["tipo_documento"] = codigo
        _upsert_session(
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            PASO_DOCUMENTO,
            datos,
            user_id,
        )
        _reply(
            bot_token,
            chat_id,
            _encabezado(
                PASO_DOCUMENTO,
                "¿Cuál es el *número de documento*?\n"
                "(Solo números, sin puntos ni espacios)",
            ),
        )
        return

    if paso == PASO_DOCUMENTO:
        documento = "".join(ch for ch in text if ch.isdigit())
        if len(documento) < 5:
            _reply(
                bot_token,
                chat_id,
                "El documento debe tener al menos 5 números. Inténtalo de nuevo:",
            )
            return
        datos["documento"] = documento
        _avanzar_con_pregunta(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            PASO_FECHA_NACIMIENTO,
            datos,
        )
        return

    if paso == PASO_FECHA_NACIMIENTO:
        if es_omitir(text):
            _reply(
                bot_token,
                chat_id,
                "Indica la fecha de nacimiento en formato día/mes/año (ej: 15/03/1990).",
            )
            return
        estado, fecha = parse_fecha_nacimiento(text)
        if estado != "ok" or not fecha:
            _reply(
                bot_token,
                chat_id,
                "Fecha no válida. Usa día/mes/año (ej: 15/03/1990).",
            )
            return
        error_cc = error_cc_menor_edad(datos.get("tipo_documento", "CC"), fecha)
        if error_cc:
            _reply(
                bot_token,
                chat_id,
                f"❌ {error_cc}\n\n"
                "Vamos a elegir de nuevo el *tipo de documento*.\n"
                "Si es menor de edad, responde *TI* (tarjeta de identidad).",
            )
            _avanzar_con_pregunta(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                PASO_TIPO_DOCUMENTO,
                datos,
            )
            return
        datos["fecha_nacimiento"] = fecha
        _avanzar_con_pregunta(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            PASO_SEXO,
            datos,
        )
        return

    if paso == PASO_SEXO:
        if es_omitir(text):
            _reply(
                bot_token,
                chat_id,
                "Responde *1* (Hombre) o *2* (Mujer).",
            )
            return
        estado, sexo = resolver_sexo(text)
        if estado != "ok" or not sexo:
            _reply(
                bot_token,
                chat_id,
                "Responde *1* (Hombre) o *2* (Mujer).",
            )
            return
        datos["sexo"] = sexo
        _avanzar_con_pregunta(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            PASO_TELEFONO,
            datos,
        )
        return

    if paso == PASO_TELEFONO:
        if es_omitir(text):
            _reply(
                bot_token,
                chat_id,
                "Escribe el celular con 10 dígitos (ej: 3001234567).",
            )
            return
        error_tel = error_telefono_invalido(text)
        if error_tel:
            _reply(bot_token, chat_id, error_tel)
            return
        datos["telefono"] = normalizar_telefono(text.strip())
        _avanzar_con_pregunta(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            PASO_DIRECCION,
            datos,
        )
        return

    if paso == PASO_DIRECCION:
        if es_omitir(text) or len(text.strip()) < 5:
            _reply(
                bot_token,
                chat_id,
                "Escribe la dirección completa.",
            )
            return
        datos["direccion"] = text.strip()
        _avanzar_con_pregunta(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            PASO_MUNICIPIO,
            datos,
        )
        return

    if paso == PASO_MUNICIPIO:
        _procesar_paso_municipio(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            datos,
            text,
        )
        return

    if paso == PASO_LUGAR_TRABAJO:
        _procesar_paso_lugar_trabajo(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            datos,
            text,
        )
        return

    if paso == PASO_ROL:
        nivel_recolector = datos.get("_nivel_recolector")
        todos_roles = fetch_roles(client, campaign_id)
        items = (
            roles_bajo_jerarquia(todos_roles, int(nivel_recolector))
            if nivel_recolector is not None
            else todos_roles
        )
        estado, item_id, etiqueta = resolver_por_numero_o_texto(
            items, text, campo_busqueda="nombre"
        )
        if estado == "invalido" or estado == "omitir":
            _reply(
                bot_token,
                chat_id,
                "No entendí tu respuesta. Elige el número del cargo en la lista.",
            )
            return
        if estado == "ambiguo":
            _reply(
                bot_token,
                chat_id,
                "Hay varias opciones parecidas. Responde con el número exacto.",
            )
            return
        item = next((r for r in items if r["id"] == item_id), {})
        if not item:
            _reply(bot_token, chat_id, "Ese cargo no está permitido para tu jerarquía.")
            return
        datos["id_rol"] = item_id
        datos["_rol_nombre"] = etiqueta_rol(item) if item else etiqueta
        datos["_voter_rol_nivel"] = item.get("nivel_jerarquia")
        siguiente = _siguiente_paso_votante(paso, datos)
        if siguiente:
            _avanzar_con_pregunta(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                siguiente,
                datos,
            )
        return

    if paso == PASO_LIDER:
        if es_omitir(text):
            _reply(
                bot_token,
                chat_id,
                "Escribe el *documento* del líder directo (solo números).",
            )
            return

        documento_lider = "".join(ch for ch in text if ch.isdigit())
        if len(documento_lider) < 5:
            _reply(
                bot_token,
                chat_id,
                "El documento debe tener al menos 5 números. Inténtalo de nuevo:",
            )
            return

        max_nivel = datos.get("_voter_rol_nivel")
        estado, lider = buscar_lider_por_documento(
            client,
            campaign_id,
            documento_lider,
            max_nivel_jerarquia=int(max_nivel) if max_nivel is not None else None,
            documento_excluir=str(datos.get("documento", "")),
        )

        if estado == "mismo_documento":
            _reply(
                bot_token,
                chat_id,
                "El líder no puede ser la misma persona que estás registrando.\n"
                "Escribe el documento de su líder directo:",
            )
            return
        if estado == "no_encontrado":
            _reply(
                bot_token,
                chat_id,
                "❌ No hay nadie *registrado* con ese documento.\n"
                "Verifica el número o registra primero al líder en la campaña.",
            )
            return
        if estado == "jerarquia_invalida":
            nombre_lider = lider.get("nombre", "") if lider else ""
            _reply(
                bot_token,
                chat_id,
                f"❌ *{nombre_lider}* no puede ser líder directo de esta persona "
                "según la jerarquía organizacional.\n"
                "Escribe el documento de otra persona:",
            )
            return
        if not lider:
            _reply(
                bot_token,
                chat_id,
                "No se pudo validar el líder. Intenta de nuevo:",
            )
            return

        datos["id_lider_directo"] = lider["id"]
        datos["_lider_nombre"] = (
            f"{lider.get('nombre', '')} — {lider.get('documento', documento_lider)}"
        )
        siguiente = _siguiente_paso_votante(paso, datos)
        if siguiente:
            _avanzar_con_pregunta(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                siguiente,
                datos,
            )
        return

    if paso == PASO_PUESTO:
        _procesar_paso_puesto(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            datos,
            text,
        )
        return

    if paso == PASO_MESA:
        mesa = text.strip()
        if es_omitir(text) or len(mesa) < 1:
            _reply(
                bot_token,
                chat_id,
                "Escribe el número de *mesa*.",
            )
            return
        datos["mesa"] = mesa
        siguiente = _siguiente_paso_votante(PASO_MESA, datos)
        if siguiente:
            _avanzar_con_pregunta(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                siguiente,
                datos,
            )
        else:
            _mostrar_confirmacion(
                bot_token, client, campaign_id, chat_id, telegram_user_id, user_id, datos
            )
        return

    if paso == PASO_CONFIRMAR:
        cmd = _normalizar_comando(text)
        if cmd in ("no", "cancelar"):
            _delete_session(client, campaign_id, chat_id)
            _reply(
                bot_token,
                chat_id,
                "Registro cancelado. Elige *Mi propio registro* o *Registrar otra persona* "
                "cuando quieras volver a empezar.",
                menu=True,
            )
            return
        if cmd not in ("si", "sí", "s", "yes", "ok"):
            _reply(
                bot_token,
                chat_id,
                "Por favor responde *SÍ* para guardar o *NO* para cancelar.",
            )
            return
        _guardar_y_responder(
            bot_token, client, campaign_id, chat_id, user_id, datos
        )


def handle_telegram_update(
    client: Client,
    campaign_id: str,
    update: dict[str, Any],
    *,
    expected_secret: str | None,
    received_secret: str | None,
) -> dict[str, str]:
    if expected_secret and received_secret != expected_secret:
        return {"status": "forbidden"}

    config = _integration_config(client, campaign_id)
    if not config:
        return {"status": "disabled"}

    bot_token = config.get("bot_token")
    if not bot_token:
        return {"status": "misconfigured"}

    if not _campaign_telegram_enabled(client, campaign_id):
        return {"status": "disabled"}

    from app.modules.telegram_api import (
        chat_id_from_message,
        extract_message,
        message_text,
        telegram_user_from_message,
    )

    message = extract_message(update)
    if not message:
        return {"status": "ignored"}

    chat_id = chat_id_from_message(message)
    tg_user = telegram_user_from_message(message)
    if chat_id is None or not tg_user:
        return {"status": "ignored"}

    text = message_text(message)
    if not text:
        return {"status": "ignored"}

    telegram_user_id = tg_user["id"]
    comando = _normalizar_comando(text)
    session = _get_session(client, campaign_id, chat_id)
    datos_sesion = dict(session.get("datos_parciales") or {}) if session else {}

    if session and session.get("paso") == PASO_RECOLECTOR_ROL:
        _procesar_seleccion_rol_recolector(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            text,
        )
        return {"status": "ok"}

    if comando in ("start", "/start"):
        if session and session.get("paso") in ORDEN_PASOS:
            _reply(
                bot_token,
                chat_id,
                "Tienes un registro en curso.\n"
                "Continúa respondiendo o toca *Cancelar* para salir.",
            )
            return {"status": "ok"}
        _preguntar_rol_recolector(
            bot_token, client, campaign_id, chat_id, telegram_user_id
        )
        return {"status": "ok"}

    if comando in ("ayuda", "/ayuda", "/help"):
        _reply(
            bot_token,
            chat_id,
            "📖 *Cómo usar este bot*\n\n"
            "1️⃣ Al abrir el bot te pregunta tu *cargo* "
            "(nombre y jerarquía) en esa sesión.\n\n"
            "2️⃣ Elige una opción:\n"
            "   • *Mi propio registro* — te registras con tu cargo\n"
            "   • *Registrar otra persona* — solo cargos *por debajo* del tuyo\n\n"
            "3️⃣ Responde cada pregunta hasta completar el registro.\n\n"
            "4️⃣ Revisa el resumen y responde *SÍ* para guardar.\n\n"
            "*Cancelar* detiene el registro en curso.",
            menu=True,
        )
        return {"status": "ok"}

    if comando in ("cancelar", "/cancelar"):
        _delete_session(client, campaign_id, chat_id)
        _reply(
            bot_token,
            chat_id,
            "Listo, cancelé lo que estabas haciendo.\n"
            "Cuando quieras, elige *Mi propio registro* o *Registrar otra persona*.",
            menu=True,
        )
        return {"status": "ok"}

    if comando in ("propio", "/propio", "mi propio registro"):
        _iniciar_registro(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            datos_sesion,
            modo=MODO_PROPIO,
        )
        return {"status": "ok"}

    if comando in ("otros", "/otros", "registrar otra persona"):
        _iniciar_registro(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            datos_sesion,
            modo=MODO_OTROS,
        )
        return {"status": "ok"}

    if not session or session.get("paso") in (PASO_INICIO, None):
        if not _recolector_listo_en_sesion(datos_sesion):
            _preguntar_rol_recolector(
                bot_token, client, campaign_id, chat_id, telegram_user_id
            )
            return {"status": "ok"}
        _reply(
            bot_token,
            chat_id,
            "Elige *Mi propio registro* o *Registrar otra persona*.\n"
            "También puedes tocar *Ayuda* si tienes dudas.",
            menu=True,
        )
        return {"status": "ok"}

    paso = session.get("paso", PASO_INICIO)
    datos = dict(session.get("datos_parciales") or {})
    user_id = session.get("id_usuario")

    if paso == PASO_RECOLECTOR_ROL:
        _procesar_seleccion_rol_recolector(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            text,
        )
        return {"status": "ok"}

    if not _recolector_listo_en_sesion(datos):
        _preguntar_rol_recolector(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            datos_iniciales={"_tras_rol": datos.get("_modo_registro") or MODO_OTROS},
        )
        return {"status": "ok"}

    _procesar_paso_registro(
        bot_token,
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        user_id,
        paso,
        datos,
        text,
    )
    return {"status": "ok"}
