import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, Phone } from "lucide-react";
import { BaybayinWatermark } from "./BaybayinWatermark";

export function Footer() {
  return (
    <footer className="wood-surface relative mt-24 overflow-hidden border-t-4 border-[var(--brand-gold)]/70 text-brand-cream">
      <BaybayinWatermark
        glyph="ᜃ"
        className="-right-12 -top-12 text-background"
        size="text-[20rem]"
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <div className="embossed font-display text-3xl font-bold text-brand-cream">
            BAGNET<span className="text-brand-red">CHON</span>
          </div>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-background/80">
            Bagnet + Lechon — organic process, probiotic herbs &amp; spices, meticulous humidity
            &amp; temperature control. Quality you can crunch.
          </p>
          <div className="mt-6 flex flex-col gap-2 text-sm">
            <a href="tel:+15625449882" className="inline-flex items-center gap-2 hover:text-accent">
              <Phone className="h-4 w-4" />
              (562) 544-9882
            </a>
            <a
              href="mailto:bagnetchon@gmail.com"
              className="inline-flex items-center gap-2 hover:text-accent"
            >
              <Mail className="h-4 w-4" />
              bagnetchon@gmail.com
            </a>
            <a
              href="mailto:bagnetchon@gmail.com"
              className="inline-flex items-center gap-2 hover:text-accent"
            >
              <Mail className="h-4 w-4" />
              bagnetchon@gmail.com
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-accent">Hours</h4>
          <p className="mt-4 text-sm text-background/80">
            Friday – Sunday
            <br />
            11:00 am – 8:00 pm
          </p>
          <h4 className="mt-8 font-display text-sm uppercase tracking-widest text-accent">
            Explore
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/menu" className="hover:text-accent">
                Menu
              </Link>
            </li>
            <li>
              <Link to="/catering" className="hover:text-accent">
                Catering
              </Link>
            </li>
            <li>
              <Link to="/our-story" className="hover:text-accent">
                Our Story
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-accent">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-sm uppercase tracking-widest text-accent">Follow</h4>
          <div className="mt-4 flex gap-3">
            <a
              href="https://facebook.com/bagnetchon"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="rounded-full border border-background/30 p-2 hover:border-accent hover:text-accent"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              href="https://instagram.com/bagnetchon"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="rounded-full border border-background/30 p-2 hover:border-accent hover:text-accent"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              href="https://tiktok.com/@bagnetchon"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
              className="rounded-full border border-background/30 p-2 hover:border-accent hover:text-accent"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M16.5 3a5.5 5.5 0 0 0 4.5 4.5v3a8.5 8.5 0 0 1-4.5-1.3v6.3a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V3h3z" />
              </svg>
            </a>
          </div>
          <p className="mt-10 text-xs text-background/60">
            © {new Date().getFullYear()} Bagnetchon. Made with crackle in Anaheim, CA.
          </p>
        </div>
      </div>
    </footer>
  );
}
