-- Field to Family: migration to add structured address fields
-- Run this in Supabase -> SQL Editor -> New query -> Run.
-- Safe to run on your existing database: it only ADDS columns, nothing is deleted
-- or overwritten, and your existing orders/profiles rows are untouched.

alter table public.profiles
  add column if not exists flat_no text,
  add column if not exists building text,
  add column if not exists street text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

alter table public.orders
  add column if not exists flat_no text,
  add column if not exists building text,
  add column if not exists street text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;
