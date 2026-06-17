from __future__ import annotations

import json
from typing import Any, Callable

from supabase import Client

from app.adapters.supabase_client import row_or_none
from app.modules.telegram_api import FLOW_KEYBOARD, MAIN_MENU_KEYBOARD, send_message
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
)
from app.modules.voter_registry import register_voter
from app.modules.voter_normalize import error_cc_menor_edad, error_telefono_invalido, normalizar_telefono

PASO_INICIO = "inicio"
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
PASO_LIDER = "lider_directo"
PASO_ROL = "rol"
PASO_CONFIRMAR = "confirmar"
PASO_ELEGIR_CORRECCION = "elegir_correccion"

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
    PASO_LIDER,
    PASO_ROL,
    PASO_CONFIRMAR,
]

TOTAL_PREGUNTAS = len(ORDEN_PASOS) - 1
NIVEL_JERARQUIA_SIN_LIDER = 1
MODO_PROPIO = "propio"
MODO_OTROS = "otros"


def _reply(
    bot_token: str,
    chat_id: int,
    text: str,
    *,
    menu: bool = False,
    flow: bool = True,
) -> None:
    if menu:
        reply_markup = MAIN_MENU_KEYBOARD
    elif flow:
        reply_markup = FLOW_KEYBOARD
    else:
        reply_markup = None
    send_message(
        bot_token,
        chat_id,
        text,
        parse_mode="Markdown",
        reply_markup=reply_markup,
    )


def _sesion_registro_activa(session: dict[str, Any] | None) -> bool:
    if not session:
        return False
    paso = session.get("paso")
    return paso in (*ORDEN_PASOS, PASO_ELEGIR_CORRECCION)


def _cancelar_sesion(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
) -> None:
    _delete_session(client, campaign_id, chat_id)
    _reply(
        bot_token,
        chat_id,
        "Listo, cancelé lo que estabas haciendo.\n"
        "Cuando quieras, elige *Mi propio registro* o *Registrar otra persona*.",
        menu=True,
        flow=False,
    )


