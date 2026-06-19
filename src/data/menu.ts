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
  // ---- Whole Roasts (by weight — market price) ----
  {
    id: "whole-pig-lechon",
    name: "Whole Pig Lechon",
    price: null,
    priceLabel: "Market Price",
    category: "Whole Roasts",
    image: IMAGES.menuWholePig,
    badge: "Centerpiece",
    requestQuote: true,
    description:
      "Traditional whole roasted pig, 50–80 lbs (medium to large). Specialty liver sauce, professional on-site carving. 7-day lead time.",
  },
  {
    id: "lechon-belly-full",
    name: "Lechon Belly Roll — Full",
    price: null,
    priceLabel: "Market Price",
    category: "Whole Roasts",
    image: IMAGES.lechonDisplay,
    requestQuote: true,
    description: "Slow-roasted lechon belly roll, 14–25 lbs. Glass-crackling skin.",
  },
  {
    id: "lechon-belly-half",
    name: "Lechon Belly Roll — Half",
    price: null,
    priceLabel: "Market Price",
    category: "Whole Roasts",
    image: IMAGES.bagnetCloseup,
    requestQuote: true,
    description: "Lechon belly roll, 8–13 lbs. Perfect for smaller gatherings.",
  },
  {
    id: "lechon-de-leche",
    name: "Lechon de Leche",
    price: null,
    priceLabel: "Market Price",
    category: "Whole Roasts",
    image: IMAGES.menuDeLeche,
    requestQuote: true,
    description: "Suckling lechon de leche, 30–39 lbs raw weight. Tender, milky-young.",
  },
  {
    id: "cochinillo",
    name: "Cochinillo",
    price: null,
    priceLabel: "Market Price",
    category: "Whole Roasts",
    image: IMAGES.menuCochinillo,
    requestQuote: true,
    description: "Spanish-style roasted cochinillo, 12–18 lbs. Delicate, paper-crisp.",
  },
];

export const CATEGORIES: ("All" | MenuCategory)[] = ["All", "Trays & Packs", "Whole Roasts"];
