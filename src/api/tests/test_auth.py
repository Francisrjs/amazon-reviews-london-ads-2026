from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.core.auth import _bearer_token


def test_bearer_token_is_required() -> None:
    with pytest.raises(HTTPException) as error:
        _bearer_token(None)
    assert error.value.status_code == 401


def test_bearer_token_is_extracted() -> None:
    token = f"header.{uuid4()}.signature"
    assert _bearer_token(f"Bearer {token}") == token
