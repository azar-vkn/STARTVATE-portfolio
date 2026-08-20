/* =============================================================
   STARTVATE — waitlist storage (Supabase) + welcome email (EmailJS)
   Exposes window.startvateWaitlist.submit(email) -> Promise<result>

   result = { ok: true }                     stored, greeting dispatched
           | { ok: true, duplicate: true }   already on the list
           | { ok: false, message: string }  nothing was stored

   Storing the signup is what decides success. The welcome email is
   best-effort on top: if EmailJS fails we still have the address, so
   the visitor is told the truth and the failure goes to the console.
   The reverse is never true — we do not send "you're on the list"
   to someone whose row was never written.
   ============================================================= */
(function () {
  'use strict';

  var cfg = window.STARTVATE_SUPABASE || {};
  var emailCfg = window.STARTVATE_EMAILJS || {};
  var lib = window.supabase;
  var emailLib = window.emailjs;
  var client = null;
  var mailReady = false;

  if (lib && typeof lib.createClient === 'function' && cfg.url && cfg.publishableKey) {
    client = lib.createClient(cfg.url, cfg.publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  } else {
    console.warn('[STARTVATE] Supabase client unavailable — signups cannot be stored.');
  }

  if (emailLib && emailCfg.publicKey && emailCfg.serviceId && emailCfg.templateId) {
    try {
      emailLib.init({ publicKey: emailCfg.publicKey });
      mailReady = true;
    } catch (e) {
      console.warn('[STARTVATE] EmailJS init failed — signups will store but not be greeted.', e);
    }
  } else {
    console.warn('[STARTVATE] EmailJS not configured — signups will store but not be greeted.');
  }

  /**
   * Best-effort greeting. Never rejects: a failed send must not turn a
   * stored signup into a reported failure. Failures are logged so they
   * are visible in the console and in the EmailJS dashboard.
   */
  function sendWelcomeEmail(address) {
    if (!mailReady) return Promise.resolve({ sent: false, reason: 'not configured' });

    return window.emailjs
      .send(emailCfg.serviceId, emailCfg.templateId, {
        to_email: address,
        email: address
      })
      .then(function (res) {
        console.log('[STARTVATE] Welcome email sent:', res.status, res.text);
        return { sent: true };
      })
      .catch(function (err) {
        console.error('[STARTVATE] Welcome email failed for ' + address + ':', err);
        return { sent: false, reason: err };
      });
  }

  function submit(email) {
    var address = String(email || '').trim().toLowerCase();

    if (!client) {
      return Promise.resolve({
        ok: false,
        message: 'Waitlist storage is not configured yet. Please try again later.'
      });
    }

    return client
      .from(cfg.table || 'waitlist')
      .insert({
        email: address,
        source: 'landing_page',
        referrer: document.referrer || null
      })
      .then(function (res) {
        var error = res && res.error;

        // Stored. Dispatch the greeting without blocking the response.
        if (!error) {
          sendWelcomeEmail(address);
          return { ok: true };
        }

        // 23505 = unique_violation — already on the list, so no second greeting.
        if (error.code === '23505') return { ok: true, duplicate: true };

        // 42501 = RLS refusal (insert policy missing).
        if (error.code === '42501') {
          console.error('[STARTVATE] Insert blocked by RLS. Run supabase/waitlist.sql.', error);
          return { ok: false, message: "We couldn't save your email. Please try again shortly." };
        }

        // PGRST205 = table does not exist.
        if (error.code === 'PGRST205') {
          console.error('[STARTVATE] Table missing. Run supabase/waitlist.sql in the SQL editor.', error);
          return { ok: false, message: "We couldn't save your email. Please try again shortly." };
        }

        console.error('[STARTVATE] Waitlist insert failed.', error);
        return { ok: false, message: error.message || 'Something went wrong. Please try again.' };
      })
      .catch(function (err) {
        console.error('[STARTVATE] Waitlist request failed.', err);
        return { ok: false, message: "Couldn't reach the server. Check your connection and try again." };
      });
  }

  window.startvateWaitlist = {
    ready: !!client,
    mailReady: mailReady,
    submit: submit,
    sendWelcomeEmail: sendWelcomeEmail
  };
})();
