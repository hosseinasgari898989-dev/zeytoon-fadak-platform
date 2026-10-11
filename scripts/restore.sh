#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
file=${1:-}
if [[ -z "$file" || ! -f "$file" ]]; then
  echo "روش استفاده: ./scripts/restore.sh backups/fadak-DATE.sql" >&2
  exit 2
fi
if [[ ! -f .env ]]; then
  echo "فایل .env وجود ندارد." >&2
  exit 1
fi
set -a
# shellcheck disable=SC1091
. ./.env
set +a

echo "هشدار: بازیابی نسخه پشتیبان، اطلاعات فعلی پایگاه داده را جایگزین می‌کند."
read -r -p "برای ادامه، RESTORE را دقیقاً بنویس: " confirm
if [[ "$confirm" != "RESTORE" ]]; then
  echo "بازیابی لغو شد."
  exit 1
fi
docker compose exec -T db psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER:-fadak}" -d "${POSTGRES_DB:-fadak}" < "$file"
echo "فایل پشتیبان بازیابی شد؛ سلامت سرویس را بررسی کن."
