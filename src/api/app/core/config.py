from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
import os


@dataclass(frozen=True)
class Settings:
    environment: str
    supabase_url: str
    supabase_publishable_key: str
    cors_origins: tuple[str, ...]
    request_timeout_seconds: float

    @property
    def auth_issuer(self) -> str:
        return f"{self.supabase_url.rstrip('/')}/auth/v1"

    @property
    def jwks_url(self) -> str:
        return f"{self.auth_issuer}/.well-known/jwks.json"

    @property
    def rest_url(self) -> str:
        return f"{self.supabase_url.rstrip('/')}/rest/v1"

    def require_supabase(self) -> None:
        if not self.supabase_url or not self.supabase_publishable_key:
            raise RuntimeError("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be configured.")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
    return Settings(
        environment=os.getenv("APP_ENV", "local"),
        supabase_url=os.getenv("SUPABASE_URL", "").strip(),
        supabase_publishable_key=os.getenv("SUPABASE_PUBLISHABLE_KEY", "").strip(),
        cors_origins=tuple(item.strip() for item in origins.split(",") if item.strip()),
        request_timeout_seconds=float(os.getenv("SUPABASE_TIMEOUT_SECONDS", "10")),
    )
