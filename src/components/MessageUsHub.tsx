import { useState } from "react";
import { MessageCircle, Phone, Mail, Facebook, Instagram, X } from "lucide-react";
import { CornerBracket } from "./Ornaments";
import { IMAGES } from "@/data/images";

const channels = [
  { label: "Call", href: "tel:+15625449882", Icon: Phone, color: "bg-brand-red text-white" },
  {
    label: "Email",
    href: "mailto:bagnetchon@gmail.com",
    Icon: Mail,
    color: "bg-accent text-accent-foreground",
  },
  {
    label: "Facebook",
    href: "https://facebook.com/bagnetchon",
    Icon: Facebook,
    color: "bg-[#1877F2] text-white",
  },
  {
    label: "Instagram",
    href: "https://instagram.com/bagnetchon",
    Icon: Instagram,
    color: "bg-[#E4405F] text-white",
  },
  {
    label: "TikTok",
    href: "https://tiktok.com/@bagnetchon",
    Icon: TikTokIcon,
    color: "bg-foreground text-background",
  },
  {
    label: "Messenger",
    href: "https://m.me/bagnetchon",
    Icon: MessageCircle,
    color: "bg-[#0084FF] text-white",
  },
] as const;

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.5 3a5.5 5.5 0 0 0 4.5 4.5v3a8.5 8.5 0 0 1-4.5-1.3v6.3a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V3h3z" />
    </svg>
  );
}

export function FloatingMessageButton() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-20 right-4 z-40 md:bottom-6">
      {open && (
        <div
          role="dialog"
          aria-label="Contact channels"
          className="mb-3 w-56 origin-bottom-right rounded-2xl border border-border bg-card p-3 shadow-2xl"
        >
          <p className="px-2 py-1 font-display text-sm font-semibold">Message us</p>
          <ul className="mt-1 grid grid-cols-1 gap-1">
            {channels.map(({ label, href, Icon, color }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-muted"
                >
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${color}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close contact menu" : "Open contact menu"}
        aria-expanded={open}
        className="btn-sheen medallion pressable group inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}

export function MessageUsHub() {
  return (
    <section
      aria-labelledby="message-us-heading"
      className="bronze-frame wood-surface relative overflow-hidden rounded-3xl px-6 py-14 text-brand-cream md:px-12 md:py-20"
    >
      <CornerBracket corner="tl" className="h-14 w-14 md:h-16 md:w-16" />
      <CornerBracket corner="tr" className="h-14 w-14 md:h-16 md:w-16" />
      <img src={IMAGES.ornamentCornerV2} alt="" aria-hidden="true" className="corner-art corner-art-left" />
      <img src={IMAGES.ornamentCornerV2} alt="" aria-hidden="true" className="corner-art corner-art-right" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-accent">Message Us</p>
        <h2 id="message-us-heading" className="embossed mt-3 font-display text-4xl md:text-5xl">
          However you message — we'll be right there.
        </h2>
        <p className="mt-4 text-brand-cream/80">
          Call, email, DM, or send a Messenger ping. Same crew. Same crackle.
        </p>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {channels.map(({ label, href, Icon, color }) => (
            <li key={label}>
              <a
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="flex flex-col items-center gap-2 rounded-2xl border border-background/15 p-4 hover:border-accent"
              >
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${color}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium">{label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
