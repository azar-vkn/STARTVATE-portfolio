# Supabase setup

Two things live here: the waitlist table, and the welcome email that goes out when someone joins.

## 1. Table (done)

[`waitlist.sql`](waitlist.sql) — table, unique index, email-format check, RLS policies.
Run once in the [SQL editor](https://supabase.com/dashboard/project/emkwrtqazbrneloksrsh/sql/new).

## 2. Welcome email

Sending needs a provider API key, which cannot live in browser code — so it runs in an Edge
Function that Supabase calls whenever a row is inserted. The site's JavaScript is not involved and
does not change.

```
signup → insert into waitlist → database webhook → edge function → Resend → inbox
```

### 2a. Get a sending address

Create a [Resend](https://resend.com) account (free tier covers early volume), then:

- **With your own domain** — add it under Domains, set the DNS records they give you, and send
  from something like `hello@yourdomain.com`. Required for sending to real users.
- **Without a domain** — Resend lets you send from `onboarding@resend.dev`, but **only to the email
  address on your Resend account**. Fine for testing, useless for real signups.

Copy your API key (`re_...`).

### 2b. Add the tracking column

Run [`waitlist-email.sql`](waitlist-email.sql) in the SQL editor. It adds `welcome_email_sent_at`,
which the function stamps after a successful send so nobody is emailed twice.

### 2c. Deploy the function

From the project root:

```bash
npx supabase login
```

```bash
npx supabase link --project-ref emkwrtqazbrneloksrsh
```

```bash
npx supabase secrets set RESEND_API_KEY=re_your_key_here WAITLIST_FROM="STARTVATE <hello@yourdomain.com>"
```

```bash
npx supabase functions deploy waitlist-welcome
```

Optional: add `WAITLIST_REPLY_TO=you@yourdomain.com` to the secrets so replies reach you.

### 2d. Fire it on every signup

Dashboard → **Database → Webhooks → Create a new hook**:

| Field | Value |
| --- | --- |
| Name | `waitlist_welcome_email` |
| Table | `waitlist` |
| Events | Insert |
| Type | Supabase Edge Functions |
| Function | `waitlist-welcome` |

The dashboard fills in the auth header itself. A SQL-only equivalent is included, commented out, at
the bottom of `waitlist-email.sql` if you'd rather keep the trigger in version control.

### 2e. Test it

Submit your own address through the form on the site, then check:

- your inbox
- **Edge Functions → waitlist-welcome → Logs** for the send confirmation
- `select email, welcome_email_sent_at from public.waitlist order by created_at desc limit 5;`

If `welcome_email_sent_at` is null, the function either didn't fire (webhook) or the send was
rejected (logs will say which).

## Editing the email

The copy and layout are in [`functions/waitlist-welcome/index.ts`](functions/waitlist-welcome/index.ts)
— `SUBJECT`, `textBody()` and `htmlBody()`. It's inline-styled table HTML because that is what mail
clients render reliably; it matches the site's warm-white and orange palette. Redeploy after editing:

```bash
npx supabase functions deploy waitlist-welcome
```

## Switching provider

Only one `fetch` call in the function talks to Resend. To use SendGrid, Postmark or Brevo, swap that
call's URL, headers and body shape — the rest of the function is provider-agnostic.

## Keys

- **Publishable/anon key** — in `assets/js/supabase-config.js`, public by design, protected by RLS.
- **Service-role key** — bypasses RLS entirely. Only ever as a function secret or Vault entry. Never
  in the site's JavaScript, never committed.
