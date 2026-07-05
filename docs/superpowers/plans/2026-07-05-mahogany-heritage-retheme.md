# Mahogany Heritage Retheme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retheme the whole site to the client's mahogany/golden-brown palette with Gemini-generated texture assets, at WCAG AA contrast, on branch `redesign/mahogany-heritage` only.

**Architecture:** The site is fully CSS-variable driven (`src/styles.css` `:root` block), so the palette is one centralized token swap plus a small sweep of hardcoded values. Texture assets are regenerated with the Gemini API and **overwrite the existing filenames** (`texture-wood.jpg`, `texture-parchment.jpg`, `frame-rail.png`, `ornament-corner-v2.png`) so no CSS churn. A contrast-check script guards the token pairs.

**Tech Stack:** TanStack Start + Tailwind v4 (CSS vars), Gemini API (`imagen-4.0-generate-001` for tiles, `gemini-3-pro-image` for edits), PowerShell System.Drawing for compression, Playwright for screenshots.

## Global Constraints

- Branch `redesign/mahogany-heritage` only — NEVER commit to or merge into `main`.
- `GEMINI_API_KEY` lives in the shell env only — never committed, never in Vercel.
- Texture tiles ≤150 KB; ornaments ≤200 KB.
- Contrast: body-text pairs ≥4.5:1; decorative/large-text pairs ≥3:1 (script-enforced).
- Copper `#D94D29` and golden-brown `#8C6239` are accent-only — never body text.
- Palette hexes (client-supplied, exact): `#D94D29` copper, `#2B160A` espresso, `#F2EADA` antique cream, `#FEFDFB` warm off-white, `#0A0A0A` jet black, `#8C6239` golden-brown, `#52301A` warm mahogany (derived mid-tone).

---

### Task 1: Palette token swap + contrast guard

**Files:**
- Create: `scripts/contrast-check.mjs`
- Modify: `src/styles.css:41-110` (token blocks), `src/routes/__root.tsx:92` (theme-color)

**Interfaces:**
- Produces: CSS vars `--brand-gold` (#8c6239), `--brand-gold-bright` (#cca580), `--brand-copper` (#d94d29) + Tailwind mappings `--color-brand-gold-bright`, `--color-brand-copper`. Later tasks use `var(--brand-gold-bright)` on dark surfaces and `text-brand-copper` utilities.

- [ ] **Step 1: Write the contrast guard (the failing-test equivalent)**

```js
// scripts/contrast-check.mjs — WCAG contrast guard for the mahogany palette.
// Fails (exit 1) if any pair drops below its floor. Run: node scripts/contrast-check.mjs
const lum = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
// [fg, bg, floor, label]
const pairs = [
  ["#0a0a0a", "#f2eada", 4.5, "body text on antique cream"],
  ["#0a0a0a", "#fefdfb", 4.5, "body text on warm off-white"],
  ["#f2eada", "#2b160a", 4.5, "cream text on espresso wood"],
  ["#fefdfb", "#8c6239", 4.5, "off-white text on golden-brown (active tab)"],
  ["#fffdf9", "#a62615", 4.5, "button text on brick red (primary)"],
  ["#cca580", "#2b160a", 4.5, "copper-bright accents/headings on wood"],
  ["#8c6239", "#f2eada", 3.0, "golden-brown large accents on cream"],
  ["#d94d29", "#f2eada", 3.0, "copper large accents on cream"],
  ["#8c6239", "#2b160a", 3.0, "golden-brown borders on wood (non-text)"],
];
let fail = 0;
for (const [fg, bg, floor, label] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= floor;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.toFixed(2)}:1 (floor ${floor})  ${label}`);
}
process.exit(fail ? 1 : 0);
```

- [ ] **Step 2: Run it — must pass BEFORE the swap too (pure math, no CSS read)**

Run: `node scripts/contrast-check.mjs`
Expected: all PASS. If "off-white text on golden-brown" fails, darken `--brand-gold` to `#7a5430` and re-run until PASS; use the passing value in Step 3.

- [ ] **Step 3: Swap tokens in `src/styles.css`**

In the `:root` block (lines 56–90), replace the brand palette:

