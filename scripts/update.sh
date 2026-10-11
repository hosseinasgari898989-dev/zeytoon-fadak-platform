#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
if [[ ! -d .git ]]; then
  echo "این پوشه clone گیت نیست؛ آپدیت خودکار متوقف شد." >&2
  exit 1
fi

./scripts/backup.sh
git pull --ff-only
docker compose up -d --build --remove-orphans
docker compose ps
echo "به‌روزرسانی کامل شد؛ /health، فروشگاه و پنل را بررسی کن."
