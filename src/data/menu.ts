import { IMAGES } from "./images";

export type MenuCategory = "Trays & Packs" | "Whole Roasts";

export interface MenuItem {
  id: string;
  name: string;
  price: number | null; // null = market price
  priceLabel?: string;
  category: MenuCategory;
  image: string;
  description: string;
  badge?: string;
  requestQuote?: boolean;
}

// Real Bagnetchon lineup. Priced trays are orderable; market-price items
// (dinakdakan, whole roasts) route to a catering quote.
export const MENU: MenuItem[] = [
  // ---- Roasted Lechon — Classic (free Chef's sarsa) ----
  {
    id: "lechon-classic-pack",
    name: "Roasted Lechon (Classic) — Pack",
    price: 25,
    category: "Trays & Packs",
    image: IMAGES.menuLechonClassic,
    badge: "Bestseller",
    description:
      "Slow-roasted Ilocano-style lechon, shatter-crisp skin. 38 oz pack with free 16 oz Chef's bagnet sarsa.",
  },
  {
    id: "lechon-classic-half",
    name: "Roasted Lechon (Classic) — Half Tray",
    price: 200,
    category: "Trays & Packs",
    image: IMAGES.menuLechonClassic,
    description: "Half tray, serves ~12. Free 8 oz Chef's bagnet sarsa.",
  },
  {
    id: "lechon-classic-full",
    name: "Roasted Lechon (Classic) — Full Tray",
    price: 400,
    category: "Trays & Packs",
    image: IMAGES.menuLechonClassic,
    description: "Full tray, serves ~25. Free 16 oz Chef's bagnet sarsa.",
  },
  // ---- Roasted Lechon — Spicy ----
  {
    id: "lechon-spicy-pack",
    name: "Roasted Lechon (Spicy) — Pack",
    price: 25,
    category: "Trays & Packs",
    image: IMAGES.menuLechonSpicy,
    badge: "Spicy",
    description:
      "Our slow-roasted lechon with house spicy sarsa. 38 oz pack with free 16 oz sarsa.",
  },
  {
    id: "lechon-spicy-half",
    name: "Roasted Lechon (Spicy) — Half Tray",
    price: 200,
    category: "Trays & Packs",
    image: IMAGES.menuLechonSpicy,
    badge: "Spicy",
    description: "Half tray, serves ~12. Free 8 oz house spicy sarsa.",
  },
  {
    id: "lechon-spicy-full",
    name: "Roasted Lechon (Spicy) — Full Tray",
    price: 400,
    category: "Trays & Packs",
    image: IMAGES.menuLechonSpicy,
    badge: "Spicy",
    description: "Full tray, serves ~25. Free 16 oz house spicy sarsa.",
  },
  // ---- Sisig Maharlika (priced) ----
  {
    id: "sisig-pack",
    name: "Sisig Maharlika — Pack",
    price: 25,
    category: "Trays & Packs",
    image: IMAGES.menuSisig,
    badge: "Spicy",
    description: "Sizzling chopped bagnet sisig, calamansi and chili. 38 oz pack.",
  },
  {
    id: "sisig-half",
    name: "Sisig Maharlika — Half Tray",
    price: 150,
    category: "Trays & Packs",
    image: IMAGES.menuSisig,
    badge: "Spicy",
    description: "Half tray, serves ~12. Sizzling bagnet sisig with chili.",
  },
  {
    id: "sisig-full",
    name: "Sisig Maharlika — Full Tray",
    price: 300,
    category: "Trays & Packs",
    image: IMAGES.menuSisig,
    badge: "Spicy",
    description: "Full tray, serves ~25. Sizzling bagnet sisig with chili.",
  },
  // ---- Specialty (market price) ----
  {
    id: "dinakdakan-de-manila",
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
    name: "Roasted Lechon Belly — Half",
    price: null,
    priceLabel: "$120–170",
    category: "Whole Roasts",
    image: IMAGES.menuBellyHalf,
    badge: "Bestseller",
    requestQuote: true,
    description:
      "Half belly, 8–12 lbs raw weight. Slow-roasted Ilocano-style, glass-crackling skin. Free Chef's bagnet sarsa.",
  },
  {
    id: "belly-full",
    name: "Roasted Lechon Belly — Full",
    price: null,
    priceLabel: "$190–320",
    category: "Whole Roasts",
    image: IMAGES.menuBelly,
    requestQuote: true,
    description:
      "Full belly, 13–22 lbs raw weight. Our signature roast, shatter-crisp crackling. Free Chef's bagnet sarsa.",
  },
  {
    id: "belly-half-truffle",
    name: "Lechon Belly Truffles — Half",
    price: null,
    priceLabel: "$160–220",
    category: "Whole Roasts",
    image: IMAGES.menuBellyHalf,
    badge: "Truffle",
    requestQuote: true,
    description:
      "Half belly, 8–12 lbs raw weight, finished with black truffle. Earthy, luxe upgrade on the classic.",
  },
  {
    id: "belly-full-truffle",
    name: "Lechon Belly Truffles — Full",
    price: null,
    priceLabel: "$260–440",
    category: "Whole Roasts",
    image: IMAGES.menuBelly,
    badge: "Truffle",
    requestQuote: true,
    description:
      "Full belly, 13–22 lbs raw weight, finished with black truffle. The centerpiece for a premium feast.",
  },
  // ---- Roasted Whole Lechon (by size — price range, guest count, quote) ----
  {
    id: "cochinillo",
    name: "Roasted Cochinillo",
    price: null,
    priceLabel: "$450",
    category: "Whole Roasts",
    image: IMAGES.menuCochinillo,
    requestQuote: true,
    description:
      "Spanish-style suckling cochinillo, 15–21 lbs. Delicate, paper-crisp skin. Serves 10–15 guests.",
  },
  {
    id: "lechon-de-leche",
    name: "Lechon De Leche",
    price: null,
    priceLabel: "$450–480",
    category: "Whole Roasts",
    image: IMAGES.menuDeLeche,
    requestQuote: true,
    description:
      "Milky-young suckling lechon, 30–40 lbs raw weight. Tender and rich. Serves 20–25 guests.",
  },
  {
    id: "whole-lechon-medium",
    name: "Whole Lechon — Medium",
    price: null,
    priceLabel: "$500–550",
    category: "Whole Roasts",
    image: IMAGES.menuWholePig,
    badge: "Centerpiece",
    requestQuote: true,
    description:
      "Traditional whole roasted pig, 51–59 lbs raw weight. On-site carving available. Serves 50–60 guests.",
  },
  {
    id: "whole-lechon-large",
    name: "Whole Lechon — Large",
    price: null,
    priceLabel: "$550–600",
    category: "Whole Roasts",
    image: IMAGES.menuLechonXL,
    requestQuote: true,
    description:
      "Whole roasted pig, 60–74 lbs raw weight. On-site carving available. Serves 60–75 guests.",
  },
  {
    id: "whole-lechon-xl",
    name: "Whole Lechon — Extra Large",
    price: null,
    priceLabel: "$600–650",
    category: "Whole Roasts",
    image: IMAGES.menuLechonXL,
    requestQuote: true,
    description:
      "Whole roasted pig, 75–85 lbs raw weight. The grand centerpiece. Serves 75–95 guests. 7-day lead time.",
  },
];

export const CATEGORIES: ("All" | MenuCategory)[] = ["All", "Trays & Packs", "Whole Roasts"];
