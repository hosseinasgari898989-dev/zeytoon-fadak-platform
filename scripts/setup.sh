#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker پیدا نشد. ابتدا Docker Engine و Docker Compose را نصب کن."
  exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "افزونه‌ی Docker Compose در دسترس نیست."
  exit 1
fi
if ! command -v openssl >/dev/null 2>&1; then
  echo "ابزار openssl برای ساخت رمز امن پیدا نشد."
  exit 1
fi
if [[ -e .env ]]; then
  echo "فایل .env از قبل وجود دارد؛ برای جلوگیری از بازنویسی تنظیمات، متوقف شد."
  exit 1
fi

DB_PASSWORD=$(openssl rand -hex 24)
read -r -s -p "یک توکن خصوصی تصادفی (حداقل ۳۲ نویسه) برای پنل وارد کن: " PANEL_TOKEN
printf '\n'
if [[ ${#PANEL_TOKEN} -lt 32 ]]; then
  echo "توکن پنل باید دست‌کم ۳۲ نویسه باشد."
  exit 1
fi

cat > .env <<EOF
POSTGRES_DB=fadak
POSTGRES_USER=fadak
POSTGRES_PASSWORD=$DB_PASSWORD
DATABASE_URL=postgresql+asyncpg://fadak:$DB_PASSWORD@db:5432/fadak
FADAK_PANEL_TOKEN=$PANEL_TOKEN
ALLOWED_ORIGINS=http://localhost:8080,http://127.0.0.1:8080
WEB_PORT=8080
FADAK_PUBLIC_PHONE=
FADAK_PUBLIC_ADDRESS=
PAYMENT_PROVIDER=disabled
ZARINPAL_MERCHANT_ID=
POS_WEBHOOK_SECRET=
EOF
chmod 600 .env
unset DB_PASSWORD PANEL_TOKEN

docker compose up -d --build
echo "اجرا انجام شد. فایل خصوصی .env را نگه دار و /health را بررسی کن."
