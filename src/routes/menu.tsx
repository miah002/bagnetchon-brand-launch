import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Minus, Plus, Trash2, Check } from "lucide-react";
import { Photo } from "@/components/Photo";
import { ChiliMark } from "@/components/Ornaments";
import { BaybayinWatermark } from "@/components/BaybayinWatermark";
import {
  MENU_GROUPS,
  CATEGORIES,
  type MenuCategory,
  type MenuGroup,
} from "@/data/menu";
import { useCart, formatPrice } from "@/context/CartContext";
import { pageMeta } from "@/lib/seo";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menu")({
  head: () =>
    pageMeta({
      title: "Menu",
      description:
        "Order Bagnetchon online — Roasted Lechon Belly, whole lechon, cochinillo, sisig and more. Delivery and catering across Southern California.",
      path: "/menu",
    }),
  component: MenuPage,
});

const SECTION_ORDER: MenuCategory[] = ["Trays & Packs", "Whole Roasts"];
const SECTION_BLURB: Record<MenuCategory, string> = {
  "Trays & Packs": "Order online for pickup or delivery — packs and trays for any table.",
  "Whole Roasts": "Our showpiece roasts, priced by weight. Tap a size, then request a quote.",
};

function MenuPage() {
  const ref = useScrollReveal();
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const cart = useCart();

  const sections = useMemo(
    () =>
      SECTION_ORDER.filter((c) => cat === "All" || cat === c).map((c) => ({
        category: c,
        groups: MENU_GROUPS.filter((g) => g.category === c),
      })),
    [cat],
  );

  return (
    <div className="relative" ref={ref as React.RefObject<HTMLDivElement>}>
      <BaybayinWatermark
        glyph="ᜎ"
        className="-right-10 top-20 text-foreground"
        size="text-[22rem]"
      />
      <header className="reveal mx-auto max-w-7xl px-4 pt-12 md:px-8 md:pt-20">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">Order Online</p>
        <h1 className="mt-2 font-display text-4xl md:text-6xl">The full crackle menu.</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Add what you crave. We confirm pickup or delivery at checkout.
        </p>
      </header>

      <div className="mx-auto mt-10 grid max-w-7xl gap-10 px-4 md:grid-cols-[1fr_360px] md:px-8">
        {/* Items */}
        <div>
          <div className="sticky top-16 z-30 -mx-4 md:top-[72px] md:mx-0">
            <div
              aria-label="Filter menu by category"
              className="flex gap-2 overflow-x-auto border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:rounded-full md:border md:border-border md:bg-card md:px-2 md:py-2"
            >
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-pressed={cat === c}
                  onClick={() => setCat(c)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                    cat === c
                      ? "bg-brand-terracotta text-brand-cream"
                      : "text-foreground/70 hover:bg-muted",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background to-transparent md:hidden"
            />
          </div>

          <div className="mt-8 space-y-14">
            {sections.map(({ category, groups }) => (
              <section key={category} aria-labelledby={`sec-${category}`}>
                {/* Editorial section header */}
                <div className="reveal flex items-end justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-primary">
                      <ChiliMark className="h-5 w-auto" />
                      <span className="font-display text-xs uppercase tracking-[0.3em]">
                        {groups.length} {groups.length === 1 ? "selection" : "selections"}
                      </span>
                    </div>
                    <h2
                      id={`sec-${category}`}
                      className="mt-1.5 font-display text-2xl md:text-3xl"
                    >
                      {category}
                    </h2>
                  </div>
                  <p className="hidden max-w-xs text-right text-sm text-muted-foreground sm:block">
                    {SECTION_BLURB[category]}
                  </p>
                </div>
                <div
                  aria-hidden="true"
                  className="reveal mt-4 h-px w-full bg-gradient-to-r from-[var(--brand-gold)]/50 via-[var(--brand-gold)]/20 to-transparent"
                />

                <ul className="mt-6 grid gap-5 sm:grid-cols-2">
                  {groups.map((group, i) => (
                    <MenuCard key={group.group} group={group} index={i} onAdd={cart.add} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        {/* Sidebar: cart */}
        <aside className="space-y-6 md:sticky md:top-24 md:self-start">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-ambient">
            <h2 className="font-display text-2xl">Your Order</h2>
            {cart.resolved.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Nothing in your cart yet. Tap an item to add it.
              </p>
            ) : (
              <>
                <ul className="mt-4 divide-y divide-border">
                  {cart.resolved.map((l) => (
                    <li key={l.id} className="flex items-center gap-3 py-3">
                      <Photo
                        src={l.item.image}
                        alt={l.item.name}
                        aspect="1/1"
                        rounded="rounded-md"
                        className="h-14 w-14 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-semibold">{l.item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(l.item.price ?? 0)} · {formatPrice(l.lineTotal)}
                        </p>
                        <div className="mt-1 inline-flex items-center rounded-full border border-border">
                          <button
                            aria-label="Decrease quantity"
                            onClick={() => cart.setQty(l.id, l.qty - 1)}
                            className="flex h-10 w-10 items-center justify-center hover:text-primary"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="min-w-6 text-center text-sm font-semibold">{l.qty}</span>
                          <button
                            aria-label="Increase quantity"
                            onClick={() => cart.setQty(l.id, l.qty + 1)}
                            className="flex h-10 w-10 items-center justify-center hover:text-primary"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <button
                        aria-label={`Remove ${l.item.name}`}
                        onClick={() => cart.remove(l.id)}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <dl className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt>Subtotal</dt>
                    <dd className="tabular-nums">{formatPrice(cart.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Tax (7.75%)</dt>
                    <dd className="tabular-nums">{formatPrice(cart.tax)}</dd>
                  </div>
                  <div className="flex justify-between font-display text-lg font-semibold">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{formatPrice(cart.total(0))}</dd>
                  </div>
                </dl>
                <Link
                  to="/checkout"
                  className="btn-sheen mt-4 inline-flex w-full items-center justify-center rounded-lg bg-primary px-5 py-3 font-semibold text-primary-foreground"
                >
                  Proceed to Checkout
                </Link>
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

/** One premium card per product. Size variants select the underlying orderable
 *  unit; price + serves update with the selection. */
function MenuCard({
  group,
  index,
  onAdd,
}: {
  group: MenuGroup;
  index: number;
  onAdd: (id: string, qty?: number) => void;
}) {
  const [sel, setSel] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const v = group.variants[sel];
  const multi = group.variants.length > 1;
  const priceText = v.price == null ? (v.priceLabel ?? "Market Price") : formatPrice(v.price);

  const handleAdd = () => {
    onAdd(v.id);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <li
      className="reveal group/card flex flex-col overflow-hidden rounded-2xl border border-[var(--brand-gold)]/20 bg-card shadow-ambient transition-all duration-300 hover:-translate-y-1.5 hover:border-[var(--brand-gold)]/45 hover:shadow-warm"
      style={{ transitionDelay: `${index * 70}ms` }}
    >
      <div className="relative">
        <Photo
          src={v.image}
          alt={group.groupName}
          aspect="4/3"
          rounded={
            index % 2 === 0
              ? "rounded-none rounded-tl-[2rem] rounded-br-[2rem]"
              : "rounded-none rounded-tr-[2rem] rounded-bl-[2rem]"
          }
        />
        {group.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground shadow-sm">
            {group.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <h3 className="font-display text-xl leading-tight">
          <span className="relative inline-block">
            {group.groupName}
            <span
              aria-hidden="true"
              className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[var(--brand-gold)] transition-transform duration-300 group-hover/card:scale-x-100"
            />
          </span>
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{group.description}</p>

        {multi && (
          <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Choose a size">
            {group.variants.map((vr, i) => (
              <button
                key={vr.id}
                type="button"
                aria-pressed={i === sel}
                onClick={() => setSel(i)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200",
                  i === sel
                    ? "border-transparent bg-[var(--brand-terracotta)] text-brand-cream"
                    : "border-[var(--brand-gold)]/30 text-foreground/70 hover:border-[var(--brand-gold)]/60 hover:text-foreground",
                )}
              >
                {vr.size}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-[var(--brand-gold)]/15 pt-5">
          <div>
            <span className="font-display text-2xl font-semibold tabular-nums text-primary">
              {priceText}
            </span>
            {v.serves && (
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{v.serves}</p>
            )}
          </div>
          {group.requestQuote ? (
            <Link
              to="/catering"
              className="rounded-full border-2 border-foreground px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-200 hover:bg-foreground hover:text-background"
            >
              Request Quote
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className={cn(
                "btn-sheen inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground transition-colors duration-200",
                justAdded ? "bg-brand-green" : "bg-primary",
              )}
            >
              {justAdded ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Added
                </>
              ) : (
                "Add to cart"
              )}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
