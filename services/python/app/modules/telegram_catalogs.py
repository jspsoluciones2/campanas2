from __future__ import annotations

import re
from typing import Any, Literal

from supabase import Client

from app.adapters.supabase_client import row_or_none
from app.modules.voter_normalize import normalizar_documento
from app.modules.voter_registry import estados_votante_para_consulta

SKIP_WORDS = {
    "saltar",
    "omitir",
    "no",
    "no se",
    "nose",
    "ninguno",
    "ninguna",
    "-",
    "s/o",
    "so",
    "sin",
    "vacio",
    "vacío",
}

TIPOS_DOCUMENTO: list[tuple[str, str]] = [
    ("CC", "Cédula de ciudadanía"),
    ("TI", "Tarjeta de identidad"),
    ("CE", "Cédula de extranjería"),
    ("PA", "Pasaporte"),
    ("PEP", "Permiso especial de permanencia"),
    ("PPT", "Permiso por protección temporal"),
]

MAX_LISTA_TELEGRAM = 40
CATALOGO_LISTA_DIRECTA_MAX = 15
CATALOGO_BUSQUEDA_MAX = 15
PUESTOS_LISTA_DIRECTA_MAX = CATALOGO_LISTA_DIRECTA_MAX
PUESTOS_BUSQUEDA_MAX = CATALOGO_BUSQUEDA_MAX


def es_omitir(texto: str) -> bool:
    return texto.strip().lower() in SKIP_WORDS


def fetch_lugares_trabajo(
    client: Client,
    campaign_id: str,
    *,
    id_comuna: str | None = None,
) -> list[dict[str, Any]]:
    query = (
        client.table("lugares_trabajo")
        .select("id, nombre, id_comuna")
        .eq("id_campana", campaign_id)
        .order("nombre")
    )
    if id_comuna:
        query = query.eq("id_comuna", id_comuna)
    result = query.limit(500).execute()
    return result.data or []


def fetch_roles(client: Client, campaign_id: str) -> list[dict[str, Any]]:
    result = (
        client.table("roles")
        .select("id, nombre, nivel_jerarquia")
        .eq("id_campana", campaign_id)
        .order("nivel_jerarquia")
        .limit(MAX_LISTA_TELEGRAM)
        .execute()
    )
    return result.data or []


def fetch_comunas(client: Client, campaign_id: str) -> list[dict[str, Any]]:
    result = (
        client.table("comunas")
        .select("id, nombre")
        .eq("id_campana", campaign_id)
        .order("nombre")
        .limit(MAX_LISTA_TELEGRAM)
        .execute()
    )
    return result.data or []


def fetch_municipios(client: Client, campaign_id: str) -> list[dict[str, Any]]:
    result = (
        client.table("puestos_votacion")
        .select("municipio")
        .eq("id_campana", campaign_id)
        .order("municipio")
        .limit(2000)
        .execute()
    )
    vistos: set[str] = set()
    items: list[dict[str, Any]] = []
    for row in result.data or []:
        nombre = str(row.get("municipio") or "").strip()
        if not nombre:
            continue
        clave = nombre.casefold()
        if clave in vistos:
            continue
        vistos.add(clave)
        items.append({"id": nombre, "nombre": nombre})
    return items


def fetch_puestos(
    client: Client,
    campaign_id: str,
    *,
    municipio: str | None = None,
) -> list[dict[str, Any]]:
    query = (
        client.table("puestos_votacion")
        .select("id, nombre, municipio, direccion, id_comuna, comunas(nombre)")
        .eq("id_campana", campaign_id)
        .order("nombre")
    )
    if municipio:
        query = query.eq("municipio", municipio)
    result = query.limit(500).execute()
    return result.data or []


def _palabras_busqueda(texto: str) -> list[str]:
    limpio = texto.strip().lower()
    palabras = [p for p in re.split(r"[\s,;.]+", limpio) if len(p) >= 2]
    return palabras if palabras else ([limpio] if len(limpio) >= 2 else [])


def _puntuar_nombre(nombre: str, texto: str, palabras: list[str]) -> int:
    normalizado = nombre.lower()
    consulta = texto.strip().lower()
    puntaje = 0

    if consulta and consulta in normalizado:
        puntaje += 50
    if consulta and normalizado.startswith(consulta):
        puntaje += 30

    for palabra in palabras:
        if palabra in normalizado:
            puntaje += 15
        for parte in re.split(r"[\s\-/]+", normalizado):
            if parte.startswith(palabra):
                puntaje += 8

    return puntaje


