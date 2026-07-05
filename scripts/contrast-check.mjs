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
