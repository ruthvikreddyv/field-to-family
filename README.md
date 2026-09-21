# Field to Family (F2F)

Production-style MVP for a hyperlocal fresh-vegetable ordering and delivery service.

## Stack

- Frontend: Next.js + React + TypeScript
- Backend: FastAPI + SQLAlchemy + Alembic
- Database: PostgreSQL
- Auth: HTTP-only JWT cookie with role checks
- Payments: Pay on Delivery only
- Email: SMTP adapter with safe development preview when SMTP is not configured

## Business rules implemented

- Delivery days: Monday, Wednesday, Friday
- Cutoff: 05:00 Asia/Kolkata
- Before 05:00 on a delivery day -> same day
- At/after 05:00 or on another weekday -> next Monday/Wednesday/Friday
- Delivery window: 05:00–07:00
- Delivery date is calculated by the backend and persisted with the order
- Product prices, purchase prices, apartments and quantity rules come from PostgreSQL
- Delivery completion rejects cash mismatches; admin has an explicit override path

## Local development

### 1. Database with Docker

```bash
docker compose up -d db
```

### 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
python3 -m app.seed
uvicorn app.main:app --reload --port 8000
```

Set `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_PARTNER_EMAIL`, and `SEED_PARTNER_PASSWORD` in `.env`. Never commit real credentials.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

## Full Docker stack

```bash
docker compose up --build
```

Customer site: http://localhost:3000  
API docs: http://localhost:8000/docs  
Health: http://localhost:8000/health

## Email

Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD and SMTP_FROM in the backend environment. Without SMTP, the backend emits a structured confirmation preview in its logs and still records the notification event in PostgreSQL.

## Deployment

Recommended split deployment:

- Frontend: Vercel
- Backend: Render/Railway/Fly/AWS
- Database: managed PostgreSQL

For production, keep frontend and API under the same site (for example `www.example.com` and `api.example.com`) or proxy `/api` through the frontend so the cookie-authenticated workflow remains same-site. Set `COOKIE_SECURE=true` and use HTTPS.

## API highlights

- `GET /products`
- `GET /apartments`
- `GET /schedule/next`
- `POST /orders`
- `GET /orders/{order_id}/track?phone=...`
- `POST /auth/login`
- `POST /auth/register`
- `GET /customer/orders`
- `GET /admin/dashboard`
- `GET /admin/orders`
- `GET /admin/procurement`
- `GET /admin/packing`
- `GET /admin/reconciliation`
- `POST /delivery/{delivery_id}/complete`
- `POST /delivery/{delivery_id}/issue`
- `POST /bulk-inquiries`

## Tests

```bash
cd backend
pytest -q
```

The test suite covers delivery-date rules, quantity validation, order total math, payment amount validation, and role authorization primitives.
