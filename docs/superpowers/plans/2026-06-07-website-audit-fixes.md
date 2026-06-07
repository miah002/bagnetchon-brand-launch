# Website Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the Bagnetchon website from functional to premium — animations on all pages, card hover effects, image zoom, mobile nav slide, carousel dots, cart UX fix, pickup option, contact form, and order email notification.

**Architecture:** All animation changes are pure CSS/Tailwind class additions with no new dependencies. Behavioral changes (pickup toggle, contact form) extend existing patterns. The order notification mirrors the existing `notify-inquiry` edge function.

**Tech Stack:** React, TanStack Router, Tailwind CSS v4, `tw-animate-css`, Supabase JS, Supabase Edge Functions (Deno)

---

## File Map

| File | What Changes |
|------|-------------|
| `src/styles.css` | Remove dead `@utility` block |
| `src/components/Photo.tsx` | Add `group` class + image hover zoom |
| `src/components/Nav.tsx` | Cart link → `/checkout`; drawer slide animation |
| `src/components/SignatureCarousel.tsx` | Add dot indicators |
| `src/routes/index.tsx` | Stagger delays on bestseller grid cards |
| `src/routes/menu.tsx` | `useScrollReveal` + card hover + stagger |
| `src/routes/catering.tsx` | `useScrollReveal` + card hover + stagger |
| `src/routes/our-story.tsx` | `useScrollReveal` + `.reveal` on text blocks |
| `src/routes/contact.tsx` | `useScrollReveal` + inquiry form |
| `src/routes/checkout.tsx` | Pickup/delivery toggle, back link, `btn-sheen`, copy fix |
| `src/lib/orders.ts` | Add `fulfillment` field; fire `notify-order` after insert |
| `supabase/functions/notify-order/index.ts` | New: email owner on new order |

---

### Task 1: CSS Cleanup + Photo Hover Zoom

**Files:**
- Modify: `src/styles.css:127-131`
- Modify: `src/components/Photo.tsx`

- [ ] **Step 1: Remove dead @utility block from styles.css**

In `src/styles.css`, delete lines 127–131 (the `@utility btn-sheen` and `@utility btn-sheen-after` blocks). These are not valid Tailwind v4 utilities and do nothing. The real `.btn-sheen` class starting at line 147 is what works.

The file currently reads (lines 126–146):
```css
/* Gold sheen sweep on primary buttons */
@utility btn-sheen {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}
@utility btn-sheen-after {
  content: "";
  ...
}

.btn-sheen::after {
```

After deletion, it should read:
```css
/* Gold sheen sweep on primary buttons */
.btn-sheen::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(232, 163, 61, 0.55) 50%,
    transparent 70%
  );
  transform: translateX(-120%);
  transition: transform 0.9s ease;
  pointer-events: none;
}
.btn-sheen:hover::after {
  transform: translateX(120%);
}
```

Also add `.btn-sheen` base styles (position/overflow/isolation) as part of the same rule block:
```css
/* Gold sheen sweep on primary buttons */
.btn-sheen {
  position: relative;
  overflow: hidden;
  isolation: isolate;
}
.btn-sheen::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(232, 163, 61, 0.55) 50%,
    transparent 70%
  );
  transform: translateX(-120%);
  transition: transform 0.9s ease;
  pointer-events: none;
}
.btn-sheen:hover::after {
  transform: translateX(120%);
}
```

- [ ] **Step 2: Add hover zoom to Photo component**

Replace the contents of `src/components/Photo.tsx` with:

```tsx
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PhotoProps {
  src: string;
  alt: string;
  className?: string;
  aspect?: string;
  label?: string;
  rounded?: string;
  eager?: boolean;
}

export function Photo({
  src,
  alt,
  className,
  aspect = "4/3",
  label,
  rounded = "rounded-2xl",
  eager = false,
}: PhotoProps) {
  const [errored, setErrored] = useState(false);

  return (
    <div
      className={cn(
        "group relative overflow-hidden bg-muted",
        rounded,
        className,
      )}
      style={{ aspectRatio: aspect }}
    >
      {!errored ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setErrored(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="photo-fallback absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <span
            className="baybayin-watermark text-[8rem]"
            aria-hidden="true"
            style={{ opacity: 0.12 }}
          >
            ᜊ
          </span>
          <span className="absolute bottom-3 left-0 right-0 font-display text-xs uppercase tracking-[0.2em] text-brand-charcoal/60">
            {label ?? alt}
          </span>
        </div>
      )}
    </div>
  );
}
```