def buscar_por_coincidencia(
    items: list[dict[str, Any]],
    texto: str,
    *,
    limite: int = CATALOGO_BUSQUEDA_MAX,
) -> list[dict[str, Any]]:
    consulta = texto.strip()
    if len(consulta) < 2:
        return []

    palabras = _palabras_busqueda(consulta)
    rankeados: list[tuple[int, str, dict[str, Any]]] = []

    for item in items:
        nombre = str(item.get("nombre", ""))
        puntaje = _puntuar_nombre(nombre, consulta, palabras)
        if puntaje > 0:
            rankeados.append((puntaje, nombre.lower(), item))

    rankeados.sort(key=lambda row: (-row[0], row[1]))
    return [row[2] for row in rankeados[:limite]]


def buscar_puestos_relevantes(
    puestos: list[dict[str, Any]],
    texto: str,
    *,
    limite: int = CATALOGO_BUSQUEDA_MAX,
) -> list[dict[str, Any]]:
    consulta = texto.strip()
    if len(consulta) < 2:
        return []

    palabras = _palabras_busqueda(consulta)
    rankeados: list[tuple[int, str, dict[str, Any]]] = []

    for item in puestos:
        nombre = str(item.get("nombre", ""))
        direccion = str(item.get("direccion", ""))
        puntaje = _puntuar_nombre(nombre, consulta, palabras)
        if direccion:
            puntaje += _puntuar_nombre(direccion, consulta, palabras) // 2
        if puntaje > 0:
            rankeados.append((puntaje, nombre.lower(), item))

    rankeados.sort(key=lambda row: (-row[0], row[1]))
    return [row[2] for row in rankeados[:limite]]


def fetch_lideres(
    client: Client,
    campaign_id: str,
    *,
    max_nivel_jerarquia: int | None = None,
) -> list[dict[str, Any]]:
    result = (
        client.table("votantes")
        .select("id, nombres, apellidos, documento, id_rol, roles(nivel_jerarquia, nombre)")
        .eq("id_campana", campaign_id)
        .in_("estado", estados_votante_para_consulta(client))
        .order("apellidos")
        .limit(MAX_LISTA_TELEGRAM)
        .execute()
    )
    rows = result.data or []
    filtrados: list[dict[str, Any]] = []
    for row in rows:
        rel = row.get("roles")
        if isinstance(rel, list):
            rel = rel[0] if rel else None
        nivel = (
            int(rel["nivel_jerarquia"])
            if rel and rel.get("nivel_jerarquia") is not None
            else 99
        )
        row["nombre"] = f"{row.get('apellidos', '')} {row.get('nombres', '')}".strip()
        row["nivel_jerarquia"] = nivel
        if max_nivel_jerarquia is not None and nivel >= max_nivel_jerarquia:
            continue
        filtrados.append(row)
    return filtrados


def buscar_lider_por_documento(
    client: Client,
    campaign_id: str,
    documento: str,
    *,
    max_nivel_jerarquia: int | None = None,
    documento_excluir: str | None = None,
) -> tuple[
    Literal["ok", "no_encontrado", "jerarquia_invalida", "mismo_documento"],
    dict[str, Any] | None,
]:
    doc = normalizar_documento(documento)
    if documento_excluir and doc == normalizar_documento(documento_excluir):
        return "mismo_documento", None

    result = (
        client.table("votantes")
        .select("id, nombres, apellidos, documento, id_rol, roles(nivel_jerarquia, nombre)")
        .eq("id_campana", campaign_id)
        .eq("documento", doc)
        .in_("estado", estados_votante_para_consulta(client))
        .limit(1)
        .execute()
    )
    row = (result.data or [None])[0]
    if not row:
        return "no_encontrado", None

    rel = row.get("roles")
    if isinstance(rel, list):
        rel = rel[0] if rel else None
    nivel = (
        int(rel["nivel_jerarquia"])
        if rel and rel.get("nivel_jerarquia") is not None
        else 99
    )
    row["nivel_jerarquia"] = nivel
    row["nombre"] = f"{row.get('apellidos', '')} {row.get('nombres', '')}".strip()

    if max_nivel_jerarquia is not None and nivel >= max_nivel_jerarquia:
        return "jerarquia_invalida", row

    return "ok", row


def etiqueta_rol(rol: dict[str, Any]) -> str:
    nivel = rol.get("nivel_jerarquia")
    nombre = rol.get("nombre", "")
    if nivel is None:
        return nombre
    return f"{nombre} (Jerarquía {nivel})"


def roles_bajo_jerarquia(
    roles: list[dict[str, Any]], nivel_recolector: int
) -> list[dict[str, Any]]:
    """Jerarquía 1 = más alto. Solo roles con número mayor (más abajo en el árbol)."""
    return [
        rol
        for rol in roles
        if rol.get("nivel_jerarquia") is not None
        and int(rol["nivel_jerarquia"]) > nivel_recolector
    ]


