import csv
import hashlib
import hmac
import io
import os
import re
import secrets
from datetime import datetime, timezone
from typing import Any

from fastapi import Depends, FastAPI, File, Header, HTTPException, Query, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from .catalog_seed import CATEGORIES
from .db import get_db, init_schema
from .models import AuditLog, Lead, PosTransaction, Product, SharedState, ShopOrder, utcnow
from .payments import PaymentUnavailable
from .schemas import LeadCreate, OrderCreate, OrderStatusUpdate, PosEvent, ProductUpsert, StateWrite, TrackOrderInput
from .security import normalize_digits, rate_limit, require_panel_token, validate_state_ids

APP_VERSION = "2026.10.1"
ORDER_STATUSES = {
    "new": "ثبت سفارش",
    "confirmed": "تأیید سفارش",
    "awaiting_payment": "در انتظار پرداخت",
    "paid": "پرداخت‌شده",
    "preparing": "در حال آماده‌سازی",
    "shipped": "ارسال‌شده",
    "delivered": "تحویل‌شده",
    "cancelled": "لغوشده",
}
ALLOWED_TRANSITIONS = set(ORDER_STATUSES)
ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{1,100}$")

app = FastAPI(
    title="زیتون فدک API",
    description="API فروشگاه مشتریان و پنل حسابداری امانی زیتون فدک",
    version=APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)
origins = [x.strip() for x in os.getenv("ALLOWED_ORIGINS", "http://localhost:8080,http://127.0.0.1:8080").split(",") if x.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "If-Match", "Idempotency-Key", "X-Fadak-Signature"],
)


@app.middleware("http")
async def secure_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
    response.headers.setdefault("Cache-Control", "no-store" if request.url.path.startswith("/api/") else "no-cache")
    return response


@app.on_event("startup")
async def startup() -> None:
    await init_schema()


def iso(value: datetime | None) -> str | None:
    if value is None:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat()


def order_public(order: ShopOrder) -> dict[str, Any]:
    return {
        "code": order.code,
        "status": order.status,
        "statusLabel": ORDER_STATUSES.get(order.status, order.status),
        "paymentStatus": order.payment_status,
        "total": order.total,
        "items": order.items,
        "createdAt": iso(order.created_at),
        "timeline": order.timeline or [],
    }


def order_admin(order: ShopOrder) -> dict[str, Any]:
    data = order_public(order)
    data.update({
        "customer": {
            "name": order.name,
            "phone": order.phone,
            "city": order.city,
            "postalCode": order.postal_code,
            "address": order.address,
        },
        "delivery": order.delivery,
        "payment": order.payment,
        "notes": order.notes or "",
    })
    return data


async def audit(session: AsyncSession, action: str, entity: str, entity_id: str, details: dict | None = None, actor: str = "system") -> None:
    session.add(AuditLog(actor=actor, action=action, entity=entity, entity_id=entity_id, details=details or {}))


