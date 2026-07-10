# Addendum — What Actually Shipped (vs. the original plan)

The original plan (`2026-07-05-mahogany-heritage-retheme.md`) specified a Gemini API
(`imagen-4.0-generate-001` / `gemini-3-pro-image`) asset-generation pipeline for
Task 2/3. That pipeline never shipped. This addendum is the durable record of what
was tried and what actually landed, since the plan doc itself was never rewritten
and would otherwise mislead anyone following it verbatim after a fresh clone.

## Task 2 — CANCELLED

Gemini/Imagen access turned out to be billing-gated: Imagen models returned
HTTP 400 ("only available on paid plans") on the user's key, and the Gemini
2.5/3.1 Flash image models returned HTTP 429 with `free_tier ... limit: 0` — zero
free quota, not a rate limit. No `scripts/gemini-image.mjs` was ever committed.
Cancelled outright rather than worked around.

## Task 3 — redefined, executed directly (not via a dispatched implementer)

Two further pipelines were tried in sequence before landing on the one that shipped:

1. **Local recolor** (`scripts/recolor-asset.ps1`, .NET `System.Drawing`
   `ColorMatrix`): a real bug — `DrawImage` silently failed to draw, leaving the
   bitmap at its zero-initialized default, which flattens to solid black (JPEG)
   or white (PNG-over-white). Abandoned; script deleted.
2. **Hugging Face Inference Providers** (`black-forest-labs/FLUX.1-schnell` via
   `scripts/hf-image.mjs`) — this is what shipped. Requires a *fine-grained* HF
   token with "Make calls to Inference Providers" checked (classic tokens 403).

Assets actually replaced in `public/images/` (same filenames, no CSS churn, as
the original plan intended): `ornament-corner-v2.png` (chroma-keyed via the new
`scripts/chroma-key.ps1`, compressed via `scripts/compress-asset.ps1`),
`texture-parchment.jpg`, `frame-rail.png` (compressed but still 319 KB — over the
200 KB ornament budget; disclosed exception, see commit `81a4319` — the CSS
class it belongs to, `.wood-rail`, is confirmed dead/unused today so this has no
live effect either way). `texture-wood.jpg` was **left unchanged**: three
generation attempts were tried and rejected on sight (too red/brick, read as
plank flooring, too shiny/busy) — this is the plan's own stated 3-attempt
fallback, not a shortfall.

## Net effect on the plan's Global Constraints

- `GEMINI_API_KEY` constraint is moot — no Gemini code shipped. The equivalent
  constraint for what did ship: `HF_TOKEN` lives in the shell env only, never
  committed, never in Vercel (verified — same standard as the original).
  Same holds for the Zoho/Supabase tokens used elsewhere in this repo — none of
  them ever landed in a commit; the Task 6 final review independently grepped
  the whole branch diff for literal secrets and found none.
- Texture/ornament byte budgets: met except `frame-rail.png` (see above,
  documented exception).
- Contrast: unaffected by the pipeline swap — `scripts/contrast-check.mjs`
  (Task 1) is unchanged in purpose and still the enforcement mechanism.

Full session-by-session detail lives in `.superpowers/sdd/progress.md` and
`.superpowers/sdd/task-3-actual-requirements.md` (both gitignored — scratch
ledger, not committed) for anyone working the branch live; this file is the
durable, committed summary for everyone else.
