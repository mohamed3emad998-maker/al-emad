-- =====================================================================
-- AL-EMAD Automotive Services — database schema, security policies, storage
-- Run once in Supabase: SQL Editor -> New query -> paste -> Run.
-- Then run supabase/seed.sql for the initial website content.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Roles & profiles
-- admin      : everything (settings, users, content, bookings)
-- editor     : website content only
-- reception  : bookings & inquiries only
-- A new auth user gets NO role (no dashboard access) until an admin assigns one.
-- ---------------------------------------------------------------------
do $$ begin
  create type public.app_role as enum ('admin', 'editor', 'reception');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role public.app_role,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now()
);

create or replace function public.has_role(roles public.app_role[])
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any (roles)
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Site settings (single row)
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  logo_url text,
  favicon_url text,
  colors jsonb not null default '{}'::jsonb,
  hero jsonb not null default '{}'::jsonb,
  seo jsonb not null default '{}'::jsonb,
  contact jsonb not null default '{}'::jsonb,
  social jsonb not null default '{}'::jsonb,
  sections jsonb not null default '{}'::jsonb,
  nav jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Editable text blocks (headlines, descriptions, footer…) in AR + EN
-- ---------------------------------------------------------------------
create table if not exists public.content (
  key text primary key,
  value_ar text not null default '',
  value_en text not null default '',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Statistics counters (value NULL = shown as a placeholder until real data is entered)
-- ---------------------------------------------------------------------
create table if not exists public.stats (
  id uuid primary key default gen_random_uuid(),
  value int,
  suffix text not null default '',
  label_ar text not null default '',
  label_en text not null default '',
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Services
-- ---------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title_ar text not null,
  title_en text not null default '',
  summary_ar text not null default '',
  summary_en text not null default '',
  details_ar text not null default '',
  details_en text not null default '',
  image_url text,
  image_alt_ar text not null default '',
  image_alt_en text not null default '',
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Spare parts catalog (no prices — every part is quote-on-request)
-- ---------------------------------------------------------------------
create table if not exists public.part_categories (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.parts (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.part_categories (id) on delete set null,
  name_ar text not null,
  name_en text not null default '',
  description_ar text not null default '',
  description_en text not null default '',
  image_url text,
  image_alt_ar text not null default '',
  image_alt_en text not null default '',
  brands text[] not null default '{}',
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Gallery (images & videos)
-- ---------------------------------------------------------------------
create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  category text not null default 'workshop'
    check (category in ('workshop', 'technicians', 'cars', 'engines', 'parts', 'diagnostics')),
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  url text not null,
  poster_url text,
  caption_ar text not null default '',
  caption_en text not null default '',
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Testimonials
-- ---------------------------------------------------------------------
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  car text not null default '',
  text_ar text not null default '',
  text_en text not null default '',
  rating int not null default 5 check (rating between 1 and 5),
  photo_url text,
  published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Bookings, quote requests & inquiries (from the public website)
-- ---------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  ref bigint generated always as identity (start with 1001),
  kind text not null default 'booking' check (kind in ('booking', 'quote', 'inquiry')),
  name text not null check (char_length(name) between 2 and 120),
  phone text not null check (char_length(phone) between 6 and 30),
  car_brand text check (char_length(car_brand) <= 60),
  car_model text check (char_length(car_model) <= 120),
  service text check (char_length(service) <= 160),
  part_name text check (char_length(part_name) <= 200),
  preferred_date date,
  message text check (char_length(message) <= 2000),
  status text not null default 'new' check (status in ('new', 'contacted', 'completed', 'cancelled')),
  notes text,
  locale text not null default 'ar' check (locale in ('ar', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bookings_status_idx on public.bookings (status);
create index if not exists bookings_created_idx on public.bookings (created_at desc);

-- Live "new request" notifications in the dashboard (Realtime respects RLS)
do $$ begin
  alter publication supabase_realtime add table public.bookings;
exception when others then null; end $$;

-- Keep "last sign-in" visible on the Users page
create or replace function public.sync_last_sign_in()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set last_sign_in_at = new.last_sign_in_at where id = new.id;
  return new;
end;
$$;
drop trigger if exists on_auth_user_signin on auth.users;
create trigger on_auth_user_signin
  after update of last_sign_in_at on auth.users
  for each row execute function public.sync_last_sign_in();

-- updated_at triggers
do $$
declare t text;
begin
  foreach t in array array['site_settings','content','stats','services','part_categories','parts','gallery_items','testimonials','bookings']
  loop
    execute format('drop trigger if exists %I_touch on public.%I', t, t);
    execute format('create trigger %I_touch before update on public.%I for each row execute function public.touch_updated_at()', t, t);
  end loop;
end $$;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles        enable row level security;
alter table public.site_settings   enable row level security;
alter table public.content         enable row level security;
alter table public.stats           enable row level security;
alter table public.services        enable row level security;
alter table public.part_categories enable row level security;
alter table public.parts           enable row level security;
alter table public.gallery_items   enable row level security;
alter table public.testimonials    enable row level security;
alter table public.bookings        enable row level security;

-- Clean re-run
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public' loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- profiles: you can read your own row; admins read & manage all. Nobody can change their own role.
create policy "profiles: read own or admin" on public.profiles
  for select using (id = auth.uid() or public.has_role(array['admin']::public.app_role[]));
create policy "profiles: admin update" on public.profiles
  for update using (public.has_role(array['admin']::public.app_role[]))
  with check (public.has_role(array['admin']::public.app_role[]));
create policy "profiles: admin delete" on public.profiles
  for delete using (public.has_role(array['admin']::public.app_role[]));

-- site_settings: public read, admin write
create policy "settings: public read" on public.site_settings for select using (true);
create policy "settings: admin write" on public.site_settings
  for all using (public.has_role(array['admin']::public.app_role[]))
  with check (public.has_role(array['admin']::public.app_role[]));

-- content & part categories: public read, admin/editor write
create policy "content: public read" on public.content for select using (true);
create policy "content: staff write" on public.content
  for all using (public.has_role(array['admin','editor']::public.app_role[]))
  with check (public.has_role(array['admin','editor']::public.app_role[]));

create policy "part_categories: public read" on public.part_categories for select using (true);
create policy "part_categories: staff write" on public.part_categories
  for all using (public.has_role(array['admin','editor']::public.app_role[]))
  with check (public.has_role(array['admin','editor']::public.app_role[]));

-- published collections: visitors see published rows, content staff see everything
do $$
declare t text;
begin
  foreach t in array array['stats','services','parts','gallery_items','testimonials'] loop
    execute format($f$create policy "%1$s: public read published" on public.%1$I
      for select using (published or public.has_role(array['admin','editor']::public.app_role[]))$f$, t);
    execute format($f$create policy "%1$s: staff write" on public.%1$I
      for all using (public.has_role(array['admin','editor']::public.app_role[]))
      with check (public.has_role(array['admin','editor']::public.app_role[]))$f$, t);
  end loop;
end $$;

-- bookings: anyone may submit a NEW request (no read-back); admin & reception manage them
create policy "bookings: public submit" on public.bookings
  for insert to anon, authenticated
  with check (status = 'new' and notes is null);
create policy "bookings: staff read" on public.bookings
  for select using (public.has_role(array['admin','reception']::public.app_role[]));
create policy "bookings: staff update" on public.bookings
  for update using (public.has_role(array['admin','reception']::public.app_role[]))
  with check (public.has_role(array['admin','reception']::public.app_role[]));
create policy "bookings: admin delete" on public.bookings
  for delete using (public.has_role(array['admin']::public.app_role[]));

-- =====================================================================
-- Storage: public "media" bucket for logos, service/part/gallery images & videos
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 52428800,
  array['image/jpeg','image/png','image/webp','image/avif','image/svg+xml','image/x-icon','image/vnd.microsoft.icon','video/mp4','video/webm']
)
on conflict (id) do update set public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media: public read" on storage.objects;
drop policy if exists "media: staff insert" on storage.objects;
drop policy if exists "media: staff update" on storage.objects;
drop policy if exists "media: staff delete" on storage.objects;

create policy "media: public read" on storage.objects
  for select using (bucket_id = 'media');
create policy "media: staff insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and public.has_role(array['admin','editor']::public.app_role[]));
create policy "media: staff update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.has_role(array['admin','editor']::public.app_role[]));
create policy "media: staff delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and public.has_role(array['admin','editor']::public.app_role[]));

-- =====================================================================
-- FIRST ADMIN
-- 1) Supabase -> Authentication -> Users -> "Add user" (email + password, auto-confirm)
-- 2) Run (with that email):
--    update public.profiles set role = 'admin', full_name = 'مدير النظام' where email = 'you@example.com';
-- =====================================================================
