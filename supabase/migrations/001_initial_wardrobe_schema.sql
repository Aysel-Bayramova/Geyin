-- Geyin initial database schema, indexes, RLS policies, and storage setup.
-- Run this in the Supabase SQL Editor or via `supabase db push`.

-- 1. Wardrobe items table
create table if not exists public.wardrobe_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text not null,
  category text not null,
  sub_category text,
  color text,
  warmth_level integer not null default 3 check (warmth_level between 1 and 5),
  waterproof boolean not null default false,
  windproof boolean not null default false,
  style text not null default 'gundelik',
  created_at timestamptz not null default now()
);

create index if not exists idx_wardrobe_items_user_created_at
  on public.wardrobe_items (user_id, created_at desc);

-- 2. Enable Row Level Security on wardrobe_items
alter table public.wardrobe_items enable row level security;

drop policy if exists "Users can view their own wardrobe items" on public.wardrobe_items;
create policy "Users can view their own wardrobe items"
  on public.wardrobe_items
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own wardrobe items" on public.wardrobe_items;
create policy "Users can insert their own wardrobe items"
  on public.wardrobe_items
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own wardrobe items" on public.wardrobe_items;
create policy "Users can update their own wardrobe items"
  on public.wardrobe_items
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own wardrobe items" on public.wardrobe_items;
create policy "Users can delete their own wardrobe items"
  on public.wardrobe_items
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- 3. Storage bucket for wardrobe photos (private recommended; switch public -> false if upgrading)
insert into storage.buckets (id, name, public)
values ('clothes', 'clothes', false)
on conflict (id) do nothing;

-- 4. Storage RLS policies: users may only access files under `<auth.uid()>/...`
drop policy if exists "Users can view their own clothes photos" on storage.objects;
create policy "Users can view their own clothes photos"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'clothes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can upload their own clothes photos" on storage.objects;
create policy "Users can upload their own clothes photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'clothes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update their own clothes photos" on storage.objects;
create policy "Users can update their own clothes photos"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'clothes'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'clothes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can delete their own clothes photos" on storage.objects;
create policy "Users can delete their own clothes photos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'clothes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
