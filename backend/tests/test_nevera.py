import uuid
from datetime import date

from httpx import AsyncClient


async def test_upsert_ration(client: AsyncClient, admin_headers: dict):
    payload = {
        "date": date.today().isoformat(),
        "target_rations": 20,
        "served_rations": 18,
    }
    r = await client.post("/api/nevera/rations", headers=admin_headers, json=payload)
    assert r.status_code == 201
    assert r.json()["served_rations"] == 18

    # upsert mismo día
    payload["served_rations"] = 15
    r2 = await client.post("/api/nevera/rations", headers=admin_headers, json=payload)
    assert r2.status_code == 201
    assert r2.json()["served_rations"] == 15


async def test_ration_summary(client: AsyncClient, admin_headers: dict):
    await client.post(
        "/api/nevera/rations",
        headers=admin_headers,
        json={
            "date": date.today().isoformat(),
            "target_rations": 20,
            "served_rations": 18,
        },
    )
    r = await client.get("/api/nevera/rations/summary", headers=admin_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["total_served"] == 18
    assert data["compliance_pct"] == 90.0


async def test_create_and_serve_derivation(client: AsyncClient, admin_headers: dict):
    ref = f"DER-{uuid.uuid4().hex[:6]}"
    r = await client.post(
        "/api/nevera/derivations",
        headers=admin_headers,
        json={
            "reference_code": ref,
            "origin": "servicios_sociales",
            "rations": 2,
        },
    )
    assert r.status_code == 201
    did = r.json()["id"]
    assert r.json()["status"] == "pendiente"

    s = await client.patch(
        f"/api/nevera/derivations/{did}/serve", headers=admin_headers
    )
    assert s.status_code == 200
    assert s.json()["status"] == "servida"


async def test_double_serve_fails(client: AsyncClient, admin_headers: dict):
    ref = f"DER-{uuid.uuid4().hex[:6]}"
    r = await client.post(
        "/api/nevera/derivations",
        headers=admin_headers,
        json={"reference_code": ref, "origin": "otro", "rations": 1},
    )
    did = r.json()["id"]

    await client.patch(f"/api/nevera/derivations/{did}/serve", headers=admin_headers)
    r2 = await client.patch(f"/api/nevera/derivations/{did}/serve", headers=admin_headers)
    assert r2.status_code == 400
