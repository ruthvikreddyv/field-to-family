-- Field to Family: roles + product images + remove "today's harvest" migration.
-- Run this in Supabase -> SQL Editor -> New query -> Run, AFTER
-- migration_admin_inventory.sql and seed_products.sql have already been run.
-- Safe on your existing database: adds/renames, doesn't delete customer data.

-- ============================================================
-- 1. ROLES: admin and supervisor have identical permissions here -
-- "staff" just means either of them. Replaces the old is_admin boolean.
-- ============================================================
alter table public.profiles
  add column if not exists role text not null default 'customer'
    check (role in ('customer', 'supervisor', 'admin'));

-- Carry over anyone already marked is_admin from the previous migration.
update public.profiles set role = 'admin' where is_admin = true and role = 'customer';

create or replace function public.is_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select role in ('admin', 'supervisor') from public.profiles where id = auth.uid()), false);
$$;

-- To make an account staff for the very first time (before the in-app
-- "Staff access" panel has anyone to use it), run this once with the
-- person's phone number in +91XXXXXXXXXX format:
--   update public.profiles set role = 'admin'
--   where id = (select id from auth.users where phone = '91XXXXXXXXXX');

-- Re-point every policy that used to call is_admin() at is_staff() instead.
drop policy if exists "products viewable by everyone" on public.products;
create policy "products viewable by everyone"
  on public.products for select
  using (active = true or public.is_staff());

drop policy if exists "products insertable by admin" on public.products;
create policy "products insertable by staff"
  on public.products for insert
  with check (public.is_staff());

drop policy if exists "products updatable by admin" on public.products;
create policy "products updatable by staff"
  on public.products for update
  using (public.is_staff())
  with check (public.is_staff());

drop policy if exists "price history viewable by admin" on public.product_price_history;
create policy "price history viewable by staff"
  on public.product_price_history for select
  using (public.is_staff());

drop policy if exists "inventory transactions viewable by admin" on public.inventory_transactions;
create policy "inventory transactions viewable by staff"
  on public.inventory_transactions for select
  using (public.is_staff());

drop policy if exists "orders are viewable by owner or admin" on public.orders;
create policy "orders are viewable by owner or staff"
  on public.orders for select
  using (auth.uid() = user_id or public.is_staff());

drop policy if exists "orders updatable by admin" on public.orders;
create policy "orders updatable by staff"
  on public.orders for update
  using (public.is_staff())
  with check (public.is_staff());

-- adjust_stock() now checks is_staff() instead of is_admin().
create or replace function public.adjust_stock(p_product_id uuid, p_delta integer)
returns public.products
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.products;
begin
  if not public.is_staff() then
    raise exception 'Only staff can adjust stock.';
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

-- The old is_admin boolean and function are no longer used anywhere.
drop function if exists public.is_admin();
alter table public.profiles drop column if exists is_admin;

-- ============================================================
-- 2. PHONE-BASED ACCOUNTS: profiles are now created from a phone signup,
-- not email. Update the new-user trigger to read the phone straight off
-- auth.users (Supabase sets this natively for phone OTP accounts).
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.phone
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================
-- 3. PRODUCT IMAGES: real photos instead of emoji icons.
-- ============================================================
alter table public.products
  add column if not exists image_url text;

-- A public storage bucket the admin dashboard uploads product photos into.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product images are publicly readable" on storage.objects;
create policy "product images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "product images upload by staff" on storage.objects;
create policy "product images upload by staff"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_staff());

drop policy if exists "product images update by staff" on storage.objects;
create policy "product images update by staff"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_staff());

drop policy if exists "product images delete by staff" on storage.objects;
create policy "product images delete by staff"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_staff());

-- ============================================================
-- 4. REMOVE "TODAY'S HARVEST": every vegetable is delivered the same day
-- it's bought, so a per-item "today's harvest" flag doesn't mean anything.
-- ============================================================
alter table public.products drop column if exists todays_harvest;
