"""Compatibility entrypoint for ``uvicorn main:app`` from ``src/api``."""

from app.main import app

__all__ = ["app"]