def rol_por_id(
    client: Client, campaign_id: str, rol_id: str
) -> dict[str, Any] | None:
    result = (
        client.table("roles")
        .select("id, nombre, nivel_jerarquia")
        .eq("id_campana", campaign_id)
        .eq("id", rol_id)
        .maybe_single()
        .execute()
    )
    return row_or_none(result)


def lista_numerada(
    items: list[dict[str, Any]],
    *,
    etiqueta: str = "nombre",
    vacio: str = "No hay opciones cargadas en la campaña.",
) -> str:
    if not items:
        return vacio
    lineas = []
    for i, item in enumerate(items, start=1):
        if etiqueta == "rol":
            texto = etiqueta_rol(item)
        elif etiqueta == "lider":
            texto = f"{item.get('nombre', '')} — {item.get('documento', '')}"
        else:
            texto = str(item.get(etiqueta, ""))
        lineas.append(f"{i}. {texto}")
    return "\n".join(lineas)


def resolver_por_numero_o_texto(
    items: list[dict[str, Any]],
    texto: str,
    *,
    campo_busqueda: str = "nombre",
) -> tuple[Literal["ok", "omitir", "invalido", "ambiguo"], str | None, str | None]:
    if es_omitir(texto):
        return "omitir", None, None

    limpio = texto.strip()
    if limpio.isdigit():
        idx = int(limpio)
        if 1 <= idx <= len(items):
            item = items[idx - 1]
            etiqueta = _etiqueta_item(item, campo_busqueda)
            return "ok", item["id"], etiqueta
        return "invalido", None, None

    lower = limpio.lower()
    coincidencias: list[dict[str, Any]] = []
    for item in items:
        nombre = str(item.get(campo_busqueda, "")).lower()
        documento = str(item.get("documento", "")).lower()
        if lower in nombre or (documento and lower in documento):
            coincidencias.append(item)

    if len(coincidencias) == 1:
        item = coincidencias[0]
        return "ok", item["id"], _etiqueta_item(item, campo_busqueda)

    if len(coincidencias) > 1:
        return "ambiguo", None, None

    return "invalido", None, None


def resolver_tipo_documento(texto: str) -> tuple[Literal["ok", "invalido"], str | None]:
    limpio = texto.strip().upper()
    if limpio.isdigit():
        idx = int(limpio)
        if 1 <= idx <= len(TIPOS_DOCUMENTO):
            return "ok", TIPOS_DOCUMENTO[idx - 1][0]
        return "invalido", None

    alias = {
        "CC": "CC",
        "CEDULA": "CC",
        "CÉDULA": "CC",
        "CIUDADANIA": "CC",
        "CIUDADANÍA": "CC",
        "TI": "TI",
        "TARJETA": "TI",
        "CE": "CE",
        "EXTRANJERIA": "CE",
        "EXTRANJERÍA": "CE",
        "PA": "PA",
        "PASAPORTE": "PA",
        "PEP": "PEP",
        "PPT": "PPT",
    }
    codigo = alias.get(limpio)
    if codigo:
        return "ok", codigo
    for code, label in TIPOS_DOCUMENTO:
        if limpio == code or limpio in label.upper():
            return "ok", code
    return "invalido", None


def prompt_tipo_documento() -> str:
    lineas = [f"{i}. {code} — {label}" for i, (code, label) in enumerate(TIPOS_DOCUMENTO, 1)]
    return "\n".join(lineas)


def resolver_sexo(texto: str) -> tuple[Literal["ok", "omitir", "invalido"], str | None]:
    if es_omitir(texto):
        return "omitir", None
    limpio = texto.strip().lower()
    if limpio in ("1", "hombre", "masculino", "m", "h"):
        return "ok", "Masculino"
    if limpio in ("2", "mujer", "femenino", "f"):
        return "ok", "Femenino"
    return "invalido", None


def parse_fecha_nacimiento(texto: str) -> tuple[Literal["ok", "omitir", "invalido"], str | None]:
    if es_omitir(texto):
        return "omitir", None

    limpio = texto.strip()
    match = re.match(r"^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$", limpio)
    if match:
        d, m, y = match.groups()
        return "ok", f"{int(y):04d}-{int(m):02d}-{int(d):02d}"

    match = re.match(r"^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$", limpio)
    if match:
        y, m, d = match.groups()
        return "ok", f"{int(y):04d}-{int(m):02d}-{int(d):02d}"

    return "invalido", None


def _etiqueta_item(item: dict[str, Any], campo: str) -> str:
    if campo == "rol":
        return etiqueta_rol(item)
    if campo == "lider":
        return f"{item.get('nombre', '')} — {item.get('documento', '')}"
    return str(item.get(campo, ""))
