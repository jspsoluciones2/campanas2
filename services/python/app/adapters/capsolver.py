"""Adaptador CapSolver — basado en bulk_validator_async.py (ProxyLess + proxy opcional)."""

from __future__ import annotations

import time
from typing import Any, TypedDict

import requests

DEFAULT_WEBSITE_URL = "https://eleccionescolombia.registraduria.gov.co/identificacion"
DEFAULT_API_BASE = "https://api.capsolver.com"


class CapsolverConfig(TypedDict, total=False):
    api_key: str
    base_url: str
    website_url: str
    website_key: str
    usar_proxy: bool
    proxy_type: str
    proxy_address: str
    proxy_port: int
    proxy_login: str
    proxy_password: str


def build_create_task_payload(
    config: CapsolverConfig,
    *,
    website_url: str | None = None,
    website_key: str | None = None,
) -> dict[str, Any] | None:
    api_key = (config.get("api_key") or "").strip()
    site_key = (website_key or config.get("website_key") or "").strip()
    if not api_key or not site_key:
        return None

    usar_proxy = config.get("usar_proxy") is not False
    page_url = (website_url or config.get("website_url") or DEFAULT_WEBSITE_URL).strip()

    task: dict[str, Any] = {
        "type": "ReCaptchaV2Task" if usar_proxy else "ReCaptchaV2TaskProxyLess",
        "websiteURL": page_url,
        "websiteKey": site_key,
    }

    if usar_proxy:
        address = (config.get("proxy_address") or "").strip()
        port = config.get("proxy_port")
        if address and port:
            task["proxyType"] = (config.get("proxy_type") or "http").strip()
            task["proxyAddress"] = address
            task["proxyPort"] = port
            login = (config.get("proxy_login") or "").strip()
            password = (config.get("proxy_password") or "").strip()
            if login:
                task["proxyLogin"] = login
            if password:
                task["proxyPassword"] = password

    return {"clientKey": api_key, "task": task}


class CapSolverService:
    """createTask → poll getTaskResult (mismo flujo que bulk_validator_async.py)."""

    def __init__(self, config: CapsolverConfig):
        self.config = config
        base = (config.get("base_url") or DEFAULT_API_BASE).rstrip("/")
        self.create_url = f"{base}/createTask"
        self.result_url = f"{base}/getTaskResult"
        self.api_key = (config.get("api_key") or "").strip()

    def solve(
        self,
        website_url: str,
        website_key: str,
        *,
        timeout_seconds: int = 300,
        poll_interval: float = 3.0,
    ) -> str | None:
        payload = build_create_task_payload(
            self.config,
            website_url=website_url,
            website_key=website_key,
        )
        if not payload:
            return None

        try:
            create_res = requests.post(self.create_url, json=payload, timeout=30)
            create_data = create_res.json()

            if create_data.get("errorId"):
                return None

            task_id = create_data.get("taskId")
            if not task_id:
                return None

            deadline = time.time() + timeout_seconds
            while time.time() < deadline:
                time.sleep(poll_interval)
                result = requests.post(
                    self.result_url,
                    json={"clientKey": self.api_key, "taskId": task_id},
                    timeout=30,
                ).json()

                if result.get("status") == "ready":
                    token = result.get("solution", {}).get("gRecaptchaResponse")
                    return token if token else None

                if result.get("status") == "failed" or result.get("errorId"):
                    return None

            return None
        except Exception:
            return None
