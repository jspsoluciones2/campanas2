import os
from functools import lru_cache

from supabase import Client, create_client

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")


@lru_cache(maxsize=1)
def get_service_client() -> Client | None:
    if not SUPABASE_URL or not SERVICE_ROLE_KEY:
        return None
    return create_client(SUPABASE_URL, SERVICE_ROLE_KEY)
