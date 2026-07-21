import re
from datetime import date
from difflib import SequenceMatcher


def normalizar_documento(documento: str) -> str:
    return re.sub(r"\D", "", documento.strip())


def edad_en_anos(fecha_nacimiento: str, *, referencia: date | None = None) -> int | None:
    try:
        nacimiento = date.fromisoformat(fecha_nacimiento[:10])
    except ValueError:
        return None

    hoy = referencia or date.today()
    edad = hoy.year - nacimiento.year
    if (hoy.month, hoy.day) < (nacimiento.month, nacimiento.day):
        edad -= 1
    return edad


def es_mayor_o_igual_18(fecha_nacimiento: str, *, referencia: date | None = None) -> bool:
    edad = edad_en_anos(fecha_nacimiento, referencia=referencia)
    return edad is not None and edad >= 18


def error_cc_menor_edad(tipo_documento: str, fecha_nacimiento: str | None) -> str | None:
    if (tipo_documento or "").upper() != "CC":
        return None
    if not fecha_nacimiento:
        return None
    if es_mayor_o_igual_18(fecha_nacimiento):
        return None
    return (
        "Menores de 18 años no pueden tener cédula de ciudadanía (CC). "
        "Use tarjeta de identidad (TI)."
    )


def normalizar_telefono(telefono: str | None) -> str | None:
    if not telefono:
        return None
    digits = re.sub(r"\D", "", telefono.strip())
    if not digits:
        return None
    if digits.startswith("57") and len(digits) == 12:
        mobile = digits[2:]
    elif len(digits) == 10:
        mobile = digits
    else:
        return None
    if len(mobile) != 10 or mobile[0] != "3":
        return None
    return f"+57{mobile}"


def error_telefono_invalido(telefono: str | None) -> str | None:
    if not telefono or not str(telefono).strip():
        return None
    if not normalizar_telefono(telefono):
        return (
            "Celular inválido. Use 10 dígitos que empiecen por 3 "
            "(ej: 3001234567)."
        )
    return None


def nombre_completo(nombres: str, apellidos: str) -> str:
    return f"{apellidos} {nombres}".strip().lower()


def similitud_nombre(nombres_a: str, apellidos_a: str, nombres_b: str, apellidos_b: str) -> float:
    a = nombre_completo(nombres_a, apellidos_a)
    b = nombre_completo(nombres_b, apellidos_b)
    if not a or not b:
        return 0.0
    return SequenceMatcher(None, a, b).ratio()
