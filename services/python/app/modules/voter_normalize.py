import re
from difflib import SequenceMatcher


def normalizar_documento(documento: str) -> str:
    return re.sub(r"\D", "", documento.strip())


def normalizar_telefono(telefono: str | None) -> str | None:
    if not telefono:
        return None
    digits = re.sub(r"\D", "", telefono.strip())
    if not digits:
        return None
    if digits.startswith("57") and len(digits) >= 12:
        return f"+{digits}"
    if len(digits) == 10:
        return f"+57{digits}"
    if len(digits) == 11 and digits.startswith("3"):
        return f"+57{digits}"
    return f"+{digits}"


def nombre_completo(nombres: str, apellidos: str) -> str:
    return f"{apellidos} {nombres}".strip().lower()


def similitud_nombre(nombres_a: str, apellidos_a: str, nombres_b: str, apellidos_b: str) -> float:
    a = nombre_completo(nombres_a, apellidos_a)
    b = nombre_completo(nombres_b, apellidos_b)
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a, b).ratio()
