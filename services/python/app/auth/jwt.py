import os
from functools import wraps
from typing import Callable

import jwt
from flask import Request, g, jsonify, request
from jwt import PyJWKClient

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "")
JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json" if SUPABASE_URL else ""

_jwks_client: PyJWKClient | None = None


def _get_jwks_client() -> PyJWKClient | None:
    global _jwks_client
    if not JWKS_URL:
        return None
    if _jwks_client is None:
        _jwks_client = PyJWKClient(JWKS_URL)
    return _jwks_client


def get_bearer_token(req: Request) -> str | None:
    auth = req.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        return auth[7:].strip()
    return None


def verify_supabase_jwt(token: str) -> dict | None:
    client = _get_jwks_client()
    if not client or not SUPABASE_URL:
        return None
    try:
        signing_key = client.get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256", "HS256"],
            audience="authenticated",
            options={"verify_aud": True},
        )
    except jwt.PyJWTError:
        return None


def require_auth(f: Callable):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = get_bearer_token(request)
        if not token:
            return jsonify({"error": "missing_token"}), 401
        claims = verify_supabase_jwt(token)
        if not claims:
            return jsonify({"error": "invalid_token"}), 401
        g.user_id = claims.get("sub")
        g.jwt_claims = claims
        return f(*args, **kwargs)

    return decorated