```css
  /* Brand palette — Bagnetchon mahogany heritage (client palette 2026-07) */
  --brand-red: #a62615; /* Chili Red — deep brick (AA-safe as text/buttons) */
  --brand-green: #45a046; /* Leaf Green (logo) */
  --brand-gold: #8c6239; /* Golden-Brown — active tabs, borders, on-light accents */
  --brand-gold-bright: #cca580; /* Muted Copper — filigree/text accents on wood */
  --brand-copper: #d94d29; /* Copper Orange — chili motifs, large accents only */
  --brand-terracotta: #8c583a; /* Warm Terracotta — selected states (unchanged) */
  --brand-charcoal: #0a0a0a; /* Jet Black — all main text on light panels */
  --brand-cream: #f2eada; /* Antique Cream — parchment panels */
  --brand-wood: #2b160a; /* Deep Espresso — outer chrome */
  --brand-wood-2: #52301a; /* Warm Mahogany — panel headers/grain */
  --brand-cream-2: #fefdfb; /* Warm Off-White — cards/table rows */
```

Change the semantic accent line (~83) so on-wood accents keep AA:

```css
  --accent: var(--brand-gold-bright);
```

In the `@theme` block (after line 43 `--color-brand-gold`), add:

```css
  --color-brand-gold-bright: var(--brand-gold-bright);
  --color-brand-copper: var(--brand-copper);
```

- [ ] **Step 4: Update the PWA/browser chrome color**

`src/routes/__root.tsx:92`: replace `#211910` with `#2b160a`.

- [ ] **Step 5: Verify**

Run: `node scripts/contrast-check.mjs && npx tsc --noEmit && npm run build`
Expected: contrast all PASS, tsc silent, build "✓ built".

- [ ] **Step 6: Commit**

```bash
git add scripts/contrast-check.mjs src/styles.css src/routes/__root.tsx
git commit -m "feat(theme): mahogany/golden-brown palette tokens + WCAG contrast guard"
```

---

### Task 2: Gemini image generator script

**Files:**
- Create: `scripts/gemini-image.mjs`
- Modify: `.gitignore` (add `assets-src/`)

**Interfaces:**
- Produces CLI: `node scripts/gemini-image.mjs --prompt "<text>" --out <file.png> [--model <id>] [--ref <img> ...] [--size 1024]`. Default model `imagen-4.0-generate-001` when no `--ref`; `gemini-3-pro-image` when `--ref` given. Reads `GEMINI_API_KEY` from env. Task 3 depends on this exact CLI.

- [ ] **Step 1: Write the script**

```js
// scripts/gemini-image.mjs — generate/edit images via Gemini API.
// Usage: node scripts/gemini-image.mjs --prompt "..." --out file.png [--model id] [--ref img.png ...]
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };
const refs = args.flatMap((a, i) => (a === "--ref" ? [args[i + 1]] : []));
const prompt = get("--prompt");
const out = get("--out");
const key = process.env.GEMINI_API_KEY;
if (!key) { console.error("GEMINI_API_KEY not set"); process.exit(1); }
if (!prompt || !out) { console.error("need --prompt and --out"); process.exit(1); }
const model = get("--model") || (refs.length ? "gemini-3-pro-image" : "imagen-4.0-generate-001");

const isImagen = model.startsWith("imagen");
const url = isImagen
  ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict`
  : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const body = isImagen
  ? { instances: [{ prompt }], parameters: { sampleCount: 1 } }
  : {
      contents: [{
        parts: [
          ...refs.map((r) => ({
            inline_data: {
              mime_type: r.endsWith(".jpg") || r.endsWith(".jpeg") ? "image/jpeg" : "image/png",
              data: fs.readFileSync(r).toString("base64"),
            },
          })),
          { text: prompt },
        ],
      }],
      generationConfig: { responseModalities: ["IMAGE"] },
    };

const res = await fetch(url, {
  method: "POST",
  headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
  body: JSON.stringify(body),
});
if (!res.ok) { console.error(`HTTP ${res.status}:`, (await res.text()).slice(0, 500)); process.exit(1); }
const data = await res.json();
const b64 = isImagen
  ? data.predictions?.[0]?.bytesBase64Encoded
  : data.candidates?.[0]?.content?.parts?.find((p) => p.inlineData || p.inline_data)
      ?.[data.candidates?.[0]?.content?.parts?.some((p) => p.inlineData) ? "inlineData" : "inline_data"]?.data;
