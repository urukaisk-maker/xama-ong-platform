import pytest
from httpx import AsyncClient


async def test_login_admin_ok(client: AsyncClient):
    r = await client.post(
        "/api/auth/login",
        json={"email": "admin@xama.local", "password": "admin1234"},
    )
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


async def test_login_wrong_password(client: AsyncClient):
    r = await client.post(
        "/api/auth/login",
        json={"email": "admin@xama.local", "password": "wrongpass"},
    )
    assert r.status_code == 401


async def test_me_with_token(client: AsyncClient, admin_headers: dict):
    r = await client.get("/api/auth/me", headers=admin_headers)
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == "admin@xama.local"
    assert data["role_name"] == "junta"


async def test_me_without_token(client: AsyncClient):
    r = await client.get("/api/auth/me")
    assert r.status_code == 401


async def test_register_requires_junta(client: AsyncClient, volunteer_headers: dict):
    r = await client.post(
        "/api/auth/users",
        headers=volunteer_headers,
        json={
            "email": "nuevo@xama.local",
            "password": "pass1234",
            "full_name": "Nuevo",
            "role_id": 4,
        },
    )
    assert r.status_code == 403


async def test_create_user_as_admin(client: AsyncClient, admin_headers: dict):
    r = await client.post(
        "/api/auth/users",
        headers=admin_headers,
        json={
            "email": "coord.reus@xama.local",
            "password": "coord1234",
            "full_name": "Coordinador Reus",
            "site": "reus",
            "role_id": 2,
        },
    )
    assert r.status_code == 201
    assert r.json()["email"] == "coord.reus@xama.local"


async def test_list_users(client: AsyncClient, admin_headers: dict):
    r = await client.get("/api/auth/users", headers=admin_headers)
    assert r.status_code == 200
    assert isinstance(r.json(), list)
    assert len(r.json()) >= 1


async def test_list_roles(client: AsyncClient, admin_headers: dict):
    r = await client.get("/api/auth/roles", headers=admin_headers)
    assert r.status_code == 200
    roles = [x["name"] for x in r.json()]
    assert "junta" in roles
    assert "voluntario" in roles
