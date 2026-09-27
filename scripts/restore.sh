#!/usr/bin/env bash
#
# Restaura un backup de XAMA-ONG
# Uso: ./restore.sh backups/daily/xama_20260927_030000.sql.gz
#
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Uso: $0 <ruta_al_backup.sql.gz>"
  exit 1
fi

BACKUP_FILE="$1"
CONTAINER="xama-db"
DB_USER="${POSTGRES_USER:-xama_user}"
DB_NAME="${POSTGRES_DB:-xama_db}"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "✗ No existe: $BACKUP_FILE"
  exit 1
fi

echo "⚠  ATENCIÓN: vas a SOBREESCRIBIR la base de datos '$DB_NAME'"
echo "   Backup: $BACKUP_FILE"
read -p "   ¿Continuar? (escribe 'SI' para confirmar): " CONFIRM

if [ "$CONFIRM" != "SI" ]; then
  echo "Cancelado."
  exit 0
fi

echo "[$(date)] Restaurando..."
gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER" psql -U "$DB_USER" -d "$DB_NAME"
echo "[$(date)] ✓ Restaurado"
