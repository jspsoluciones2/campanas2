import os
from pathlib import Path

from dotenv import load_dotenv

_root = Path(__file__).resolve().parents[2]
load_dotenv(_root / ".env")
# .env.local tiene las credenciales reales de producción; debe ganar sobre placeholders en .env
load_dotenv(_root / "apps" / "web" / ".env.local", override=True)

from app import create_app  # noqa: E402

app = create_app()