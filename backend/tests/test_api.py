import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.db import Base, get_db
from app.catalog_seed import seed_catalog
from app.main import app


@pytest_asyncio.fixture
async def client(monkeypatch):
    monkeypatch.setenv("FADAK_PANEL_TOKEN", "test-panel-token-with-more-than-24-chars")
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    factory = async_sessionmaker(engine, expire_on_commit=False)

    async def override_get_db():
        async with factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    async with factory() as session:
        await seed_catalog(session)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as test_client:
        yield test_client

    app.dependency_overrides.clear()
    await engine.dispose()


@pytest.mark.asyncio
async def test_health_and_catalog(client):
    health = await client.get("/health")
    assert health.status_code == 200
    assert health.json()["ok"] is True

    catalog = await client.get("/api/catalog")
    assert catalog.status_code == 200
    ids = {product["id"] for product in catalog.json()["products"]}
    assert {"o1", "l1", "v1", "c1"} <= ids


@pytest.mark.asyncio
async def test_order_uses_server_prices_and_is_idempotent(client):
    payload = {
        "name": "مشتری آزمایشی",
        "phone": "09123456789",
        "city": "قم",
        "postalCode": "3711111111",
        "address": "نشانی آزمایشی شماره یک",
        "delivery": "ارسال با پست",
        "payment": "طبق توافق با پشتیبانی",
        "items": [{"pid": "o1", "vi": 0, "qty": 2}],
    }
    headers = {"Idempotency-Key": "test-order-key-0001"}
    first = await client.post("/api/orders", json=payload, headers=headers)
    second = await client.post("/api/orders", json=payload, headers=headers)
    assert first.status_code == 201
    assert first.json()["total"] == 440000
    assert first.json()["code"] == second.json()["code"]


@pytest.mark.asyncio
async def test_state_version_conflict(client):
    token = {"Authorization": "Bearer test-panel-token-with-more-than-24-chars"}
    initial = await client.get("/api/state", headers=token)
    assert initial.status_code == 200
    assert initial.json()["version"] == 0

    payload = {"state": {"products": [], "stores": [], "deliveries": [], "sales": [], "pos": [], "adjustments": [], "closings": [], "settings": {}}}
    saved = await client.put("/api/state", headers={**token, "If-Match": "0"}, json=payload)
    assert saved.status_code == 200
    assert saved.json()["version"] == 1

    conflict = await client.put("/api/state", headers={**token, "If-Match": "0"}, json=payload)
    assert conflict.status_code == 409
@pytest.mark.asyncio
async def test_admin_orders_return_delivery_details_only_with_token(client):
    payload = {
        "name": "مشتری آزمایشی",
        "phone": "09123456789",
        "city": "قم",
        "postalCode": "3711111111",
        "address": "نشانی آزمایشی شماره یک",
        "delivery": "ارسال با پست",
        "payment": "کارت به کارت",
        "items": [{"pid": "o1", "vi": 0, "qty": 1}],
    }
    created = await client.post("/api/orders", json=payload, headers={"Idempotency-Key": "order-admin-test-key"})
    assert created.status_code == 201

    denied = await client.get("/api/admin/orders")
    assert denied.status_code == 401

    token = {"Authorization": "Bearer test-panel-token-with-more-than-24-chars"}
    response = await client.get("/api/admin/orders", headers=token)
    assert response.status_code == 200
    order = response.json()["orders"][0]
    assert order["customer"]["name"] == "مشتری آزمایشی"
    assert order["customer"]["address"] == "نشانی آزمایشی شماره یک"