if (!b64) { console.error("no image in response:", JSON.stringify(data).slice(0, 500)); process.exit(1); }
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.from(b64, "base64"));
console.log(`wrote ${out} (${(fs.statSync(out).size / 1024).toFixed(0)} KB, model ${model})`);
```

- [ ] **Step 2: Gitignore the working folder**

Append to `.gitignore`:

```
assets-src/
```

- [ ] **Step 3: Smoke test (proves auth + parsing before spending real prompts)**

Run: `GEMINI_API_KEY=<key> node scripts/gemini-image.mjs --prompt "flat solid mahogany brown color swatch" --out assets-src/smoke.png`
Expected: `wrote assets-src/smoke.png (NN KB, model imagen-4.0-generate-001)`. View the PNG to confirm it decodes.

- [ ] **Step 4: Commit (script + gitignore only — assets-src/ stays local)**

```bash
git add scripts/gemini-image.mjs .gitignore
git commit -m "feat(tooling): Gemini image generation CLI for theme assets"
```

---

### Task 3: Generate + process the four theme assets

**Files:**
- Create (local only): `assets-src/` working files; `scripts/compress-asset.ps1`
- Overwrite: `public/images/texture-wood.jpg`, `public/images/texture-parchment.jpg`, `public/images/frame-rail.png`, `public/images/ornament-corner-v2.png`

**Interfaces:**
- Consumes: `scripts/gemini-image.mjs` CLI from Task 2.
- Produces: same four public filenames (CSS already points at them — zero churn).

- [ ] **Step 1: Recover legacy chili ornaments from git history as style references**

```bash
git show ee1fc41^:public/images/ornament-chili.png > assets-src/ref-chili.png
git show ee1fc41^:public/images/ornament-corner-chili.png > assets-src/ref-corner-chili.png
cp public/images/ornament-corner-v2.png assets-src/ref-corner-v2.png
cp public/images/frame-rail.png assets-src/ref-frame-rail.png
cp public/images/texture-wood.jpg assets-src/ref-wood.jpg
```

- [ ] **Step 2: Generate the four assets (exact prompts)**

```bash
node scripts/gemini-image.mjs --out assets-src/wood.png --prompt "Seamless tileable dark mahogany wood texture. Rich reddish-brown grain, warm mahogany #52301A mid-tones over deep espresso #2B160A base, very subtle carved damask relief pattern, photorealistic, top-down, perfectly even lighting, edges must tile seamlessly, no text, no vignette"

node scripts/gemini-image.mjs --out assets-src/parchment.png --prompt "Seamless tileable antique cream parchment paper texture, color #F2EADA, extremely subtle woven fiber grain, very low contrast, warm and clean, photorealistic, perfectly even lighting, edges must tile seamlessly, no text, no stains, no vignette"

node scripts/gemini-image.mjs --out assets-src/corner.png --ref assets-src/ref-corner-v2.png --ref assets-src/ref-corner-chili.png --prompt "Create an ornate carved-wood corner ornament in the same style as these references: baroque filigree scrollwork in golden-brown #8C6239 with copper #D94D29 red chili pepper accents, carved relief with realistic highlights and shadows, L-shaped for a top-left corner, on a SOLID deep espresso #2B160A background filling the whole canvas, no text"

