-- Home Healthcare — Supabase Row Level Security starter policies
-- Run after schema.sql in the Supabase SQL Editor.
-- Review with the production team before launch.

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid()
$$;

grant execute on function public.current_user_role() to authenticated;

alter table public.users enable row level security;
alter table public.patients enable row level security;
alter table public.care_records enable row level security;
alter table public.medical_reports enable row level security;
alter table public.medicines enable row level security;
alter table public.delivery_requests enable row level security;
alter table public.chat_messages enable row level security;
alter table public.emergency_contacts enable row level security;

create policy users_self on public.users
  for select to authenticated
  using (id = auth.uid() or public.current_user_role() in ('health_worker','admin'));

create policy patients_access on public.patients
  for all to authenticated
  using (user_id = auth.uid() or public.current_user_role() in ('health_worker','admin'))
  with check (user_id = auth.uid() or public.current_user_role() in ('health_worker','admin'));

create policy care_records_access on public.care_records
  for select to authenticated
  using (
    exists (select 1 from public.patients p where p.id = patient_id and p.user_id = auth.uid())
    or public.current_user_role() in ('health_worker','admin')
  );

create policy care_records_staff_insert on public.care_records
  for insert to authenticated
  with check (public.current_user_role() in ('health_worker','admin'));

create policy reports_access on public.medical_reports
  for select to authenticated
  using (
    exists (select 1 from public.patients p where p.id = patient_id and p.user_id = auth.uid())
    or public.current_user_role() in ('health_worker','admin')
  );

create policy reports_staff_insert on public.medical_reports
  for insert to authenticated
  with check (public.current_user_role() in ('health_worker','admin'));

create policy medicines_access on public.medicines
  for select to authenticated
  using (
    exists (select 1 from public.patients p where p.id = patient_id and p.user_id = auth.uid())
    or public.current_user_role() in ('health_worker','admin')
  );

create policy medicines_staff_insert on public.medicines
  for insert to authenticated
  with check (public.current_user_role() in ('health_worker','admin'));

create policy delivery_patient_create on public.delivery_requests
  for insert to authenticated
  with check (
    exists (select 1 from public.patients p where p.id = patient_id and p.user_id = auth.uid())
  );

create policy delivery_access on public.delivery_requests
  for select to authenticated
  using (
    exists (select 1 from public.patients p where p.id = patient_id and p.user_id = auth.uid())
    or public.current_user_role() in ('health_worker','admin')
    or (public.current_user_role() = 'delivery_worker' and status = 'approved')
  );

create policy delivery_staff_update on public.delivery_requests
  for update to authenticated
  using (public.current_user_role() in ('health_worker','delivery_worker','admin'))
  with check (public.current_user_role() in ('health_worker','delivery_worker','admin'));

create policy chat_access on public.chat_messages
  for select to authenticated
  using (user_id = auth.uid() or public.current_user_role() in ('health_worker','admin'));

create policy chat_user_insert on public.chat_messages
  for insert to authenticated
  with check (user_id = auth.uid() and sender = 'user');

create policy emergency_public_read on public.emergency_contacts
  for select to anon, authenticated
  using (active = true);

-- No public/anon policy is created for private patient tables.
-- Do not expose service-role credentials in the frontend.
