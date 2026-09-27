# Admin Dashboard — setup and how it works

This update replaces the hardcoded vegetable list with a real database-backed
product/inventory system, plus a protected `/admin` area.

## What changed

- **Products, prices, and stock now live in Supabase**, not in the code. The
  homepage catalog reads live from the database.
- **Order pricing is calculated on the server**, never trusted from the
  browser. When a customer checks out, the app calls a Postgres function
  (`place_order`) that looks up the *current* price and stock for each item,
  validates everything, decrements stock, and only then creates the order.
  This closes the "someone edits the price in their browser" hole.
- **A new `/admin` area** (Dashboard, Products, Inventory, Orders) is visible
  only to accounts with `is_admin = true`, enforced by the database itself
  (row-level security), not just by hiding the menu link.

## One-time setup

Do these in order, in Supabase → SQL Editor:

1. **Run `supabase/migration_admin_inventory.sql`** — creates the `products`,
   `product_price_history`, and `inventory_transactions` tables, adds the
   `is_admin` column, and creates the `place_order` / `adjust_stock`
   functions. Safe on your existing database — nothing is deleted.

2. **Run `supabase/seed_products.sql`** — copies your original 30-vegetable
   catalog into the new `products` table so you don't start from empty. Safe
   to re-run; it skips anything already there.

3. **Make your own account an admin.** In SQL Editor, run (with your real
   email):
   ```sql
   update public.profiles set is_admin = true
   where id = (select id from auth.users where email = 'you@example.com');
   ```
   You must have already signed up on the site with that email before
   running this.

4. **Sign out and back in** on the site (or just refresh) so the app picks
   up your new admin status, then open **/admin** — you should see the
   dashboard, or an "Admin" link in the header.

## Replacing project files

Copy these files/folders from this update into your project, overwriting
what's there:

```
components/AdminLayout.jsx   (new)
components/Catalog.jsx
components/CartDrawer.jsx
components/Header.jsx
context/ProductsContext.js   (new)
context/CartContext.js
lib/products.js
pages/index.js
pages/admin/                 (new folder: index.js, products.js, inventory.js, orders.js)
supabase/migration_admin_inventory.sql  (new)
supabase/seed_products.sql              (new)
.gitignore
```

Then test locally (`npm run dev`), sign in as your admin account, and check:
- `/admin` loads and shows real counts
- `/admin/products` lets you add/edit a vegetable and change its price
- `/admin/inventory` lets you tap +/- and see stock update
- The homepage catalog reflects those changes immediately (no redeploy)
- `/admin/orders` shows a test order and lets you change its status

Then commit and push as usual — Vercel redeploys automatically.

## How stock and availability interact

- **`active`** — the admin on/off switch. Off means the product disappears
  from the catalog entirely (but old orders that reference it still work).
- **`available`** — whether it's currently orderable. This flips to false
  automatically when stock hits 0, and back to true automatically when you
  restock — *unless* you've manually checked "Mark unavailable to customers"
  in the product form, which overrides the automatic behavior until you
  uncheck it.

## Price history & inventory log

Every price change is automatically logged (old price → new price → who →
when) in `product_price_history`, and every stock change (order or manual
adjustment) is logged in `inventory_transactions`. There's no admin screen
for these yet — you can view them directly in Supabase → Table Editor if
you ever need to audit something.

## "Order again" and other nice-to-haves

The spec mentioned a few lightweight extras (search, "only 3 left" badges,
"order again"). Search and stock badges are already in this update. "Order
again" from a past order isn't built yet — it's a small addition (a button
on `/orders` that re-adds that order's items to the current basket) if you
want it next.
