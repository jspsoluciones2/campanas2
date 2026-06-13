from flask import Blueprint, g, jsonify

from app.auth.jwt import require_auth

platform_bp = Blueprint("platform", __name__)


@platform_bp.route("/me", methods=["GET"])
@require_auth
def me():
    return jsonify({"user_id": g.user_id})


@platform_bp.route("/export/<campaign_id>", methods=["POST"])
@require_auth
def export_campaign(campaign_id: str):
    # Phase 1.6 — stub
    return jsonify(
        {
            "status": "pending",
            "campaign_id": campaign_id,
            "message": "Export ZIP — implementación en Phase 1.6",
        }
    ), 202


@platform_bp.route("/purge/<campaign_id>", methods=["POST"])
@require_auth
def purge_campaign(campaign_id: str):
    # Phase 1.8 — stub
    return jsonify(
        {
            "status": "pending",
            "campaign_id": campaign_id,
            "message": "Purga manual — implementación en Phase 1.8",
        }
    ), 202