Key change: added `group` to wrapper div; added `transition-transform duration-500 group-hover:scale-105` to the `<img>`.

- [ ] **Step 3: Verify in browser**

Run `npm run dev`. Navigate to `/menu`. Hover over any menu item image — it should zoom in smoothly. Hover over homepage hero image — same zoom.

- [ ] **Step 4: Commit**

```bash
git add src/styles.css src/components/Photo.tsx
git commit -m "style: card image hover zoom + clean up dead btn-sheen @utility block"
```

---

### Task 2: Card Hover Lift + Stagger on Homepage Bestsellers

**Files:**
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Add hover lift + stagger to bestseller grid cards**

In `src/routes/index.tsx`, find the `{bestsellers.map((item, i) => (` block (around line 183). Replace the `<article>` element's className and add a stagger style:

Before:
```tsx
<article
  key={item.id}
  className="reveal group flex flex-col overflow-hidden rounded-2xl bg-card shadow-ambient"
>
```

After:
```tsx
<article
  key={item.id}
  className="reveal group flex flex-col overflow-hidden rounded-2xl bg-card shadow-ambient transition-all duration-300 hover:-translate-y-1 hover:shadow-warm"
  style={{ transitionDelay: `${i * 60}ms` }}
>
```

- [ ] **Step 2: Verify in browser**

Navigate to homepage. Scroll down to "Weekend Bestsellers" section. Hover over each card — it should lift slightly. On page load, cards should reveal in a staggered sequence (each 60ms after the previous).

- [ ] **Step 3: Commit**

```bash
git add src/routes/index.tsx
git commit -m "style: homepage bestseller cards get hover lift + stagger reveal"
```

---

### Task 3: Scroll Reveal + Hover on Menu Page

**Files:**
- Modify: `src/routes/menu.tsx`

- [ ] **Step 1: Add useScrollReveal + reveal class + card hover lift**

In `src/routes/menu.tsx`, make these changes:

1. Add import at the top:
```tsx
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
```

2. In the `MenuPage` function, add the hook call:
```tsx
function MenuPage() {
  const ref = useScrollReveal();
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("All");
  const cart = useCart();
  // ...
```

3. Wrap the returned `<div>` with the ref:
```tsx
return (
  <div className="relative" ref={ref as React.RefObject<HTMLDivElement>}>
```

4. Add `reveal` to the `<header>` element:
```tsx
<header className="reveal mx-auto max-w-7xl px-4 pt-12 md:px-8 md:pt-20">
```

5. Add `reveal` to the category tab bar div, and `reveal` + hover to each `<li>` card. Find the `{items.map((item, i) => (` block and update:
```tsx
{items.map((item, i) => (
  <li
    key={item.id}
    className="reveal flex flex-col overflow-hidden rounded-2xl bg-card shadow-ambient transition-all duration-300 hover:-translate-y-1 hover:shadow-warm"
    style={{ transitionDelay: `${i * 50}ms` }}
  >
```

- [ ] **Step 2: Verify in browser**

Navigate to `/menu`. Scroll down — menu items should fade in from below in a staggered sequence. Hover over a card — it should lift.

- [ ] **Step 3: Commit**

```bash
git add src/routes/menu.tsx
git commit -m "style: menu page scroll reveal + card hover lift with stagger"
```

---

### Task 4: Scroll Reveal on Catering, Our Story, Contact Pages

**Files:**
- Modify: `src/routes/catering.tsx`
- Modify: `src/routes/our-story.tsx`
- Modify: `src/routes/contact.tsx`

- [ ] **Step 1: Add useScrollReveal to catering.tsx**

Add import + hook in `CateringPage`:
```tsx
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

function CateringPage() {
  const ref = useScrollReveal();
  // ...existing state...
  return (
    <div className="relative" ref={ref as React.RefObject<HTMLDivElement>}>
```

Add `reveal` + stagger + hover to the packages grid cards. Find `{PACKAGES.map((p) => (` block:
```tsx
{PACKAGES.map((p, i) => (
  <article
    key={p.name}
    className="reveal relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-ambient transition-all duration-300 hover:-translate-y-1 hover:shadow-warm"
    style={{ transitionDelay: `${i * 60}ms` }}
  >
```

