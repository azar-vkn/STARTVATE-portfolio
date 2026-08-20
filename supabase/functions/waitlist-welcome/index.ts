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

const SUBJECT = "Welcome to STARTVATE — We're Launching Soon!";

const textBody = () =>
  [
    'Welcome to STARTVATE!',
    '',
    "Thanks for joining our early-access waitlist. We're getting ready to launch soon, and as an early builder, you'll be among the very first to get access.",
    '',
    'What STARTVATE brings to you:',
    '• Discovery Layer: One place to discover founders, startups, mentors, and investors.',
    '• Opportunity Radar: Curated hackathons, grants, accelerators, and funding tailored to your stage.',
    '• AI Intelligence: Intelligent next steps and intent-based matching to turn ideas into companies.',
    '',
    'What happens next:',
    '  1. We are putting the finishing touches on our Phase 1 platform.',
    '  2. You will receive an exclusive early-access invite before the public launch.',
    '  3. No spam — only essential product milestones and your invite.',
    '',
    "Have ideas or specific features you'd love to see? Just hit reply to this email. We'd love to hear what you're building!",
    '',
    '— The STARTVATE Team',
    'One place to discover who to meet, what to explore, and what to do next.',
  ].join('\n');

const htmlBody = () => `<!doctype html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${SUBJECT}</title></head>
<body style="margin:0;padding:0;background:#FAF9F5;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Welcome to STARTVATE — We're launching soon. Early builders get priority access!</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF9F5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border:1px solid rgba(26,25,23,.09);border-radius:18px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

        <!-- Brand Header -->
        <tr><td style="padding:30px 34px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:10px;">
              <div style="width:32px;height:32px;border-radius:9px;background:#D97757;color:#fff;font-size:18px;line-height:32px;text-align:center;font-weight:700;">&#10022;</div>
            </td>
            <td style="font-size:18px;font-weight:700;letter-spacing:-.03em;color:#1A1917;">STARTVATE</td>
          </tr></table>
        </td></tr>

        <!-- Greeting & Hero -->
        <tr><td style="padding:26px 34px 0;">
          <div style="display:inline-block;padding:6px 14px;border-radius:999px;background:#FDF2EC;border:1px solid #F7E2D8;color:#A64E2E;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">&#10024; Launching Soon</div>
          <h1 style="margin:18px 0 0;font-size:28px;line-height:1.2;letter-spacing:-.03em;color:#1A1917;font-weight:600;">Welcome to STARTVATE!</h1>
          <p style="margin:14px 0 0;font-size:15.5px;line-height:1.62;color:#4A463F;">
            Thanks for joining our early-access waitlist. We are putting the final touches on the platform and <strong>getting ready to launch soon</strong>.
          </p>
        </td></tr>

        <!-- Highlight Banner -->
        <tr><td style="padding:24px 34px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FDF9F6;border:1px solid #F7E2D8;border-radius:12px;">
            <tr><td style="padding:18px 20px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#A64E2E;">What to expect</div>
              <p style="margin:8px 0 0;font-size:14.5px;line-height:1.6;color:#4A463F;">
                One intelligent ecosystem for discovering founders, startups, opportunities, and the next step to turn an idea into a company. Describe what you're building, and we'll bring back the people, opportunities, and intelligence tailored for you.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Next Steps -->
        <tr><td style="padding:26px 34px 0;">
          <div style="font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#7A746A;">What happens next</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
            ${[
              ['1', 'Priority Early Access', 'You will receive an exclusive invite before we open the platform to the public.'],
              ['2', 'Launch Announcement', 'We will notify you the moment the discovery layer goes live.'],
              ['3', 'Zero Spam', 'We only reach out with milestone updates and your personal access key.'],
            ]
              .map(
                ([n, t, d]) => `<tr><td style="padding-bottom:14px;">
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

        <!-- Community Callout -->
        <tr><td style="padding:14px 34px 30px;">
          <p style="margin:0;font-size:14.5px;line-height:1.62;color:#4A463F;">
            Building something already? Simply reply to this email and tell us what you're working on — early builders directly shape what we ship.
          </p>
          <p style="margin:20px 0 0;font-size:14.5px;font-weight:600;color:#1A1917;">— The STARTVATE Team</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 34px;border-top:1px solid rgba(26,25,23,.09);background:#FCFBF8;">
          <p style="margin:0;font-size:12px;line-height:1.55;color:#A9A296;">
            You received this email because you signed up for the STARTVATE waitlist.<br />
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
