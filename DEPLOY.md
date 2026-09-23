# Deploying Field to Family — full step-by-step

This takes about 20–30 minutes the first time. You'll set up three free accounts
(GitHub, Supabase, Vercel) and connect them together. Do the steps in order.

---

## Part 1 — Get the code ready on your computer

1. Unzip the file you downloaded (`field-to-family.zip`) somewhere on your computer,
   e.g. `Desktop/field-to-family`.
2. Install [Node.js](https://nodejs.org) (version 18 or later) if you don't have it —
   download the "LTS" installer for your OS and run it.
3. Install [Git](https://git-scm.com/downloads) if you don't have it.
4. Open a terminal (Command Prompt / PowerShell on Windows, Terminal on Mac) and go into
   the project folder:
   ```bash
   cd Desktop/field-to-family
   ```
5. Install the project's dependencies:
   ```bash
   npm install
   ```
   This creates a `node_modules` folder — that's normal, it's not committed to GitHub.

---

## Part 2 — Create the database (Supabase)

1. Go to [supabase.com](https://supabase.com) and sign up (GitHub login is fastest).
2. Click **New project**.
   - Give it a name, e.g. `field-to-family`.
   - Set a database password (save it somewhere — you likely won't need it again, but keep it safe).
   - Pick a region close to Hyderabad, e.g. **Mumbai (ap-south-1)** or **Singapore**.
   - Click **Create new project** and wait about 2 minutes for it to spin up.
3. Once it's ready, open the **SQL Editor** (left sidebar) and click **New query**.
4. Open the file `supabase/schema.sql` from the project folder, copy its entire contents,
   paste it into the SQL editor, and click **Run**.
   - This creates the `profiles` and `orders` tables, locks them down so each customer can
     only see their own data (row-level security), and sets up automatic profile creation
     when someone signs up.
   - You should see "Success. No rows returned."
5. Go to **Authentication -> Providers** (left sidebar) and confirm **Email** is enabled
   (it is by default). Nothing else to change here for now.
6. Optional, for faster testing: go to **Authentication -> Sign In / Providers -> Email**
   and turn **off** "Confirm email" so new accounts can sign in immediately without clicking
   a confirmation link. You can turn this back on later for a real launch.
7. Go to **Project Settings -> API** (left sidebar, gear icon). You'll need two values from
   this page in the next step:
   - **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

---

## Part 3 — Connect the code to your database

1. Back in your project folder, make a copy of the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   (On Windows: `copy .env.example .env.local`)
2. Open `.env.local` in any text editor and fill in the real values:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...(the long anon key)
   NEXT_PUBLIC_WHATSAPP_NUMBER=91XXXXXXXXXX
   NEXT_PUBLIC_BUSINESS_EMAIL=you@yourdomain.com
   ```
   Use your real WhatsApp business number (country code + number, no spaces or +) and email —
   this is where the "Send order" button on the confirmation screen will send orders.
3. Test it locally:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000, sign up for a test account, add a few vegetables, and place
   a test order. Check in Supabase under **Table Editor -> orders** that the row appeared.
4. Stop the server (Ctrl+C) once you're happy.

---

## Part 4 — Push the code to GitHub

1. Go to [github.com/new](https://github.com/new) and create a new repository:
   - Name it `field-to-family` (or anything you like).
   - Leave it **Public** or **Private**, your choice.
   - Do **not** tick "Add a README" — you already have one.
   - Click **Create repository**.
2. GitHub will show you a page with commands. Back in your terminal, in the project folder,
   run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Field to Family"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/field-to-family.git
   git push -u origin main
   ```
   Replace `YOUR-USERNAME` with your actual GitHub username. If prompted, sign in with your
   GitHub credentials (or a personal access token if you have 2FA enabled).
3. Refresh the GitHub page — you should see all your files there. Note that `.env.local`
   should **not** appear (it's excluded by `.gitignore` on purpose, since it holds real
   credentials).

---

## Part 5 — Deploy the live site (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign up using **"Continue with GitHub"**.
2. Click **Add New -> Project**.
3. Find your `field-to-family` repository in the list and click **Import**.
4. Vercel auto-detects it's a Next.js app — leave the build settings as default.
5. Before clicking Deploy, open **Environment Variables** and add the same four values from
   your `.env.local`:
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | your WhatsApp number |
   | `NEXT_PUBLIC_BUSINESS_EMAIL` | your order email |
6. Click **Deploy**. Wait 1–2 minutes.
7. You'll get a live URL like `https://field-to-family.vercel.app` — open it and confirm the
   site loads, you can sign up, add items, and place an order.

---

## Part 6 — One last Supabase setting

Supabase needs to know your live URL is allowed to send auth requests (sign-up confirmation
links, password resets, etc.):

1. In Supabase, go to **Authentication -> URL Configuration**.
2. Set **Site URL** to your Vercel URL, e.g. `https://field-to-family.vercel.app`.
3. Under **Redirect URLs**, add the same URL.
4. Save.

---

## After launch: making changes

Any time you edit the code (e.g. update `lib/products.js` to change prices or add a
vegetable), just commit and push:

```bash
git add .
git commit -m "Update vegetable prices"
git push
```

Vercel automatically rebuilds and redeploys within about a minute — no manual redeploy needed.

## Using your own domain name

In Vercel, go to your project -> **Settings -> Domains** and add your domain (e.g.
`fieldtofamily.in`). Vercel will show you DNS records to add at your domain registrar
(GoDaddy, Namecheap, etc.). Once added, it usually activates within a few minutes to a few
hours. Remember to also add the new domain to Supabase's **Site URL / Redirect URLs**
(Part 6 above).

## Troubleshooting

- **"Invalid API key" or sign-up/sign-in does nothing**: double-check the Supabase URL and
  anon key in Vercel's Environment Variables match Project Settings -> API exactly, then
  redeploy (Vercel dashboard -> Deployments -> ⋯ -> Redeploy).
- **Orders don't appear in "My orders"**: open Supabase -> Table Editor -> orders and check
  a row was actually created; if not, check the browser console for the error Supabase
  returned (usually a row-level-security policy mismatch — re-run `supabase/schema.sql`).
- **New sign-ups can't sign in right away**: "Confirm email" is likely still on — see Part 2,
  step 6, or have users check their inbox for the confirmation link.
