import { IMAGES } from "./images";

export type MenuCategory = "Trays & Packs" | "Whole Roasts";

export interface MenuItem {
  id: string;
  name: string;
  price: number | null; // null = market/quote price
  priceLabel?: string;
  category: MenuCategory;
  image: string;
  description: string;
  badge?: string;
  requestQuote?: boolean;
  // Grouping — variants of the same product share a `group`. `size` is the
  // per-variant label shown as a pill; `serves` is an optional guest guide.
  group: string;
  groupName: string;
  size: string;
  serves?: string;
}

// Real Bagnetchon lineup. Priced trays are orderable; weight-based roasts
// show a price range and route to a catering quote. Each entry stays a flat
// orderable unit (the cart resolves line ids against this list); the UI groups
// them by `group` into one card per product with size pills.
export const MENU: MenuItem[] = [
  // ---- Roasted Lechon — Classic (free Chef's sarsa) ----
  {
    id: "lechon-classic-pack",
    group: "lechon-classic",
    groupName: "Roasted Lechon — Classic",
    size: "Pack",
    name: "Roasted Lechon (Classic) — Pack",
    price: 25,
    category: "Trays & Packs",
    image: IMAGES.menuLechonClassic,
    badge: "Bestseller",
    description:
      "Slow-roasted Ilocano-style lechon, shatter-crisp skin. Free Chef's bagnet sarsa.",
  },
  {
    id: "lechon-classic-half",
    group: "lechon-classic",
    groupName: "Roasted Lechon — Classic",
    size: "Half Tray",
    serves: "Serves ~12",
    name: "Roasted Lechon (Classic) — Half Tray",
    price: 200,
    category: "Trays & Packs",
    image: IMAGES.menuLechonClassic,
    description: "Half tray, serves ~12. Free 8 oz Chef's bagnet sarsa.",
  },
  {
    id: "lechon-classic-full",
    group: "lechon-classic",
    groupName: "Roasted Lechon — Classic",
    size: "Full Tray",
    serves: "Serves ~25",
    name: "Roasted Lechon (Classic) — Full Tray",
    price: 400,
    category: "Trays & Packs",
    image: IMAGES.menuLechonClassic,
    description: "Full tray, serves ~25. Free 16 oz Chef's bagnet sarsa.",
  },
  // ---- Roasted Lechon — Spicy ----
  {
    id: "lechon-spicy-pack",
    group: "lechon-spicy",
    groupName: "Roasted Lechon — Spicy",
    size: "Pack",
    name: "Roasted Lechon (Spicy) — Pack",
    price: 25,
    category: "Trays & Packs",
    image: IMAGES.menuLechonSpicy,
    badge: "Spicy",
    description: "Our slow-roasted lechon with house spicy sarsa. Free sarsa.",
  },
  {
    id: "lechon-spicy-half",
    group: "lechon-spicy",
    groupName: "Roasted Lechon — Spicy",
    size: "Half Tray",
    serves: "Serves ~12",
    name: "Roasted Lechon (Spicy) — Half Tray",
    price: 200,
    category: "Trays & Packs",
    image: IMAGES.menuLechonSpicy,
    badge: "Spicy",
    description: "Half tray, serves ~12. Free 8 oz house spicy sarsa.",
  },
  {
    id: "lechon-spicy-full",
    group: "lechon-spicy",
    groupName: "Roasted Lechon — Spicy",
    size: "Full Tray",
    serves: "Serves ~25",
    name: "Roasted Lechon (Spicy) — Full Tray",
    price: 400,
    category: "Trays & Packs",
    image: IMAGES.menuLechonSpicy,
    badge: "Spicy",
    description: "Full tray, serves ~25. Free 16 oz house spicy sarsa.",
  },
  // ---- Sisig Maharlika ----
  {
    id: "sisig-pack",
    group: "sisig",
    groupName: "Sisig Maharlika",
    size: "Pack",
    name: "Sisig Maharlika — Pack",
    price: 25,
    category: "Trays & Packs",
    image: IMAGES.menuSisig,
    badge: "Spicy",
    description: "Sizzling chopped bagnet sisig, calamansi and chili.",
  },
  {
    id: "sisig-half",
    group: "sisig",
    groupName: "Sisig Maharlika",
    size: "Half Tray",
    serves: "Serves ~12",
    name: "Sisig Maharlika — Half Tray",
    price: 150,
    category: "Trays & Packs",
    image: IMAGES.menuSisig,
    badge: "Spicy",
    description: "Half tray, serves ~12. Sizzling bagnet sisig with chili.",
  },
  {
    id: "sisig-full",
    group: "sisig",
    groupName: "Sisig Maharlika",
    size: "Full Tray",
    serves: "Serves ~25",
    name: "Sisig Maharlika — Full Tray",
    price: 300,
    category: "Trays & Packs",
    image: IMAGES.menuSisig,
    badge: "Spicy",
    description: "Full tray, serves ~25. Sizzling bagnet sisig with chili.",
  },
  // ---- Dinakdakan (market price) ----
  {
    id: "dinakdakan-de-manila",
    group: "dinakdakan",
    groupName: "Dinakdakan De Manila",
    size: "Market Price",
    name: "Dinakdakan De Manila",
    price: null,
    priceLabel: "Market Price",
    category: "Trays & Packs",
    image: IMAGES.menuDinakdakan,
    requestQuote: true,
    description:
      "Grilled pork belly & mask, creamy-tangy with red onion and chili. Pack · Half · Full tray.",
  },
  // ---- Roasted Lechon Belly (by raw weight — price range, quote) ----
  {
    id: "belly-half",
    group: "lechon-belly",
    groupName: "Roasted Lechon Belly",
    size: "Half",
    serves: "8–12 lbs",
    name: "Roasted Lechon Belly — Half",
    price: null,
    priceLabel: "$120–170",
    category: "Whole Roasts",
    image: IMAGES.menuBellyHalf,
    badge: "Bestseller",
    requestQuote: true,
    description:
      "Slow-roasted Ilocano-style belly roll, glass-crackling skin. Free Chef's bagnet sarsa. Priced by raw weight.",
  },
  {
    id: "belly-full",
    group: "lechon-belly",
    groupName: "Roasted Lechon Belly",
    size: "Full",
    serves: "13–22 lbs",
    name: "Roasted Lechon Belly — Full",
    price: null,
    priceLabel: "$190–320",
    category: "Whole Roasts",
    image: IMAGES.menuBelly,
    requestQuote: true,
    description:
      "Slow-roasted Ilocano-style belly roll, glass-crackling skin. Free Chef's bagnet sarsa. Priced by raw weight.",
  },
  {
    id: "belly-half-truffle",
    group: "lechon-belly",
    groupName: "Roasted Lechon Belly",
    size: "Half + Truffles",
    serves: "8–12 lbs",
    name: "Lechon Belly Truffles — Half",
    price: null,
    priceLabel: "$160–220",
    category: "Whole Roasts",
    image: IMAGES.menuBellyHalf,
    badge: "Truffle",
    requestQuote: true,
    description:
      "Half belly finished with black truffle — an earthy, luxe upgrade on the classic. Priced by raw weight.",
  },
  {
    id: "belly-full-truffle",
    group: "lechon-belly",
    groupName: "Roasted Lechon Belly",
    size: "Full + Truffles",
    serves: "13–22 lbs",
    name: "Lechon Belly Truffles — Full",
    price: null,
    priceLabel: "$260–440",
    category: "Whole Roasts",
    image: IMAGES.menuBelly,
    badge: "Truffle",
    requestQuote: true,
    description:
      "Full belly finished with black truffle — the centerpiece for a premium feast. Priced by raw weight.",
  },
  // ---- Roasted Whole Lechon (by size — price range, guest count, quote) ----
  {
    id: "cochinillo",
    group: "cochinillo",
    groupName: "Roasted Cochinillo",
    size: "15–21 lbs",
    serves: "Serves 10–15",
    name: "Roasted Cochinillo",
    price: null,
    priceLabel: "$450",
    category: "Whole Roasts",
    image: IMAGES.menuCochinillo,
    requestQuote: true,
    description:
      "Spanish-style suckling cochinillo, paper-crisp skin. A delicate, elegant centerpiece.",
  },
  {
    id: "lechon-de-leche",
    group: "lechon-de-leche",
    groupName: "Lechon De Leche",
    size: "30–40 lbs",
    serves: "Serves 20–25",
    name: "Lechon De Leche",
    price: null,
    priceLabel: "$450–480",
    category: "Whole Roasts",
    image: IMAGES.menuDeLeche,
    requestQuote: true,
    description:
      "Milky-young suckling lechon, tender and rich. The traditional fiesta showpiece.",
  },
  {
    id: "whole-lechon-medium",
    group: "whole-lechon",
    groupName: "Whole Roasted Lechon",
    size: "Medium",
    serves: "50–60 guests",
    name: "Whole Lechon — Medium",
    price: null,
    priceLabel: "$500–550",
    category: "Whole Roasts",
    image: IMAGES.menuWholePig,
    badge: "Centerpiece",
    requestQuote: true,
    description:
      "Traditional whole roasted pig, 51–59 lbs raw weight. On-site carving available.",
  },
  {
    id: "whole-lechon-large",
    group: "whole-lechon",
    groupName: "Whole Roasted Lechon",
    size: "Large",
    serves: "60–75 guests",
    name: "Whole Lechon — Large",
    price: null,
    priceLabel: "$550–600",
    category: "Whole Roasts",
    image: IMAGES.menuLechonXL,
    requestQuote: true,
    description:
      "Whole roasted pig, 60–74 lbs raw weight. On-site carving available.",
  },
  {
    id: "whole-lechon-xl",
    group: "whole-lechon",
    groupName: "Whole Roasted Lechon",
    size: "Extra Large",
    serves: "75–95 guests",
    name: "Whole Lechon — Extra Large",
    price: null,
    priceLabel: "$600–650",
    category: "Whole Roasts",
    image: IMAGES.menuLechonXL,
    requestQuote: true,
    description:
      "Whole roasted pig, 75–85 lbs raw weight. The grand centerpiece. 7-day lead time.",
  },
];

export const CATEGORIES: ("All" | MenuCategory)[] = ["All", "Trays & Packs", "Whole Roasts"];

// ---- Derived grouping: one card per product, variants as size options ----
export interface MenuGroup {
  group: string;
  groupName: string;
  category: MenuCategory;
  image: string;
  badge?: string;
  description: string;
  requestQuote: boolean;
  variants: MenuItem[];
}

export function buildMenuGroups(items: MenuItem[] = MENU): MenuGroup[] {
  const order: string[] = [];
  const map = new Map<string, MenuGroup>();
  for (const item of items) {
    let g = map.get(item.group);
    if (!g) {
      g = {
        group: item.group,
        groupName: item.groupName,
        category: item.category,
        image: item.image,
        badge: item.badge,
        description: item.description,
        requestQuote: !!item.requestQuote,
        variants: [],
      };
      map.set(item.group, g);
      order.push(item.group);
    }
    g.variants.push(item);
  }
  return order.map((k) => map.get(k)!);
}

export const MENU_GROUPS: MenuGroup[] = buildMenuGroups();
