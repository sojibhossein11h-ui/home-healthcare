-- Home Healthcare — live Supabase schema
-- Updated 2026-10-07 to match the deployed frontend.
-- No service-role keys or passwords are stored here.

create extension if not exists pgcrypto;

do $$ begin
  create type public.app_role as enum ('patient','health_worker','delivery','admin');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  address text,
  role public.app_role not null default 'patient',
  created_at timestamptz not null default now()
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  age integer not null check (age >= 0),
  address text,
  health_condition text,
  gender text,
  weight_kg numeric(6,2),
  height_cm numeric(6,2),
  blood_group text,
  blood_pressure text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.medical_reports (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  report_title text not null,
  report_url text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  report_id uuid references public.medical_reports(id) on delete set null,
  doctor_name text,
  medicines text not null,
  instructions text,
  created_at timestamptz not null default now()
);

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  prescription_id uuid references public.prescriptions(id) on delete set null,
  assigned_to uuid references auth.users(id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending','assigned','out_for_delivery','delivered','cancelled')),
  delivery_address text not null,
  delivery_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delivery_private_contacts (
  delivery_id uuid primary key references public.deliveries(id) on delete cascade,
  patient_phone text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.delivery_messages (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references public.deliveries(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  message text not null check (length(trim(message)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists deliveries_assigned_to_idx on public.deliveries(assigned_to);
create index if not exists deliveries_patient_id_idx on public.deliveries(patient_id);
create index if not exists deliveries_prescription_id_idx on public.deliveries(prescription_id);
create index if not exists medical_reports_patient_id_idx on public.medical_reports(patient_id);
create index if not exists prescriptions_patient_id_idx on public.prescriptions(patient_id);
create index if not exists prescriptions_report_id_idx on public.prescriptions(report_id);
create index if not exists delivery_messages_delivery_id_idx on public.delivery_messages(delivery_id);

-- New Auth users get a patient profile by default.
create or replace function public.handle_new_user()
returns trigger language plpgsql security invoker set search_path = public
as $$
begin
  insert into public.profiles(id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), 'patient')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker
as $$ begin new.updated_at = now(); return new; end; $$;

drop trigger if exists patients_updated_at on public.patients;
create trigger patients_updated_at before update on public.patients
for each row execute function public.set_updated_at();

drop trigger if exists deliveries_updated_at on public.deliveries;
create trigger deliveries_updated_at before update on public.deliveries
for each row execute function public.set_updated_at();

-- Copies the patient's phone into a separate table whose RLS exposes it
-- only to the assigned delivery worker.
create or replace function public.sync_delivery_private_contact()
returns trigger language plpgsql security invoker
as $$
begin
  if new.delivery_phone is not null and length(trim(new.delivery_phone)) > 0 then
    insert into public.delivery_private_contacts(delivery_id, patient_phone)
    values (new.id, new.delivery_phone)
    on conflict (delivery_id) do update set patient_phone = excluded.patient_phone;
  end if;
  return new;
end;
$$;

drop trigger if exists delivery_private_contact_sync on public.deliveries;
create trigger delivery_private_contact_sync
after insert or update of delivery_phone on public.deliveries
for each row execute function public.sync_delivery_private_contact();

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.medical_reports enable row level security;
alter table public.prescriptions enable row level security;
alter table public.deliveries enable row level security;
alter table public.delivery_private_contacts enable row level security;
alter table public.delivery_messages enable row level security;

-- Patient-owned data.
create policy if not exists profiles_self_select on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy if not exists profiles_self_update on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy if not exists patients_self_select on public.patients
  for select to authenticated using ((select auth.uid()) = user_id);
create policy if not exists patients_self_insert on public.patients
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy if not exists patients_self_update on public.patients
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy if not exists reports_patient_select on public.medical_reports
  for select to authenticated using (exists (
    select 1 from public.patients p where p.id = patient_id and p.user_id = (select auth.uid())
  ));
create policy if not exists reports_patient_insert on public.medical_reports
  for insert to authenticated with check (exists (
    select 1 from public.patients p where p.id = patient_id and p.user_id = (select auth.uid())
  ));

create policy if not exists prescriptions_patient_select on public.prescriptions
  for select to authenticated using (exists (
    select 1 from public.patients p where p.id = patient_id and p.user_id = (select auth.uid())
  ));
create policy if not exists prescriptions_patient_insert on public.prescriptions
  for insert to authenticated with check (exists (
    select 1 from public.patients p where p.id = patient_id and p.user_id = (select auth.uid())
  ));

-- Delivery: patient can see/request their own delivery; only assigned
-- delivery workers can see/update operational delivery records.
create policy if not exists deliveries_patient_select on public.deliveries
  for select to authenticated using (exists (
    select 1 from public.patients p where p.id = patient_id and p.user_id = (select auth.uid())
  ));
create policy if not exists deliveries_delivery_select on public.deliveries
  for select to authenticated using (
    assigned_to = (select auth.uid()) and exists (
      select 1 from public.profiles pr where pr.id = (select auth.uid()) and pr.role = 'delivery'
    )
  );
create policy if not exists deliveries_patient_insert on public.deliveries
  for insert to authenticated with check (exists (
    select 1 from public.patients p where p.id = patient_id and p.user_id = (select auth.uid())
  ));
create policy if not exists deliveries_worker_update on public.deliveries
  for update to authenticated using (
    assigned_to = (select auth.uid()) and exists (
      select 1 from public.profiles pr where pr.id = (select auth.uid()) and pr.role = 'delivery'
    )
  ) with check (assigned_to = (select auth.uid()));

-- Private phone and private messages: delivery worker only.
create policy if not exists private_contact_delivery_select on public.delivery_private_contacts
  for select to authenticated using (exists (
    select 1 from public.deliveries d
    join public.profiles pr on pr.id = (select auth.uid())
    where d.id = delivery_id and d.assigned_to = (select auth.uid()) and pr.role = 'delivery'
  ));

create policy if not exists messages_delivery_select on public.delivery_messages
  for select to authenticated using (exists (
    select 1 from public.deliveries d
    join public.profiles pr on pr.id = (select auth.uid())
    where d.id = delivery_id and d.assigned_to = (select auth.uid()) and pr.role = 'delivery'
  ));

create policy if not exists messages_delivery_insert on public.delivery_messages
  for insert to authenticated with check (
    sender_id = (select auth.uid()) and exists (
      select 1 from public.deliveries d
      join public.profiles pr on pr.id = (select auth.uid())
      where d.id = delivery_id and d.assigned_to = (select auth.uid()) and pr.role = 'delivery'
    )
  );