Add `reveal` to the catering hero copy div (the `<div>` containing `<h1>Feed Your Fiesta</h1>`):
```tsx
<div className="reveal">
  <p className="font-display text-sm uppercase ...">Catering</p>
  <h1 ...>Feed Your Fiesta.</h1>
  ...
</div>
```

Add `reveal` to the photo in the hero:
```tsx
<div className="reveal">
  <Photo src={IMAGES.fiestaSpread} ... />
</div>
```

Add `reveal` to the inquiry form section heading:
```tsx
<h2 id="inquiry-heading" className="reveal font-display text-3xl md:text-5xl">
```

- [ ] **Step 2: Add useScrollReveal to our-story.tsx**

```tsx
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

function Story() {
  const ref = useScrollReveal();
  return (
    <div className="relative" ref={ref as React.RefObject<HTMLDivElement>}>
```

Add `reveal` class to:
- The `<section>` heading div (wrap the `<p>` + `<h1>` in a `<div className="reveal">`)
- The `<Photo>` element — wrap with `<div className="reveal">`
- The prose text div: `<div className="reveal prose-bagnet mt-10 space-y-6 ...">`
- The CTA buttons div: `<div className="reveal mt-10 flex flex-wrap gap-3">`

- [ ] **Step 3: Add useScrollReveal to contact.tsx**

```tsx
import { useScrollReveal } from "@/hooks/use-scroll-reveal";

function Contact() {
  const ref = useScrollReveal();
  return (
    <div className="relative" ref={ref as React.RefObject<HTMLDivElement>}>
```

Add `reveal` + stagger + hover to each card in the grid. The `Card` component renders `<a href={href}>` or just the `<div>`. Instead of modifying Card, pass className through and add it to the wrapping element. Wrap each `Card` call in a `<div className="reveal" style={...}>`:

Find the `<section className="mx-auto mt-12 grid ...">` block and wrap each Card call:
```tsx
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
```

Also update the `Card` component's inner div to have hover effect:
```tsx
<div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 shadow-ambient transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-warm">
```

- [ ] **Step 4: Verify in browser**

Navigate to `/catering`, `/our-story`, `/contact`. Elements should fade in from below as you scroll. On `/contact`, hover cards lift.

- [ ] **Step 5: Commit**

```bash
git add src/routes/catering.tsx src/routes/our-story.tsx src/routes/contact.tsx
git commit -m "style: scroll reveal animations on catering, our-story, contact pages"
```

---

### Task 5: SignatureCarousel Dot Indicators

**Files:**
- Modify: `src/components/SignatureCarousel.tsx`

- [ ] **Step 1: Add dot state + dot navigation**

Replace the entire contents of `src/components/SignatureCarousel.tsx` with:

```tsx
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Photo } from "./Photo";
import { IMAGES } from "@/data/images";
import { cn } from "@/lib/utils";

const items = [
  { name: "Signature Bagnet", image: IMAGES.bagnetCloseup, tag: "Crisp · Cured · Twice-fried" },
  { name: "Lechon Belly", image: IMAGES.lechonDisplay, tag: "Glass-crackling skin" },
  { name: "Whole Lechon", image: IMAGES.hero, tag: "Fiesta centerpiece" },
  { name: "Crispy Sisig", image: IMAGES.sisigBagnet, tag: "Calamansi · Chili" },
];

export function SignatureCarousel() {
  const scroller = useRef<HTMLUListElement>(null);
  const [idx, setIdx] = useState(0);

  const scrollTo = (i: number) => {
    const next = Math.max(0, Math.min(items.length - 1, i));
    setIdx(next);
    const el = scroller.current;
    if (!el) return;
    const card = el.children[next] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <section aria-labelledby="roster-heading" className="relative">
      <div className="mx-auto flex max-w-7xl items-end justify-between gap-4 px-4 md:px-8">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">
            The Signature Roster
          </p>
          <h2 id="roster-heading" className="mt-2 font-display text-3xl md:text-5xl">
            Four cuts. One religion: crackle.
          </h2>
        </div>
        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollTo(idx - 1)}
            aria-label="Previous"
            disabled={idx === 0}
            className="rounded-full border border-border p-3 hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollTo(idx + 1)}
            aria-label="Next"
            disabled={idx === items.length - 1}
            className="rounded-full border border-border p-3 hover:bg-muted disabled:opacity-40"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <ul
        ref={scroller}
        className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it, i) => (
          <li
            key={it.name}
            className="snap-center shrink-0 basis-[82%] sm:basis-[55%] md:basis-[38%] lg:basis-[28%]"
          >
            <div className="overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] bg-card shadow-ambient transition-all duration-300 hover:-translate-y-1 hover:shadow-warm">
              <Photo
                src={it.image}
                alt={it.name}
                aspect="4/5"
                rounded="rounded-none"
                label={it.name}
                eager={i === 0}
              />
              <div className="p-5">
                <h3 className="font-display text-2xl">{it.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{it.tag}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Dot indicators */}
      <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Carousel position">
        {items.map((it, i) => (
          <button
            key={it.name}
            type="button"
            role="tab"
            aria-selected={idx === i}
            aria-label={`Go to ${it.name}`}
            onClick={() => scrollTo(i)}
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              idx === i
                ? "w-6 bg-primary"
                : "w-2 bg-border hover:bg-muted-foreground",
            )}
          />
        ))}
      </div>
    </section>
  );
}
```

