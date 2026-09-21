# Field to Family — Deployment

Recommended initial deployment: Render for the FastAPI backend, Next.js frontend, and managed PostgreSQL.

## GitHub

Create a new GitHub repository, then from this directory:

```bash
git init
git add .
git commit -m "Initial F2F MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Do not commit `.env` files or production secrets.

## Render Blueprint

1. Open Render Dashboard.
2. Choose **New → Blueprint**.
3. Connect the GitHub repository.
4. Select the `main` branch.
5. Render reads `render.yaml` and proposes the `f2f-api`, `f2f-web`, and `f2f-db` resources.
6. Enter the secret values for the admin/rider accounts, Farm Team contact details, and SMTP if email is enabled.
7. Deploy the Blueprint.

The backend runs migrations and the idempotent seed command before starting Uvicorn. The frontend proxies `/api/*` requests to the backend, keeping browser authentication on the frontend origin.

## After deploy

Backend:

`https://<f2f-api>.onrender.com/health`

Swagger:

`https://<f2f-api>.onrender.com/docs`

Frontend:

`https://<f2f-web>.onrender.com`

The frontend's `F2F_BACKEND_URL` is wired from the backend service's public Render URL.

## Production notes

The included Blueprint uses Render's Free plans for an inexpensive first deployment. Render states that Free web services spin down after 15 minutes of inactivity and Free Postgres expires after 30 days and has no backups. Use paid resources before accepting real customer orders for a production launch.

The backend must keep `COOKIE_SECURE=true` in production.

Configure a real SMTP provider before relying on customer confirmation emails. Render Free web services cannot send outbound SMTP traffic on ports 25, 465, or 587, so use a paid service/plan or a transactional-email HTTPS API when enabling production email delivery.
