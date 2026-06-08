import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useCart, formatPrice } from "@/context/CartContext";

export function MobileCartBar() {
  const { itemCount, subtotal } = useCart();
  if (itemCount === 0) return null;
  return (
    <Link
      to="/checkout"
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between gap-3 border-t border-border bg-primary px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] text-primary-foreground shadow-2xl md:hidden"
      aria-label={`View order, ${itemCount} items, subtotal ${formatPrice(subtotal)}`}
    >
      <span className="flex items-center gap-2 text-sm font-semibold">
        <ShoppingBag className="h-4 w-4" />
        {itemCount} item{itemCount > 1 ? "s" : ""} · {formatPrice(subtotal)}
      </span>
      <span className="rounded-full bg-background/15 px-4 py-1.5 text-sm font-semibold">
        View order →
      </span>
    </Link>
  );
}
