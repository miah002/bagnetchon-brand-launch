import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Photo } from "@/components/Photo";
import { DeliveryWidget } from "@/components/DeliveryWidget";
import { BaybayinWatermark } from "@/components/BaybayinWatermark";
import { MENU, CATEGORIES, type MenuCategory } from "@/data/menu";
import { useCart, formatPrice } from "@/context/CartContext";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/menu")({
  head: () =>
    pageMeta({
      title: "Menu",
      description:
        "Order Bagnetchon online — Original Bagnet, Lechon Belly, Sisig Bagnet, Kare-Kare, Fiesta Platters and more. Delivery across South Florida.",
      path: "/menu",
    }),
  component: MenuPage,
});

function MenuPage() {
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const cart = useCart();

  const items = useMemo(
    () =>
      cat === "All"
        ? MENU
        : MENU.filter((m) => m.category === (cat as MenuCategory)),
    [cat],
  );

  return (
    <div className="relative">
      <BaybayinWatermark
        glyph="ᜎ"
        className="-right-10 top-20 text-foreground"
        size="text-[22rem]"
      />
      <header className="mx-auto max-w-7xl px-4 pt-12 md:px-8 md:pt-20">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">
          Order Online
        </p>
        <h1 className="mt-2 font-display text-4xl md:text-6xl">
          The full crackle menu.
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Add what you crave. We confirm pickup or delivery at checkout.
        </p>
      </header>

      <div className="mx-auto mt-10 grid max-w-7xl gap-10 px-4 md:grid-cols-[1fr_360px] md:px-8">
        {/* Items */}
        <div>
          <div
            role="tablist"
            aria-label="Menu categories"
            className="sticky top-[68px] z-30 -mx-4 flex gap-2 overflow-x-auto border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:mx-0 md:rounded-full md:border md:border-border md:bg-card md:px-2 md:py-2"
          >
            {CATEGORIES.map((c) => (
              <button
                key={c}
                role="tab"
                aria-selected={cat === c}
                onClick={() => setCat(c)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  cat === c
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:bg-muted"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <ul className="mt-6 grid gap-5 sm:grid-cols-2">
            {items.map((item, i) => (
              <li
                key={item.id}
                className="flex flex-col overflow-hidden rounded-2xl bg-card shadow-ambient"
              >
                <div className="relative">
                  <Photo
                    src={item.image}
                    alt={item.name}
                    aspect="4/3"
                    rounded={
                      i % 2 === 0
                        ? "rounded-none rounded-tl-[2rem] rounded-br-[2rem]"
                        : "rounded-none rounded-tr-[2rem] rounded-bl-[2rem]"
                    }
                  />
                  {item.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-xl">{item.name}</h2>
                    <span className="shrink-0 font-display text-lg font-semibold text-primary">
                      {item.price == null
                        ? item.priceLabel ?? "Market Price"
                        : formatPrice(item.price)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      {item.category}
                    </span>
                    {item.requestQuote ? (
                      <Link
                        to="/catering"
                        className="rounded-full border-2 border-foreground px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-foreground hover:text-background"
                      >
                        Request Quote
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => cart.add(item.id)}
                        className="btn-sheen rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground"
                      >
                        Add to cart
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Sidebar: cart + widget */}
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
                        <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-border">
                          <button
                            aria-label="Decrease"
                            onClick={() => cart.setQty(l.id, l.qty - 1)}
                            className="p-1.5 hover:text-primary"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="min-w-4 text-center text-sm font-semibold">
                            {l.qty}
                          </span>
                          <button
                            aria-label="Increase"
                            onClick={() => cart.setQty(l.id, l.qty + 1)}
                            className="p-1.5 hover:text-primary"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                      <button
                        aria-label={`Remove ${l.item.name}`}
                        onClick={() => cart.remove(l.id)}
                        className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
                <dl className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between">
                    <dt>Subtotal</dt>
                    <dd>{formatPrice(cart.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Tax (7%)</dt>
                    <dd>{formatPrice(cart.tax)}</dd>
                  </div>
                  <div className="flex justify-between font-display text-lg font-semibold">
                    <dt>Total</dt>
                    <dd>{formatPrice(cart.total(0))}</dd>
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
          <DeliveryWidget />
        </aside>
      </div>
    </div>
  );
}
