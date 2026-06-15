import json

from flask import Blueprint, jsonify, request

from app.adapters.supabase_client import get_service_client, row_or_none
from app.modules.telegram_capture import handle_telegram_update

telegram_bp = Blueprint("telegram", __name__)


def _integration_secret(client, campaign_id: str) -> str | None:
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
        config = raw
    else:
        try:
            config = json.loads(raw)
        except json.JSONDecodeError:
            return None
    secret = config.get("webhook_secret")
    return str(secret) if secret else None


@telegram_bp.route("/telegram/webhook/<campaign_id>", methods=["POST"])
def telegram_webhook(campaign_id: str):
    client = get_service_client()
    if not client:
        return jsonify({"error": "supabase_not_configured"}), 503

    try:
        expected_secret = _integration_secret(client, campaign_id)
    except Exception:
        return jsonify({"error": "supabase_query_failed"}), 503

    received_secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token")

    update = request.get_json(silent=True) or {}
    try:
        result = handle_telegram_update(
            client,
            campaign_id,
            update,
            expected_secret=expected_secret,
            received_secret=received_secret,
        )
    except Exception:
        return jsonify({"error": "handler_failed"}), 500

    status = result.get("status", "ok")
    if status == "forbidden":
        return jsonify({"error": "forbidden"}), 403
    if status == "disabled":
        return jsonify({"error": "disabled"}), 404
    if status == "misconfigured":
        return jsonify({"error": "misconfigured"}), 503

    return jsonify({"ok": True}), 200
