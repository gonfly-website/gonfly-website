-- GoNfly Admin Studio schema
-- Run in Supabase SQL Editor. Add an admin profile for your own auth user before using the portal.
create extension if not exists pgcrypto;

create table if not exists public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','editor','reviewer')),
  created_at timestamptz not null default now()
);

create table if not exists public.visa_missions (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  visa_type text not null,
  processing_time text not null default '',
  entry_type text not null default 'Single Entry',
  validity text not null default '',
  permitted_stay text not null default '',
  description text not null default '',
  pricing jsonb not null default '{"visa_fee":0,"service_fee":0,"verification_fee":0,"convenience_fee":0,"other_fee":0}'::jsonb,
  documents jsonb not null default '[]'::jsonb,
  notes text not null default '',
  image_url text not null default '',
  status text not null default 'draft' check (status in ('draft','review','approved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null,
  constraint pricing_is_object check (jsonb_typeof(pricing) = 'object'),
  constraint documents_is_array check (jsonb_typeof(documents) = 'array')
);

create index if not exists visa_missions_status_idx on public.visa_missions(status);
create index if not exists visa_missions_country_idx on public.visa_missions(country);

create or replace function public.touch_visa_mission()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  new.updated_by = auth.uid();
  return new;
end;
$$;

drop trigger if exists visa_missions_touch_updated_at on public.visa_missions;
create trigger visa_missions_touch_updated_at
before update on public.visa_missions
for each row execute function public.touch_visa_mission();

alter table public.admin_profiles enable row level security;
alter table public.visa_missions enable row level security;

-- Users can only read their own role profile. Admin profile creation is done by a trusted project owner in SQL.
drop policy if exists "Users read own admin profile" on public.admin_profiles;
create policy "Users read own admin profile" on public.admin_profiles
for select to authenticated using (user_id = auth.uid());

-- Only explicitly provisioned staff can read mission data.
drop policy if exists "Staff read missions" on public.visa_missions;
create policy "Staff read missions" on public.visa_missions
for select to authenticated using (
  exists (select 1 from public.admin_profiles p where p.user_id = auth.uid() and p.role in ('admin','editor','reviewer'))
);

-- Admins and editors can create and edit mission records.
drop policy if exists "Editors insert missions" on public.visa_missions;
create policy "Editors insert missions" on public.visa_missions
for insert to authenticated with check (
  exists (select 1 from public.admin_profiles p where p.user_id = auth.uid() and p.role in ('admin','editor'))
);

drop policy if exists "Editors update missions" on public.visa_missions;
create policy "Editors update missions" on public.visa_missions
for update to authenticated using (
  exists (select 1 from public.admin_profiles p where p.user_id = auth.uid() and p.role in ('admin','editor'))
) with check (
  exists (select 1 from public.admin_profiles p where p.user_id = auth.uid() and p.role in ('admin','editor'))
);

-- Only admins can delete a mission.
drop policy if exists "Admins delete missions" on public.visa_missions;
create policy "Admins delete missions" on public.visa_missions
for delete to authenticated using (
  exists (select 1 from public.admin_profiles p where p.user_id = auth.uid() and p.role = 'admin')
);

-- No anonymous policies are created. Never place the Supabase service-role key in browser code.
