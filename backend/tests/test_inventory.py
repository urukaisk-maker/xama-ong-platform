from datetime import date, timedelta

from httpx import AsyncClient


async def test_create_product(client: AsyncClient, admin_headers: dict):
    r = await client.post(
        "/api/inventory/products",
        headers=admin_headers,
        json={"name": "Manzanas", "category": "fruta", "unit": "kg"},
    )
    assert r.status_code == 201
    assert r.json()["name"] == "Manzanas"


async def test_list_products(client: AsyncClient, admin_headers: dict):
    await client.post(
        "/api/inventory/products",
        headers=admin_headers,
        json={"name": "Pan"},
    )
    r = await client.get("/api/inventory/products", headers=admin_headers)
    assert r.status_code == 200
    assert any(p["name"] == "Pan" for p in r.json())


async def test_create_batch_and_consume(client: AsyncClient, admin_headers: dict):
    p = await client.post(
        "/api/inventory/products",
        headers=admin_headers,
        json={"name": "Leche"},
    )
    pid = p.json()["id"]

    expiry = (date.today() + timedelta(days=10)).isoformat()
    b = await client.post(
        "/api/inventory/batches",
        headers=admin_headers,
        json={
            "product_id": pid,
            "origin": "comercio_local",
            "quantity": 10,
            "expiry_date": expiry,
        },
    )
    assert b.status_code == 201
    bid = b.json()["id"]

    c = await client.patch(
        f"/api/inventory/batches/{bid}/consume",
        headers=admin_headers,
        json={"quantity": 4},
    )
    assert c.status_code == 200
    assert float(c.json()["quantity"]) == 6.0


async def test_consume_more_than_available(client: AsyncClient, admin_headers: dict):
    p = await client.post(
        "/api/inventory/products",
        headers=admin_headers,
        json={"name": "Arroz"},
    )
    pid = p.json()["id"]
    b = await client.post(
        "/api/inventory/batches",
        headers=admin_headers,
        json={
            "product_id": pid,
            "origin": "donacion",
            "quantity": 5,
            "expiry_date": date.today().isoformat(),
        },
    )
    bid = b.json()["id"]

    c = await client.patch(
        f"/api/inventory/batches/{bid}/consume",
        headers=admin_headers,
        json={"quantity": 100},
    )
    assert c.status_code == 400


async def test_expiring_soon(client: AsyncClient, admin_headers: dict):
    p = await client.post(
        "/api/inventory/products",
        headers=admin_headers,
        json={"name": "Yogur"},
    )
    pid = p.json()["id"]

    soon = (date.today() + timedelta(days=3)).isoformat()
    await client.post(
        "/api/inventory/batches",
        headers=admin_headers,
        json={
            "product_id": pid,
            "origin": "comercio_local",
            "quantity": 20,
            "expiry_date": soon,
        },
    )

    r = await client.get(
        "/api/inventory/batches/expiring-soon?days=7",
        headers=admin_headers,
    )
    assert r.status_code == 200
    assert len(r.json()) >= 1


async def test_summary(client: AsyncClient, admin_headers: dict):
    r = await client.get("/api/inventory/summary", headers=admin_headers)
    assert r.status_code == 200
    data = r.json()
    assert "total_products" in data
    assert "total_quantity_kg" in data
    assert "expiring_soon_count" in data
