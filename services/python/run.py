import os
from pathlib import Path

from dotenv import load_dotenv

from app import create_app

_root = Path(__file__).resolve().parents[2]
load_dotenv(_root / ".env")
# .env.local tiene las credenciales reales de desarrollo; debe ganar sobre placeholders en .env
load_dotenv(_root / "apps" / "web" / ".env.local", override=True)

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=os.getenv("FLASK_DEBUG", "1") == "1")
