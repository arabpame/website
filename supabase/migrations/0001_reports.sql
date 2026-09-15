-- EARTHLINK Philippines. Reports table and evidence bucket.
--
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- It is safe to run again; every statement is idempotent.
--
-- Security model, in one paragraph: row level security is ON and there are NO
-- policies. That means the public anon key can read and write nothing at all.
-- The website talks to this table only from the server, with the service role
-- key, which bypasses RLS. Reporter names, contact details and the IP hash never
-- leave the server: lib/reports/db.ts selects only the public columns when it
-- lists cases for the site.

create table if not exists public.reports (
  id               uuid primary key default gen_random_uuid(),
  -- The documented 2026 cases in data/cases.ts are numbered from 0001 upwards.
  -- Reports filed through the site start at 0100 so the two can never collide.
  seq              bigint generated always as identity (start with 100) unique,
  case_number      text unique,
  created_at       timestamptz not null default now(),

  category         text not null check (category in ('water','forest','waste','air','biodiversity','land','hazard')),
  title            text not null check (char_length(title) between 8 and 120),
  description      text not null check (char_length(description) between 30 and 4000),
  observed_on      date not null,
  urgency          text not null check (urgency in ('low','moderate','high','critical')),

  barangay         text not null default '',
  municipality     text not null,
  province         text not null,
  region           text not null,
  landmark         text not null default '',
  lat              double precision not null,
  lng              double precision not null,
  -- 'device' when the browser supplied coordinates, 'place' when they came from
  -- the municipality gazetteer in data/ph-places.json.
  location_source  text not null check (location_source in ('device','place')),

  status           text not null default 'reported'
                   check (status in ('reported','verifying','referred','progress','resolved','monitoring')),

  -- Private. Never selected by the public site.
  anonymous        boolean not null default false,
  reporter_name    text,
  reporter_contact text,
  ip_hash          text not null,

  -- [{ "path": "EARTH-2026-0700/1.jpg", "type": "image/jpeg", "size": 183221 }]
  evidence         jsonb not null default '[]'::jsonb
);

-- The case number is assigned by the database, not the app, so two reports
-- filed in the same second cannot receive the same number.
create or replace function public.assign_case_number()
returns trigger
language plpgsql
as $$
begin
  if new.case_number is null then
    new.case_number := 'EARTH-'
      || to_char(new.created_at at time zone 'Asia/Manila', 'YYYY')
      || '-'
      || lpad(new.seq::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists reports_assign_case_number on public.reports;
create trigger reports_assign_case_number
  before insert on public.reports
  for each row execute function public.assign_case_number();

create index if not exists reports_created_idx on public.reports (created_at desc);
create index if not exists reports_ip_hash_created_idx on public.reports (ip_hash, created_at desc);

alter table public.reports enable row level security;

-- Evidence photographs. Private bucket: files are reachable only through
-- short-lived signed links that the server creates for the founder's email.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('evidence', 'evidence', false, 3145728, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
