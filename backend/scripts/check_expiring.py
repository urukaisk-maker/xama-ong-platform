"""Script de cron: comprueba lotes que caducan pronto y avisa por email.

Uso:
    docker compose exec xama-api python -m scripts.check_expiring
"""
import asyncio
import os
import sys

from app.db.session import SessionLocal
from app.modules.notifications.service import notify_expiring_batches


async def main():
    days = int(os.getenv("EXPIRING_DAYS", "3"))
    inventory_url = os.getenv(
        "INVENTORY_URL", "http://localhost:3100/inventory"
    )

    print(f"→ Comprobando lotes que caducan en los próximos {days} días...")
    print()

    async with SessionLocal() as db:
        result = await notify_expiring_batches(
            db, days=days, inventory_url=inventory_url
        )

    print()
    print("=" * 70)
    print("  RESUMEN")
    print("=" * 70)
    total = 0
    for site, info in result.items():
        count = info["count"]
        total += count
        if count == 0:
            print(f"  {site.capitalize():<12} sin lotes próximos a caducar")
        else:
            extra = ""
            if info.get("dryrun"):
                extra = " (dryrun)"
            elif info.get("sent"):
                extra = f" → {', '.join(info['sent'])}"
            elif info.get("skipped"):
                extra = f" (saltado: {info['skipped']})"
            elif info.get("error"):
                extra = f" ERROR: {info['error']}"
            print(f"  {site.capitalize():<12} {count} lote(s){extra}")
    print()
    print(f"  Total: {total} lotes próximos a caducar")
    print()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        sys.exit(130)
