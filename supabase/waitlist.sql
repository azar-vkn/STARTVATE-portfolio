-- =============================================================
-- STARTVATE — waitlist table
-- Run this once in the Supabase SQL editor:
--   Dashboard → SQL Editor → New query → paste → Run
-- =============================================================

create table if not exists public.waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text        not null,
  source     text        not null default 'landing_page',
  referrer   text,
  created_at timestamptz not null default now()
);

-- One row per address. The client turns this violation into
-- "you're already on the list" instead of an error.
create unique index if not exists waitlist_email_key
  on public.waitlist (lower(email));

-- Reject anything that isn't shaped like an email address, so a
-- malformed value can never reach the table even if the browser
-- validation is bypassed.
alter table public.waitlist
  drop constraint if exists waitlist_email_format;
alter table public.waitlist
  add constraint waitlist_email_format
  check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$' and length(email) <= 254);

-- =============================================================
-- Row Level Security
--
-- The publishable key ships in the browser, so RLS is the only
-- thing standing between the public and this table.
--
--   INSERT : allowed for anonymous visitors (that is the signup)
--   SELECT : NOT granted — nobody can read the list with the
--            publishable key. Read it from the dashboard, or
--            from a server using the secret service-role key.
--   UPDATE/DELETE : not granted.
-- =============================================================

alter table public.waitlist enable row level security;

drop policy if exists "Anyone can join the waitlist" on public.waitlist;
create policy "Anyone can join the waitlist"
  on public.waitlist
  for insert
  to anon, authenticated
  with check (true);

-- Sanity check — should return 1 policy and rowsecurity = true:
--   select relrowsecurity from pg_class where oid = 'public.waitlist'::regclass;
--   select policyname, cmd, roles from pg_policies where tablename = 'waitlist';
