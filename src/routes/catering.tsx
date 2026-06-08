import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Photo } from "@/components/Photo";
import { BaybayinWatermark } from "@/components/BaybayinWatermark";
import { MessageUsHub } from "@/components/MessageUsHub";
import { IMAGES } from "@/data/images";
import { submitInquiry } from "@/lib/inquiries";
import { detectSource, SOURCE_OPTIONS } from "@/lib/source";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/catering")({
  head: () =>
    pageMeta({
      title: "Catering",
      description:
        "Bagnetchon catering across Southern California — 10 to 500 guests. Whole lechon, fiesta platters, full-service packages. Inquire today.",
      path: "/catering",
      image: IMAGES.teamEvent,
    }),
  component: CateringPage,
});

const PACKAGES = [
  {
    name: "Intimate",
    price: "from $185",
    serves: "Serves 10",
    bullets: ["Choice of 2 Mains", "Large Garlic Rice Tray"],
  },
  {
    name: "Family",
    price: "from $395",
    serves: "Serves 25",
    bullets: ["Choice of 3 Mains", "Pancit & Dessert Trays"],
  },
  {
    name: "Fiesta",
    price: "from $720",
    serves: "Serves 50",
    badge: "POPULAR",
    bullets: ["Choice of 5 Mains", "Full Beverage Service"],
  },
  {
    name: "Whole Lechon",
    price: "Market Price",
    serves: "Centerpiece",
    bullets: ["Traditional Roasted Pig", "Specialty Liver Sauce", "Professional Carving"],
  },
];

interface Form {
  name: string;
  email: string;
  phone: string;
  date: string;
  guests: string;
  location: string;
  package: string;
  notes: string;
  source: string;
}

