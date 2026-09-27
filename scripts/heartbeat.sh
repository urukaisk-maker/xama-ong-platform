#!/usr/bin/env bash
#
# Envía un "latido" a healthchecks.io si los servicios responden.
# Se ejecuta por cron cada 5 minutos.
#
set -euo pipefail

# ── Configuración ──
# Rellena estos valores con las URLs de healthchecks.io
HC_API_URL="${HC_API_URL:-https://hc-ping.com/TU-UUID-AQUI}"
HC_WEB_URL="${HC_WEB_URL:-https://hc-ping.com/OTRO-UUID-AQUI}"

API_LOCAL="http://localhost:8100/health"
WEB_LOCAL="http://localhost:3100"
TIMEOUT=5

# ── Funciones ──
ping() {
  curl -fsS -m "$TIMEOUT" "$1" -o /dev/null 2>&1
}

notify() {
  local url="$1"
  local suffix="$2"
  if [ -n "$url" ]; then
    curl -fsS -m "$TIMEOUT" "${url}${suffix}" -o /dev/null 2>&1 || true
  fi
}

# ── Check API ──
if ping "$API_LOCAL"; then
  echo "[$(date)] ✓ API responde"
  notify "$HC_API_URL" ""
else
  echo "[$(date)] ✗ API no responde" >&2
  notify "$HC_API_URL" "/fail"
fi

# ── Check Web ──
if ping "$WEB_LOCAL"; then
  echo "[$(date)] ✓ Web responde"
  notify "$HC_WEB_URL" ""
else
  echo "[$(date)] ✗ Web no responde" >&2
  notify "$HC_WEB_URL" "/fail"
fi
