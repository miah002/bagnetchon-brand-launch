import { IMAGES } from "./images";

export type MenuCategory = "Small" | "Medium" | "Large" | "For Events";

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

export const MENU: MenuItem[] = [
  {
    id: "original-bagnet",
    name: "Original Bagnet",
    price: 18.5,
    category: "Small",
    image: IMAGES.bagnetCloseup,
    description:
      "Classic Ilocano-style pork belly, cured and double-fried until shatteringly crisp.",
  },
  {
    id: "belly-combo",
    name: "Belly Combo",
    price: 18.5,
    category: "Small",
    image: IMAGES.tastingBowls,
    description: "Quarter-pound lechon belly with garlic rice and achara.",
  },
  {
    id: "sisig-bagnet",
    name: "Sisig Bagnet",
    price: 19.95,
    category: "Small",
    image: IMAGES.sisigBagnet,
    badge: "Spicy",
    description:
      "Chopped bagnet tossed in a savory, tangy sauce with calamansi and chili.",
  },
  {
    id: "dinakdakan",
    name: "Dinakdakan",
    price: 19.95,
    category: "Small",
    image: IMAGES.dinakdakan,
    description: "Grilled pork belly & mask, creamy-tangy with onion and chili.",
  },
  {
    id: "bagnet-pinakbet",
    name: "Bagnet Pinakbet",
    price: 22.0,
    category: "Medium",
    image: IMAGES.dishPlatter,
    description:
      "Vegetable medley sautéed in shrimp paste, crowned with crunchy bagnet.",
  },
  {
    id: "kare-kare-bagnet",
    name: "Kare-Kare Bagnet",
    price: 22.0,
    category: "Medium",
    image: IMAGES.kareKare,
    badge: "HOT",
    description: "Peanut stew with crispy bagnet and shrimp paste.",
  },
  {
    id: "bagnet-1lb",
    name: "Bagnet (1 lb)",
    price: 28.0,
    category: "Medium",
    image: IMAGES.lechonCloseup,
    description: "Chopped and served with spicy sukang Iloko.",
  },
  {
    id: "lechon-belly",
    name: "Lechon Belly",
    price: 32.0,
    category: "Large",
    image: IMAGES.lechonDisplay,
    description:
      "Slow-roasted pork belly with lemongrass and garlic; glass-crackling skin.",
  },
  {
    id: "fiesta-platter",
    name: "Fiesta Platter",
    price: 65.0,
    category: "For Events",
    image: IMAGES.fiestaSpread,
    description: "Bagnet, sisig, and grilled liempo for 4.",
  },
  {
    id: "bagnet-kare-kare-fiesta",
    name: "Bagnet Kare-Kare Fiesta",
    price: 65.0,
    category: "For Events",
    image: IMAGES.kareKare,
    badge: "EVENT FAVORITE",
    description:
      "Bagnet with creamy peanut stew and house-made bagoong; party size.",
  },
  {
    id: "whole-lechon",
    name: "Whole Lechon",
    price: null,
    priceLabel: "Market Price",
    category: "For Events",
    image: IMAGES.hero,
    requestQuote: true,
    description:
      "Traditional whole roasted pig, specialty liver sauce, professional carving. 7-day lead time.",
  },
];

export const CATEGORIES: ("All" | MenuCategory)[] = [
  "All",
  "Small",
  "Medium",
  "Large",
  "For Events",
];
