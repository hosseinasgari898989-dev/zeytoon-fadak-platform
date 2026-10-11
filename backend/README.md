# Fadak API

API service for the customer shop and the consignments accounting panel.

## Run locally
\`\`\`bash
cd backend
python -m venv .venv
# Linux/macOS
. .venv/bin/activate
# Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
export DATABASE_URL=sqlite+aiosqlite:///./fadak.db
uvicorn app.main:app --reload
\`\`\`

Open \`/docs\` for the interactive API reference and \`/health\` to inspect service/database readiness.

## Key routes
- \`GET /api/catalog\` — public catalog and server-side prices.
- \`POST /api/orders\` — validated order submission; price is recalculated on the server.
- \`POST /api/orders/track\` — order tracking protected by order code + last four phone digits.
- \`GET /api/state\` and \`PUT /api/state\` — versioned accounting-panel state; requires bearer token and \`If-Match\`.
- \`GET /api/admin/orders\`, \`PATCH /api/admin/orders/{code}/status\` — starter admin order controls.
- \`POST /api/wholesale\`, \`/api/contact\`, \`/api/subscriptions\` — persist public form submissions.
- \`POST /api/pos/import-csv\` — authenticated CSV import; amount units must be documented in the source file.
- \`POST /api/pos/webhook\` — accepts HMAC-signed JSON only after a secret is configured.
- \`GET /api/reconcile?month=YYYY-MM\` — starter report comparing saved panel sales with imported terminal references/amounts.

## Important boundaries
- The existing accounting panel uses a shared bearer token as a compatibility bridge. Before wider production use, replace it with named users, password hashing, roles and short-lived sessions.
- The payment adapter is intentionally disabled. A real merchant account, official provider API contract, callback validation and independent payment-verification tests are needed before accepting online payments.
- Actual physical POS devices do not integrate automatically. CSV import or a vendor's authenticated webhook/API is required.
- SMS delivery, OTP login and email delivery are not implemented by this starter.