Key additions: dot buttons below the scroll list, active dot stretches wide (pill shape), disabled state on prev/next arrows, hover lift on carousel cards.

- [ ] **Step 2: Verify in browser**

Navigate to homepage. Scroll to carousel section. On mobile, swipe — dots should reflect position. On desktop, click prev/next — dots update.

- [ ] **Step 3: Commit**

```bash
git add src/components/SignatureCarousel.tsx
git commit -m "feat: carousel dot indicators + disabled arrow state + card hover lift"
```

---

### Task 6: Mobile Nav Drawer Slide Animation

**Files:**
- Modify: `src/components/Nav.tsx`

- [ ] **Step 1: Add slide-in animation to mobile drawer**

The mobile drawer currently does a conditional render with no animation. Change it to always render (when `open` is true OR during the exit transition) using a CSS class approach.

In `src/components/Nav.tsx`, find the `{open && (` block starting around line 120. Replace it with an always-rendered drawer that uses CSS transforms:

Change:
```tsx
{open && (
  <div
    className="fixed inset-0 z-[60] md:hidden"
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
    <div className="absolute right-0 top-0 h-full w-80 max-w-[88%] bg-background p-6 shadow-2xl">
```

To (replace the full `{open && (...)}` block with):
```tsx
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
    <div className="absolute right-0 top-0 h-full w-80 max-w-[88%] animate-in slide-in-from-right duration-200 bg-background p-6 shadow-2xl">
```

The `animate-in`, `fade-in`, `slide-in-from-right` are classes from `tw-animate-css` which is already imported in `styles.css`.

- [ ] **Step 2: Verify in browser (mobile viewport)**

Open the browser at 375px width (DevTools mobile emulation). Click the hamburger menu — the overlay should fade in and the drawer should slide in from the right smoothly.

- [ ] **Step 3: Commit**

```bash
git add src/components/Nav.tsx
git commit -m "style: mobile nav drawer slide-in animation"
```

---

### Task 7: Nav Cart Fix + Missing btn-sheen on Checkout

**Files:**
- Modify: `src/components/Nav.tsx`
- Modify: `src/routes/checkout.tsx`

- [ ] **Step 1: Fix Nav cart link destination**

In `src/components/Nav.tsx`, find the cart Link around line 94:
```tsx
<Link
  to="/menu"
  className="relative inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-2 text-sm font-medium text-background hover:bg-primary"
  aria-label={`Cart with ${itemCount} items`}
>
```

Change `to="/menu"` to `to="/checkout"`:
```tsx
<Link
  to="/checkout"
  className="relative inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-2 text-sm font-medium text-background hover:bg-primary"
  aria-label={`Cart with ${itemCount} items`}
>
```

- [ ] **Step 2: Add btn-sheen to checkout buttons**

In `src/routes/checkout.tsx`, find the "Order more" Link in the success state (around line 139):
```tsx
<Link
  to="/menu"
  className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground"
>
  Order more
</Link>
```
Change to:
```tsx
<Link
  to="/menu"
  className="btn-sheen rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground"
>
  Order more
</Link>
```

