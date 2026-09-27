from httpx import AsyncClient


async def test_impact(client: AsyncClient, admin_headers: dict):
    r = await client.get("/api/metrics/impact", headers=admin_headers)
    assert r.status_code == 200
    data = r.json()
    assert "total_kg_recovered" in data
    assert "co2_avoided_kg" in data
    assert "total_families" in data


async def test_export_csv(client: AsyncClient, admin_headers: dict):
    r = await client.get(
        "/api/metrics/export.csv?year=2026", headers=admin_headers
    )
    assert r.status_code == 200
    assert "text/csv" in r.headers["content-type"]
    assert "XAMA-ONG" in r.text


async def test_export_pdf(client: AsyncClient, admin_headers: dict):
    r = await client.get(
        "/api/metrics/report.pdf?year=2026", headers=admin_headers
    )
    assert r.status_code == 200
    assert r.headers["content-type"] == "application/pdf"
    assert r.content.startswith(b"%PDF")


async def test_export_requires_role(client: AsyncClient, volunteer_headers: dict):
    r = await client.get(
        "/api/metrics/report.pdf", headers=volunteer_headers
    )
    assert r.status_code == 403
