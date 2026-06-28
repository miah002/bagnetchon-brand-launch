// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Security headers applied to every route. 'unsafe-inline' is required for
// React inline styles + the SSR hydration script (no nonce pipeline yet —
// future upgrade). Google Fonts + Supabase (https/wss) are allow-listed.
const SECURITY_HEADERS = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "script-src 'self' 'unsafe-inline'",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  ].join("; "),
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Enable Nitro with Vercel preset for self-hosted deployment.
  // Without this, Lovable's config skips Nitro outside the Lovable sandbox
  // and produces a static-only Vite build (no SSR, no API routes).
  // `routeRules` is supported by nitro at runtime (it bakes the headers into
  // .vercel/output/config.json) but isn't in the Lovable wrapper's narrow nitro
  // type, so cast to satisfy tsc.
  nitro: {
    preset: "vercel",
    routeRules: {
      "/**": { headers: SECURITY_HEADERS },
    },
  } as unknown as { preset: string },
});
