// Lovable Cloud edge function: notify-inquiry
// Sends an email to the owner via Resend when a new inquiry lands.
// SAFE-NO-OP if RESEND_API_KEY is not configured.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InquiryBody {
  id?: string;
  type?: string;
  source?: string;
  name?: string;
  email?: string;
  phone?: string | null;
  event_date?: string | null;
  guest_count?: number | null;
  location?: string | null;
  package?: string | null;
  message?: string | null;
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let body: InquiryBody = {};
  try {
    body = await req.json();
  } catch {
    /* ignore */
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const TO =
    Deno.env.get("OWNER_NOTIFICATION_EMAIL") ?? "catering@bagnetchon.com";
  const FROM = Deno.env.get("RESEND_FROM") ?? "Bagnetchon <onboarding@resend.dev>";

  // Without a Resend key configured this is a no-op — never fail the user.
  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ ok: true, skipped: true, reason: "no_resend_key" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const when = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const lines: string[] = [
    `<p><strong>Type:</strong> ${esc(body.type ?? "inquiry")}</p>`,
    `<p><strong>When:</strong> ${esc(when)} (ET)</p>`,
    `<p><strong>Source:</strong> ${esc(body.source ?? "Website")}</p>`,
    `<p><strong>Name:</strong> ${esc(body.name ?? "")}</p>`,
    `<p><strong>Email:</strong> ${esc(body.email ?? "")}</p>`,
  ];
  if (body.phone) lines.push(`<p><strong>Phone:</strong> ${esc(body.phone)}</p>`);
  if (body.event_date)
    lines.push(`<p><strong>Event date:</strong> ${esc(body.event_date)}</p>`);
  if (body.guest_count != null)
    lines.push(`<p><strong>Guests:</strong> ${body.guest_count}</p>`);
  if (body.location)
    lines.push(`<p><strong>Location:</strong> ${esc(body.location)}</p>`);
  if (body.package)
    lines.push(`<p><strong>Package:</strong> ${esc(body.package)}</p>`);
  if (body.message)
    lines.push(
      `<p><strong>Message:</strong><br/>${esc(body.message).replace(/\n/g, "<br/>")}</p>`,
    );

  const subject = `New ${body.type ?? "inquiry"} — ${body.name ?? "Bagnetchon"}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h2 style="margin:0 0 12px;font-family:Georgia,serif;color:#D7141A">New Bagnetchon ${esc(body.type ?? "inquiry")}</h2>
      ${lines.join("\n")}
    </div>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: [TO], subject, html }),
    });
    const ok = r.ok;
    const data = await r.json().catch(() => ({}));
    return new Response(JSON.stringify({ ok, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: ok ? 200 : 200, // 200 either way; never fail the caller
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
