-- ===========================================================
-- SCHEMA — portfolio_admin (Supabase)
-- Jalankan di Supabase SQL Editor (https://supabase.com/dashboard)
-- ===========================================================

-- 1. Tabel item portfolio (sertifikat, pengalaman, achievements)
--    section  -> 'certifications' | 'experience' | 'achievements'
--    data     -> objek JSON yang sama persis dengan interface di data/*.ts
create table if not exists public.portfolio_items (
  id         uuid primary key default gen_random_uuid(),
  section    text not null,
  number     text not null,
  data       jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (section, number)
);

create index if not exists portfolio_items_section_idx
  on public.portfolio_items (section, number);

-- 2. Public read (tanpa login) — biar halaman portfolio bisa tampil
create policy "public read portfolio_items"
  on public.portfolio_items
  for select
  using ( true );

-- 3. Hanya user login (admin) yang bisa tulis/ubah/hapus
create policy "authenticated write portfolio_items"
  on public.portfolio_items
  for all
  using  ( auth.role() = 'authenticated' )
  with check ( auth.role() = 'authenticated' );

-- 4. Storage bucket untuk file sertifikat (PDF / gambar)
--    Public supaya bisa ditampilkan langsung di portfolio.
insert into storage.buckets (id, name, public)
values ('certificates', 'certificates', true)
on conflict (id) do nothing;

-- 5. Public read dari bucket
create policy "public read certificates"
  on storage.objects
  for select
  using ( bucket_id = 'certificates' );

-- 6. Authenticated user bisa upload ke bucket
create policy "authenticated write certificates"
  on storage.objects
  for all
  using  ( bucket_id = 'certificates' and auth.role() = 'authenticated' )
  with check ( bucket_id = 'certificates' and auth.role() = 'authenticated' );