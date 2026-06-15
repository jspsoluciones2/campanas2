from flask import Blueprint, g, jsonify, request

from app.adapters.supabase_client import get_service_client
from app.auth.campaign_access import user_can_edit_campaign
from app.auth.jwt import require_auth
from app.modules.voter_registry import register_voter

voters_bp = Blueprint("voters", __name__)


@voters_bp.route("/campaigns/<campaign_id>/voters/register", methods=["POST"])
@require_auth
def register_campaign_voter(campaign_id: str):
    client = get_service_client()
    if not client:
        return jsonify({"error": "supabase_not_configured"}), 503

    user_id = g.user_id
    if not user_can_edit_campaign(client, user_id, campaign_id):
        return jsonify({"error": "forbidden"}), 403

    body = request.get_json(silent=True) or {}
    result = register_voter(client, campaign_id, user_id, body)

    if result.get("outcome") == "validation_error":
        return jsonify(result), 400

    status = 201 if result.get("outcome") == "created" else 202
    return jsonify(result), status
