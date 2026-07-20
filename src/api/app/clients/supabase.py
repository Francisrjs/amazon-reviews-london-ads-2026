from __future__ import annotations

from typing import Any
import httpx

from app.core.config import Settings
from app.core.errors import RepositoryError


class SupabaseRestClient:
    """Async PostgREST client scoped to a verified user JWT."""

    def __init__(self, settings: Settings, access_token: str) -> None:
        settings.require_supabase()
        self._base_url = settings.rest_url
        self._timeout = settings.request_timeout_seconds
        self._headers = {
            "apikey": settings.supabase_publishable_key,
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

    async def request(self, method: str, path: str, *, params=None, json=None, prefer=None) -> Any:
        headers = dict(self._headers)
        if prefer:
            headers["Prefer"] = prefer
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.request(
                method, f"{self._base_url}/{path.lstrip('/')}", params=params, json=json, headers=headers
            )
        if response.status_code >= 400:
            detail = "Supabase rejected the data operation."
            try:
                payload = response.json()
                detail = payload.get("message") or payload.get("hint") or detail
            except ValueError:
                pass
            raise RepositoryError(detail, status_code=409 if response.status_code == 409 else 502)
        if response.status_code == 204 or not response.content:
            return None
        return response.json()

    async def rpc(self, function: str, payload: dict[str, Any]) -> Any:
        return await self.request("POST", f"rpc/{function}", json=payload)
