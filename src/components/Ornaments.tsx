import { cn } from "@/lib/utils";
import { IMAGES } from "@/data/images";

/** Red chili accent mark (real art). */
export function ChiliMark({ className }: { className?: string }) {
  return (
    <img
      src={IMAGES.ornamentChili}
      alt=""
      aria-hidden="true"
      className={cn("select-none object-contain", className)}
    />
  );
}

/** Centered chili flanked by tapering bronze rules — a section divider. */
export function ChiliDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)} aria-hidden="true">
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--brand-gold)]/80 sm:w-24" />
      <ChiliMark className="h-8 w-auto shrink-0 sm:h-10" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--brand-gold)]/80 sm:w-24" />
    </div>
  );
}

/**
 * Bronze filigree + chili corner ornament (real art). Place absolutely inside a
 * framed wood panel. `flip` mirrors horizontally for the opposite corner; pair
 * with a rotate utility for the diagonal corner.
 */
export function CornerFlourish({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <img
      src={IMAGES.ornamentCornerChili}
      alt=""
      aria-hidden="true"
      className={cn("select-none object-contain", className)}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    />
  );
}
