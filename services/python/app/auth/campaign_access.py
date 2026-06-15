from supabase import Client

from app.adapters.supabase_client import row_or_none


def user_can_read_campaign(client: Client, user_id: str, campaign_id: str) -> bool:
    if _is_platform_owner(client, user_id):
        return True
    return _has_campaign_membership(client, user_id, campaign_id)


def user_can_edit_campaign(client: Client, user_id: str, campaign_id: str) -> bool:
    if _is_platform_owner(client, user_id):
        return True
    return _has_campaign_role(
        client, user_id, campaign_id, ("editor", "administrador_campana")
    )


def _is_platform_owner(client: Client, user_id: str) -> bool:
    result = (
        client.table("miembros_plataforma")
        .select("rol")
        .eq("id_usuario", user_id)
        .maybe_single()
        .execute()
    )
    return bool(row_or_none(result))


def _has_campaign_membership(
    client: Client, user_id: str, campaign_id: str
) -> bool:
    result = (
        client.table("miembros_campana")
        .select("id")
        .eq("id_usuario", user_id)
        .eq("id_campana", campaign_id)
        .maybe_single()
        .execute()
    )
    return bool(row_or_none(result))


def _has_campaign_role(
    client: Client, user_id: str, campaign_id: str, roles: tuple[str, ...]
) -> bool:
    result = (
        client.table("miembros_campana")
        .select("rol")
        .eq("id_usuario", user_id)
        .eq("id_campana", campaign_id)
        .maybe_single()
        .execute()
    )
    data = row_or_none(result)
    if not data:
        return False
    return data.get("rol") in roles
