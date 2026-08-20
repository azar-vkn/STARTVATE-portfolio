/* =============================================================
   STARTVATE — waitlist storage & EmailJS integration
   Exposes window.startvateWaitlist.submit(email) -> Promise<result>
   ============================================================= */
(function () {
  'use strict';

  var cfg = window.STARTVATE_SUPABASE || {};
  var emailCfg = window.STARTVATE_EMAILJS || {};
  var lib = window.supabase;
  var emailLib = window.emailjs;
  var client = null;

  if (lib && typeof lib.createClient === 'function' && cfg.url && cfg.publishableKey) {
    client = lib.createClient(cfg.url, cfg.publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }

  if (emailLib && emailCfg.publicKey) {
    try {
      emailLib.init({ publicKey: emailCfg.publicKey });
    } catch (e) {
      console.warn('[STARTVATE] EmailJS init failed', e);
    }
  }

  function sendWelcomeEmail(address) {
    if (!window.emailjs || !emailCfg.serviceId || !emailCfg.templateId) {
      return Promise.resolve();
    }
    return window.emailjs.send(emailCfg.serviceId, emailCfg.templateId, {
      to_email: address,
      email: address
    }).then(function (res) {
      console.log('[STARTVATE] Welcome email sent via EmailJS:', res.status, res.text);
      return res;
    }).catch(function (err) {
      console.error('[STARTVATE] EmailJS send failed:', err);
    });
  }

  function submit(email) {
    var address = String(email || '').trim().toLowerCase();

    // If Supabase is available, insert to DB and dispatch EmailJS welcome email
    if (client) {
      return client
        .from(cfg.table || 'waitlist')
        .insert({
          email: address,
          source: 'landing_page',
          referrer: document.referrer || null
        })
        .then(function (res) {
          var error = res && res.error;
          if (!error) {
            sendWelcomeEmail(address);
            return { ok: true };
          }

          // 23505 = unique_violation — the address is already on the list.
          if (error.code === '23505') {
            return { ok: true, duplicate: true };
          }

          // If database refused or table missing, fallback to sending email
          console.warn('[STARTVATE] Supabase insert failed, sending email directly...', error);
          return sendWelcomeEmail(address).then(function () {
            return { ok: true };
          });
        })
        .catch(function (err) {
          console.warn('[STARTVATE] Supabase connection failed, sending email directly...', err);
          return sendWelcomeEmail(address).then(function () {
            return { ok: true };
          });
        });
    }

    // Fallback: If Supabase client not present, send directly via EmailJS
    return sendWelcomeEmail(address).then(function () {
      return { ok: true };
    }).catch(function (err) {
      return { ok: false, message: 'Could not submit email. Please try again.' };
    });
  }

  window.startvateWaitlist = { ready: true, submit: submit, sendWelcomeEmail: sendWelcomeEmail };
})();
