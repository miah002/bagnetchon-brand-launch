// Lovable Cloud edge function: notify-order
// Sends an email to the owner via Resend when a new order lands.
// SAFE-NO-OP if RESEND_API_KEY is not configured.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderBody {
  order_ref?: string;
  fulfillment?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  address_street?: string;
  address_city?: string;
  address_zip?: string;
  items?: unknown[];
  subtotal?: number;
  tax?: number;
  delivery_fee?: number;
  total?: number;
  source?: string;
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmt(n?: number) {
  return n != null ? `$${n.toFixed(2)}` : "—";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let body: OrderBody = {};
  try {
    body = await req.json();
  } catch { /* ignore */ }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const TO = Deno.env.get("OWNER_NOTIFICATION_EMAIL") ?? "catering@bagnetchon.com";
  const FROM = Deno.env.get("RESEND_FROM") ?? "Bagnetchon <onboarding@resend.dev>";

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
    `<p><strong>Order Ref:</strong> ${esc(body.order_ref ?? "—")}</p>`,
    `<p><strong>When:</strong> ${esc(when)} (ET)</p>`,
    `<p><strong>Fulfillment:</strong> ${esc(body.fulfillment ?? "delivery")}</p>`,
    `<p><strong>Source:</strong> ${esc(body.source ?? "Website")}</p>`,
    `<p><strong>Customer:</strong> ${esc(body.customer_name ?? "")}</p>`,
    `<p><strong>Email:</strong> ${esc(body.customer_email ?? "")}</p>`,
    `<p><strong>Phone:</strong> ${esc(body.customer_phone ?? "")}</p>`,
  ];

  if (body.fulfillment !== "pickup") {
    lines.push(`<p><strong>Address:</strong> ${esc(body.address_street ?? "")} ${esc(body.address_city ?? "")} FL ${esc(body.address_zip ?? "")}</p>`);
  }

  lines.push(
    `<p><strong>Subtotal:</strong> ${fmt(body.subtotal)}</p>`,
    `<p><strong>Tax:</strong> ${fmt(body.tax)}</p>`,
    `<p><strong>Delivery Fee:</strong> ${fmt(body.delivery_fee)}</p>`,
    `<p><strong>Total:</strong> ${fmt(body.total)}</p>`,
    `<p><strong>Items:</strong> ${body.items ? body.items.length : 0} line(s)</p>`,
  );

  const subject = `New Order ${body.order_ref ?? ""} — ${body.customer_name ?? "Bagnetchon"}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h2 style="margin:0 0 12px;font-family:Georgia,serif;color:#D7141A">New Bagnetchon Order</h2>
      ${lines.join("\n")}
      <hr style="margin:16px 0;border:none;border-top:1px solid #eee"/>
      <p style="font-size:12px;color:#888">Check the admin panel at /admin for full order details.</p>
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
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
