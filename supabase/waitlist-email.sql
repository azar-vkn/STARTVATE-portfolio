-- =============================================================
-- STARTVATE — welcome email support
-- Run AFTER waitlist.sql, in the Supabase SQL editor.
-- =============================================================

-- Records when the greeting went out. The Edge Function stamps this
-- after a successful send, and skips any row that already has it,
-- so a retried webhook can never email the same person twice.
alter table public.waitlist
  add column if not exists welcome_email_sent_at timestamptz;

-- The publishable key can insert but not update, so this column is
-- writable only by the Edge Function (service role). No policy change
-- is needed — the service role bypasses RLS.

-- Useful for spotting signups that never got their email:
--   select email, created_at from public.waitlist
--   where welcome_email_sent_at is null order by created_at desc;


-- =============================================================
-- Firing the function on insert
--
-- RECOMMENDED: use the dashboard instead of the SQL below.
--   Database → Webhooks → Create a new hook
--     Table      : waitlist
--     Events     : Insert
--     Type       : Supabase Edge Functions
--     Function   : waitlist-welcome
--   The dashboard wires up the auth header for you.
--
-- The SQL below does the same thing by hand. Use it only if you
-- prefer the trigger in version control. It needs your service-role
-- key, so it is stored in Vault rather than written into the trigger.
-- =============================================================

-- One-time: put the service-role key in Vault (Project Settings → API
-- → service_role. This key bypasses RLS — never put it in client code).
--
--   select vault.create_secret(
--     'PASTE_SERVICE_ROLE_KEY_HERE',
--     'service_role_key',
--     'Used by the waitlist welcome-email trigger'
--   );

-- create extension if not exists pg_net with schema extensions;
--
-- create or replace function public.send_waitlist_welcome()
-- returns trigger
-- language plpgsql
-- security definer
-- set search_path = public, extensions
-- as $$
-- declare
--   key text;
-- begin
--   select decrypted_secret into key
--   from vault.decrypted_secrets
--   where name = 'service_role_key';
--
--   perform net.http_post(
--     url     := 'https://emkwrtqazbrneloksrsh.supabase.co/functions/v1/waitlist-welcome',
--     headers := jsonb_build_object(
--                  'Content-Type', 'application/json',
--                  'Authorization', 'Bearer ' || key
--                ),
--     body    := jsonb_build_object('type', 'INSERT', 'record', to_jsonb(new))
--   );
--
--   return new;
-- end;
-- $$;
--
-- -- AFTER INSERT only. If this also fired on UPDATE, the function's own
-- -- welcome_email_sent_at stamp would re-trigger it in a loop.
-- drop trigger if exists waitlist_welcome_email on public.waitlist;
-- create trigger waitlist_welcome_email
--   after insert on public.waitlist
--   for each row execute function public.send_waitlist_welcome();
