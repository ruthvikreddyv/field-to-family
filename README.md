# Field to Family (F2F)

A vegetable-ordering website for Hyderabad, built with Next.js and Supabase.

- Browse a vegetable catalog in English, Hindi and Telugu
- Add to basket, sign up / sign in, checkout with a Hyderabad delivery address
- Orders are saved to a real Postgres database (Supabase) tied to the customer's account
- Order history under **My orders**, editable default delivery details under **Account**
- On order confirmation, a WhatsApp/email link sends the order summary straight to the business

## Tech stack

- **Next.js 14** (Pages Router) — React framework, deploys cleanly to Vercel's free tier
- **Supabase** — Postgres database + authentication (email/password), free tier
- Plain CSS (`styles/globals.css`) — no UI framework needed

## Project structure

```
pages/          Routes: / (shop), /login, /signup, /account, /orders
components/     Header, Footer, Catalog, CartDrawer
context/        AuthContext (Supabase session), CartContext (basket state)
lib/            products.js (catalog + business config), supabaseClient.js
styles/         globals.css (all styling)
supabase/       schema.sql — run this in your Supabase project once
```

## Before you start

You'll need free accounts on:
1. [GitHub](https://github.com) — to host the code
2. [Supabase](https://supabase.com) — the database + login system
3. [Vercel](https://vercel.com) — to host the live website

See **DEPLOY.md** for the full step-by-step walkthrough.

## Editing the catalog, prices, or delivery areas

Everything is in `lib/products.js` — the `CONFIG` object (business name, WhatsApp number,
email, delivery areas, delivery slots, minimum order, delivery fee) and the `CATALOG` array
(vegetables, prices, Hindi/Telugu names). Edit, commit, and push — Vercel redeploys automatically.

## Running locally

```bash
npm install
cp .env.example .env.local   # then fill in your real Supabase URL/key
npm run dev
```

Open http://localhost:3000
