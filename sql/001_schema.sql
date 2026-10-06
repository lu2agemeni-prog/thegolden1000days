-- =============================================================
-- Counseling Data Entry System - Database Schema
-- =============================================================
-- Run this in: Supabase Dashboard > SQL Editor > New Query
-- This script is idempotent and safe to re-run during dev.
-- =============================================================

-- 0. Required extensions --------------------------------------------------
create extension if not exists "pgcrypto";

-- 1. counselors ----------------------------------------------------------
-- Data entry staff (مقدمي المشورة)
create table if not exists public.counselors (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid unique references auth.users(id) on delete set null,
  full_name        text not null,
  national_id      text unique,
  phone            text,
  email            text,
  employee_code    text unique,
  specialty        text,             -- التخصص: طبيب / ممرضة / رائدة / ...
  work_days        text,             -- أيام العمل: السبت-الثلاثاء
  trainings        text,             -- التدريبات الحاصل عليها (نص حر)
  is_active        boolean not null default true,
  is_admin         boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_counselors_active on public.counselors (is_active);

-- 2. clients -------------------------------------------------------------
-- Master record per (national_id, client_type).  One person may appear in
-- multiple types (e.g. a woman who first came for family planning then for
-- pregnancy).  We treat (national_id, client_type) as a soft composite key.
create table if not exists public.clients (
  id               uuid primary key default gen_random_uuid(),
  client_type      text not null check (client_type in (
                     'pre_marriage','children','pregnancy','family_planning'
                   )),
  national_id      text not null,
  full_name        text not null,
  phone            text,
  spouse_name      text,             -- اسم الشريك/الزوج/الام/الاب حسب النوع
  spouse_national_id text,
  spouse_phone     text,
  -- Free-form payload for type-specific demographic fields
  meta             jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- A given (national_id, client_type) pair is unique so we can pre-fill data
create unique index if not exists uq_clients_nid_type
  on public.clients (national_id, client_type);
create index if not exists idx_clients_nid on public.clients (national_id);
create index if not exists idx_clients_name on public.clients (full_name);
create index if not exists idx_clients_phone on public.clients (phone);

-- 3. visits --------------------------------------------------------------
-- One row per actual visit/session.  The (clients_id, visit_date) pair plus
-- the type is what makes a visit unique.
create table if not exists public.visits (
  id                    uuid primary key default gen_random_uuid(),
  visit_type            text not null check (visit_type in (
                          'pre_marriage','children','pregnancy','family_planning'
                        )),
  client_id             uuid not null references public.clients(id) on delete cascade,
  counselor_id          uuid references public.counselors(id) on delete set null,

  -- Common header fields (present in every Excel sheet)
  governorate           text,
  governorate_mfl       text,
  district              text,
  district_mfl          text,
  health_facility       text,
  health_facility_mfl   text,
  counselor_name        text,             -- مقدمة المشورة (free text fallback)
  counselor_phone       text,
  first_visit_date      date,
  case_number           text,

  -- Optional per-visit fields used for multi-session sheets
  session_number        text,             -- رقم اللقاء (الأول/الثاني/...)
  visit_date            date,

  -- Free-form payload holding the type-specific Q&A columns
  data                  jsonb not null default '{}'::jsonb,

  notes                 text,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_visits_client     on public.visits (client_id);
create index if not exists idx_visits_type       on public.visits (visit_type);
create index if not exists idx_visits_counselor  on public.visits (counselor_id);
create index if not exists idx_visits_first_date on public.visits (first_visit_date);
create index if not exists idx_visits_visit_date on public.visits (visit_date);

-- 4. updated_at trigger -------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_counselors_updated on public.counselors;
create trigger trg_counselors_updated
  before update on public.counselors
  for each row execute function public.set_updated_at();

drop trigger if exists trg_clients_updated on public.clients;
create trigger trg_clients_updated
  before update on public.clients
  for each row execute function public.set_updated_at();

drop trigger if exists trg_visits_updated on public.visits;
create trigger trg_visits_updated
  before update on public.visits
  for each row execute function public.set_updated_at();

-- 5. Row Level Security --------------------------------------------------
alter table public.counselors enable row level security;
alter table public.clients   enable row level security;
alter table public.visits    enable row level security;

-- Helper: is the current user an admin counselor?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.counselors
    where user_id = auth.uid() and is_admin = true and is_active = true
  );
$$;

-- Helper: is the current user an active counselor?
create or replace function public.is_counselor()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1 from public.counselors
    where user_id = auth.uid() and is_active = true
  );
$$;

-- counselors: read for all authenticated, write only for admin
drop policy if exists "counselors_read"     on public.counselors;
drop policy if exists "counselors_admin_rw" on public.counselors;
create policy "counselors_read"
  on public.counselors for select
  to authenticated using (true);

create policy "counselors_admin_rw"
  on public.counselors for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- clients: counselors can read & write all
drop policy if exists "clients_counselor_rw" on public.clients;
create policy "clients_counselor_rw"
  on public.clients for all
  to authenticated
  using (public.is_counselor())
  with check (public.is_counselor());

-- visits: counselors can read & write all
drop policy if exists "visits_counselor_rw" on public.visits;
create policy "visits_counselor_rw"
  on public.visits for all
  to authenticated
  using (public.is_counselor())
  with check (public.is_counselor());
