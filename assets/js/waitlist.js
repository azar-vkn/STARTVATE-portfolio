/* =============================================================
   STARTVATE — waitlist storage (Supabase)
   Exposes window.startvateWaitlist.submit(email) -> Promise<result>

   result = { ok: true }                     stored
           | { ok: true, duplicate: true }   already on the list
           | { ok: false, message: string }  nothing was stored
   ============================================================= */
(function () {
  'use strict';

  var cfg = window.STARTVATE_SUPABASE || {};
  var lib = window.supabase; // UMD global from assets/js/vendor/supabase.js
  var client = null;

  if (lib && typeof lib.createClient === 'function' && cfg.url && cfg.publishableKey) {
    client = lib.createClient(cfg.url, cfg.publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  } else {
    console.warn('[STARTVATE] Supabase client unavailable — waitlist submissions cannot be stored.');
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
        if (!error) return { ok: true };

        // 23505 = unique_violation — the address is already on the list.
        if (error.code === '23505') return { ok: true, duplicate: true };

        // 42501 / RLS refusal — the insert policy is missing.
        if (error.code === '42501') {
          console.error('[STARTVATE] Insert blocked by RLS. Run supabase/waitlist.sql.', error);
          return { ok: false, message: "We couldn't save your email. Please try again shortly." };
        }

        // PGRST205 — the table has not been created yet.
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

  window.startvateWaitlist = { ready: !!client, submit: submit };
})();
