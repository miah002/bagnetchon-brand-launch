# Running Bagnetchon locally

TanStack Start + Vite 7 + React 19 + Tailwind + shadcn/ui, backed by Supabase.

## Prerequisites
- Node 20.19+ or 22+ (Vite 7 requirement)
- npm (or bun — `bun.lock` is included; scripts just call vite)

## Setup
```bash
npm install
cp .env.example .env     # a .env already exists with your Supabase URL + anon key
npm run dev              # http://localhost:5173
```
`npm run build` → production build · `npm run preview` → serve the build.

## Photos
The 15 real photos are already in `public/images/`. Swap any by replacing the file
(keep the name) or edit `src/data/images.ts` / `src/data/menu.ts`.

## Environment variables
| Var | Scope | Where to get it |
|---|---|---|
| VITE_SUPABASE_URL / SUPABASE_URL | client+server | Lovable → View Backend → Project Settings → API → Project URL |
| VITE_SUPABASE_PUBLISHABLE_KEY / SUPABASE_PUBLISHABLE_KEY | client+server | same screen → anon / publishable key (public-safe) |
| SUPABASE_SERVICE_ROLE_KEY | server only | same screen → service_role key (SECRET — never prefix with VITE_, never commit) |
| GOOGLE_MAPS_API_KEY | server only | Google Cloud → enable Distance Matrix API → Credentials → API key |
| VITE_KITCHEN_ORIGIN | client | your real kitchen address |

The Supabase URL + anon key are already filled in `.env`. You only need to add
GOOGLE_MAPS_API_KEY (for live delivery distance), SUPABASE_SERVICE_ROLE_KEY (for the
server admin client used by API routes), and VITE_KITCHEN_ORIGIN.

## Email alerts (notify-inquiry)
The owner-email function runs on Supabase, not locally. Set its secrets in the
Supabase dashboard → Edge Functions → Secrets: `RESEND_API_KEY`,
`OWNER_NOTIFICATION_EMAIL`, optional `RESEND_FROM`.

## Payments
Stripe is stubbed. The hook-in point is `src/lib/config.server.ts` (commented
`stripeSecretKey`) and the order-creation flow. Drop in a Stripe Checkout session there.

## Security notes
- `.env` is now gitignored and untracked — commit that change (`git add .gitignore && git commit -m "ignore .env"`).
- Never put SERVICE_ROLE / Stripe / Google keys in a committed file or a VITE_ var.
- Set the GitHub repo back to **Private** now that it's cloned.

## Backend (Supabase) ownership
This points at the Supabase project Lovable provisioned (`supabase/migrations/` +
`supabase/functions/notify-inquiry`). To go fully independent: create your own Supabase
project, run the SQL in `supabase/migrations/`, redeploy the function, set its secrets,
and update `.env`.
