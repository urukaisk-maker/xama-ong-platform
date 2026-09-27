#!/usr/bin/env bash
#
# Backup automático de XAMA-ONG
# - Dump completo de PostgreSQL
# - Compresión gzip
# - Rotación: 30 días diarios, 12 semanas, 12 meses
# - Almacenamiento: ./backups/
#
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-$HOME/proyectos/xama-ong-platform/backups}"
CONTAINER="xama-db"
DB_USER="${POSTGRES_USER:-xama_user}"
DB_NAME="${POSTGRES_DB:-xama_db}"
KEEP_DAILY=30
KEEP_WEEKLY=12
KEEP_MONTHLY=12

mkdir -p "$BACKUP_DIR"/{daily,weekly,monthly}
cd "$BACKUP_DIR"

TS=$(date +%Y%m%d_%H%M%S)
DAY_OF_WEEK=$(date +%u)   # 1=lunes ... 7=domingo
DAY_OF_MONTH=$(date +%d)

echo "[$(date)] Iniciando backup de $DB_NAME..."

# ─── Dump diario ───
DAILY_FILE="daily/xama_${TS}.sql.gz"
docker exec "$CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" --clean --if-exists \
  | gzip > "$DAILY_FILE"

SIZE=$(du -h "$DAILY_FILE" | cut -f1)
echo "[$(date)] ✓ Backup diario: $DAILY_FILE ($SIZE)"

# ─── Copia semanal (domingos) ───
if [ "$DAY_OF_WEEK" = "7" ]; then
  cp "$DAILY_FILE" "weekly/xama_week_${TS}.sql.gz"
  echo "[$(date)] ✓ Copia semanal creada"
fi

# ─── Copia mensual (día 1) ───
if [ "$DAY_OF_MONTH" = "01" ]; then
  cp "$DAILY_FILE" "monthly/xama_month_$(date +%Y%m)_${TS}.sql.gz"
  echo "[$(date)] ✓ Copia mensual creada"
fi

# ─── Rotación ───
cd "$BACKUP_DIR/daily"
ls -1t xama_*.sql.gz 2>/dev/null | tail -n +$((KEEP_DAILY + 1)) | xargs -r rm -f
cd "$BACKUP_DIR/weekly"
ls -1t xama_*.sql.gz 2>/dev/null | tail -n +$((KEEP_WEEKLY + 1)) | xargs -r rm -f
cd "$BACKUP_DIR/monthly"
ls -1t xama_*.sql.gz 2>/dev/null | tail -n +$((KEEP_MONTHLY + 1)) | xargs -r rm -f

echo "[$(date)] ✓ Rotación completada"
echo "[$(date)] Backup finalizado"
echo ""
echo "Estado actual:"
echo "  Diarios:  $(ls -1 $BACKUP_DIR/daily/*.sql.gz 2>/dev/null | wc -l)/$KEEP_DAILY"
echo "  Semanales: $(ls -1 $BACKUP_DIR/weekly/*.sql.gz 2>/dev/null | wc -l)/$KEEP_WEEKLY"
echo "  Mensuales: $(ls -1 $BACKUP_DIR/monthly/*.sql.gz 2>/dev/null | wc -l)/$KEEP_MONTHLY"
