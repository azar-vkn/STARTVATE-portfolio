/**
 * STARTVATE — waitlist welcome email
 * -----------------------------------------------------------------
 * Triggered by a Database Webhook on INSERT into public.waitlist.
 * Sends a greeting via Resend, then stamps welcome_email_sent_at so
 * the same address is never emailed twice.
 *
 * Required secrets (supabase secrets set ...):
 *   RESEND_API_KEY     re_xxxxxxxx
 *   WAITLIST_FROM      STARTVATE <hello@yourdomain.com>
 * Optional:
 *   WAITLIST_REPLY_TO  you@yourdomain.com
 *
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically.
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const FROM = Deno.env.get('WAITLIST_FROM') ?? 'STARTVATE <onboarding@resend.dev>';
const REPLY_TO = Deno.env.get('WAITLIST_REPLY_TO') ?? '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/* ---------------------------------------------------------------- */
/* Email content                                                     */
/* ---------------------------------------------------------------- */

const SUBJECT = "You're on the STARTVATE waitlist";

const textBody = () =>
  [
    'Welcome to STARTVATE.',
    '',
    "Thanks for joining the waitlist — you're on the list, and you'll hear from us before we open the doors.",
    '',
    'What STARTVATE is:',
    'One intelligent ecosystem for discovering founders, startups, opportunities, and the next step',
    'to turn an idea into a company. Instead of searching across a dozen platforms, you describe what',
    "you're building and we bring back the people, startups, opportunities and knowledge around it.",
    '',
    'What happens next:',
    '  1. We are building Phase 1 — search, startup discovery, opportunities and builder profiles.',
    '  2. Early builders on this list get first access when it opens.',
    '  3. We will email you as launch approaches. No spam in between.',
    '',
    "If you have something you want the product to solve, just reply to this email — early builders shape what we ship.",
    '',
    '— The STARTVATE team',
    'One place to discover who to meet, what to explore, and what to do next.',
  ].join('\n');

const htmlBody = () => `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${SUBJECT}</title></head>
<body style="margin:0;padding:0;background:#FAF9F5;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">You're on the STARTVATE waitlist — early builders get first access.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF9F5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid rgba(26,25,23,.09);border-radius:18px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

        <tr><td style="padding:30px 34px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:10px;">
              <div style="width:30px;height:30px;border-radius:9px;background:#D97757;color:#fff;font-size:18px;line-height:30px;text-align:center;font-weight:700;">&#10022;</div>
            </td>
            <td style="font-size:17px;font-weight:700;letter-spacing:-.03em;color:#1A1917;">STARTVATE</td>
          </tr></table>
        </td></tr>

        <tr><td style="padding:26px 34px 0;">
          <div style="display:inline-block;padding:6px 13px;border-radius:999px;background:#FDF2EC;border:1px solid #F7E2D8;color:#A64E2E;font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;">Early access</div>
          <h1 style="margin:18px 0 0;font-size:27px;line-height:1.15;letter-spacing:-.03em;color:#1A1917;font-weight:600;">You're on the list.</h1>
          <p style="margin:14px 0 0;font-size:15.5px;line-height:1.62;color:#4A463F;">
            Thanks for joining the STARTVATE waitlist. You'll hear from us before we open the doors —
            and early builders get first access.
          </p>
        </td></tr>

        <tr><td style="padding:24px 34px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDF9F6;border:1px solid #F7E2D8;border-radius:12px;">
            <tr><td style="padding:18px 20px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#A64E2E;">What we're building</div>
              <p style="margin:8px 0 0;font-size:14.5px;line-height:1.6;color:#4A463F;">
                One intelligent ecosystem for discovering founders, startups, opportunities, and the next
                step to turn an idea into a company. Describe what you're building, and we bring back the
                people, startups, opportunities and knowledge around it.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="padding:26px 34px 0;">
          <div style="font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#7A746A;">What happens next</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:12px;">
            ${[
              ['1', 'We ship Phase 1', 'Search, startup discovery, opportunities and builder profiles.'],
              ['2', 'You get first access', 'Everyone on this list is invited before we open publicly.'],
              ['3', 'We email you at launch', 'No spam in between — only what matters.'],
            ]
              .map(
                ([n, t, d]) => `<tr><td style="padding-bottom:12px;">
              <table role="presentation" cellpadding="0" cellspacing="0"><tr>
                <td valign="top" style="width:26px;">
                  <div style="width:22px;height:22px;border-radius:999px;background:#FDF2EC;border:1px solid #F7E2D8;color:#A64E2E;font-size:11px;font-weight:700;line-height:22px;text-align:center;">${n}</div>
                </td>
                <td style="padding-left:12px;">
                  <div style="font-size:14.5px;font-weight:600;color:#1A1917;letter-spacing:-.01em;">${t}</div>
                  <div style="font-size:13.5px;color:#7A746A;line-height:1.5;margin-top:2px;">${d}</div>
                </td>
              </tr></table>
            </td></tr>`,
              )
              .join('')}
          </table>
        </td></tr>

        <tr><td style="padding:14px 34px 30px;">
          <p style="margin:0;font-size:14.5px;line-height:1.62;color:#4A463F;">
            Building something already? Reply to this email and tell us what you'd want STARTVATE to
            solve — early builders shape what we ship.
          </p>
          <p style="margin:20px 0 0;font-size:14.5px;color:#1A1917;">— The STARTVATE team</p>
        </td></tr>

        <tr><td style="padding:20px 34px;border-top:1px solid rgba(26,25,23,.09);background:#FCFBF8;">
          <p style="margin:0;font-size:12px;line-height:1.55;color:#A9A296;">
            You're receiving this because you joined the STARTVATE waitlist.
            One place to discover who to meet, what to explore, and what to do next.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

/* ---------------------------------------------------------------- */
/* Handler                                                           */
/* ---------------------------------------------------------------- */

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set — cannot send.');
    return json(500, { error: 'Email provider not configured' });
  }

  let payload: Record<string, any>;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  // Database Webhook sends { type, table, record }. A direct call may send { email }.
  const record = payload.record ?? payload;
  const email = String(record?.email ?? '').trim().toLowerCase();
  const id = record?.id ?? null;

  if (!EMAIL_RE.test(email)) return json(400, { error: 'Invalid email address' });

  // Already greeted — the webhook fired twice, or the row was replayed.
  if (record?.welcome_email_sent_at) {
    return json(200, { skipped: 'already sent', email });
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [email],
      subject: SUBJECT,
      html: htmlBody(),
      text: textBody(),
      ...(REPLY_TO ? { reply_to: REPLY_TO } : {}),
    }),
  });

  const result = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error('Resend rejected the send', res.status, result);
    return json(502, { error: 'Send failed', status: res.status, detail: result });
  }

  // Stamp the row so a retry can't double-send.
  if (id) {
    try {
      const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
        auth: { persistSession: false },
      });
      const { error } = await admin
        .from('waitlist')
        .update({ welcome_email_sent_at: new Date().toISOString() })
        .eq('id', id);
      if (error) console.error('Could not stamp welcome_email_sent_at', error);
    } catch (err) {
      console.error('Stamp step failed', err);
    }
  }

  console.log('Welcome email sent', { email, providerId: result?.id });
  return json(200, { sent: true, email, providerId: result?.id ?? null });
});
