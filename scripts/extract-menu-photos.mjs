// One-off: pull the largest embedded raster out of each designed menu SVG in
// public/Files and save it as a clean photo in public/images. The SVGs are
// multi-MB slides (photo + vector text); we only want the dish photo.
//   run: node scripts/extract-menu-photos.mjs
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const SRC = "public/Files";
const OUT = "public/images";

const slug = (name) =>
  name
    .replace(/\.svg$/i, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const files = (await readdir(SRC)).filter((f) => f.toLowerCase().endsWith(".svg"));
await mkdir(OUT, { recursive: true });

for (const f of files) {
  const txt = await readFile(path.join(SRC, f), "utf8");
  const re = /data:image\/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)/g;
  let m;
  let best = null;
  while ((m = re.exec(txt))) {
    const buf = Buffer.from(m[2], "base64");
    if (!best || buf.length > best.buf.length) {
      best = { ext: m[1] === "jpeg" ? "jpg" : m[1], buf };
    }
  }
  if (!best) {
    console.log("NO IMAGE FOUND:", f);
    continue;
  }
  const out = path.join(OUT, `menu-${slug(f)}.${best.ext}`);
  await writeFile(out, best.buf);
  console.log(`${f} -> ${out} (${Math.round(best.buf.length / 1024)} KB)`);
}
