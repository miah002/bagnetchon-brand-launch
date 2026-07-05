# Mahogany Heritage Retheme — Design

**Date:** 2026-07-05 · **Branch:** `redesign/mahogany-heritage` · **Status:** approved by Jeremiah (scope: whole site; assets: Gemini)

## Context

The client (via designer Chedie Balboa Narcelles) approved a skeuomorphic mahogany/wood
concept, delivered as Gemini-generated mobile mockups of the admin page and public
footer, plus an exact palette table. The current site **already contains** the heritage
treatment (the `redesign/v2-woodcut-heritage` and `redesign/admin-skeuo` branches were
merged to main earlier): wood surface, parchment panels, bronze frames, corner
ornaments, carved-relief CSS. This retheme is therefore a **palette swap + asset
upgrade + contrast fix**, not a rebuild.

The site is not publicly live; all work stays on this branch. Client reviews via the
Vercel branch preview. No merge to `main` without explicit approval.

## Goal

Whole-site retheme to the client's mahogany / golden-brown palette with richer
Gemini-generated assets, keeping text contrast at WCAG AA so it "does not look ugly."

## 1. Palette tokens (`src/styles.css`)

The site is fully CSS-variable driven; the swap is centralized.

| Token | Current | New | Role |
|---|---|---|---|
| `--brand-wood` | `#26130b` | `#2B160A` Deep Espresso | outer chrome / dark backgrounds |
| `--brand-wood-2` | `#402213` | `#52301A` Warm Mahogany | panel headers, grain mid-tone |
| `--brand-gold` | (current) | `#8C6239` Golden-Brown | active tabs, borders, highlights |
| accent | (current red) | `#D94D29` Copper Orange | chili motifs, small accents ONLY |
| `--brand-cream` | `#f5efe4` | `#F2EADA` Antique Cream | content panels |
| rows/page light | — | `#FEFDFB` Warm Off-White | table rows, light page areas |
| text-on-light | `#26130b` | `#0A0A0A` Jet Black | body text |

## 2. Contrast rules (non-negotiable)

- Body text NEVER sits on raw wood texture. Light panels: `#0A0A0A` text (≈20:1).
  Text over wood: solid/near-solid overlay panel `rgba(43,22,10,.85)`+ behind the text
  block, `#F2EADA` text (≈12:1).
- `#8C6239` and `#D94D29` on cream ≈ 3.2–3.4:1 → **accent-only** (large headings
  ≥18px bold, borders, icons). Never body text.
- Focus rings: copper on light surfaces, cream on wood.
- Each token pair checked against WCAG AA during build; violations fixed before review.

## 3. Asset pipeline (Gemini API)

- **Auth:** user-supplied Google AI Studio key, local env only (`GEMINI_API_KEY`),
  never committed, never added to Vercel (assets are baked at build time).
- **Models:** `gemini-3-pro-image` (image *editing*: recolor existing assets, extract
  ornaments from the client mockup, keeping Chedie's established style) and
  `imagen-4.0-generate-001` (fresh seamless texture tiles). Verified available on the key.
- **Post-processing** (PowerShell System.Drawing, same pipeline as menu photos):
  ornaments generated on a solid key color → chroma-key cut to transparent PNG;
  textures cropped to seamless tiles; everything compressed. **Budget ≤150 KB per tile,
  ≤200 KB per ornament.**
- **Asset list:**
  1. Mahogany wood texture tile (replaces `texture-wood.jpg`)
  2. Antique-cream parchment tile (replaces `texture-parchment.jpg`)
  3. Chili corner ornament, transparent (mockup's corners; git-history versions as style reference)
  4. Carved header banner backing (admin masthead + public nav)
  5. Copper/bronze frame rail recolor (replaces `frame-rail.png`)
- Fallback if a generation disappoints: recolor the existing repo asset via color
  matrix instead. No Higgsfield.

## 4. Application

- **Admin (mobile-first, per mockup):** recolored carved masthead, golden-brown active
  pill tabs, `#FEFDFB` framed table rows, copper chevrons/accents. Structure already
  matches (prior ledger redesign); this is palette + polish.
- **Public pages:** token swap does most; per-page sweep for hardcoded hex values
  (grep) — Nav, hero framing, menu cards (cream cards, mahogany borders), catering,
  our-story, contact.
- **Footer:** wood texture + overlay panel behind all text (mockup treatment, made AA).

## 5. Verification & delivery

- `npx tsc --noEmit` + `npm run build` clean.
- Playwright mobile (390px) screenshots: admin inbox, home, menu, footer — shown to
  Jeremiah before client handoff.
- Contrast: automated check of the token pairs listed in §2.
- Push branch → Vercel preview URL → client sign-off → only then discuss merge
  (backup-first, as always).

## Out of scope

- Public launch tasks (CAPTCHA, Zoho/Sheet test-data cleanup).
- Pixel-perfect replication of the AI mockup (sliced mockup assets look muddy).
- Higgsfield; any paid image generation.
- New pages or feature changes — visual retheme only.
