import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Truck, Store } from "lucide-react";
import { useCart, formatPrice } from "@/context/CartContext";
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ ref: string } | null>(null);

  useEffect(() => {
    setF((p) => ({ ...p, source: detectSource() }));
  }, []);

  const total = cart.total(0);

  const [touched, setTouched] = useState<Partial<Record<keyof Fields, boolean>>>({});

  const errors = useMemo(() => {
    const e: Partial<Record<keyof Fields, string>> = {};
    if (!f.name.trim()) e.name = "Enter your name.";
    if (!f.phone.trim()) e.phone = "Enter a phone number.";
    if (!/\S+@\S+\.\S+/.test(f.email)) e.email = "Enter a valid email.";
    if (f.fulfillment === "delivery") {
      if (f.street.trim().length < 3) e.street = "Enter your street address.";
      if (f.city.trim().length < 2) e.city = "Enter your city.";
      if (!/^\d{5}$/.test(f.zip)) e.zip = "Enter a 5-digit ZIP.";
    }
    return e;
  }, [f]);

  const fieldProps = (id: keyof Fields) => ({
    onBlur: () => setTouched((t) => ({ ...t, [id]: true })),
    error: touched[id] ? errors[id] : undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (Object.keys(errors).length > 0) {
      setTouched({
        name: true,
        phone: true,
        email: true,
        street: true,
        city: true,
        zip: true,
      });
      const firstInvalid = Object.keys(errors)[0];
      if (firstInvalid) document.getElementById(firstInvalid)?.focus();
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
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
        lines: cart.resolved,
        subtotal: cart.subtotal,
        tax: cart.tax,
        deliveryFee: 0,
        deliveryMiles: null,
        total,
        source: f.source,
      });
      cart.clear();
      setSuccess({ ref: order.ref });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Could not place order. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center md:px-8">
        <CheckCircle2 className="mx-auto h-14 w-14 text-brand-green" />
        <h1 className="mt-4 font-display text-4xl md:text-5xl">Thank you!</h1>
        <p className="mt-3 text-muted-foreground">
          Your order is in. We'll be in touch at the contact info you provided with pickup or
          delivery details.
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
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-medium capitalize transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 ${
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
                  {opt === "delivery" ? (
                    <Truck className="h-4 w-4" />
                  ) : (
                    <Store className="h-4 w-4" />
                  )}
                  {opt}
                </label>
              ))}
            </div>
          </Section>

          <Section title="Your details">
            <Grid>
              <Field
                label="Full name"
                id="name"
                value={f.name}
                onChange={(v) => setF({ ...f, name: v })}
                required
                autoComplete="name"
                {...fieldProps("name")}
              />
              <Field
                label="Phone"
                id="phone"
                type="tel"
                value={f.phone}
                onChange={(v) => setF({ ...f, phone: v })}
                required
                autoComplete="tel"
                inputMode="tel"
                {...fieldProps("phone")}
              />
              <Field
                label="Email"
                id="email"
                type="email"
                value={f.email}
                onChange={(v) => setF({ ...f, email: v })}
                required
                full
                autoComplete="email"
                inputMode="email"
                {...fieldProps("email")}
              />
            </Grid>
          </Section>

          {f.fulfillment === "delivery" ? (
            <Section title="Delivery">
              <Grid>
                <Field
                  label="Street address"
                  id="street"
                  value={f.street}
                  onChange={(v) => setF({ ...f, street: v })}
                  required
                  full
                  autoComplete="address-line1"
                  {...fieldProps("street")}
                />
                <Field
                  label="City"
                  id="city"
                  value={f.city}
                  onChange={(v) => setF({ ...f, city: v })}
                  required
                  autoComplete="address-level2"
                  {...fieldProps("city")}
                />
                <Field
                  label="ZIP"
                  id="zip"
                  value={f.zip}
                  onChange={(v) => setF({ ...f, zip: v.replace(/\D/g, "").slice(0, 5) })}
                  required
                  autoComplete="postal-code"
                  inputMode="numeric"
                  {...fieldProps("zip")}
                />
              </Grid>
              <div className="mt-4 rounded-xl bg-secondary p-4 text-sm text-muted-foreground">
                Delivery fee is confirmed by our team after you order.
              </div>
            </Section>
          ) : (
            <Section title="Pickup">
              <p className="text-sm text-muted-foreground">
                We'll confirm your pickup time and location via the contact info provided. Lead
                time: 24 hours.
              </p>
            </Section>
          )}

          <Section title="How did you hear about us?">
            <label htmlFor="source" className="sr-only">
              Source
            </label>
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
              <Row label="Tax (7.75%)" value={formatPrice(cart.tax)} muted />
              <Row
                label={f.fulfillment === "delivery" ? "Delivery" : "Pickup"}
                value={f.fulfillment === "pickup" ? "Free" : "Confirmed after order"}
                muted
              />
              <div className="mt-2 flex justify-between border-t border-border pt-2 font-display text-lg font-semibold">
                <dt>Total</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
            </dl>
            <button
              type="submit"
              disabled={submitting}
              className="btn-sheen mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 font-semibold text-primary-foreground disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Place Order
            </button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Payment integration coming soon — your order is reserved on submit.
            </p>
            {submitError && (
              <p role="alert" className="mt-2 text-center text-xs text-destructive">
                {submitError}
              </p>
            )}
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
  label,
  id,
  value,
  onChange,
  type = "text",
  required,
  full,
  error,
  autoComplete,
  inputMode,
  onBlur,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  full?: boolean;
  error?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  onBlur?: () => void;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-primary"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-1 w-full rounded-lg border bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring ${
          error ? "border-destructive" : "border-input"
        }`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
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
