import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MENU, type MenuItem } from "@/data/menu";
import { TAX_RATE } from "@/config/delivery";

export interface CartLine {
  id: string;
  qty: number;
}

interface CartContextValue {
  lines: CartLine[];
  add: (id: string, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  itemCount: number;
  subtotal: number;
  tax: number;
  total: (deliveryFee?: number) => number;
  resolved: (CartLine & { item: MenuItem; lineTotal: number })[];
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "bagnetchon_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const add = (id: string, qty = 1) => {
      setLines((prev) => {
        const i = prev.findIndex((l) => l.id === id);
        if (i === -1) return [...prev, { id, qty }];
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      });
    };
    const remove = (id: string) =>
      setLines((prev) => prev.filter((l) => l.id !== id));
    const setQty = (id: string, qty: number) => {
      if (qty <= 0) return remove(id);
      setLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty } : l)));
    };
    const clear = () => setLines([]);

    const resolved = lines
      .map((l) => {
        const item = MENU.find((m) => m.id === l.id);
        if (!item) return null;
        return {
          ...l,
          item,
          lineTotal: (item.price ?? 0) * l.qty,
        };
      })
      .filter(Boolean) as (CartLine & { item: MenuItem; lineTotal: number })[];

    const itemCount = resolved.reduce((s, l) => s + l.qty, 0);
    const subtotal = resolved.reduce((s, l) => s + l.lineTotal, 0);
    const tax = +(subtotal * TAX_RATE).toFixed(2);
    const total = (deliveryFee = 0) =>
      +(subtotal + tax + deliveryFee).toFixed(2);

    return {
      lines,
      add,
      remove,
      setQty,
      clear,
      itemCount,
      subtotal,
      tax,
      total,
      resolved,
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function formatPrice(n: number) {
  return `$${n.toFixed(2)}`;
}
