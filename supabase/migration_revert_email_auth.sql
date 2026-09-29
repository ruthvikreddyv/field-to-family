-- Field to Family: revert to email-based signup.
-- Run this in Supabase -> SQL Editor -> New query -> Run.
-- Only needed if you had already run migration_roles_images.sql (which
-- pointed the new-user trigger at phone-auth's native phone field). This
-- points it back at the phone number typed into the signup form instead.

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
