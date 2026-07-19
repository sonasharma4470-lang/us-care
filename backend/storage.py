"""Object storage helper for CARE WITH US clinic app.
Uses Emergent's object storage API (persistent across deploys)."""
import os
import uuid
import logging
import requests

logger = logging.getLogger(__name__)

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
APP_NAME = "carewithus"

_storage_key: str | None = None


def init_storage() -> str:
    """Call ONCE at startup. Returns a session-scoped, reusable storage_key."""
    global _storage_key
    if _storage_key:
        return _storage_key
    key = os.environ.get("EMERGENT_LLM_KEY")
    if not key:
        raise RuntimeError("EMERGENT_LLM_KEY not set")
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": key}, timeout=30)
    resp.raise_for_status()
    _storage_key = resp.json()["storage_key"]
    logger.info("Object storage initialized")
    return _storage_key


def _reinit_and_retry(op):
    """Refresh storage key once on 403 and retry the operation."""
    global _storage_key
    _storage_key = None
    init_storage()
    return op()


def put_object(path: str, data: bytes, content_type: str) -> dict:
    """Upload file. Returns {'path': ..., 'size': ..., 'etag': ...}"""
    def _do():
        key = init_storage()
        resp = requests.put(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key, "Content-Type": content_type},
            data=data,
            timeout=120,
        )
        resp.raise_for_status()
        return resp.json()
    try:
        return _do()
    except requests.HTTPError as e:
        if e.response is not None and e.response.status_code == 403:
            return _reinit_and_retry(_do)
        raise


def get_object(path: str) -> tuple[bytes, str]:
    def _do():
        key = init_storage()
        resp = requests.get(
            f"{STORAGE_URL}/objects/{path}",
            headers={"X-Storage-Key": key},
            timeout=60,
        )
        resp.raise_for_status()
        return resp.content, resp.headers.get("Content-Type", "application/octet-stream")
    try:
        return _do()
    except requests.HTTPError as e:
        if e.response is not None and e.response.status_code == 403:
            return _reinit_and_retry(_do)
        raise


def build_path(kind: str, filename: str) -> str:
    """kind: 'doctors', 'services', 'gallery', 'blogs', 'logo', 'hero', 'misc'."""
    ext = ""
    if "." in filename:
        ext = "." + filename.rsplit(".", 1)[-1].lower()
    return f"{APP_NAME}/{kind}/{uuid.uuid4().hex}{ext}"
