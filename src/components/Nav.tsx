import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, X, Phone } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import { IMAGES } from "@/data/images";

const links = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/catering", label: "Catering" },
  { to: "/our-story", label: "Our Story" },
  { to: "/contact", label: "Contact" },
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoOk, setLogoOk] = useState(true);
  const drawerRef = useRef<HTMLDivElement>(null);
  const { itemCount } = useCart();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "Tab" && drawerRef.current) {
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "wood-surface sticky top-0 z-50 border-b-2 border-[var(--brand-gold)]/70 transition-shadow",
        scrolled ? "shadow-warm" : "",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-8 md:py-4">
        <Link to="/" className="flex items-center gap-2" aria-label="Bagnetchon home">
          {logoOk ? (
            <img
              src={IMAGES.logo}
              alt="Bagnetchon"
              width={44}
              height={44}
              className="h-10 w-10 rounded-full object-cover ring-1 ring-border"
              onError={() => setLogoOk(false)}
            />
          ) : null}
          <span className="embossed font-display text-2xl font-bold tracking-tight text-brand-cream">
            BAGNET<span className="text-brand-red">CHON</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="relative text-sm font-medium text-brand-cream/85 transition-colors hover:text-brand-gold"
              activeProps={{
                className: "text-brand-gold underline underline-offset-8 decoration-2",
              }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="tel:+15625449882"
            className="hidden items-center gap-2 rounded-full border border-[var(--brand-gold)]/60 px-3 py-2 text-sm font-medium text-brand-cream hover:border-[var(--brand-gold)] hover:text-brand-gold md:inline-flex"
            aria-label="Call Bagnetchon"
          >
            <Phone className="h-4 w-4" />
            (562) 544-9882
          </a>
          <Link
            to="/checkout"
            className="pressable relative inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground ring-1 ring-[var(--brand-gold)]/40 hover:brightness-110"
            aria-label={`Cart with ${itemCount} items`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            {itemCount > 0 && (
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs font-bold text-accent-foreground">
                {itemCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full p-2 text-brand-cream md:hidden"
            aria-label="Open navigation menu"
            aria-expanded={open}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-[60] animate-in fade-in duration-200 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
          />
          <div
            ref={drawerRef}
            className="absolute right-0 top-0 h-full w-80 max-w-[88%] animate-in slide-in-from-right duration-200 bg-background p-6 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-xl font-bold">
                BAGNET<span className="text-brand-red">CHON</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 hover:bg-muted"
                aria-label="Close menu"
                autoFocus
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-8 flex flex-col gap-1" aria-label="Mobile">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="rounded-lg px-3 py-3 text-base font-medium hover:bg-muted"
                  activeProps={{ className: "bg-muted text-brand-red" }}
                  activeOptions={{ exact: l.to === "/" }}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <a
              href="tel:+15625449882"
              className="mt-6 flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              <Phone className="h-4 w-4" />
              (562) 544-9882
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
