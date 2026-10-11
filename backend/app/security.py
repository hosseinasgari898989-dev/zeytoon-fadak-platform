import hmac
import os
import re
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

_RATE_BUCKETS: dict[str, deque[float]] = defaultdict(deque)
_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,100}$")


def normalize_digits(value: str) -> str:
    persian = "۰۱۲۳۴۵۶۷۸۹"
    arabic = "٠١٢٣٤٥٦٧٨٩"
    result = []
    for char in str(value):
        if char in persian:
            result.append(str(persian.index(char)))
        elif char in arabic:
            result.append(str(arabic.index(char)))
        else:
            result.append(char)
    return "".join(result)


def require_panel_token(authorization: str | None) -> str:
    expected = os.getenv("FADAK_PANEL_TOKEN", "").strip()
    if len(expected) < 24:
        raise HTTPException(status_code=503, detail="توکن پنل در تنظیمات سرور آماده نشده است.")
    scheme, _, supplied = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not supplied or not hmac.compare_digest(supplied, expected):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="دسترسی مجاز نیست.")
    return "platform_admin"


def rate_limit(request: Request, bucket: str, limit: int = 20, seconds: int = 60) -> None:
    now = time.monotonic()
    client = request.client.host if request.client else "unknown"
    key = bucket + ":" + client
    entries = _RATE_BUCKETS[key]
    while entries and now - entries[0] > seconds:
        entries.popleft()
    if len(entries) >= limit:
        raise HTTPException(status_code=429, detail="درخواست‌های زیادی ارسال شده؛ کمی بعد دوباره امتحان کنید.")
    entries.append(now)


def validate_state_ids(state: dict) -> None:
    for key in ("products", "stores", "deliveries", "sales", "pos", "adjustments", "closings"):
        values = state.get(key, [])
        if not isinstance(values, list):
            raise HTTPException(status_code=422, detail="ساختار اطلاعات پنل معتبر نیست: " + key)
        for item in values:
            if not isinstance(item, dict):
                raise HTTPException(status_code=422, detail="رکورد نامعتبر در " + key)
            value = item.get("id")
            if value is not None and not _ID_PATTERN.fullmatch(str(value)):
                raise HTTPException(status_code=422, detail="شناسه نامعتبر در " + key)
    if len(str(state).encode("utf-8")) > 5_000_000:
        raise HTTPException(status_code=413, detail="اندازه اطلاعات پنل بیش از حد مجاز است.")