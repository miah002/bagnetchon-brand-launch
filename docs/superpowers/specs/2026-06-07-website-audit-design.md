# Website Audit — Design Spec

**Date:** 2026-06-07
**Scope:** Premium feel + animations, button functionality, missing features

---

## 1. What We're Fixing

### Tier 1 — Animations & Visual Polish

**1.1 Card hover lift**
All cards (bestseller, menu item, catering package, contact cards) get a subtle hover transform:
`group-hover:-translate-y-1 group-hover:shadow-warm transition-all duration-300`
The parent article/div needs `group` class.

**1.2 Photo hover zoom**
The `Photo` component's `<img>` gets `transition-transform duration-500 group-hover:scale-105`.
The wrapper div gets `group overflow-hidden` (overflow already set, just add group).

**1.3 useScrollReveal on all pages**
Currently only `src/routes/index.tsx` uses the hook. Add it to:
- `src/routes/catering.tsx` — sections marked with `.reveal`
- `src/routes/our-story.tsx` — text blocks + photo
- `src/routes/contact.tsx` — info cards
- `src/routes/menu.tsx` — header + card list

**1.4 Card grid stagger**
Reveal cards in sequence rather than all at once. Use inline style `transition-delay` on each card:
`style={{ transitionDelay: \`\${i * 80}ms\` }}`
Applied to: bestseller grid (homepage), menu item grid, catering package grid.

**1.5 Mobile nav drawer slide animation**
Replace instant conditional render with a CSS slide-in:
```css
.mobile-nav-drawer {
  transform: translateX(100%);
  transition: transform 0.25s ease;
}
.mobile-nav-drawer.open {
  transform: translateX(0);
}
```
Or use `tw-animate-css` `animate-in slide-in-from-right-full duration-200`.

**1.6 Carousel dot indicators**
Add a row of dot buttons below the `SignatureCarousel` scroll list.
Active dot = filled circle, inactive = ring. Clicking dot scrolls to card.
Dots replace keyboard-only affordance for mobile.

**1.7 CSS cleanup — remove dead @utility block**
Lines 127–131 in `styles.css` declare `@utility btn-sheen` and `@utility btn-sheen-after` — these are not standard Tailwind v4 utilities and do nothing. Remove them. The plain `.btn-sheen` class at line 147+ is what actually works.

---

### Tier 2 — Button & UX Fixes

**2.1 Nav cart button → /checkout**
`src/components/Nav.tsx` line 94: change `to="/menu"` to `to="/checkout"`.
Cart badge is shown — clicking it should go to checkout, not back to the menu.

**2.2 Missing btn-sheen on secondary CTAs**
- Checkout success "Order more" button → add `btn-sheen`
- Empty cart "Browse the menu" button → add `btn-sheen`

**2.3 Add "Back to menu" link in checkout**
Above the `<form>` in `checkout.tsx`, add a small `← Back to menu` link.
Prevents user being stranded if they want to add more items.

**2.4 Pickup / Delivery toggle on checkout**
Add a radio group above the delivery address section:
- "Delivery" (default): show address + delivery fee calculation
- "Pickup": hide address, hide delivery fee, show "We'll confirm pickup time"
This is the most-requested feature for food ordering sites.

**2.5 Contact page — simple inquiry form**
The contact page has no form. Add a basic form:
- Name, Email, Message (textarea), Submit
- On submit: calls `submitInquiry({ type: "general", ... })` — already supported by `src/lib/inquiries.ts`
- Shows success state matching catering form

---

### Tier 3 — Missing Features (flagged, some executable now)

**3.1 Order email notification**
Create `supabase/functions/notify-order/index.ts` — mirrors `notify-inquiry/index.ts`.
Sends email to owner when a new order is placed.
Wire it in `src/lib/orders.ts` after successful Supabase insert.

**3.2 Supabase project mismatch**
`.env` has stale project ID `gknfcyjgwpzwkzbjwopj`.
Correct project: `lgufkpcunwnfyozmswdm` (user's dashboard).
Requires new anon key from user — documented but not executable without credentials.

**3.3 "We'll text you" copy fix**
No SMS exists. Change checkout success message to:
"Your order is in. We'll be in touch at the contact info provided."
Honest, doesn't promise SMS.

---

## 2. Files Touched

| File | What Changes |
|------|-------------|
| `src/styles.css` | Remove dead @utility block |
| `src/components/Photo.tsx` | Add `group` + image hover zoom |
| `src/components/Nav.tsx` | Cart → /checkout |
| `src/components/SignatureCarousel.tsx` | Add dot indicators |
| `src/routes/index.tsx` | Card stagger delays on bestseller grid |
| `src/routes/menu.tsx` | useScrollReveal + card hover + stagger |
| `src/routes/catering.tsx` | useScrollReveal + card hover + stagger |
| `src/routes/our-story.tsx` | useScrollReveal + .reveal classes |
| `src/routes/contact.tsx` | useScrollReveal + inquiry form |
| `src/routes/checkout.tsx` | Pickup/delivery toggle, missing btn-sheen, back link, copy fix |
| `supabase/functions/notify-order/index.ts` | New edge function (Tier 3) |

---

## 3. Out of Scope

- Stripe payment integration (major — own initiative)
- SMS notifications (requires third-party)
- Product detail pages
- Allergen filters
- Order tracking
- Dark mode toggle
- Loyalty program

---

## 4. Success Criteria

- All 6 pages feel like a premium brand site with motion
- Card hover lift + image zoom on all cards
- Scroll reveal triggers on all pages
- Mobile nav drawer slides in smoothly
- Carousel is self-explanatory on mobile
- Nav cart goes to checkout
- Checkout offers pickup or delivery
- Contact page has a working form
- Owner gets email when an order is placed
- Checkout success message doesn't lie about SMS
