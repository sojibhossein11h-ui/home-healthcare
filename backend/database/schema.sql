-- Home Healthcare — production database blueprint
-- Provider-neutral PostgreSQL schema. Apply only after reviewing provider/RLS policy.

create table if not exists users (
  id uuid primary key,
  role text not null check (role in ('patient','health_worker','delivery_worker','admin')),
  name text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists patients (
  id uuid primary key,
  user_id uuid not null unique references users(id) on delete cascade,
  address text,
  age integer check (age between 0 and 130),
  gender text,
  blood_pressure text,
  blood_group text,
  weight_kg numeric(5,2),
  height_cm numeric(5,2),
  health_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists care_records (
  id uuid primary key,
  patient_id uuid not null references patients(id) on delete cascade,
  health_worker_id uuid not null references users(id),
  care_type text not null,
  advice text,
  created_at timestamptz not null default now()
);

create table if not exists medical_reports (
  id uuid primary key,
  patient_id uuid not null references patients(id) on delete cascade,
  report_reference text not null,
  report_date date,
  uploaded_at timestamptz not null default now(),
  uploaded_by uuid references users(id)
);

create table if not exists medicines (
  id uuid primary key,
  patient_id uuid not null references patients(id) on delete cascade,
  prescribed_by uuid not null references users(id),
  medicine_name text not null,
  dose text,
  instructions text,
  created_at timestamptz not null default now()
);

create table if not exists delivery_requests (
  id uuid primary key,
  patient_id uuid not null references patients(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','approved','delivered','cancelled')),
  delivery_name text not null,
  delivery_phone text not null,
  delivery_address text not null,
  items text not null,
  approved_by uuid references users(id),
  approved_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  sender text not null check (sender in ('user','ai','health_worker')),
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists emergency_contacts (
  id uuid primary key,
  label text not null,
  phone text not null,
  sms_enabled boolean not null default true,
  active boolean not null default true
);

create index if not exists idx_care_records_patient on care_records(patient_id);
create index if not exists idx_reports_patient on medical_reports(patient_id);
create index if not exists idx_medicines_patient on medicines(patient_id);
create index if not exists idx_delivery_status on delivery_requests(status);
create index if not exists idx_chat_user_created on chat_messages(user_id, created_at);

-- IMPORTANT: enable row-level/record-level authorization in the selected
-- production provider before exposing these tables to the client.
-- Never put provider service-role keys or passwords in this repository.
