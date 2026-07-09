// scripts/hf-image.mjs — generate images via Hugging Face Inference API.
// Usage: node scripts/hf-image.mjs --prompt "..." --out file.png [--model id]
import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };
const prompt = get("--prompt");
const out = get("--out");
const model = get("--model") || "black-forest-labs/FLUX.1-schnell";
const key = process.env.HF_TOKEN;
if (!key) { console.error("HF_TOKEN not set"); process.exit(1); }
if (!prompt || !out) { console.error("need --prompt and --out"); process.exit(1); }

const url = `https://router.huggingface.co/hf-inference/models/${model}`;

async function generate(retries = 4) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "x-wait-for-model": "true",
      },
      body: JSON.stringify({ inputs: prompt }),
    });
    const ct = res.headers.get("content-type") || "";
    if (res.ok && ct.startsWith("image/")) {
      const buf = Buffer.from(await res.arrayBuffer());
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, buf);
      console.log(`wrote ${out} (${(buf.length / 1024).toFixed(0)} KB, model ${model})`);
      return;
    }
    const text = await res.text();
    let body;
    try { body = JSON.parse(text); } catch { body = { raw: text.slice(0, 300) }; }
    if (res.status === 503 && body.estimated_time) {
      const wait = Math.min(Math.ceil(body.estimated_time * 1000), 20000);
      console.error(`model loading, waiting ${wait}ms (attempt ${attempt + 1}/${retries + 1})`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    console.error(`HTTP ${res.status}:`, JSON.stringify(body).slice(0, 400));
    process.exit(1);
  }
  console.error("exhausted retries waiting for model to load");
  process.exit(1);
}

await generate();
