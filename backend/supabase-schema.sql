-- Home Healthcare — Supabase database foundation
-- Safe to commit: contains no passwords, API keys, or service-role secrets.

create extension if not exists pgcrypto;

create type public.user_role as enum ('patient','health_worker','delivery_worker','admin');
create type public.request_status as enum ('pending','approved','delivered','rejected');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  address text,
  age integer check (age is null or age >= 0),
  role public.user_role not null default 'patient',
  created_at timestamptz not null default now()
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  health_condition text,
  blood_group text,
  blood_pressure text,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  report_name text not null,
  report_url text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.medicines (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  prescribed_by uuid references public.profiles(id),
  medicine_name text not null,
  dosage text,
  instructions text,
  delivery_status public.request_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.delivery_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  medicine_id uuid references public.medicines(id) on delete set null,
  status public.request_status not null default 'pending',
  delivery_address text not null,
  contact_phone text,
  approved_by uuid references public.profiles(id),
  delivered_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.reports enable row level security;
alter table public.medicines enable row level security;
alter table public.delivery_requests enable row level security;

-- Basic least-privilege policies. Production deployment should review these
-- with the organization's health/privacy requirements before going live.
create policy "profiles own row" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles update own row" on public.profiles
  for update using (auth.uid() = id);

create policy "patient own record" on public.patients
  for select using (profile_id = auth.uid());

create policy "patient create own record" on public.patients
  for insert with check (profile_id = auth.uid());

create policy "patient own reports" on public.reports
  for select using (exists (select 1 from public.patients p where p.id = patient_id and p.profile_id = auth.uid()));

create policy "patient own medicines" on public.medicines
  for select using (exists (select 1 from public.patients p where p.id = patient_id and p.profile_id = auth.uid()));

create policy "patient create delivery request" on public.delivery_requests
  for insert with check (exists (select 1 from public.patients p where p.id = patient_id and p.profile_id = auth.uid()));

create policy "patient view own delivery request" on public.delivery_requests
  for select using (exists (select 1 from public.patients p where p.id = patient_id and p.profile_id = auth.uid()));

-- Delivery-worker/admin/health-worker operational policies should be added
-- through a trusted server-side role-checking layer before production launch.
