import { IMAGES } from "./images";

export type MenuCategory = "Trays & Packs" | "Whole Roasts";

export interface MenuItem {
  id: string;
  name: string;
  price: number | null;
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

// Official Bagnetchon price sheet (client-supplied, 2026-07). Fixed-price trays
// are orderable online; weight-based roasts show the sheet's price range and
// route to a catering quote (final price set by raw weight). Each entry stays a
// flat orderable unit (the cart resolves line ids against this list); the UI
// groups them by `group` into one card per product with size pills.
export const MENU: MenuItem[] = [
  // ==== WHOLE ROASTS — priced by raw weight, quote to confirm ====

  // ---- Roasted Lechon Belly ($25/lb raw weight) ----
  {
    id: "belly-half",
    group: "lechon-belly",
    groupName: "Roasted Lechon Belly",
    size: "Half",
    serves: "9–14 lbs",
    name: "Roasted Lechon Belly — Half",
    price: 120,
    category: "Whole Roasts",
    image: IMAGES.dishBellyHalf,
    badge: "Bestseller",
    description:
      "Slow-roasted Ilocano-style belly roll, glass-crackling skin. Free Chef's bagnet sarsa. $25/lb raw weight.",
  },
  {
    id: "belly-full",
    group: "lechon-belly",
    groupName: "Roasted Lechon Belly",
    size: "Full",
    serves: "15–27 lbs",
    name: "Roasted Lechon Belly — Full",
    price: 220,
    category: "Whole Roasts",
    image: IMAGES.dishBellyFull,
    description:
      "Slow-roasted Ilocano-style belly roll, glass-crackling skin. Free Chef's bagnet sarsa. $25/lb raw weight.",
  },
  {
    id: "belly-half-truffle",
    group: "lechon-belly",
    groupName: "Roasted Lechon Belly",
    size: "Half + Truffles",
    serves: "9–14 lbs",
    name: "Lechon Belly Truffles — Half",
    price: 160,
    category: "Whole Roasts",
    image: IMAGES.dishBellyTruffle1,
    badge: "Truffle",
    description:
      "Half belly finished with black truffle — an earthy, luxe upgrade on the classic. Priced by raw weight.",
  },
  {
    id: "belly-full-truffle",
    group: "lechon-belly",
    groupName: "Roasted Lechon Belly",
    size: "Full + Truffles",
    serves: "15–27 lbs",
    name: "Lechon Belly Truffles — Full",
    price: 260,
    category: "Whole Roasts",
    image: IMAGES.dishBellyTruffle2,
    badge: "Truffle",
    description:
      "Full belly finished with black truffle — the centerpiece for a premium feast. Priced by raw weight.",
  },

  // ---- Roasted Cochinillo ----
  {
    id: "cochinillo",
    group: "cochinillo",
    groupName: "Roasted Cochinillo",
    size: "15–21 lbs",
    serves: "Serves 10–15",
    name: "Roasted Cochinillo",
    price: 380,
    category: "Whole Roasts",
    image: IMAGES.dishCochinillo1,
    description:
      "Spanish-style suckling cochinillo, paper-crisp skin. A delicate, elegant centerpiece.",
  },

  // ---- Lechon De Leche ----
  {
    id: "lechon-de-leche",
    group: "lechon-de-leche",
    groupName: "Lechon De Leche",
    size: "30–40 lbs",
    serves: "Serves 20–25",
    name: "Lechon De Leche",
    price: 450,
    category: "Whole Roasts",
    image: IMAGES.dishDeLeche1,
    description:
      "Milky-young suckling lechon, tender and rich. The traditional fiesta showpiece.",
  },

  // ---- Roasted Whole Lechon (by size) ----
  {
    id: "whole-lechon-small",
    group: "whole-lechon",
    groupName: "Whole Roasted Lechon",
    size: "Small",
    serves: "25–30 guests",
    name: "Whole Lechon — Small",
    price: 480,
    category: "Whole Roasts",
    image: IMAGES.dishLechonMedium,
    badge: "Centerpiece",
    description:
      "Traditional whole roasted pig, 41–50 lbs raw weight. On-site carving available.",
  },
  {
    id: "whole-lechon-medium",
    group: "whole-lechon",
    groupName: "Whole Roasted Lechon",
    size: "Medium",
    serves: "25–45 guests",
    name: "Whole Lechon — Medium",
    price: 500,
    category: "Whole Roasts",
    image: IMAGES.dishLechonMedium,
    description:
      "Traditional whole roasted pig, 51–59 lbs raw weight. On-site carving available.",
  },
  {
    id: "whole-lechon-large",
    group: "whole-lechon",
    groupName: "Whole Roasted Lechon",
    size: "Large",
    serves: "50–80 guests",
    name: "Whole Lechon — Large",
    price: 550,
    category: "Whole Roasts",
    image: IMAGES.dishLechonLarge,
    description:
      "Whole roasted pig, 60–74 lbs raw weight. On-site carving available.",
  },
  {
    id: "whole-lechon-xl",
    group: "whole-lechon",
    groupName: "Whole Roasted Lechon",
    size: "Extra Large",
    serves: "80–100 guests",
    name: "Whole Lechon — Extra Large",
    price: 600,
    category: "Whole Roasts",
    image: IMAGES.dishLechonXL1,
    description:
      "Whole roasted pig, 75–85 lbs raw weight. The grand centerpiece. 7-day lead time.",
  },

  // ---- Roasted Lechon Pata ----
  {
    id: "lechon-pata",
    group: "lechon-pata",
    groupName: "Roasted Lechon Pata",
    size: "4–8 lbs",
    name: "Roasted Lechon Pata",
    price: 50,
    category: "Whole Roasts",
    image: IMAGES.lechonCloseup,
    description:
      "Whole roasted pork leg — crackling skin over fall-apart meat. Priced by raw weight.",
  },

  // ==== TRAYS & PACKS — fixed price, order online ====

  // ---- Sisig Maharlika ----
  {
    id: "sisig-half",
    group: "sisig",
    groupName: "Sisig Maharlika",
    size: "Half Tray",
    serves: "1200 g",
    name: "Sisig Maharlika — Half Tray",
    price: 140,
    category: "Trays & Packs",
    image: IMAGES.menuSisig,
    badge: "Spicy",
    description: "Sizzling chopped bagnet sisig, calamansi and chili. 1200 g half tray.",
  },
  {
    id: "sisig-full",
    group: "sisig",
    groupName: "Sisig Maharlika",
    size: "Full Tray",
    serves: "2400 g",
    name: "Sisig Maharlika — Full Tray",
    price: 250,
    category: "Trays & Packs",
    image: IMAGES.menuSisig,
    badge: "Spicy",
    description: "Sizzling chopped bagnet sisig, calamansi and chili. 2400 g full tray.",
  },

  // ---- Authentic Lechon Paksiw ----
  {
    id: "paksiw-half",
    group: "lechon-paksiw",
    groupName: "Authentic Lechon Paksiw",
    size: "Half Tray",
    name: "Lechon Paksiw — Half Tray",
    price: 120,
    category: "Trays & Packs",
    image: IMAGES.lechonDisplay,
    description:
      "Chopped lechon simmered in a rich, tangy-sweet sarsa — the classic day-after fiesta dish.",
  },
  {
    id: "paksiw-full",
    group: "lechon-paksiw",
    groupName: "Authentic Lechon Paksiw",
    size: "Full Tray",
    name: "Lechon Paksiw — Full Tray",
    price: 250,
    category: "Trays & Packs",
    image: IMAGES.lechonDisplay,
    description:
      "Chopped lechon simmered in a rich, tangy-sweet sarsa — the classic day-after fiesta dish.",
  },

  // ---- Filipino-Chinese Specialty (full trays) ----
  {
    id: "lumpiang-shanghai",
    group: "lumpiang-shanghai",
    groupName: "Lumpiang Shanghai",
    size: "Full Tray",
    name: "Lumpiang Shanghai — Full Tray",
    price: 180,
    category: "Trays & Packs",
    image: IMAGES.tastingBowls,
    description: "Golden, crisp-rolled pork spring rolls with sweet-chili dip.",
  },
  {
    id: "pansit-canton-bihon",
    group: "pansit-canton-bihon",
    groupName: "Pansit Canton Bihon",
    size: "Full Tray",
    name: "Pansit Canton Bihon — Full Tray",
    price: 180,
    category: "Trays & Packs",
    image: IMAGES.dishPlatter,
    description: "Classic double-noodle pansit with vegetables and savory soy glaze.",
  },
  {
    id: "beef-caldereta",
    group: "beef-caldereta",
    groupName: "Beef Caldereta",
    size: "Full Tray",
    name: "Beef Caldereta — Full Tray",
    price: 265,
    category: "Trays & Packs",
    image: IMAGES.fiestaSpread,
    description: "Slow-braised beef in rich tomato sauce with peppers and olives.",
  },
  {
    id: "bistek-tagalog",
    group: "bistek-tagalog",
    groupName: "Bistek Tagalog",
    size: "Full Tray",
    name: "Bistek Tagalog — Full Tray",
    price: 265,
    category: "Trays & Packs",
    image: IMAGES.fiestaSpread,
    description: "Tender beef steak braised in calamansi-soy with sweet onions.",
  },
  {
    id: "beef-kare-kare",
    group: "beef-kare-kare",
    groupName: "Beef Kare Kare",
    size: "Full Tray",
    name: "Beef Kare Kare — Full Tray",
    price: 265,
    category: "Trays & Packs",
    image: IMAGES.kareKare,
    description: "Oxtail-rich peanut stew with vegetables and bagoong on the side.",
  },
  {
    id: "pork-menudo",
    group: "pork-menudo",
    groupName: "Pork Menudo",
    size: "Full Tray",
    name: "Pork Menudo — Full Tray",
    price: 220,
    category: "Trays & Packs",
    image: IMAGES.fiestaSpread,
    description: "Hearty pork and liver stew in tomato sauce with potatoes and carrots.",
  },
  {
    id: "chicken-curry",
    group: "chicken-curry",
    groupName: "Chicken Curry",
    size: "Full Tray",
    name: "Chicken Curry — Full Tray",
    price: 220,
    category: "Trays & Packs",
    image: IMAGES.tastingBowls,
    description: "Coconut-cream chicken curry, Filipino-style with vegetables.",
  },
  {
    id: "pork-siomai",
    group: "pork-siomai",
    groupName: "Pork Siomai",
    size: "200 pcs / Full Tray",
    name: "Pork Siomai — Full Tray (200 pcs)",
    price: 250,
    category: "Trays & Packs",
    image: IMAGES.tastingBowls,
    description: "Steamed pork siomai with garlic-chili calamansi soy. 200 pieces.",
  },
  {
    id: "lechon-sarsa",
    group: "lechon-sarsa",
    groupName: "Chef's Lechon Sarsa",
    size: "450 g",
    name: "Chef's Lechon Sarsa — 450 g",
    price: 10,
    category: "Trays & Packs",
    image: IMAGES.menuSarsa,
    description:
      "Chef Bagnet's all-purpose sarsa — savory, sweet, and tangy in perfect balance.",
  },
  {
    id: "steamed-rice",
    group: "steamed-rice",
    groupName: "Steamed Rice",
    size: "Full Tray",
    name: "Steamed Rice — Full Tray",
    price: 80,
    category: "Trays & Packs",
    image: IMAGES.dishPlatter,
    description: "Fluffy steamed jasmine rice, party tray.",
  },

  // ---- Dessert ----
  {
    id: "buko-pandan",
    group: "buko-pandan",
    groupName: "Buko Pandan Salad",
    size: "Full Tray",
    name: "Buko Pandan Salad — Full Tray",
    price: 200,
    category: "Trays & Packs",
    image: IMAGES.tastingBowls,
    description: "Young coconut and pandan jelly in sweet cream — a fiesta favorite.",
  },
  {
    id: "kakanin-platter",
    group: "kakanin-platter",
    groupName: "Kakanin Platter",
    size: "Platter",
    name: "Kakanin Platter",
    price: 120,
    category: "Trays & Packs",
    image: IMAGES.dishPlatter,
    description: "Assorted native rice delicacies — sapin-sapin, biko, and more.",
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
