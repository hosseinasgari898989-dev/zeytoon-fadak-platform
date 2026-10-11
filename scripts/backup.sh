#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
if [[ ! -f .env ]]; then
  echo "فایل .env وجود ندارد." >&2
  exit 1
fi
set -a
# shellcheck disable=SC1091
. ./.env
set +a

mkdir -p backups
chmod 700 backups
file="backups/fadak-$(date -u +%Y%m%dT%H%M%SZ).sql"
docker compose exec -T db pg_dump --clean --if-exists --no-owner --no-acl -U "${POSTGRES_USER:-fadak}" -d "${POSTGRES_DB:-fadak}" > "$file"
chmod 600 "$file"
echo "نسخه‌ی پشتیبان ساخته شد: $file"