Find the "Browse the menu" Link in the empty cart state (around line 154):
```tsx
<Link
  to="/menu"
  className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground"
>
  Browse the menu
</Link>
```
Change to:
```tsx
<Link
  to="/menu"
  className="btn-sheen mt-6 inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground"
>
  Browse the menu
</Link>
```

- [ ] **Step 3: Add "Back to menu" link at top of checkout**

In `src/routes/checkout.tsx`, find the return's outer div and the `<h1>Checkout</h1>`. Add a back link before the `<h1>`:

```tsx
<div className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-20">
  <Link
    to="/menu"
    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
  >
    ← Back to menu
  </Link>
  <h1 className="mt-4 font-display text-4xl md:text-5xl">Checkout</h1>
```

Make sure `Link` is already imported (it is, from `@tanstack/react-router`).

- [ ] **Step 4: Fix the "We'll text you" copy**

In `src/routes/checkout.tsx`, find in the success block:
```tsx
<p className="mt-3 text-muted-foreground">
  Your order is in. We'll text you at the number provided with pickup
  or delivery details.
</p>
```

Change to:
```tsx
<p className="mt-3 text-muted-foreground">
  Your order is in. We'll be in touch at the contact info you provided
  with pickup or delivery details.
</p>
```

- [ ] **Step 5: Verify in browser**

1. Click the cart icon in the Nav — should go to `/checkout` (not `/menu`)
2. Clear cart on checkout page — "Browse the menu" should have gold sheen on hover
3. Place a test order — success copy no longer mentions "text"
4. Click "← Back to menu" from checkout — returns to menu

- [ ] **Step 6: Commit**

```bash
git add src/components/Nav.tsx src/routes/checkout.tsx
git commit -m "fix: nav cart → checkout; btn-sheen on secondary CTAs; honest success copy; back-to-menu link"
```

---

### Task 8: Checkout Pickup / Delivery Toggle

**Files:**
- Modify: `src/routes/checkout.tsx`
- Modify: `src/lib/orders.ts`

- [ ] **Step 1: Add fulfillment field to Order interface in orders.ts**

In `src/lib/orders.ts`, update the `Order` interface:

```ts
export interface Order {
  ref: string;
  createdAt: string;
  fulfillment: "delivery" | "pickup";
  customer: {
    name: string;
    phone: string;
    email: string;
    street: string;
    city: string;
    zip: string;
  };
  lines: CartLine[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  deliveryMiles?: number | null;
  total: number;
  source: string;
}
```

Update `createOrder` parameter type and payload:
```ts
export async function createOrder(
  order: Omit<Order, "ref" | "createdAt">,
): Promise<Order> {
  const ref = genRef();
  const payload = {
    order_ref: ref,
    fulfillment: order.fulfillment,        // ← add this
    customer_name: order.customer.name,
    customer_email: order.customer.email,
    customer_phone: order.customer.phone,
    address_street: order.customer.street,
    address_city: order.customer.city,
    address_zip: order.customer.zip,
    source: order.source,
    items: JSON.parse(JSON.stringify(order.lines)),
    subtotal: order.subtotal,
    tax: order.tax,
    delivery_fee: order.deliveryFee,
    delivery_miles: order.deliveryMiles ?? null,
    total: order.total,
    status: "pending",
    payment_status: "unpaid",
  };
  // rest unchanged
```

- [ ] **Step 2: Add fulfillment state + UI to checkout.tsx**

In `src/routes/checkout.tsx`:

1. Add `fulfillment` to the `Fields` interface:
```tsx
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
```

2. Set default in state:
```tsx
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
```

3. Update `addrReady` to only require address when delivery:
```tsx
const addrReady =
  f.fulfillment === "delivery" &&
  f.street.length > 2 &&
  f.city.length > 1 &&
  /^\d{5}$/.test(f.zip);
```

4. Update `canSubmit` to skip address validation for pickup:
```tsx
const canSubmit =
  cart.itemCount > 0 &&
  f.name &&
  f.phone &&
  /\S+@\S+\.\S+/.test(f.email) &&
  (f.fulfillment === "pickup" || (f.street && f.city && /^\d{5}$/.test(f.zip))) &&
  !submitting;
```

5. Update `handleSubmit` to pass fulfillment + use pickup-safe address:
```tsx
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
```

6. Add the Fulfillment Section UI, BEFORE the "Your details" Section. Insert this block:
```tsx
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
```

