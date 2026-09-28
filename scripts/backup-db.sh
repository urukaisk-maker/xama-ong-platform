#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

set -a
source .env.production
set +a

BACKUP_DIR="./backups"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/xama_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

docker compose -f docker-compose.prod.yml exec -T xama-db \
    pg_dump -U "${POSTGRES_USER}" "${POSTGRES_DB}" | gzip > "${BACKUP_FILE}"

find "${BACKUP_DIR}" -name "xama_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "✅ Backup: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"
