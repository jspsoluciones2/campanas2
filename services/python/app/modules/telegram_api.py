from __future__ import annotations

import os
from typing import Any

import requests

TELEGRAM_API = "https://api.telegram.org/bot{token}/{method}"


MAIN_MENU_KEYBOARD: dict[str, Any] = {
    "keyboard": [
        [{"text": "Mi propio registro"}],
        [{"text": "Registrar otra persona"}],
        [{"text": "Ayuda"}, {"text": "Cancelar"}],
    ],
    "resize_keyboard": True,
    "is_persistent": True,
}


def send_message(
    bot_token: str,
    chat_id: int | str,
    text: str,
    *,
    parse_mode: str | None = None,
    reply_markup: dict[str, Any] | None = None,
) -> bool:
    payload: dict[str, Any] = {
        "chat_id": chat_id,
        "text": text,
    }
    if parse_mode:
        payload["parse_mode"] = parse_mode
    if reply_markup:
        payload["reply_markup"] = reply_markup

    try:
        response = requests.post(
            TELEGRAM_API.format(token=bot_token, method="sendMessage"),
            json=payload,
            timeout=15,
        )
        data = response.json()
        return bool(data.get("ok"))
    except requests.RequestException:
        return False


def extract_message(update: dict[str, Any]) -> dict[str, Any] | None:
    message = update.get("message")
    if not isinstance(message, dict):
        return None
    return message


def message_text(message: dict[str, Any]) -> str:
    return str(message.get("text") or "").strip()


def chat_id_from_message(message: dict[str, Any]) -> int | None:
    chat = message.get("chat")
    if not isinstance(chat, dict):
        return None
    chat_id = chat.get("id")
    return int(chat_id) if chat_id is not None else None


def telegram_user_from_message(message: dict[str, Any]) -> dict[str, Any] | None:
    user = message.get("from")
    if not isinstance(user, dict):
        return None
    user_id = user.get("id")
    if user_id is None:
        return None
    return {
        "id": int(user_id),
        "username": user.get("username"),
    }