function CateringPage() {
  const ref = useScrollReveal();
  const [f, setF] = useState<Form>({
    name: "",
    email: "",
    phone: "",
    date: "",
    guests: "",
    location: "",
    package: "",
    notes: "",
    source: "Website",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    setF((p) => ({ ...p, source: detectSource() }));
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!f.name.trim()) e.name = "Required";
    if (!/\S+@\S+\.\S+/.test(f.email)) e.email = "Valid email required";
    if (!f.date) e.date = "Required";
    else if (f.date <= today) e.date = "Date must be in the future";
    const g = Number(f.guests);
    if (!f.guests || isNaN(g) || g < 1) e.guests = "At least 1 guest";
    if (!f.location.trim()) e.location = "Required";
    return e;
  }, [f, today]);

  const valid = Object.keys(errors).length === 0;

  const prefill = (pkg: string) => {
    setF((p) => ({ ...p, package: pkg }));
    document.getElementById("inquiry-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitInquiry({
        type: "catering",
        name: f.name,
        email: f.email,
        phone: f.phone,
        eventDate: f.date,
        guestCount: Number(f.guests),
        location: f.location,
        package: f.package || undefined,
        notes: f.notes || undefined,
        source: f.source,
      });
      setSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Could not submit. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="relative" ref={ref as React.RefObject<HTMLDivElement>}>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <BaybayinWatermark
          glyph="ᜃ"
          className="-right-10 top-10 text-foreground"
          size="text-[24rem]"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:px-8 md:py-24">
          <div className="reveal">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">Catering</p>
            <h1 className="mt-3 font-display text-5xl md:text-7xl leading-tight">
              Feed Your Fiesta.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              From intimate dinners to 500-guest celebrations. We bring the lechon, the crackle, and
              the lola-approved dipping sauces.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#packages"
                className="btn-sheen rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground"
              >
                View Packages
              </a>
              <a
                href="#inquiry-form"
                className="rounded-full border-2 border-foreground px-6 py-3 font-semibold hover:bg-foreground hover:text-background"
              >
                Inquire Now
              </a>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              <strong className="text-foreground">Lead time:</strong> 48 hours for standard
              packages, 7 days for whole lechon. All catering includes traditional dipping sauces
              and serving utensils.
            </p>
          </div>
          <div className="reveal">
            <Photo
              src={IMAGES.fiestaSpread}
              alt="Bagnetchon fiesta spread"
              aspect="4/5"
              rounded="rounded-tl-[3rem] rounded-br-[3rem]"
              eager
            />
          </div>
        </div>
      </section>

      {/* PACKAGES */}
      <section id="packages" className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <h2 className="font-display text-3xl md:text-5xl">Packages</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PACKAGES.map((p, i) => (
            <article
              key={p.name}
              className="reveal relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-ambient transition-all duration-300 hover:-translate-y-1 hover:shadow-warm"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              {p.badge && (
                <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                  {p.badge}
                </span>
              )}
              <h3 className="font-display text-2xl">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.serves}</p>
              <p className="mt-4 font-display text-2xl font-semibold text-primary">{p.price}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {p.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {b}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => prefill(p.name)}
                className="btn-sheen mt-5 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:bg-brand-red"
              >
                Inquire
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* GALLERY */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Photo
            src={IMAGES.teamEvent}
            alt="Catering at a Filipino fiesta"
            aspect="1/1"
            rounded="rounded-tl-[2rem] rounded-br-[2rem]"
          />
          <Photo
            src={IMAGES.teamBooth}
            alt="Pop-up booth"
            aspect="1/1"
            rounded="rounded-tr-[2rem] rounded-bl-[2rem]"
          />
          <Photo
            src={IMAGES.fiestaSpread}
            alt="Full fiesta spread"
            aspect="1/1"
            rounded="rounded-tl-[2rem] rounded-br-[2rem]"
          />
          <Photo
            src={IMAGES.dishPlatter}
            alt="Platter close-up"
            aspect="1/1"
            rounded="rounded-tr-[2rem] rounded-bl-[2rem]"
          />
        </div>
      </section>

      {/* INQUIRY FORM */}
      <section
        id="inquiry-form"
        aria-labelledby="inquiry-heading"
        className="mx-auto max-w-3xl px-4 py-16 md:px-8 md:py-24"
      >
        <h2 id="inquiry-heading" className="font-display text-3xl md:text-5xl">
          Tell us about your event.
        </h2>
        <p className="mt-2 text-muted-foreground">We respond within 24 hours, usually faster.</p>

        {success ? (
          <div className="mt-10 rounded-2xl bg-secondary p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-brand-green" />
            <h3 className="mt-3 font-display text-2xl">Salamat!</h3>
            <p className="mt-2 text-muted-foreground">
              Our catering concierge will reach out within 24 hours.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handle}
            noValidate
            className="mt-8 grid gap-5 rounded-2xl border border-border bg-card p-6 shadow-ambient md:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <CField
                label="Full Name"
                id="cname"
                value={f.name}
                onChange={(v) => setF({ ...f, name: v })}
                error={errors.name}
                required
              />
              <CField
                label="Email"
                id="cemail"
                type="email"
                value={f.email}
                onChange={(v) => setF({ ...f, email: v })}
                error={errors.email}
                required
              />
              <CField
                label="Phone"
                id="cphone"
                type="tel"
                value={f.phone}
                onChange={(v) => setF({ ...f, phone: v })}
              />
              <CField
                label="Event Date"
                id="cdate"
                type="date"
                min={today}
                value={f.date}
                onChange={(v) => setF({ ...f, date: v })}
                error={errors.date}
                required
              />
              <CField
                label="Guest Count"
                id="cguests"
                type="number"
                min="1"
                value={f.guests}
                onChange={(v) => setF({ ...f, guests: v })}
                error={errors.guests}
                required
              />
              <CField
                label="Event Location / Venue"
                id="cloc"
                value={f.location}
                onChange={(v) => setF({ ...f, location: v })}
                error={errors.location}
                required
              />
            </div>

            <div>
              <label htmlFor="cpkg" className="text-sm font-medium">
                Package
              </label>
              <select
                id="cpkg"
                value={f.package}
                onChange={(e) => setF({ ...f, package: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5"
              >
                <option value="">Select a package (optional)</option>
                {PACKAGES.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="cnotes" className="text-sm font-medium">
                Dietary Restrictions / Notes
              </label>
              <textarea
                id="cnotes"
                rows={4}
                value={f.notes}
                onChange={(e) => setF({ ...f, notes: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5"
              />
            </div>

            <div>
              <label htmlFor="csource" className="text-sm font-medium">
                How did you hear about us?
              </label>
              <select
                id="csource"
                value={f.source}
                onChange={(e) => setF({ ...f, source: e.target.value })}
                className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5"
              >
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={!valid || submitting}
              className="btn-sheen inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3.5 font-semibold text-primary-foreground disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Send Inquiry
            </button>
            {submitError && (
              <p role="alert" className="text-sm text-destructive">
                {submitError}
              </p>
            )}
          </form>
        )}
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <MessageUsHub />
      </div>
    </div>
  );
}

function CField({
  label,
  id,
  value,
  onChange,
  type = "text",
  required,
  error,
  min,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  error?: string;
  min?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-primary"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        min={min}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`mt-1 w-full rounded-lg border bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring ${
          error ? "border-destructive" : "border-input"
        }`}
      />
      {error && (
        <p id={`${id}-err`} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
