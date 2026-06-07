import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { MessageUsHub } from "@/components/MessageUsHub";
import { BaybayinWatermark } from "@/components/BaybayinWatermark";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageMeta({
      title: "Contact",
      description:
        "Call (954) 625-9631, email hello@bagnetchon.com, or DM us anywhere. Serving Broward, Miami-Dade, and Palm Beach.",
      path: "/contact",
    }),
  component: Contact,
});

function Contact() {
  const ref = useScrollReveal();
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
          { icon: <Phone />, title: "Call us", lines: ["(954) 625-9631", "Fastest for same-day orders"], href: "tel:+19546259631" },
          { icon: <Mail />, title: "Catering", lines: ["catering@bagnetchon.com", "Events of 10 to 500"], href: "mailto:catering@bagnetchon.com" },
          { icon: <Mail />, title: "General", lines: ["hello@bagnetchon.com", "Press, partnerships, hellos"], href: "mailto:hello@bagnetchon.com" },
          { icon: <Clock />, title: "Hours", lines: ["Fri – Sun", "11:00 am – 8:00 pm"] },
          { icon: <MapPin />, title: "Service Area", lines: ["Broward · Miami-Dade · Palm Beach", "Delivery, pickup & catering"] },
        ].map((card, i) => (
          <div key={card.title} className="reveal" style={{ transitionDelay: `${i * 60}ms` }}>
            <Card {...card} />
          </div>
        ))}
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
  return href ? <a href={href}>{inner}</a> : inner;
}
