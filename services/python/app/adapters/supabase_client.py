import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from supabase import Client, create_client

_env_loaded = False


def _load_env() -> None:
    global _env_loaded
    if _env_loaded:
        return
    root = Path(__file__).resolve().parents[4]
    load_dotenv(root / ".env")
    load_dotenv(root / "apps" / "web" / ".env.local", override=True)
    _env_loaded = True


@lru_cache(maxsize=1)
def get_service_client() -> Client | None:
    _load_env()
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key or key == "PEGA_AQUI_TU_SERVICE_ROLE_KEY":
        return None
    return create_client(url, key)


def row_or_none(result) -> dict | None:
    """Supabase-py puede devolver None en maybe_single() cuando no hay filas."""
    if result is None:
        return None
    return result.data