@app.get("/")
async def root():
    return {
        "ok": True,
        "service": "zeytoon-fadak-api",
        "version": APP_VERSION,
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health")
async def health(session: AsyncSession = Depends(get_db)):
    try:
        await session.execute(text("SELECT 1"))
        return {"ok": True, "service": "zeytoon-fadak-api", "version": APP_VERSION, "database": "ok"}
    except Exception:
        raise HTTPException(status_code=503, detail="پایگاه داده در دسترس نیست.")


@app.get("/api/catalog")
async def get_catalog(session: AsyncSession = Depends(get_db)):
    rows = (await session.scalars(select(Product).where(Product.active.is_(True)).order_by(Product.category, Product.id))).all()
    products = []
    for product in rows:
        variants = [
            {"l": str(item.get("l", "")), "p": int(item.get("p", 0))}
            for item in (product.variants or [])
            if item.get("active", True) and int(item.get("p", 0)) > 0
        ]
        products.append({
            "id": product.id,
            "c": product.category,
            "n": product.name,
            "d": product.description,
            "long": product.long_description,
            "tag": product.tag,
            "v": variants,
        })
    return {
        "categories": CATEGORIES,
        "products": products,
        "currency": "Toman",
        "settings": {"phoneText": os.getenv("FADAK_PUBLIC_PHONE", ""), "address": os.getenv("FADAK_PUBLIC_ADDRESS", "")},
    }


@app.post("/api/orders", status_code=201)
async def create_order(
    payload: OrderCreate,
    request: Request,
    idempotency_key: str | None = Header(default=None, alias="Idempotency-Key"),
    session: AsyncSession = Depends(get_db),
):
    rate_limit(request, "create-order", limit=10, seconds=60)
    phone = re.sub(r"\D", "", normalize_digits(payload.phone))
    if not re.fullmatch(r"09\d{9}", phone):
        raise HTTPException(status_code=422, detail="شماره موبایل باید به شکل 09xxxxxxxxx باشد.")
    postal = re.sub(r"\D", "", normalize_digits(payload.postal_code))
    if postal and len(postal) != 10:
        raise HTTPException(status_code=422, detail="کد پستی باید ۱۰ رقم باشد.")
    key = (idempotency_key or secrets.token_urlsafe(24)).strip()
    if not key or len(key) > 140:
        raise HTTPException(status_code=400, detail="کلید تکرارپذیری درخواست معتبر نیست.")

    existing = await session.scalar(select(ShopOrder).where(ShopOrder.idempotency_key == key))
    if existing:
        return order_public(existing)

    priced_items: list[dict[str, Any]] = []
    total = 0
    for line in payload.items:
        product = await session.get(Product, line.pid)
        if product is None or not product.active:
            raise HTTPException(status_code=422, detail="یکی از محصولات انتخاب‌شده فعال نیست.")
        variants = product.variants or []
        if line.vi >= len(variants):
            raise HTTPException(status_code=422, detail="اندازه‌ی انتخاب‌شده برای یکی از محصولات معتبر نیست.")
        variant = variants[line.vi]
        if not variant.get("active", True):
            raise HTTPException(status_code=409, detail="یکی از اندازه‌های انتخاب‌شده فعلاً موجود نیست.")
        price = int(variant.get("p", 0))
        if price <= 0:
            raise HTTPException(status_code=409, detail="قیمت یکی از محصولات هنوز تعیین نشده است.")
        stock = variant.get("stock")
        if isinstance(stock, int) and line.qty > stock:
            raise HTTPException(status_code=409, detail="تعداد درخواستی از موجودی فعلی بیشتر است.")
        line_total = price * line.qty
        total += line_total
        priced_items.append({"n": product.name, "l": str(variant.get("l", "")), "q": line.qty, "p": price})

    now = utcnow()
    code = "FD-" + secrets.token_hex(4).upper()
    payment_online = "آنلاین" in payload.payment or "online" in payload.payment.lower()
    payment_status = "not_configured" if payment_online else "unpaid"
    timeline = [{"status": "new", "label": ORDER_STATUSES["new"], "at": iso(now), "note": "سفارش در سامانه ثبت شد."}]
    order = ShopOrder(
        code=code,
        idempotency_key=key,
        name=payload.name.strip(),
        phone=phone,
        city=payload.city.strip(),
        postal_code=postal,
        address=payload.address.strip(),
        notes=payload.notes.strip(),
        delivery=payload.delivery.strip(),
        payment=payload.payment.strip(),
        payment_status=payment_status,
        status="new",
        items=priced_items,
        total=total,
        timeline=timeline,
        created_at=now,
        updated_at=now,
    )
    session.add(order)
    try:
        await session.flush()
        await audit(session, "order.created", "order", code, {"total_toman": total, "item_count": len(priced_items)})
        await session.commit()
    except IntegrityError:
        await session.rollback()
        existing = await session.scalar(select(ShopOrder).where(ShopOrder.idempotency_key == key))
        if existing:
            return order_public(existing)
        raise HTTPException(status_code=409, detail="سفارش هم‌زمان تغییر کرد؛ دوباره تلاش کنید.")
    await session.refresh(order)
    return order_public(order)


@app.post("/api/orders/track")
async def track_order(payload: TrackOrderInput, request: Request, session: AsyncSession = Depends(get_db)):
    rate_limit(request, "track-order", limit=12, seconds=60)
    code = payload.code.strip().upper()
    last4 = re.sub(r"\D", "", normalize_digits(payload.phone_last4))
    if len(last4) != 4:
        raise HTTPException(status_code=422, detail="چهار رقم آخر شماره موبایل را وارد کنید.")
    order = await session.scalar(select(ShopOrder).where(ShopOrder.code == code))
    if order is None or not hmac.compare_digest(order.phone[-4:], last4):
        raise HTTPException(status_code=404, detail="سفارش پیدا نشد؛ کد و چهار رقم آخر موبایل را بررسی کنید.")
    return order_public(order)


@app.get("/api/admin/orders")
async def admin_orders(
    authorization: str | None = Header(default=None),
    status_filter: str | None = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
):
    actor = require_panel_token(authorization)
    query = select(ShopOrder).order_by(ShopOrder.created_at.desc()).limit(limit)
    if status_filter:
        query = select(ShopOrder).where(ShopOrder.status == status_filter).order_by(ShopOrder.created_at.desc()).limit(limit)
    orders = (await session.scalars(query)).all()
    return {"orders": [order_admin(item) for item in orders], "count": len(orders)}


@app.patch("/api/admin/orders/{code}/status")
async def update_order_status(
    code: str,
    payload: OrderStatusUpdate,
    authorization: str | None = Header(default=None),
    session: AsyncSession = Depends(get_db),
):
    actor = require_panel_token(authorization)
    if payload.status not in ALLOWED_TRANSITIONS:
        raise HTTPException(status_code=422, detail="وضعیت سفارش معتبر نیست.")
    order = await session.scalar(select(ShopOrder).where(ShopOrder.code == code.upper()))
    if order is None:
        raise HTTPException(status_code=404, detail="سفارش پیدا نشد.")
    previous = order.status
    order.status = payload.status
    if payload.status == "paid":
        # The authenticated owner must verify the payment outside the site before using this status.
        order.payment_status = "paid"
    order.updated_at = utcnow()
    timeline = list(order.timeline or [])
    timeline.append({"status": payload.status, "label": ORDER_STATUSES[payload.status], "at": iso(order.updated_at), "note": payload.note.strip()})
    order.timeline = timeline
    await audit(session, "order.status_changed", "order", order.code, {"from": previous, "to": payload.status}, actor)
    await session.commit()
    await session.refresh(order)
    return order_admin(order)


@app.put("/api/state")
async def write_shared_state(
    payload: StateWrite,
    authorization: str | None = Header(default=None),
    if_match: str | None = Header(default=None, alias="If-Match"),
    session: AsyncSession = Depends(get_db),
):
    actor = require_panel_token(authorization)
    if if_match is None:
        raise HTTPException(status_code=428, detail="هدر If-Match برای جلوگیری از بازنویسی اطلاعات لازم است.")
    try:
        expected_version = int(if_match.strip().strip('"'))
    except ValueError:
        raise HTTPException(status_code=400, detail="نسخه‌ی If-Match معتبر نیست.")
    validate_state_ids(payload.state)
    record = await session.get(SharedState, 1)
    current_version = record.version if record else 0
    if expected_version != current_version:
        raise HTTPException(status_code=409, detail={"message": "اطلاعات روی سرور تغییر کرده است؛ ابتدا آن را دوباره دریافت کنید.", "currentVersion": current_version})
    now = utcnow()
    if record is None:
        record = SharedState(id=1, version=1, state=payload.state, updated_at=now)
        session.add(record)
    else:
        record.version += 1
        record.state = payload.state
        record.updated_at = now
    await audit(session, "panel.state_saved", "shared_state", "1", {"version": record.version}, actor)
    await session.commit()
    await session.refresh(record)
    return {"version": record.version, "state": record.state, "updatedAt": iso(record.updated_at)}


@app.get("/api/state")
async def read_shared_state(
    authorization: str | None = Header(default=None),
    session: AsyncSession = Depends(get_db),
):
    require_panel_token(authorization)
    record = await session.get(SharedState, 1)
    if record is None:
        return {"version": 0, "state": None, "updatedAt": None}
    return {"version": record.version, "state": record.state, "updatedAt": iso(record.updated_at)}


@app.put("/api/admin/catalog/{product_id}")
async def upsert_catalog_product(
    product_id: str,
    payload: ProductUpsert,
    authorization: str | None = Header(default=None),
    session: AsyncSession = Depends(get_db),
):
    actor = require_panel_token(authorization)
    if not ID_PATTERN.fullmatch(product_id):
        raise HTTPException(status_code=422, detail="شناسه‌ی محصول معتبر نیست.")
    for variant in payload.variants:
        if int(variant.get("p", 0)) < 0:
            raise HTTPException(status_code=422, detail="قیمت محصول نمی‌تواند منفی باشد.")
        label = str(variant.get("l", "")).strip()
        if not label:
            raise HTTPException(status_code=422, detail="اندازه‌ی محصول باید نام داشته باشد.")
    product = await session.get(Product, product_id)
    data = payload.model_dump()
    if product is None:
        product = Product(id=product_id, **data)
        session.add(product)
    else:
        for key, value in data.items():
            setattr(product, key, value)
    await audit(session, "catalog.upsert", "product", product_id, {"active": payload.active}, actor)
    await session.commit()
    return {"ok": True, "id": product_id}


async def save_lead(kind: str, payload: LeadCreate, request: Request, session: AsyncSession):
    rate_limit(request, "lead-" + kind, limit=8, seconds=60)
    if payload.honey.strip():
        return {"ok": True, "received": True}
    data = payload.model_dump()
    phone = re.sub(r"\D", "", normalize_digits(payload.phone))
    if phone and not re.fullmatch(r"09\d{9}", phone):
        raise HTTPException(status_code=422, detail="شماره موبایل معتبر نیست.")
    lead = Lead(kind=kind, name=payload.name.strip(), phone=phone, payload=data)
    session.add(lead)
    await session.commit()
    await session.refresh(lead)
    return {"ok": True, "id": lead.id, "received": True}


@app.post("/api/wholesale", status_code=201)
async def create_wholesale(payload: LeadCreate, request: Request, session: AsyncSession = Depends(get_db)):
    return await save_lead("wholesale", payload, request, session)


@app.post("/api/contact", status_code=201)
async def create_contact(payload: LeadCreate, request: Request, session: AsyncSession = Depends(get_db)):
    return await save_lead("contact", payload, request, session)


@app.post("/api/subscriptions", status_code=201)
async def create_subscription(payload: LeadCreate, request: Request, session: AsyncSession = Depends(get_db)):
    return await save_lead("subscription", payload, request, session)


def parse_amount(value: Any) -> int:
    text_value = re.sub(r"[,\s]", "", normalize_digits(str(value or "")))
    try:
        return int(float(text_value))
    except (ValueError, TypeError):
        return 0


def parse_date(value: str) -> datetime:
    value = normalize_digits(str(value or "")).strip()
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
    except ValueError:
        return utcnow()


def pos_public(item: PosTransaction) -> dict[str, Any]:
    return {"date": iso(item.transaction_date), "amount": item.amount, "reference": item.reference, "terminal": item.terminal, "store": item.store, "note": (item.payload or {}).get("note", "")}


@app.post("/api/pos/import-csv")
async def import_pos_csv(
    request: Request,
    file: UploadFile = File(...),
    authorization: str | None = Header(default=None),
    session: AsyncSession = Depends(get_db),
):
    actor = require_panel_token(authorization)
    rate_limit(request, "pos-import", limit=10, seconds=60)
    raw = await file.read(2_000_001)
    if len(raw) > 2_000_000:
        raise HTTPException(status_code=413, detail="اندازه‌ی فایل CSV بیش از حد مجاز است.")
    try:
        text_data = raw.decode("utf-8-sig")
        reader = csv.DictReader(io.StringIO(text_data))
        if not reader.fieldnames:
            raise ValueError("missing header")
    except (UnicodeDecodeError, ValueError):
        raise HTTPException(status_code=422, detail="فایل CSV معتبر نیست یا سرستون ندارد.")
    added = 0
    skipped = 0
    for row in reader:
        reference = normalize_digits(str(row.get("reference") or row.get("reference_number") or "")).strip()
        terminal = str(row.get("terminal") or row.get("terminal_id") or "").strip()
        if not reference:
            skipped += 1
            continue
        amount = parse_amount(row.get("amount"))
        if row.get("amount_rial") not in (None, ""):
            amount = parse_amount(row.get("amount_rial")) // 10
        if amount <= 0:
            skipped += 1
            continue
        existing = await session.scalar(select(PosTransaction).where(PosTransaction.reference == reference, PosTransaction.terminal == terminal))
        if existing:
            skipped += 1
            continue
        date_text = str(row.get("date") or row.get("transaction_date") or "")
        store = str(row.get("store") or "").strip()
        session.add(PosTransaction(reference=reference, amount=amount, terminal=terminal, store=store, transaction_date=parse_date(date_text), payload={"source": "csv"}))
        added += 1
    await audit(session, "pos.csv_imported", "pos_transactions", "", {"added": added, "skipped": skipped}, actor)
    await session.commit()
    return {"ok": True, "added": added, "skipped": skipped, "currency": "Toman"}


@app.post("/api/pos/webhook", status_code=201)
async def pos_webhook(request: Request, session: AsyncSession = Depends(get_db)):
    secret = os.getenv("POS_WEBHOOK_SECRET", "").strip()
    if len(secret) < 24:
        raise HTTPException(status_code=503, detail="وب‌هوک کارت‌خوان تا زمان تنظیم راز HMAC غیرفعال است.")
    raw = await request.body()
    supplied = request.headers.get("X-Fadak-Signature", "").strip()
    if supplied.startswith("sha256="):
        supplied = supplied[7:]
    expected = hmac.new(secret.encode("utf-8"), raw, hashlib.sha256).hexdigest()
    if not supplied or not hmac.compare_digest(supplied, expected):
        raise HTTPException(status_code=401, detail="امضای وب‌هوک معتبر نیست.")
    try:
        payload = PosEvent.model_validate_json(raw)
    except Exception:
        raise HTTPException(status_code=422, detail="بدنه‌ی تراکنش معتبر نیست.")
    existing = await session.scalar(select(PosTransaction).where(PosTransaction.reference == payload.reference, PosTransaction.terminal == payload.terminal))
    if existing:
        return {"ok": True, "duplicate": True}
    transaction = PosTransaction(
        reference=payload.reference,
        amount=payload.amount,
        terminal=payload.terminal,
        store=payload.store,
        transaction_date=parse_date(payload.date),
        payload={"note": payload.note, "source": "signed-webhook"},
    )
    session.add(transaction)
    await session.commit()
    return {"ok": True, "duplicate": False}


@app.get("/api/reconcile")
async def reconcile(
    month: str = Query(pattern=r"^\d{4}-\d{2}$"),
    store: str | None = None,
    authorization: str | None = Header(default=None),
    session: AsyncSession = Depends(get_db),
):
    require_panel_token(authorization)
    state_record = await session.get(SharedState, 1)
    state = state_record.state if state_record and isinstance(state_record.state, dict) else {}
    sales = state.get("sales", []) if isinstance(state.get("sales", []), list) else []
    sales = [sale for sale in sales if str(sale.get("date", ""))[:7] == month and (not store or str(sale.get("storeId", "")) == store)]
    start = datetime.fromisoformat(month + "-01").replace(tzinfo=timezone.utc)
    year, mon = start.year, start.month
    next_start = datetime(year + (mon == 12), 1 if mon == 12 else mon + 1, 1, tzinfo=timezone.utc)
    pos_rows = (await session.scalars(select(PosTransaction).where(PosTransaction.transaction_date >= start, PosTransaction.transaction_date < next_start).order_by(PosTransaction.transaction_date))).all()
    if store:
        pos_rows = [item for item in pos_rows if item.store == store]
    pos_by_key: dict[str, list[PosTransaction]] = {}
    for transaction in pos_rows:
        pos_by_key.setdefault(transaction.reference.strip(), []).append(transaction)
    matched, unmatched_sales = [], []
    used = set()
    for sale in sales:
        reference = str(sale.get("reference", "")).strip()
        card_amount = parse_amount(sale.get("cardAmount") if sale.get("cardAmount") is not None else sale.get("total", 0))
        possible = pos_by_key.get(reference, []) if reference else []
        candidate = next((p for p in possible if p.id not in used and p.amount == card_amount), None)
        item = {"saleId": sale.get("id"), "reference": reference, "amount": card_amount}
        if candidate:
            used.add(candidate.id)
            matched.append({**item, "posAmount": candidate.amount, "posId": candidate.id})
        else:
            unmatched_sales.append(item)
    unmatched_pos = [pos_public(p) | {"id": p.id} for p in pos_rows if p.id not in used]
    return {
        "month": month,
        "store": store or "all",
        "matched": matched,
        "unmatchedSales": unmatched_sales,
        "unmatchedPos": unmatched_pos,
        "totals": {
            "salesCount": len(sales),
            "posCount": len(pos_rows),
            "matchedCount": len(matched),
            "unmatchedSalesCount": len(unmatched_sales),
            "unmatchedPosCount": len(unmatched_pos),
            "salesCardToman": sum(parse_amount(s.get("cardAmount") if s.get("cardAmount") is not None else s.get("total", 0)) for s in sales),
            "posToman": sum(p.amount for p in pos_rows),
        },
    }


@app.post("/api/orders/{code}/payment")
async def start_payment(code: str, session: AsyncSession = Depends(get_db)):
    order = await session.scalar(select(ShopOrder).where(ShopOrder.code == code.upper()))
    if order is None:
        raise HTTPException(status_code=404, detail="سفارش پیدا نشد.")
    # Never claim payment succeeded while no verified payment provider is configured.
    raise HTTPException(status_code=503, detail="درگاه پرداخت هنوز پیکربندی و با اطلاعات رسمی تأیید نشده است. سفارش پرداخت‌شده محسوب نمی‌شود.")


@app.get("/api/admin/leads")
async def admin_leads(
    authorization: str | None = Header(default=None),
    limit: int = Query(default=50, ge=1, le=100),
    session: AsyncSession = Depends(get_db),
):
    require_panel_token(authorization)
    rows = (await session.scalars(select(Lead).order_by(Lead.created_at.desc()).limit(limit))).all()
    return {"leads": [{"id": row.id, "kind": row.kind, "name": row.name, "phone": row.phone, "payload": row.payload, "status": row.status, "createdAt": iso(row.created_at)} for row in rows]}