def _reiniciar_sesion(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
) -> None:
    _delete_session(client, campaign_id, chat_id)
    _mostrar_menu_principal(
        bot_token, client, campaign_id, chat_id, telegram_user_id
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


def _sin_lider_directo_en_sesion(datos: dict[str, Any]) -> bool:
    return bool(datos.get("_sin_lider_directo"))


def _votante_sin_lider_directo(datos: dict[str, Any]) -> bool:
    if _sin_lider_directo_en_sesion(datos):
        return True
    nivel = datos.get("_voter_rol_nivel")
    if nivel is None:
        return False
    return int(nivel) == NIVEL_JERARQUIA_SIN_LIDER


def _limpiar_lider_directo(datos: dict[str, Any]) -> None:
    datos.pop("id_lider_directo", None)
    datos.pop("_lider_nombre", None)
    datos.pop("_lider_rol_nivel", None)
    datos.pop("_sin_lider_directo", None)


def _limpiar_rol_votante(datos: dict[str, Any]) -> None:
    datos.pop("id_rol", None)
    datos.pop("_rol_nombre", None)
    datos.pop("_voter_rol_nivel", None)


def _roles_disponibles_votante(
    datos: dict[str, Any], roles: list[dict[str, Any]]
) -> list[dict[str, Any]]:
    if _sin_lider_directo_en_sesion(datos):
        return [
            rol
            for rol in roles
            if rol.get("nivel_jerarquia") is not None
            and int(rol["nivel_jerarquia"]) == NIVEL_JERARQUIA_SIN_LIDER
        ]
    nivel_lider = datos.get("_lider_rol_nivel")
    if nivel_lider is not None:
        return roles_bajo_jerarquia(roles, int(nivel_lider))
    return roles


def _aplicar_lider_directo(datos: dict[str, Any], lider: dict[str, Any]) -> None:
    documento = lider.get("documento", "")
    datos["id_lider_directo"] = lider["id"]
    datos["_lider_nombre"] = f"{lider.get('nombre', '')} — {documento}"
    datos["_lider_rol_nivel"] = lider.get("nivel_jerarquia")
    datos["_sin_lider_directo"] = False
    _limpiar_rol_votante(datos)


def _marcar_sin_lider_directo(datos: dict[str, Any]) -> None:
    _limpiar_lider_directo(datos)
    datos["_sin_lider_directo"] = True
    _limpiar_rol_votante(datos)


def _resolver_paso_destino(paso: str, datos: dict[str, Any]) -> str | None:
    while paso:
        if paso == PASO_LIDER and _votante_sin_lider_directo(datos):
            if datos.get("id_rol"):
                return PASO_CONFIRMAR
            return PASO_ROL
        return paso
    return None


def _siguiente_paso_votante(paso_actual: str, datos: dict[str, Any]) -> str | None:
    siguiente = _siguiente_paso(paso_actual)
    if not siguiente:
        return None
    return _resolver_paso_destino(siguiente, datos)


def _mensaje_inicio_registro(modo: str) -> str:
    return (
        f"Vamos a registrar {'tus' if modo == MODO_PROPIO else 'a otra persona'} "
        f"datos en la campaña.\n\n"
        "Empezamos con *nombres* y *apellidos*."
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
        "reiniciar": "reiniciar",
        "/reiniciar": "reiniciar",
        "empezar de nuevo": "reiniciar",
        "nuevo inicio": "reiniciar",
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


def _mensaje_bienvenida() -> str:
    return (
        "¡Hola! 👋\n\n"
        "Bienvenido al bot de registro de la campaña.\n\n"
        "Elige una opción:\n"
        "• *Mi propio registro* — registrarte en la campaña\n"
        "• *Registrar otra persona* — capturar datos de otra persona\n\n"
        "• *Ayuda* — instrucciones\n"
        "• *Cancelar* — detener el registro en curso"
    )


def _mostrar_menu_principal(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    *,
    id_usuario: str | None = None,
) -> None:
    _upsert_session(
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        PASO_INICIO,
        {},
        id_usuario,
    )
    _reply(bot_token, chat_id, _mensaje_bienvenida(), menu=True)


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


def _iniciar_flujo_registro(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    *,
    modo: str,
) -> None:
    datos: dict[str, Any] = {"_modo_registro": modo}
    _upsert_session(
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        PASO_NOMBRES,
        datos,
        None,
    )
    _avanzar_con_pregunta(
        bot_token,
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        None,
        PASO_NOMBRES,
        datos,
        mensaje_previo=_mensaje_inicio_registro(modo),
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
    _iniciar_flujo_registro(
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
    _siguiente_despues_de_campo(
        bot_token,
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        user_id,
        PASO_MUNICIPIO,
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
    _siguiente_despues_de_campo(
        bot_token,
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        user_id,
        PASO_PUESTO,
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
    _siguiente_despues_de_campo(
        bot_token,
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        user_id,
        PASO_LUGAR_TRABAJO,
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
    user_id: str | None,
    paso: str,
    datos: dict[str, Any],
    *,
    mensaje_previo: str | None = None,
) -> None:
    paso = _resolver_paso_destino(paso, datos) or PASO_CONFIRMAR
    if paso == PASO_CONFIRMAR:
        _mostrar_confirmacion(
            bot_token, client, campaign_id, chat_id, telegram_user_id, user_id, datos
        )
        return

    if paso == PASO_TIPO_DOCUMENTO:
        _upsert_session(
            client, campaign_id, chat_id, telegram_user_id, paso, datos, user_id
        )
        cuerpo = (
            f"{mensaje_previo}\n\n" if mensaje_previo else ""
        ) + (
            "¿Qué tipo de documento tiene?\n\n"
            f"{prompt_tipo_documento()}\n\n"
            "Responde con el número o las siglas (ej: CC)."
        )
        _reply(bot_token, chat_id, _encabezado(paso, cuerpo))
        return

    if paso == PASO_DOCUMENTO:
        _upsert_session(
            client, campaign_id, chat_id, telegram_user_id, paso, datos, user_id
        )
        _reply(
            bot_token,
            chat_id,
            _encabezado(
                paso,
                "¿Cuál es el *número de documento*?\n"
                "(Solo números, sin puntos ni espacios)",
            ),
        )
        return

    if paso == PASO_NOMBRES:
        _upsert_session(
            client, campaign_id, chat_id, telegram_user_id, paso, datos, user_id
        )
        _reply(
            bot_token,
            chat_id,
            _encabezado(
                paso,
                "¿Cuáles son sus *nombres*?\n(Ejemplo: Juan Carlos)",
            ),
        )
        return

    if paso == PASO_APELLIDOS:
        _upsert_session(
            client, campaign_id, chat_id, telegram_user_id, paso, datos, user_id
        )
        _reply(
            bot_token,
            chat_id,
            _encabezado(
                paso,
                "¿Cuáles son sus *apellidos*?\n(Ejemplo: Pérez Gómez)",
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
                "Escribe solo números, sin puntos ni espacios.\n\n"
                "Si esta persona es del *cargo más alto* (sin líder), "
                "responde *OMITIR*.",
            ),
        )
        return

    if paso == PASO_ROL:
        roles = _roles_disponibles_votante(datos, fetch_roles(client, campaign_id))
        if not roles:
            mensaje = (
                "No hay cargos disponibles para esta persona según el líder elegido. "
                "Corrige el *líder directo* o el *cargo*."
            )
            if _sin_lider_directo_en_sesion(datos):
                mensaje = (
                    "No hay cargos de jerarquía máxima configurados. "
                    "Pide a tu coordinador que revise los *roles*."
                )
            _reply(bot_token, chat_id, f"⚠️ {mensaje}")
            _upsert_session(
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                PASO_LIDER if datos.get("id_lider_directo") else PASO_ROL,
                datos,
                user_id,
            )
            return
        lista = lista_numerada(roles, etiqueta="rol")
        lider = datos.get("_lider_nombre", "—")
        contexto = (
            f"Líder directo: *{lider}*\n"
            "Solo puedes elegir cargos *por debajo* del líder.\n\n"
            if datos.get("id_lider_directo")
            else "Cargo de *jerarquía máxima* (sin líder directo).\n\n"
        )
        _upsert_session(
            client, campaign_id, chat_id, telegram_user_id, paso, datos, user_id
        )
        _reply(
            bot_token,
            chat_id,
            _pregunta_catalogo(
                paso,
                f"{contexto}¿Qué *cargo organizacional* tiene esta persona?",
                lista,
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


def _siguiente_despues_de_campo(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str | None,
    paso_completado: str,
    datos: dict[str, Any],
    *,
    paso_siguiente_forzado: str | None = None,
) -> None:
    if datos.pop("_retorno_confirmacion", False):
        _mostrar_confirmacion(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            datos,
        )
        return
    siguiente = paso_siguiente_forzado or _siguiente_paso_votante(paso_completado, datos)
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
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            datos,
        )


def _opciones_correccion(datos: dict[str, Any]) -> list[tuple[str, str]]:
    opciones: list[tuple[str, str]] = [
        ("Tipo de documento", PASO_TIPO_DOCUMENTO),
        ("Número de documento", PASO_DOCUMENTO),
        ("Nombres", PASO_NOMBRES),
        ("Apellidos", PASO_APELLIDOS),
        ("Fecha de nacimiento", PASO_FECHA_NACIMIENTO),
        ("Sexo", PASO_SEXO),
        ("Teléfono", PASO_TELEFONO),
        ("Dirección", PASO_DIRECCION),
        ("Municipio", PASO_MUNICIPIO),
        ("Puesto de votación", PASO_PUESTO),
        ("Mesa", PASO_MESA),
        ("Lugar de trabajo", PASO_LUGAR_TRABAJO),
        ("Líder directo", PASO_LIDER),
        ("Cargo organizacional", PASO_ROL),
    ]
    if _votante_sin_lider_directo(datos):
        opciones = [item for item in opciones if item[1] != PASO_LIDER]
    opciones.append(("Volver al resumen (sin cambios)", PASO_CONFIRMAR))
    return opciones


def _preparar_correccion_campo(paso: str, datos: dict[str, Any]) -> None:
    if paso == PASO_LIDER:
        _limpiar_rol_votante(datos)
    elif paso == PASO_MUNICIPIO:
        datos.pop("id_puesto_votacion", None)
        datos.pop("_puesto_nombre", None)
        datos.pop("_comuna_nombre", None)
        _limpiar_busqueda_municipio(datos)
        _limpiar_busqueda_puesto(datos)
    elif paso == PASO_PUESTO:
        datos.pop("id_puesto_votacion", None)
        datos.pop("_puesto_nombre", None)
        datos.pop("_comuna_nombre", None)
        _limpiar_busqueda_puesto(datos)


def _mostrar_menu_correccion(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str | None,
    datos: dict[str, Any],
) -> None:
    opciones = _opciones_correccion(datos)
    datos["_correccion_opciones"] = [paso for _, paso in opciones]
    lineas = [f"{idx}. {etiqueta}" for idx, (etiqueta, _) in enumerate(opciones, start=1)]
    _upsert_session(
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        PASO_ELEGIR_CORRECCION,
        datos,
        user_id,
    )
    _reply(
        bot_token,
        chat_id,
        "✏️ *¿Qué dato quieres corregir?*\n\n"
        + "\n".join(lineas)
        + "\n\nResponde con el *número* de la opción.\n"
        "El resto de los datos se conservan.",
    )


def _procesar_elegir_correccion(
    bot_token: str,
    client: Client,
    campaign_id: str,
    chat_id: int,
    telegram_user_id: int,
    user_id: str | None,
    datos: dict[str, Any],
    text: str,
) -> None:
    opciones = datos.get("_correccion_opciones") or []
    if not opciones:
        _mostrar_menu_correccion(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            datos,
        )
        return

    try:
        indice = int("".join(ch for ch in text.strip() if ch.isdigit()))
    except ValueError:
        indice = 0

    if indice < 1 or indice > len(opciones):
        _reply(
            bot_token,
            chat_id,
            f"Responde con un número del 1 al {len(opciones)}.",
        )
        return

    paso_destino = str(opciones[indice - 1])
    datos.pop("_correccion_opciones", None)

    if paso_destino == PASO_CONFIRMAR:
        _mostrar_confirmacion(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            datos,
        )
        return

    _preparar_correccion_campo(paso_destino, datos)
    datos["_retorno_confirmacion"] = True
    _avanzar_con_pregunta(
        bot_token,
        client,
        campaign_id,
        chat_id,
        telegram_user_id,
        user_id,
        paso_destino,
        datos,
    )


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
        f"• Líder directo: {_valor_resumen(datos.get('_lider_nombre'))}\n"
        f"• Rol: {_valor_resumen(datos.get('_rol_nombre'))}\n"
    )
    resumen += (
        "\n¿Los datos están bien?\n"
        "Responde *SÍ* para guardar o *NO* para corregir algún dato."
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
    telegram_user_id: int,
    user_id: str | None,
    datos: dict[str, Any],
) -> None:
    if _votante_sin_lider_directo(datos):
        _limpiar_lider_directo(datos)

    payload: dict[str, Any] = {
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
    }

    result = register_voter(
        client,
        campaign_id,
        user_id,
        payload,
    )

    nombre = f"{datos.get('nombres', '')} {datos.get('apellidos', '')}".strip()

    if result.get("outcome") == "created":
        _delete_session(client, campaign_id, chat_id)
        _reply(
            bot_token,
            chat_id,
            f"✅ ¡Listo! *{nombre}* quedó registrado(a).\n\n"
            "¿Quieres hacer otro registro?\n"
            "Elige *Mi propio registro* o *Registrar otra persona*.",
            menu=True,
        )
    elif result.get("outcome") == "quarantined":
        _delete_session(client, campaign_id, chat_id)
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
        error_text = " ".join(errors).lower()
        if any(
            palabra in error_text
            for palabra in ("líder", "lider", "cargo", "jerarquía", "jerarquia")
        ):
            _reply(
                bot_token,
                chat_id,
                f"⚠️ {errors[0]}\n\n"
                "Corrige el *líder directo* o el *cargo organizacional*.",
            )
            _mostrar_menu_correccion(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                datos,
            )
            return
        _delete_session(client, campaign_id, chat_id)
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
    comando = _normalizar_comando(text)
    if comando in ("cancelar", "/cancelar"):
        _cancelar_sesion(bot_token, client, campaign_id, chat_id)
        return
    if comando in ("reiniciar", "/reiniciar"):
        _reiniciar_sesion(
            bot_token, client, campaign_id, chat_id, telegram_user_id
        )
        return

    if paso == PASO_ELEGIR_CORRECCION:
        _procesar_elegir_correccion(
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

    if paso == PASO_NOMBRES:
        if len(text) < 2:
            _reply(bot_token, chat_id, "Escribe al menos 2 letras en los nombres.")
            return
        datos["nombres"] = text.strip()
        if datos.pop("_retorno_confirmacion", False):
            _mostrar_confirmacion(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                datos,
            )
            return
        _siguiente_despues_de_campo(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            PASO_NOMBRES,
            datos,
            paso_siguiente_forzado=PASO_APELLIDOS,
        )
        return

    if paso == PASO_APELLIDOS:
        if len(text) < 2:
            _reply(bot_token, chat_id, "Escribe al menos 2 letras en los apellidos.")
            return
        datos["apellidos"] = text.strip()
        _siguiente_despues_de_campo(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            PASO_APELLIDOS,
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
        if datos.pop("_retorno_confirmacion", False):
            _mostrar_confirmacion(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                datos,
            )
            return
        _siguiente_despues_de_campo(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            PASO_TIPO_DOCUMENTO,
            datos,
            paso_siguiente_forzado=PASO_DOCUMENTO,
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
        if datos.pop("_retorno_confirmacion", False):
            _mostrar_confirmacion(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                datos,
            )
            return
        _siguiente_despues_de_campo(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            PASO_DOCUMENTO,
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
        _siguiente_despues_de_campo(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            PASO_FECHA_NACIMIENTO,
            datos,
            paso_siguiente_forzado=PASO_SEXO,
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
        _siguiente_despues_de_campo(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            PASO_SEXO,
            datos,
            paso_siguiente_forzado=PASO_TELEFONO,
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
        _siguiente_despues_de_campo(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            PASO_TELEFONO,
            datos,
            paso_siguiente_forzado=PASO_DIRECCION,
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
        _siguiente_despues_de_campo(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            PASO_DIRECCION,
            datos,
            paso_siguiente_forzado=PASO_MUNICIPIO,
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
        items = _roles_disponibles_votante(datos, fetch_roles(client, campaign_id))
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
            _reply(
                bot_token,
                chat_id,
                "Ese cargo no está permitido con el líder elegido. "
                "Elige otro de la lista o corrige el líder directo.",
            )
            return
        datos["id_rol"] = item_id
        datos["_rol_nombre"] = etiqueta_rol(item) if item else etiqueta
        datos["_voter_rol_nivel"] = item.get("nivel_jerarquia")
        if _votante_sin_lider_directo(datos):
            _limpiar_lider_directo(datos)
        _siguiente_despues_de_campo(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            PASO_ROL,
            datos,
        )
        return

    if paso == PASO_LIDER:
        if es_omitir(text):
            _marcar_sin_lider_directo(datos)
            _siguiente_despues_de_campo(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                PASO_LIDER,
                datos,
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

        estado, lider = buscar_lider_por_documento(
            client,
            campaign_id,
            documento_lider,
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
                "No encontré a nadie *registrado* con ese documento.\n"
                "Verifica el número o registra primero al líder en la campaña.",
            )
            return
        if estado == "jerarquia_invalida" or not lider:
            _reply(
                bot_token,
                chat_id,
                "No se pudo validar el líder. Verifica el documento e inténtalo de nuevo:",
            )
            return

        _aplicar_lider_directo(datos, lider)
        _reply(
            bot_token,
            chat_id,
            f"✅ Líder: *{lider.get('nombre', '')}* — {lider.get('documento', documento_lider)}",
        )
        _siguiente_despues_de_campo(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            PASO_LIDER,
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
        _siguiente_despues_de_campo(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            PASO_MESA,
            datos,
        )
        return

    if paso == PASO_CONFIRMAR:
        cmd = _normalizar_comando(text)
        if cmd == "no":
            _mostrar_menu_correccion(
                bot_token,
                client,
                campaign_id,
                chat_id,
                telegram_user_id,
                user_id,
                datos,
            )
            return
        if cmd not in ("si", "sí", "s", "yes", "ok"):
            _reply(
                bot_token,
                chat_id,
                "Por favor responde *SÍ* para guardar o *NO* para corregir algún dato.",
            )
            return
        _guardar_y_responder(
            bot_token,
            client,
            campaign_id,
            chat_id,
            telegram_user_id,
            user_id,
            datos,
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

    if comando in ("cancelar", "/cancelar"):
        _cancelar_sesion(bot_token, client, campaign_id, chat_id)
        return {"status": "ok"}

    if comando in ("reiniciar", "/reiniciar"):
        _reiniciar_sesion(
            bot_token, client, campaign_id, chat_id, telegram_user_id
        )
        return {"status": "ok"}

    if comando in ("ayuda", "/ayuda", "/help"):
        _reply(
            bot_token,
            chat_id,
            "📖 *Cómo usar este bot*\n\n"
            "1️⃣ Elige una opción:\n"
            "   • *Mi propio registro* — registrarte en la campaña\n"
            "   • *Registrar otra persona* — capturar datos de otra persona\n\n"
            "2️⃣ Responde cada pregunta hasta completar el registro.\n\n"
            "3️⃣ Revisa el resumen y responde *SÍ* para guardar.\n\n"
            "Si algo no está bien, responde *NO* y elige el dato a corregir.\n"
            "*Cancelar* detiene el registro y vuelve al menú.\n"
            "*Reiniciar* borra un borrador incompleto y empieza de cero.",
            menu=not _sesion_registro_activa(session),
            flow=_sesion_registro_activa(session),
        )
        return {"status": "ok"}

    if comando in ("start", "/start"):
        if _sesion_registro_activa(session):
            _reply(
                bot_token,
                chat_id,
                "Tienes un registro en curso.\n\n"
                "• Continúa respondiendo la pregunta actual\n"
                "• Toca *Cancelar* para salir al menú\n"
                "• Escribe *Reiniciar* para borrar el borrador y empezar de cero",
                menu=True,
                flow=False,
            )
            return {"status": "ok"}
        _mostrar_menu_principal(
            bot_token, client, campaign_id, chat_id, telegram_user_id
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