7. Wrap the entire Delivery section (address fields + delivery fee display) in a conditional:
```tsx
{f.fulfillment === "delivery" && (
  <Section title="Delivery">
    {/* ...existing delivery fields... */}
  </Section>
)}
{f.fulfillment === "pickup" && (
  <Section title="Pickup">
    <p className="text-sm text-muted-foreground">
      We'll confirm your pickup time and location via the contact info provided. Lead time: 24 hours.
    </p>
  </Section>
)}
```

8. Update the Order summary `<Row>` for delivery fee:
```tsx
<Row
  label={f.fulfillment === "delivery" ? "Delivery" : "Pickup"}
  value={f.fulfillment === "pickup" ? "Free" : (estimate ? formatPrice(deliveryFee) : "—")}
  muted
/>
```

- [ ] **Step 3: Verify in browser**

1. Go to `/menu`, add an item, go to checkout
2. Toggle between Delivery and Pickup — address section should show/hide
3. With Pickup selected, the Place Order button should become active without address
4. Place a pickup order — verify it saves without requiring address

- [ ] **Step 4: Commit**

```bash
git add src/routes/checkout.tsx src/lib/orders.ts
git commit -m "feat: pickup/delivery toggle on checkout; fulfillment field on orders"
```

---

### Task 9: Contact Page Inquiry Form

**Files:**
- Modify: `src/routes/contact.tsx`

- [ ] **Step 1: Add inquiry form state + submit handler**

The `inquiries.ts` lib already supports `type: "contact"`. The `Contact` function needs a form state.

Replace the entire `src/routes/contact.tsx` with:

```tsx
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
        "Call (954) 625-9631, email hello@bagnetchon.com, or DM us anywhere. Serving Broward, Miami-Dade, and Palm Beach.",
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
```

- [ ] **Step 2: Verify in browser**

1. Navigate to `/contact`
2. Info cards should reveal with stagger + lift on hover
3. Fill in the contact form with name, email, message — Submit button should activate
4. Submit — success state shows "Salamat!"
5. Open Supabase dashboard → inquiries table → new row with type="contact"

- [ ] **Step 3: Commit**

```bash
git add src/routes/contact.tsx
git commit -m "feat: contact page inquiry form + scroll reveal + card hover lift"
```

---

### Task 10: Order Email Notification Edge Function

**Files:**
- Create: `supabase/functions/notify-order/index.ts`
- Modify: `src/lib/orders.ts`

- [ ] **Step 1: Create notify-order edge function**

Create `supabase/functions/notify-order/index.ts`:

```ts
// Lovable Cloud edge function: notify-order
// Sends an email to the owner via Resend when a new order lands.
// SAFE-NO-OP if RESEND_API_KEY is not configured.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface OrderBody {
  order_ref?: string;
  fulfillment?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  address_street?: string;
  address_city?: string;
  address_zip?: string;
  items?: unknown[];
  subtotal?: number;
  tax?: number;
  delivery_fee?: number;
  total?: number;
  source?: string;
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmt(n?: number) {
  return n != null ? `$${n.toFixed(2)}` : "—";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let body: OrderBody = {};
  try {
    body = await req.json();
  } catch { /* ignore */ }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const TO = Deno.env.get("OWNER_NOTIFICATION_EMAIL") ?? "catering@bagnetchon.com";
  const FROM = Deno.env.get("RESEND_FROM") ?? "Bagnetchon <onboarding@resend.dev>";

  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ ok: true, skipped: true, reason: "no_resend_key" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const when = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const lines: string[] = [
    `<p><strong>Order Ref:</strong> ${esc(body.order_ref ?? "—")}</p>`,
    `<p><strong>When:</strong> ${esc(when)} (ET)</p>`,
    `<p><strong>Fulfillment:</strong> ${esc(body.fulfillment ?? "delivery")}</p>`,
    `<p><strong>Source:</strong> ${esc(body.source ?? "Website")}</p>`,
    `<p><strong>Customer:</strong> ${esc(body.customer_name ?? "")}</p>`,
    `<p><strong>Email:</strong> ${esc(body.customer_email ?? "")}</p>`,
    `<p><strong>Phone:</strong> ${esc(body.customer_phone ?? "")}</p>`,
  ];

  if (body.fulfillment !== "pickup") {
    lines.push(`<p><strong>Address:</strong> ${esc(body.address_street ?? "")} ${esc(body.address_city ?? "")} FL ${esc(body.address_zip ?? "")}</p>`);
  }

  lines.push(
    `<p><strong>Subtotal:</strong> ${fmt(body.subtotal)}</p>`,
    `<p><strong>Tax:</strong> ${fmt(body.tax)}</p>`,
    `<p><strong>Delivery Fee:</strong> ${fmt(body.delivery_fee)}</p>`,
    `<p><strong>Total:</strong> ${fmt(body.total)}</p>`,
    `<p><strong>Items:</strong> ${body.items ? body.items.length : 0} line(s)</p>`,
  );

  const subject = `New Order ${body.order_ref ?? ""} — ${body.customer_name ?? "Bagnetchon"}`;
  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h2 style="margin:0 0 12px;font-family:Georgia,serif;color:#D7141A">New Bagnetchon Order</h2>
      ${lines.join("\n")}
      <hr style="margin:16px 0;border:none;border-top:1px solid #eee"/>
      <p style="font-size:12px;color:#888">Check the admin panel at /admin for full order details.</p>
    </div>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to: [TO], subject, html }),
    });
    const ok = r.ok;
    const data = await r.json().catch(() => ({}));
    return new Response(JSON.stringify({ ok, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
```

