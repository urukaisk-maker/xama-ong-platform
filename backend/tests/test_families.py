from datetime import date

from httpx import AsyncClient


async def test_create_family(client: AsyncClient, admin_headers: dict):
    r = await client.post(
        "/api/families",
        headers=admin_headers,
        json={
            "reference_code": "FAM-001",
            "site": "reus",
            "adults": 2,
            "minors": 3,
        },
    )
    assert r.status_code == 201
    assert r.json()["reference_code"] == "FAM-001"
    assert r.json()["site"] == "reus"


async def test_list_families_filter_by_site(client: AsyncClient, admin_headers: dict):
    await client.post(
        "/api/families",
        headers=admin_headers,
        json={"reference_code": "F-R", "site": "reus"},
    )
    await client.post(
        "/api/families",
        headers=admin_headers,
        json={"reference_code": "F-T", "site": "tarragona"},
    )

    r = await client.get("/api/families?site=reus", headers=admin_headers)
    assert r.status_code == 200
    sites = [f["site"] for f in r.json()]
    assert all(s == "reus" for s in sites)


async def test_delivery_checkin(client: AsyncClient, admin_headers: dict):
    f = await client.post(
        "/api/families",
        headers=admin_headers,
        json={"reference_code": "FAM-002", "site": "reus"},
    )
    fid = f.json()["id"]

    d = await client.post(
        "/api/deliveries",
        headers=admin_headers,
        json={
            "family_id": fid,
            "delivery_date": date.today().isoformat(),
            "site": "reus",
        },
    )
    assert d.status_code == 201
    did = d.json()["id"]
    assert d.json()["status"] == "pendiente"

    c = await client.patch(
        f"/api/deliveries/{did}/check-in",
        headers=admin_headers,
        json={"notes": "OK"},
    )
    assert c.status_code == 200
    assert c.json()["status"] == "entregada"


async def test_double_checkin_fails(client: AsyncClient, admin_headers: dict):
    f = await client.post(
        "/api/families",
        headers=admin_headers,
        json={"reference_code": "FAM-003", "site": "reus"},
    )
    fid = f.json()["id"]
    d = await client.post(
        "/api/deliveries",
        headers=admin_headers,
        json={
            "family_id": fid,
            "delivery_date": date.today().isoformat(),
            "site": "reus",
        },
    )
    did = d.json()["id"]

    await client.patch(
        f"/api/deliveries/{did}/check-in", headers=admin_headers, json={}
    )
    r = await client.patch(
        f"/api/deliveries/{did}/check-in", headers=admin_headers, json={}
    )
    assert r.status_code == 400


async def test_family_summary(client: AsyncClient, admin_headers: dict):
    r = await client.get("/api/families-summary", headers=admin_headers)
    assert r.status_code == 200
    assert "total_families" in r.json()
