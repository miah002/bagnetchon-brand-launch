import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useCart, formatPrice } from "@/context/CartContext";
import {
  calcDeliveryFee,
  estimateDistanceMiles,
  type DeliveryEstimate,
} from "@/config/delivery";
import { createOrder } from "@/lib/orders";
import { detectSource, SOURCE_OPTIONS } from "@/lib/source";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/checkout")({
  head: () =>
    pageMeta({
      title: "Checkout",
      description: "Complete your Bagnetchon order.",
      path: "/checkout",
    }),
  component: Checkout,
});

interface Fields {
  name: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  zip: string;
  source: string;
  fulfillment: "delivery" | "pickup";
}

function Checkout() {
  const cart = useCart();
  const [f, setF] = useState<Fields>({
    name: "",
    phone: "",
    email: "",
    street: "",
    city: "",
    zip: "",
    source: "Website",
    fulfillment: "delivery",
  });
  const [estimate, setEstimate] = useState<DeliveryEstimate | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [estimateMsg, setEstimateMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ ref: string } | null>(null);

  useEffect(() => {
    setF((p) => ({ ...p, source: detectSource() }));
  }, []);

  const addr = useMemo(
    () => `${f.street}, ${f.city}, FL ${f.zip}`,
    [f.street, f.city, f.zip],
  );
  const addrReady =
    f.fulfillment === "delivery" &&
    f.street.length > 2 &&
    f.city.length > 1 &&
    /^\d{5}$/.test(f.zip);

  useEffect(() => {
    let cancelled = false;
    if (!addrReady) {
      setEstimate(null);
      setEstimateMsg(null);
      return;
    }
    setEstimating(true);
    setEstimateMsg(null);
    estimateDistanceMiles(addr).then((miles) => {
      if (cancelled) return;
      setEstimating(false);
      if (miles == null) {
        setEstimate(null);
        setEstimateMsg("We'll confirm your delivery cost after you order.");
      } else {
        setEstimate(calcDeliveryFee(miles));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [addr, addrReady]);

  const deliveryFee = estimate?.fee ?? 0;
  const total = cart.total(deliveryFee);

  const canSubmit =
    cart.itemCount > 0 &&
    f.name &&
    f.phone &&
    /\S+@\S+\.\S+/.test(f.email) &&
    (f.fulfillment === "pickup" || (f.street && f.city && /^\d{5}$/.test(f.zip))) &&
    !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    // TODO(stripe): replace with Stripe Checkout session call here.
    const order = await createOrder({
      fulfillment: f.fulfillment,
      customer: {
        name: f.name,
        phone: f.phone,
        email: f.email,
        street: f.fulfillment === "pickup" ? "Pickup" : f.street,
        city: f.fulfillment === "pickup" ? "Pickup" : f.city,
        zip: f.fulfillment === "pickup" ? "00000" : f.zip,
      },
      lines: cart.lines,
      subtotal: cart.subtotal,
      tax: cart.tax,
      deliveryFee: f.fulfillment === "pickup" ? 0 : deliveryFee,
      total: f.fulfillment === "pickup" ? cart.total(0) : total,
      source: f.source,
    });
    cart.clear();
    setSuccess({ ref: order.ref });
    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center md:px-8">
        <CheckCircle2 className="mx-auto h-14 w-14 text-brand-green" />
        <h1 className="mt-4 font-display text-4xl md:text-5xl">Salamat!</h1>
        <p className="mt-3 text-muted-foreground">
          Your order is in. We'll be in touch at the contact info you provided
          with pickup or delivery details.
        </p>
        <p className="mt-6 inline-block rounded-full bg-secondary px-4 py-2 font-mono text-sm">
          Order ref: <strong>{success.ref}</strong>
        </p>
        <div className="mt-8">
          <Link
            to="/menu"
            className="btn-sheen rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            Order more
          </Link>
        </div>
      </div>
    );
  }

  if (cart.itemCount === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center md:px-8">
        <h1 className="font-display text-4xl">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">Add a dish to get started.</p>
        <Link
          to="/menu"
          className="btn-sheen mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground"
        >
          Browse the menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-20">
      <Link
        to="/menu"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        ← Back to menu
      </Link>
      <h1 className="mt-4 font-display text-4xl md:text-5xl">Checkout</h1>
      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 md:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <Section title="Fulfillment">
            <div role="radiogroup" aria-label="Order fulfillment" className="flex gap-3">
              {(["delivery", "pickup"] as const).map((opt) => (
                <label
                  key={opt}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-medium capitalize transition ${
                    f.fulfillment === opt
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="fulfillment"
                    value={opt}
                    checked={f.fulfillment === opt}
                    onChange={() => setF({ ...f, fulfillment: opt })}
                    className="sr-only"
                  />
                  {opt === "delivery" ? "🚗 Delivery" : "🏠 Pickup"}
                </label>
              ))}
            </div>
          </Section>

          <Section title="Your details">
            <Grid>
              <Field label="Full name" id="name" value={f.name} onChange={(v) => setF({ ...f, name: v })} required />
              <Field label="Phone" id="phone" type="tel" value={f.phone} onChange={(v) => setF({ ...f, phone: v })} required />
              <Field label="Email" id="email" type="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} required full />
            </Grid>
          </Section>

          {f.fulfillment === "delivery" ? (
            <Section title="Delivery">
              <Grid>
                <Field label="Street address" id="street" value={f.street} onChange={(v) => setF({ ...f, street: v })} required full />
                <Field label="City" id="city" value={f.city} onChange={(v) => setF({ ...f, city: v })} required />
                <Field label="ZIP" id="zip" value={f.zip} onChange={(v) => setF({ ...f, zip: v.replace(/\D/g, "").slice(0, 5) })} required />
              </Grid>
              <div className="mt-4 rounded-xl bg-secondary p-4 text-sm">
                {!addrReady && (
                  <p className="text-muted-foreground">
                    Enter your address to see your delivery fee.
                  </p>
                )}
                {estimating && (
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Calculating distance…
                  </p>
                )}
                {estimate && (
                  <>
                    <div className="flex justify-between">
                      <span>Distance</span>
                      <span className="font-semibold">{estimate.miles.toFixed(1)} mi</span>
                    </div>
                    <div className="mt-1 flex justify-between">
                      <span>Delivery fee</span>
                      <span className="font-semibold text-primary">
                        {formatPrice(estimate.fee)}
                      </span>
                    </div>
                    {estimate.needsQuote && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Over 30 miles — we'll contact you to confirm this quote.
                      </p>
                    )}
                  </>
                )}
                {estimateMsg && <p className="text-muted-foreground">{estimateMsg}</p>}
              </div>
            </Section>
          ) : (
            <Section title="Pickup">
              <p className="text-sm text-muted-foreground">
                We'll confirm your pickup time and location via the contact info provided. Lead time: 24 hours.
              </p>
            </Section>
          )}

          <Section title="How did you hear about us?">
            <label htmlFor="source" className="sr-only">Source</label>
            <select
              id="source"
              value={f.source}
              onChange={(e) => setF({ ...f, source: e.target.value })}
              className="w-full rounded-lg border border-input bg-background px-4 py-3"
            >
              {SOURCE_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Section>
        </div>

        <aside className="md:sticky md:top-24 md:self-start">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-ambient">
            <h2 className="font-display text-2xl">Order summary</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {cart.resolved.map((l) => (
                <li key={l.id} className="flex justify-between">
                  <span>
                    {l.qty}× {l.item.name}
                  </span>
                  <span>{formatPrice(l.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
              <Row label="Subtotal" value={formatPrice(cart.subtotal)} />
              <Row label="Tax (7%)" value={formatPrice(cart.tax)} muted />
              <Row
                label={f.fulfillment === "delivery" ? "Delivery" : "Pickup"}
                value={f.fulfillment === "pickup" ? "Free" : (estimate ? formatPrice(deliveryFee) : "—")}
                muted
              />
              <div className="mt-2 flex justify-between border-t border-border pt-2 font-display text-lg font-semibold">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-sheen mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 font-semibold text-primary-foreground disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Place Order
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Payment integration coming soon — your order is reserved on submit.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-ambient">
      <h2 className="font-display text-xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
function Field({
  label, id, value, onChange, type = "text", required, full,
}: {
  label: string; id: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}{required && <span className="text-primary"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}
function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`flex justify-between ${muted ? "text-muted-foreground" : ""}`}>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
