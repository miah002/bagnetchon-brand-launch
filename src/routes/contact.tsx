import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { MessageUsHub } from "@/components/MessageUsHub";
import { BaybayinWatermark } from "@/components/BaybayinWatermark";
import { pageMeta } from "@/lib/seo";
import { submitInquiry } from "@/lib/inquiries";
import { detectSource } from "@/lib/source";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageMeta({
      title: "Contact",
      description:
        "Call (562) 544-9882, email bagnetchon@gmail.com, or DM us anywhere. Serving Orange County, Los Angeles, and Southern California.",
      path: "/contact",
    }),
  component: Contact,
});

function Contact() {
  const ref = useScrollReveal();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = name.trim() && /\S+@\S+\.\S+/.test(email) && message.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitInquiry({
        type: "contact",
        name,
        email,
        notes: message,
        source: detectSource(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send. Please try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="relative" ref={ref as React.RefObject<HTMLDivElement>}>
      <BaybayinWatermark glyph="ᜊ" className="-right-10 top-20 text-foreground" size="text-[22rem]" />

      <section className="reveal mx-auto max-w-3xl px-4 pt-16 text-center md:px-8 md:pt-24">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">
          Contact
        </p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl">
          Hungry? Curious? Catering?
        </h1>
        <p className="mt-4 text-muted-foreground">
          Reach out however you like — we're quick to respond.
        </p>
      </section>

      <section className="mx-auto mt-12 grid max-w-5xl gap-5 px-4 sm:grid-cols-2 md:px-8">
        {[
          { icon: <Phone />, title: "Call us", lines: ["(562) 544-9882", "Fastest for same-day orders"], href: "tel:+15625449882" },
          { icon: <Mail />, title: "Catering", lines: ["catering@bagnetchon.com", "Events of 10 to 500"], href: "mailto:catering@bagnetchon.com" },
          { icon: <Mail />, title: "General", lines: ["bagnetchon@gmail.com", "Press, partnerships, hellos"], href: "mailto:bagnetchon@gmail.com" },
          { icon: <Clock />, title: "Hours", lines: ["Fri – Sun", "11:00 am – 8:00 pm"] },
          { icon: <MapPin />, title: "Service Area", lines: ["Orange County · Los Angeles · IE", "Delivery, pickup & catering"] },
        ].map((card, i) => (
          <div key={card.title} className="reveal" style={{ transitionDelay: `${i * 60}ms` }}>
            <Card {...card} />
          </div>
        ))}
      </section>

      {/* Contact Form */}
      <section
        aria-labelledby="contact-form-heading"
        className="mx-auto mt-16 max-w-2xl px-4 md:px-8"
      >
        <div className="reveal rounded-2xl border border-border bg-card p-6 shadow-ambient md:p-8">
          <h2 id="contact-form-heading" className="font-display text-2xl">
            Send us a message
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            We respond within 24 hours.
          </p>
          {success ? (
            <div className="mt-8 text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-brand-green" />
              <p className="mt-3 font-display text-xl">Salamat!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                We'll get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="contact-name" className="text-sm font-medium">
                  Name <span className="text-primary">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="text-sm font-medium">
                  Email <span className="text-primary">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="text-sm font-medium">
                  Message <span className="text-primary">*</span>
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              {error && (
                <p role="alert" className="text-sm text-destructive">{error}</p>
              )}
              <button
                type="submit"
                disabled={!valid || submitting}
                className="btn-sheen inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Message
              </button>
            </form>
          )}
        </div>
      </section>

      <div className="mx-auto mt-16 max-w-7xl px-4 pb-20 md:px-8">
        <MessageUsHub />
      </div>
    </div>
  );
}

function Card({
  icon, title, lines, href,
}: {
  icon: React.ReactNode; title: string; lines: string[]; href?: string;
}) {
  const inner = (
    <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-ambient transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-warm">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <h2 className="font-display text-xl">{title}</h2>
      <div className="text-sm text-muted-foreground">
        {lines.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>
    </div>
  );
  return href ? <a href={href}>{inner}</a> : <>{inner}</>;
}
