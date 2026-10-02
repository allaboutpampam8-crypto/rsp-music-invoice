-- ========================================================
-- RSP MUSIC ENTERTAINMENT - DATABASE SCHEMA (SUPABASE)
-- Jalankan skrip SQL ini di menu "SQL Editor" pada Supabase
-- ========================================================

-- 1. Tabel Invoices
create table if not exists invoices (
  id text primary key,
  invoice_number text not null,
  client_name text,
  event_date text,
  invoice_date text,
  items jsonb default '[]'::jsonb,
  pelunasan numeric default 0,
  status text default 'PENDING',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Tabel Pengaturan Bisnis & Rekening
create table if not exists business_settings (
  id text primary key default 'default',
  business_name text,
  logo_url text,
  instagram text,
  email text,
  whatsapp text,
  bank_name text,
  account_name text,
  account_number text,
  note1 text,
  note2 text,
  updated_at timestamp with time zone default now()
);

-- 3. Aktifkan Row Level Security (RLS)
alter table invoices enable row level security;
alter table business_settings enable row level security;

-- 4. Kebijakan Akses (Public Read/Write untuk aplikasi internal RSP)
drop policy if exists "Allow public read invoices" on invoices;
create policy "Allow public read invoices" on invoices for select using (true);

drop policy if exists "Allow public insert invoices" on invoices;
create policy "Allow public insert invoices" on invoices for insert with check (true);

drop policy if exists "Allow public update invoices" on invoices;
create policy "Allow public update invoices" on invoices for update using (true);

drop policy if exists "Allow public delete invoices" on invoices;
create policy "Allow public delete invoices" on invoices for delete using (true);

drop policy if exists "Allow public read settings" on business_settings;
create policy "Allow public read settings" on business_settings for select using (true);

drop policy if exists "Allow public insert settings" on business_settings;
create policy "Allow public insert settings" on business_settings for insert with check (true);

drop policy if exists "Allow public update settings" on business_settings;
create policy "Allow public update settings" on business_settings for update using (true);

-- 5. Data Default Pengaturan Bisnis RSP Music
insert into business_settings (id, business_name, logo_url, instagram, email, whatsapp, bank_name, account_name, account_number, note1, note2)
values (
  'default',
  'RSP MUSIC ENTERTAINMENT',
  '/images/logo-rsp.png',
  'rspmusic.id',
  'rsp.music14@gmail.com',
  '087739103414 - 085200609411',
  'BCA',
  'Rieyani Okta Sumbawa',
  '1321045036',
  'Pelunasan Max H+1',
  'Cancel DP Hangus'
)
on conflict (id) do nothing;
