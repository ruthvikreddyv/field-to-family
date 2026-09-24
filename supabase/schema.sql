-- Field to Family: database schema for Supabase (Postgres)
-- Run this once in your Supabase project: SQL Editor -> New query -> paste -> Run.

create extension if not exists pgcrypto;

-- 1. PROFILES - one row per signed-up customer, linked to auth.users

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  default_address text,
  default_area text,
  flat_no text,
  building text,
  street text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles are viewable by owner" on public.profiles;
create policy "profiles are viewable by owner"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles are editable by owner" on public.profiles;
create policy "profiles are editable by owner"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "profiles are insertable by owner" on public.profiles;
create policy "profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up, using the
-- full_name / phone passed in at signup (see lib/auth.js).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 2. ORDERS - one row per placed order
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_code text not null,
  items jsonb not null,
  subtotal numeric not null,
  delivery_fee numeric not null default 0,
  total numeric not null,
  area text not null,
  address text not null,
  flat_no text,
  building text,
  street text,
  latitude double precision,
  longitude double precision,
  slot text,
  payment text,
  notes text,
  status text not null default 'placed',
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

drop policy if exists "orders are viewable by owner" on public.orders;
create policy "orders are viewable by owner"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "orders are insertable by owner" on public.orders;
create policy "orders are insertable by owner"
  on public.orders for insert
  with check (auth.uid() = user_id);

create index if not exists orders_user_id_idx on public.orders (user_id, created_at desc);
