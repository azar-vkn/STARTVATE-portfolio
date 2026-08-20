# STARTVATE — Startup Ecosystem Discovery Platform

Investor-facing landing page and product showcase for **STARTVATE** — the discovery and
networking layer for the startup ecosystem.

> One place to discover who to meet, what to explore, and what to do next.

## Run it

Any static server works. From this folder:

```bash
python -m http.server 5173
```

Then open <http://localhost:5173>. (Opening `index.html` directly also works, but a server is
recommended so the fonts and assets resolve cleanly.)

## Structure

```
index.html                     # entire page — nav, hero, 20+ sections, AI panel, footer
assets/css/styles.css          # design system (tokens, components, responsive rules)
assets/js/app.js               # search engine demo, filters, animations, AI assistant
assets/js/supabase-config.js   # Supabase project URL + publishable key
assets/js/waitlist.js          # waitlist insert, error handling
assets/js/vendor/supabase.js   # vendored @supabase/supabase-js UMD build
supabase/waitlist.sql          # table + RLS policies (run once)
.claude/launch.json            # dev-server config for the preview pane
```

## Waitlist → Supabase

Emails from the final CTA are stored in a `waitlist` table in Supabase.

**Setup (one time):** open the [SQL editor](https://supabase.com/dashboard/project/emkwrtqazbrneloksrsh/sql/new),
paste the contents of [`supabase/waitlist.sql`](supabase/waitlist.sql), and run it. Until that runs,
the form correctly reports a failure rather than a false success.

**Why no `@supabase/ssr` or `.env.local`:** this is a static site with no server and no bundler, so
there are no server components to keep sessions for and no build step to inline env vars. The
browser client talks to Supabase directly. `@supabase/supabase-js` is installed via npm and its UMD
build is vendored into `assets/js/vendor/` so the page has no CDN dependency at runtime.

**On the key:** the publishable (anon) key is public by design — it ships in every Supabase browser
app. Row Level Security is what protects the data. The policy in the SQL file grants `insert` only:
anonymous visitors can add themselves to the list, and nobody can read, update or delete it with
that key. Read the list from the dashboard, or from a server with the secret service-role key —
which must never appear in this repo.

Stored per signup: `email`, `source`, `referrer`, `created_at`. Duplicate addresses are rejected by
a unique index and shown as "you're already on the list".

### Welcome email

A greeting goes out on every new signup via **EmailJS**, sent from the browser
([`assets/js/waitlist.js`](assets/js/waitlist.js), configured in
[`assets/js/emailjs-config.js`](assets/js/emailjs-config.js)).

Storing the signup is what decides success; the email is best-effort on top. If EmailJS fails the
visitor still gets an honest confirmation — the address is safely in the table — and the error goes
to the console and the EmailJS dashboard. The reverse never happens: if the insert fails, no
greeting is sent and the visitor is told to try again.

Duplicates are not re-greeted.

**Note on the EmailJS keys:** unlike a Resend or SendGrid key, EmailJS credentials are meant to be
public — but anyone can copy them off the page and spend your monthly quota. Restrict them in the
EmailJS dashboard (Account → Security) to your deployed domain once the site is hosted.

A server-side alternative (Supabase Edge Function + Resend) is written but not deployed — see
[`supabase/README.md`](supabase/README.md). Use one or the other, never both.

## What's interactive

| Feature | Where | Behaviour |
| --- | --- | --- |
| Ecosystem search | "What are you building?" | Type or pick a suggestion — results re-render across People / Startups / Opportunities / Knowledge. Five domain datasets (agri, fintech, climate, student, health) plus a generic fallback for any other query. |
| Result tabs | Results dashboard | Switch between all results and a single category. |
| Ask AI | Floating button + section CTAs | Slide-in assistant with scripted, intent-matched answers on co-founders, accelerators, validation, funding and next steps. |
| Opportunity filters | Never Miss Your Next Opportunity | Filter by hackathon, grant, accelerator, job and more. Match rings animate on scroll. |
| Startup filters | Discover What Others Are Building | Filter the ecosystem map by AI, FinTech, HealthTech, AgriTech, ClimateTech, SaaS, DeepTech, EdTech. |
| Feed actions | Builder Feed | Like and save toggle live. |
| Counters & matches | From Search to Action, Matching | Count up when scrolled into view. |
| Journey | From Idea to Company | Steps light up in sequence. |
| Waitlist | Final CTA | Client-side validation and confirmation state (no backend). |

## Design system

- Warm white surfaces (`#FAF9F5` / `#FFFFFF`) with a Claude-style orange accent (`#D97757`).
- Light mode only, by intent — dark typography, soft shadows, generous whitespace.
- Type: Inter, with Instrument Serif italics for emphasis and IBM Plex Mono for data labels.
- Fully responsive: desktop presentation → readable tablet → single-column mobile with search
  kept as the central interaction.
- Honours `prefers-reduced-motion`.

## Notes

- All people, startups, opportunities, match percentages and AI answers are **illustrative sample
  data** for demonstration, labelled as such on the page.
- No build step, no dependencies, no tracking. Google Fonts is the only external request, and the
  page falls back to system fonts without it.
