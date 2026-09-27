from datetime import date

from httpx import AsyncClient


async def test_create_shift_requires_coord(client: AsyncClient, volunteer_headers: dict):
    r = await client.post(
        "/api/shifts",
        headers=volunteer_headers,
        json={
            "shift_date": date.today().isoformat(),
            "site": "reus",
            "role": "puerta",
            "start_time": "10:00:00",
            "end_time": "13:00:00",
            "capacity": 2,
        },
    )
    assert r.status_code == 403


async def test_create_shift_ok(client: AsyncClient, admin_headers: dict):
    r = await client.post(
        "/api/shifts",
        headers=admin_headers,
        json={
            "shift_date": date.today().isoformat(),
            "site": "reus",
            "role": "puerta",
            "start_time": "10:00:00",
            "end_time": "13:00:00",
            "capacity": 2,
        },
    )
    assert r.status_code == 201
    assert r.json()["role"] == "puerta"


async def test_assign_and_duplicate(client: AsyncClient, admin_headers: dict, volunteer_headers: dict):
    s = await client.post(
        "/api/shifts",
        headers=admin_headers,
        json={
            "shift_date": date.today().isoformat(),
            "site": "reus",
            "role": "cestas",
            "start_time": "09:00:00",
            "end_time": "11:00:00",
            "capacity": 2,
        },
    )
    sid = s.json()["id"]

    r1 = await client.post(
        f"/api/shifts/{sid}/assign",
        headers=volunteer_headers,
        json={},
    )
    assert r1.status_code == 201

    r2 = await client.post(
        f"/api/shifts/{sid}/assign",
        headers=volunteer_headers,
        json={},
    )
    assert r2.status_code == 400


async def test_hours_summary_requires_junta(
    client: AsyncClient, volunteer_headers: dict
):
    r = await client.get(
        "/api/volunteers/hours/summary", headers=volunteer_headers
    )
    assert r.status_code == 403


async def test_hours_summary_ok(client: AsyncClient, admin_headers: dict):
    r = await client.get(
        "/api/volunteers/hours/summary", headers=admin_headers
    )
    assert r.status_code == 200
    assert "ranking" in r.json()