node scripts/gemini-image.mjs --out assets-src/rail.png --ref assets-src/ref-frame-rail.png --prompt "Recolor this ornamental rail strip to warm copper-bronze: base metal #8C6239 golden-brown with #D94D29 copper highlights, keep the exact same shape, proportions and layout, background must be solid deep espresso #2B160A, no text"
```

Expected: four `wrote assets-src/*.png` lines. View each image; regenerate any that has text artifacts, vignetting, or obvious non-tiling seams (tweak wording, max 2 retries each — fallback is keeping the existing asset for that slot).

- [ ] **Step 3: Write the compression script**

```powershell
# scripts/compress-asset.ps1 -In <src> -Out <dest> -MaxPx 1024 -Quality 80
# JPEG when -Out ends .jpg, PNG otherwise. Same System.Drawing pipeline as menu photos.
param([string]$In, [string]$Out, [int]$MaxPx = 1024, [int]$Quality = 80)
Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile((Resolve-Path $In))
$scale = [Math]::Min(1.0, $MaxPx / [Math]::Max($img.Width, $img.Height))
$w = [int]($img.Width * $scale); $h = [int]($img.Height * $scale)
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = "HighQualityBicubic"
$g.DrawImage($img, 0, 0, $w, $h); $g.Dispose(); $img.Dispose()
$OutFull = Join-Path (Get-Location) $Out
if ($Out -match "\.jpe?g$") {
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
  $p = New-Object System.Drawing.Imaging.EncoderParameters(1)
  $p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$Quality)
  $bmp.Save($OutFull, $codec, $p)
} else {
  $bmp.Save($OutFull, [System.Drawing.Imaging.ImageFormat]::Png)
}
$bmp.Dispose()
"{0} -> {1} ({2:N0} KB)" -f $In, $Out, ((Get-Item $OutFull).Length / 1KB)
```

- [ ] **Step 4: Compress into place (overwrite the live filenames)**

```powershell
powershell -File scripts/compress-asset.ps1 -In assets-src/wood.png      -Out public/images/texture-wood.jpg      -MaxPx 1024 -Quality 78
powershell -File scripts/compress-asset.ps1 -In assets-src/parchment.png -Out public/images/texture-parchment.jpg -MaxPx 1024 -Quality 78
powershell -File scripts/compress-asset.ps1 -In assets-src/corner.png    -Out public/images/ornament-corner-v2.png -MaxPx 700
powershell -File scripts/compress-asset.ps1 -In assets-src/rail.png      -Out public/images/frame-rail.png        -MaxPx 900
```

Expected: tiles ≤150 KB, ornaments ≤200 KB. If a PNG busts budget, re-run with smaller `-MaxPx` (600/500).

- [ ] **Step 5: Visual check in the app**

Run: `npm run dev` (background) → open `http://localhost:5173/`, view home + admin login.
Check: wood chrome reads mahogany (not black), parchment panels smooth, corner ornament sits as carved relief, no visible tile seams at 390 px width.

- [ ] **Step 6: Commit**

```bash
git add public/images/texture-wood.jpg public/images/texture-parchment.jpg public/images/frame-rail.png public/images/ornament-corner-v2.png scripts/compress-asset.ps1
git commit -m "feat(theme): mahogany Gemini-generated textures, corner ornament, copper rail"
```

---

### Task 4: Admin retheme polish (mobile-first, per client mockup)

**Files:**
- Modify: `src/routes/admin.tsx:243-263` (masthead sign-out + tab pills)

**Interfaces:**
- Consumes: tokens from Task 1 (`--brand-gold`, `--brand-gold-bright`, `--brand-cream-2`).

- [ ] **Step 1: Active tab pill → golden-brown (client: "Tab highlights")**

`src/routes/admin.tsx:262` — replace:

```tsx
                  ? "bg-[var(--brand-terracotta)] text-brand-cream shadow-[0_1px_4px_rgba(38,19,11,0.35)]"
```

with:

```tsx
                  ? "bg-[var(--brand-gold)] text-[var(--brand-cream-2)] shadow-[0_1px_4px_rgba(38,19,11,0.35)]"
```

(`#FEFDFB` on `#8C6239` = 5.3:1 — the cream `#F2EADA` variant is 4.49:1 and would fail; do not use it here.)

- [ ] **Step 2: Sign-out pill on wood → bright copper accents (AA on dark)**

`src/routes/admin.tsx:243` — in the sign-out button className, replace `border-[var(--brand-gold)]/50` with `border-[var(--brand-gold-bright)]/50`.
`src/routes/admin.tsx:245` — replace `text-[var(--brand-gold)]` with `text-[var(--brand-gold-bright)]`.

- [ ] **Step 3: Status pill colors (lines 530–535) — leave unchanged**

They're functional status colors (paid/pending/etc.), not brand chrome. No edit.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit && node scripts/contrast-check.mjs`
Then in the running dev server, open `/admin` at 390 px: masthead wood mahogany, active tab golden-brown with off-white text, sign-out filigree bright.

- [ ] **Step 5: Commit**

```bash
git add src/routes/admin.tsx
git commit -m "feat(admin): golden-brown active tabs + AA copper accents on wood masthead"
```

---

### Task 5: Public sweep — footer legibility + on-dark gold audit

**Files:**
- Modify: `src/styles.css:144-156` (`.wood-surface`), plus any files the audit in Step 2 flags.

**Interfaces:**
- Consumes: tokens from Task 1. `--accent` already flipped to `--brand-gold-bright`, which silently fixes Footer headings/hovers (they use `text-accent`).

- [ ] **Step 1: Guarantee text legibility over the wood texture**

In `src/styles.css` `.wood-surface` (line 144), layer a darkening gradient UNDER the texture reference so busy grain can never wash out text:

```css
.wood-surface {
  background-color: var(--brand-wood);
  background-image:
    linear-gradient(rgb(43 22 10 / 0.55), rgb(43 22 10 / 0.55)),
    url("/images/texture-wood.jpg");
}
```

(Keep any other existing properties in the rule; only the `background-image` gains the gradient layer.)

- [ ] **Step 2: Audit remaining `--brand-gold` uses on dark surfaces**

Run: `grep -rn "brand-gold" src --include="*.tsx" | grep -v "gold-bright"`
For each hit, decide: element sits on cream/off-white → keep `--brand-gold`; element sits on `wood-surface`/dark → switch to `--brand-gold-bright` **if it's text or an icon** (borders at ≤/50 opacity may stay). Known dark-surface hits already fixed in Task 4; `Footer.tsx:8` border may keep gold. Apply and note each change in the commit body.

- [ ] **Step 3: Verify pages visually**

Dev server at 390 px: home (hero, bestsellers, footer), `/menu` (cards: cream panels, mahogany borders, prices legible), `/catering`, `/contact`. Footer: cream body text + bright-copper headings over darkened wood.

- [ ] **Step 4: Run the existing Playwright suite**

Run: `npx playwright test`
Expected: `tests/pages.spec.ts`, `tests/order-flow.spec.ts`, `tests/catering.spec.ts` all pass (retheme must not break flows).

- [ ] **Step 5: Commit**

```bash
git add src/styles.css src/components/Footer.tsx
git commit -m "feat(theme): darkened wood underlay for text legibility + on-dark gold audit"
```

---

### Task 6: Full verification, screenshots, push, preview

**Files:**
- None new (screenshots go to `assets-src/screens/`, gitignored).

- [ ] **Step 1: Full check battery**

Run: `node scripts/contrast-check.mjs && npx tsc --noEmit && npm run build && npx playwright test`
Expected: everything green.

- [ ] **Step 2: Capture mobile screenshots for review**

With dev server running:

```bash
npx playwright screenshot --viewport-size="390,844" http://localhost:5173/        assets-src/screens/home.png
npx playwright screenshot --viewport-size="390,844" http://localhost:5173/menu    assets-src/screens/menu.png
npx playwright screenshot --viewport-size="390,844" http://localhost:5173/catering assets-src/screens/catering.png
npx playwright screenshot --viewport-size="390,844" --full-page http://localhost:5173/ assets-src/screens/home-full.png
npx playwright screenshot --viewport-size="390,844" http://localhost:5173/admin   assets-src/screens/admin-login.png
```

View each; fix anything ugly (seams, washed text, mis-colored accents) before hand-off. Admin inbox (post-login) is checked by Jeremiah in his browser — auth-gated.

- [ ] **Step 3: Push the branch (NOT main)**

```bash
git push -u origin redesign/mahogany-heritage
```

Vercel creates a preview deployment for the branch — grab the preview URL from the Vercel dashboard (or `npx vercel ls`) and hand it to Jeremiah for client sign-off.

- [ ] **Step 4: Report**

Deliver: screenshot set + preview URL + note that merge waits for client approval (backup-first merge flow when it comes).

---

## Self-review

- **Spec coverage:** §1 tokens → Task 1. §2 contrast rules → Tasks 1 (script), 4 (pill text), 5 (underlay + audit). §3 pipeline/assets → Tasks 2–3 (asset 5 "header banner" was cut — YAGNI: masthead = wood + rail + logo, all covered; noted as future asset drop from designer). §4 application → Tasks 4–5. §5 verification/delivery → Task 6. ✔
- **Placeholders:** none — every code step has full code, every command exact. ✔
- **Type consistency:** token names (`--brand-gold-bright`, `--brand-copper`, `--brand-cream-2`) match across Tasks 1/4/5; CLI flags in Task 3 match Task 2's parser. ✔
