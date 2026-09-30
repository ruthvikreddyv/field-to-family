# Admin Dashboard — setup and how it works

This covers the database-backed product/inventory system, the protected
`/admin` area, and staff (Admin/Supervisor) accounts. Login is plain email +
password (no SMS costs, no third-party provider needed).

## What changed from the original site

- **Products, prices, and stock live in Supabase**, not in the code. The
  homepage catalog reads live from the database — add/edit/disable a
  vegetable from your phone, no code change or redeploy.
- **Order pricing is calculated on the server**, never trusted from the
  browser. Checkout calls a Postgres function (`place_order`) that looks up
  the *current* price and stock for each item, validates everything,
  decrements stock, and only then creates the order.
- **Real photos instead of emoji icons.** Each product can have an uploaded
  photo (stored in Supabase Storage); until you add one, it shows a plain
  letter placeholder instead of an icon.
- **No "today's harvest" flag** — every vegetable is delivered the day it's
  bought, so a per-item badge for that didn't mean anything. Removed.
- **`/admin`** (Dashboard, Products, Inventory, Orders) is visible only to
  accounts with `role = 'admin'` or `role = 'supervisor'` — both have
  identical permissions, "Supervisor" is just a separate label for a second
  tier of staff. This is enforced by the database (row-level security), not
  just by hiding the menu link.
- **A separate staff login at `/admin/login`.** Same email/password
  mechanism as the customer login, but it never creates a new account — only
  accounts already promoted to staff can get in there.

## One-time database setup

Run these in order, in Supabase → SQL Editor:

1. **`supabase/migration_admin_inventory.sql`** — creates `products`,
   `product_price_history`, `inventory_transactions`, and the `place_order` /
   `adjust_stock` functions.
2. **`supabase/seed_products.sql`** — copies the original 30-vegetable
   catalog into `products`. Safe to re-run.
3. **`supabase/migration_roles_images.sql`** — adds the `role` column
   (customer/supervisor/admin), the product photo storage bucket, and drops
   the unused "today's harvest" column.
4. **`supabase/migration_revert_email_auth.sql`** — run this too, it keeps
   new-signup profiles reading from the email signup form correctly.

## Making yourself the first admin

You must already have signed up once on the live site (so a `profiles` row
exists for you) before running this. In Supabase → SQL Editor, using the
email you signed up with:

- Remove someone's staff access, returning them to a normal customer account

## Replacing project files

Copy everything from this update into your project:

```
components/               (Icons.jsx is new; others updated)
context/                  (ProductsContext.js is new; others updated)
lib/products.js
pages/                    (login.js rewritten, signup.js now just redirects,
                            admin/login.js is new, admin/* updated)
supabase/migration_roles_images.sql   (new)
supabase/seed_products.sql            (updated)
styles/globals.css
.gitignore
```

Then test locally (`npm run dev`):
1. Sign up with a real email/password on the live site
2. Run the "make yourself admin" SQL above
3. Go to `/admin/login`, sign in again there
4. In `/admin/products`, edit a vegetable and upload a real photo of it
5. Confirm the homepage catalog shows that photo immediately
6. In `/admin/inventory`, tap +/- and confirm stock updates
7. Place a real test order and confirm it appears in `/admin/orders`
8. In the Dashboard's Staff access panel, try adding a second staff member by phone number

Then commit and push as usual — Vercel redeploys automatically. No new
environment variables are needed for anything in this update.

## How stock and availability interact

- **`active`** — the admin on/off switch. Off means the product disappears
  from the catalog entirely (old orders that reference it still work).
- **`available`** — whether it's currently orderable. Flips to false
  automatically at 0 stock, and back to true automatically when restocked —
  unless you've checked "Mark unavailable to customers" in the product form,
  which overrides the automatic behavior until unchecked.

## Price history & inventory log

Every price change is logged automatically (old price → new price → who →
when) in `product_price_history`, and every stock change in
`inventory_transactions`. There's no dedicated admin screen for these yet —
view them directly in Supabase → Table Editor if you need to audit something.
