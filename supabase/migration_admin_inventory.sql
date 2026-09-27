-- Field to Family: Admin Dashboard + Inventory + Secure Pricing migration
-- Run this in Supabase -> SQL Editor -> New query -> Run.
-- Safe to run once on your existing database. It adds new tables/columns and
-- does not delete any existing data. Run supabase/seed_products.sql AFTER this
-- file to populate the products table from the original hardcoded catalog.

-- ============================================================
-- 0. KEEP THESE IN SYNC WITH lib/products.js CONFIG
-- If you change minOrder / freeDeliveryAbove / deliveryFee in the code,
-- update the matching numbers inside place_order() below too.
-- ============================================================

-- ============================================================
-- 1. ADMIN ROLE
-- ============================================================
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Security-definer helper so RLS policies can check admin status without
-- recursively re-querying profiles under RLS (which would deadlock).
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_admin from public.profiles where id = auth.uid()), false);
$$;

-- To make your own account an admin, run this once with your email:
--   update public.profiles set is_admin = true
--   where id = (select id from auth.users where email = 'you@example.com');

-- ============================================================
-- 2. PRODUCTS
-- ============================================================
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique,                    -- stable short id, e.g. 'spinach' (used by the seed script)
  category text not null,              -- 'leafy' | 'roots' | 'gourds' | 'everyday' | any new category you add
  category_label text not null,        -- display label, e.g. 'Leafy greens'
  name text not null,
  name_hi text,
  name_te text,
  icon text default '🥬',
  price numeric not null check (price >= 0),
  unit text not null,
  stock integer not null default 0 check (stock >= 0),
  low_stock_threshold integer not null default 5,
  tags text[] not null default '{}',   -- e.g. {organic}, {season}
  active boolean not null default true,          -- admin on/off switch; false = hidden from catalog entirely
  available boolean not null default true,       -- currently orderable; auto-driven by stock
  manually_unavailable boolean not null default false, -- admin explicitly marked unavailable, independent of stock
  featured boolean not null default false,
  todays_harvest boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category, sort_order);
create index if not exists products_active_idx on public.products (active, available);

alter table public.products enable row level security;

-- Everyone (including anonymous visitors) can see active products.
-- Admins can see every product, including disabled ones.
drop policy if exists "products viewable by everyone" on public.products;
create policy "products viewable by everyone"
  on public.products for select
  using (active = true or public.is_admin());

drop policy if exists "products insertable by admin" on public.products;
create policy "products insertable by admin"
  on public.products for insert
  with check (public.is_admin());

drop policy if exists "products updatable by admin" on public.products;
create policy "products updatable by admin"
  on public.products for update
  using (public.is_admin())
  with check (public.is_admin());

-- No delete policy on purpose: products are disabled (active = false),
-- never deleted, so old orders that reference them still make sense.

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- 3. PRICE HISTORY
-- ============================================================
create table if not exists public.product_price_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  old_price numeric,
  new_price numeric not null,
  changed_by uuid references auth.users(id),
  changed_at timestamptz not null default now()
);

create index if not exists price_history_product_idx on public.product_price_history (product_id, changed_at desc);

alter table public.product_price_history enable row level security;

drop policy if exists "price history viewable by admin" on public.product_price_history;
create policy "price history viewable by admin"
  on public.product_price_history for select
  using (public.is_admin());
-- No insert/update/delete policy: rows are only ever written by the
-- security-definer trigger below, which bypasses RLS as its owner.

