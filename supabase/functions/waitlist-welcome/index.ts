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
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${SUBJECT}</title>
  <!--[if !mso]><!-->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
  <!--<![endif]-->
</head>
<body style="margin:0;padding:0;background:#FAF9F5;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Welcome to STARTVATE! We're building the discovery layer for the startup ecosystem — and getting ready to launch soon.</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAF9F5;padding:40px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#FFFFFF;border:1px solid rgba(26,25,23,.09);border-radius:20px;box-shadow:0 4px 20px -4px rgba(26,25,23,.05);overflow:hidden;">

        <!-- Brand Header -->
        <tr><td style="padding:32px 36px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:10px;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="background:#D97757;border-radius:10px;width:34px;height:34px;">
                <tr><td align="center" valign="middle" style="color:#fff;font-size:20px;line-height:34px;font-weight:700;">&#10022;</td></tr>
              </table>
            </td>
            <td style="font-size:19px;font-weight:750;letter-spacing:-.03em;color:#1A1917;">STARTVATE</td>
          </tr></table>
        </td></tr>

        <!-- Greeting & Hero Headline -->
        <tr><td style="padding:24px 36px 0;">
          <div style="display:inline-block;padding:6px 14px;border-radius:999px;background:#FDF2EC;border:1px solid #F7E2D8;color:#A64E2E;font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">
            <span style="color:#D97757;font-size:13px;vertical-align:-1px;">&#10022;</span> Early Access &middot; Launching Soon
          </div>
          <h1 style="margin:18px 0 0;font-size:30px;line-height:1.15;letter-spacing:-.035em;color:#1A1917;font-weight:700;">
            Build what's next.<br />
            Find who's <span style="font-family:'Instrument Serif',Georgia,serif;font-style:italic;font-weight:400;color:#D97757;">building it</span> with you.
          </h1>
          <p style="margin:14px 0 0;font-size:15.5px;line-height:1.62;color:#4A463F;">
            Welcome aboard! Thanks for joining the early-access waitlist. We are putting the final touches on STARTVATE and <strong>getting ready to launch soon</strong>.
          </p>
        </td></tr>

        <!-- Highlight Banner -->
        <tr><td style="padding:22px 36px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FEF9F6;border:1px solid #F7E2D8;border-radius:14px;">
            <tr><td style="padding:18px 22px;">
              <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#A64E2E;margin-bottom:6px;">The Discovery Layer For Startups</div>
              <p style="margin:0;font-size:14.5px;line-height:1.58;color:#4A463F;">
                One intelligent platform where you describe what you're building, and we instantly bring back the people to meet, startups to study, opportunities to apply for, and the next steps to take.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- What You Get Section -->
        <tr><td style="padding:24px 36px 0;">
          <div style="font-size:11.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#7A746A;margin-bottom:12px;">What you get with STARTVATE</div>
          
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;background:#FCFBF8;border:1px solid rgba(26,25,23,.06);border-radius:12px;">
            <tr>
              <td valign="top" style="padding:12px 14px;width:32px;">
                <div style="width:28px;height:28px;border-radius:8px;background:#FDF2EC;color:#D97757;text-align:center;line-height:28px;font-size:14px;">&#128101;</div>
              </td>
              <td valign="middle" style="padding:12px 16px 12px 2px;">
                <div style="font-size:14px;font-weight:600;color:#1A1917;">People &amp; Co-founders</div>
                <div style="font-size:13px;color:#7A746A;margin-top:2px;">Intent-matched founders, technical co-founders, and mentors in your space.</div>
              </td>
            </tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;background:#FCFBF8;border:1px solid rgba(26,25,23,.06);border-radius:12px;">
            <tr>
              <td valign="top" style="padding:12px 14px;width:32px;">
                <div style="width:28px;height:28px;border-radius:8px;background:#FDF2EC;color:#D97757;text-align:center;line-height:28px;font-size:14px;">&#127919;</div>
              </td>
              <td valign="middle" style="padding:12px 16px 12px 2px;">
                <div style="font-size:14px;font-weight:600;color:#1A1917;">Opportunities &amp; Funding</div>
                <div style="font-size:13px;color:#7A746A;margin-top:2px;">Curated hackathons, grants, incubators, and investors ranked by match score.</div>
              </td>
            </tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FCFBF8;border:1px solid rgba(26,25,23,.06);border-radius:12px;">
            <tr>
              <td valign="top" style="padding:12px 14px;width:32px;">
                <div style="width:28px;height:28px;border-radius:8px;background:#FDF2EC;color:#D97757;text-align:center;line-height:28px;font-size:14px;">&#10024;</div>
              </td>
              <td valign="middle" style="padding:12px 16px 12px 2px;">
                <div style="font-size:14px;font-weight:600;color:#1A1917;">AI-Recommended Next Steps</div>
                <div style="font-size:13px;color:#7A746A;margin-top:2px;">Actionable milestones so you always know what to validate next.</div>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- CTA Button -->
        <tr><td align="center" style="padding:22px 36px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr>
            <td align="center" style="background:#D97757;border-radius:999px;box-shadow:0 10px 24px -8px rgba(217,119,87,.5);">
              <a href="https://github.com/azar-vkn/STARTVATE-portfolio" target="_blank" style="display:inline-block;padding:13px 30px;font-size:14.5px;font-weight:600;color:#fff;text-decoration:none;border-radius:999px;">
                Explore the Ecosystem &rarr;
              </a>
            </td>
          </tr></table>
        </td></tr>

        <!-- Reply Prompt -->
        <tr><td style="padding:18px 36px 28px;border-top:1px solid rgba(26,25,23,.08);">
          <p style="margin:0;font-size:14px;line-height:1.58;color:#4A463F;">
            <strong>Building something already?</strong> Simply reply to this email and tell us about what you're working on — early builders directly shape what we ship.
          </p>
          <p style="margin:16px 0 0;font-size:14px;font-weight:600;color:#1A1917;">&mdash; The STARTVATE Team</p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:18px 36px;border-top:1px solid rgba(26,25,23,.08);background:#FCFBF8;">
          <p style="margin:0;font-size:12px;line-height:1.55;color:#A9A296;text-align:center;">
            You received this email because you signed up for the STARTVATE waitlist.<br />
            &copy; 2026 STARTVATE &middot; The discovery layer for the startup ecosystem.
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