- [ ] **Step 2: Wire notify-order in orders.ts**

In `src/lib/orders.ts`, after the `if (error || !row)` check, add the fire-and-forget notification (same pattern as `notify-inquiry` in `inquiries.ts`):

```ts
  if (error || !row) {
    throw new Error(error?.message ?? "Could not place order");
  }

  // Fire-and-forget owner notification — never blocks success.
  supabase.functions
    .invoke("notify-order", { body: { ...payload } })
    .catch(() => { /* swallow */ });

  return { ...order, ref, createdAt: row.created_at };
```

- [ ] **Step 3: Update the Playwright mock for orders**

In `tests/mocks/network.ts`, the `mockOrderInsert` already intercepts the Supabase insert. Add a mock for the notify-order function call:

```ts
export async function mockNotifyOrder(page: Page) {
  await page.route("**/functions/v1/notify-order*", async (route) => {
    if (route.request().method() !== "POST") return route.continue();
    await route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
}
```

- [ ] **Step 4: Use mockNotifyOrder in order-flow.spec.ts**

In `tests/order-flow.spec.ts`, in the happy path test and any test that places an order, add:
```ts
import { mockOrderInsert, mockNotifyOrder } from "./mocks/network";
// ...
await mockNotifyOrder(page);
```

- [ ] **Step 5: Run Playwright tests**

```bash
npx playwright test tests/order-flow.spec.ts
```

Expected: all tests pass (notify-order call is mocked).

- [ ] **Step 6: Commit**

```bash
git add supabase/functions/notify-order/index.ts src/lib/orders.ts tests/mocks/network.ts tests/order-flow.spec.ts
git commit -m "feat: notify-order edge function + wire in orders.ts; update Playwright mock"
```

---

## Self-Review

**Spec coverage check:**
- ✅ 1.1 Card hover lift — Tasks 2, 3, 4, 5
- ✅ 1.2 Photo hover zoom — Task 1
- ✅ 1.3 useScrollReveal on all pages — Tasks 3, 4
- ✅ 1.4 Card stagger — Tasks 2, 3, 4
- ✅ 1.5 Mobile nav drawer slide — Task 6
- ✅ 1.6 Carousel dot indicators — Task 5
- ✅ 1.7 CSS cleanup — Task 1
- ✅ 2.1 Nav cart → /checkout — Task 7
- ✅ 2.2 Missing btn-sheen — Task 7
- ✅ 2.3 Back to menu link — Task 7
- ✅ 2.4 Pickup/delivery toggle — Task 8
- ✅ 2.5 Contact form — Task 9
- ✅ 3.1 Order email notification — Task 10
- ✅ 3.3 "We'll text you" copy fix — Task 7

**Placeholder scan:** None found. All tasks contain exact code.

**Type consistency:**
- `Order.fulfillment` added in Task 8 Step 1, used in Task 8 Step 2 ✅
- `mockNotifyOrder` defined in Task 10 Step 3, imported in Task 10 Step 4 ✅
- `useScrollReveal` used identically across Tasks 3, 4, 9 ✅