create or replace function public.log_price_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.price is distinct from new.price then
    insert into public.product_price_history (product_id, old_price, new_price, changed_by)
    values (new.id, old.price, new.price, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists products_log_price_change on public.products;
create trigger products_log_price_change
  after update on public.products
  for each row execute procedure public.log_price_change();

-- ============================================================
-- 4. INVENTORY TRANSACTIONS
-- ============================================================
create table if not exists public.inventory_transactions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  delta integer not null,              -- positive = restock, negative = sold/removed
  reason text not null,                -- 'admin_adjust' | 'order_placed' | 'order_cancelled'
  order_id uuid references public.orders(id) on delete set null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists inventory_tx_product_idx on public.inventory_transactions (product_id, created_at desc);

alter table public.inventory_transactions enable row level security;

drop policy if exists "inventory transactions viewable by admin" on public.inventory_transactions;
create policy "inventory transactions viewable by admin"
  on public.inventory_transactions for select
  using (public.is_admin());
-- No insert policy: only written by the security-definer functions below.

-- ============================================================
-- 5. ORDERS: add product linkage + admin visibility/updates
-- ============================================================
-- Existing "orders" table already has: area, address, flat_no, building,
-- street, latitude, longitude, slot, payment, notes, items (jsonb), status.
-- We only add what's missing and tighten who can write to it.

drop policy if exists "orders are viewable by owner" on public.orders;
create policy "orders are viewable by owner or admin"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

-- Customers can no longer INSERT orders directly (that would mean trusting
-- prices/totals sent from the browser). All order creation now goes through
-- place_order() below, which runs as the table owner and bypasses this.
drop policy if exists "orders are insertable by owner" on public.orders;

drop policy if exists "orders updatable by admin" on public.orders;
create policy "orders updatable by admin"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
-- 6. SECURE ORDER PLACEMENT
-- p_items: jsonb array like [{"product_id": "...", "qty": 2}, ...]
-- Runs as one transaction: locks each product row, checks it's active,
-- available and in stock, prices it from the database (never from the
-- browser), decrements stock, logs an inventory transaction, and inserts
-- the order. Raises an exception (which the app shows to the customer) if
-- anything is invalid.
-- ============================================================
create or replace function public.place_order(
  p_items jsonb,
  p_area text,
  p_address text,
  p_flat_no text,
  p_building text,
  p_street text,
  p_latitude double precision,
  p_longitude double precision,
  p_slot text,
  p_payment text,
  p_notes text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_product record;
  v_qty integer;
  v_subtotal numeric := 0;
  v_delivery_fee numeric := 0;
  v_total numeric := 0;
  v_line_items jsonb := '[]'::jsonb;
  v_order_id uuid;
  v_order_code text;
  -- Keep these two numbers in sync with CONFIG in lib/products.js
  v_min_order numeric := 150;
  v_free_delivery_above numeric := 500;
  v_delivery_fee_amount numeric := 30;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to place an order.';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Your basket is empty.';
  end if;

  -- Price and validate every line, locking each product row so concurrent
  -- orders cannot both oversell the same stock.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item ->> 'qty')::integer;
    if v_qty is null or v_qty <= 0 then
      raise exception 'Invalid quantity for an item in your basket.';
    end if;

    select * into v_product
    from public.products
    where id = (v_item ->> 'product_id')::uuid
    for update;

    if not found then
      raise exception 'One of the items in your basket no longer exists.';
    end if;

    if not v_product.active or not v_product.available then
      raise exception '% is currently unavailable.', v_product.name;
    end if;

    if v_product.stock < v_qty then
      raise exception 'Only % % of % left in stock.', v_product.stock, v_product.unit, v_product.name;
    end if;

    v_subtotal := v_subtotal + (v_product.price * v_qty);

    v_line_items := v_line_items || jsonb_build_object(
      'id', v_product.id,
      'name', v_product.name,
      'hi', v_product.name_hi,
      'te', v_product.name_te,
      'qty', v_qty,
      'unit', v_product.unit,
      'price', v_product.price,
      'lineTotal', v_product.price * v_qty
    );
  end loop;

  if v_subtotal < v_min_order then
    raise exception 'Minimum order is ₹%.', v_min_order;
  end if;

  v_delivery_fee := case when v_subtotal >= v_free_delivery_above then 0 else v_delivery_fee_amount end;
  v_total := v_subtotal + v_delivery_fee;
  v_order_code := 'F2F-' || to_char(now(), 'YYMMDD') || '-' || floor(1000 + random() * 9000)::text;

  insert into public.orders (
    user_id, order_code, items, subtotal, delivery_fee, total,
    area, address, flat_no, building, street, latitude, longitude,
    slot, payment, notes, status
  ) values (
    auth.uid(), v_order_code, v_line_items, v_subtotal, v_delivery_fee, v_total,
    p_area, p_address, p_flat_no, p_building, p_street, p_latitude, p_longitude,
    p_slot, p_payment, p_notes, 'placed'
  )
  returning id into v_order_id;

  -- Now that the order exists, decrement stock and log each transaction.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_qty := (v_item ->> 'qty')::integer;

    update public.products
    set stock = stock - v_qty,
        available = case
          when (stock - v_qty) <= 0 then false
          else not manually_unavailable
        end
    where id = (v_item ->> 'product_id')::uuid;

    insert into public.inventory_transactions (product_id, delta, reason, order_id, created_by)
    values ((v_item ->> 'product_id')::uuid, -v_qty, 'order_placed', v_order_id, auth.uid());
  end loop;

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_code', v_order_code,
    'items', v_line_items,
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery_fee,
    'total', v_total
  );
end;
$$;

revoke all on function public.place_order from public;
grant execute on function public.place_order to authenticated;

-- ============================================================
-- 7. ADMIN STOCK ADJUSTMENT (used by /admin/inventory quick buttons)
-- ============================================================
create or replace function public.adjust_stock(p_product_id uuid, p_delta integer)
returns public.products
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.products;
begin
  if not public.is_admin() then
    raise exception 'Only an admin can adjust stock.';
  end if;

  update public.products
  set stock = greatest(0, stock + p_delta),
      available = case
        when greatest(0, stock + p_delta) <= 0 then false
        else not manually_unavailable
      end
  where id = p_product_id
  returning * into v_row;

  if not found then
    raise exception 'Product not found.';
  end if;

  insert into public.inventory_transactions (product_id, delta, reason, created_by)
  values (p_product_id, p_delta, 'admin_adjust', auth.uid());

  return v_row;
end;
$$;

revoke all on function public.adjust_stock from public;
grant execute on function public.adjust_stock to authenticated;
