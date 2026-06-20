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

type Corner = "tl" | "tr" | "bl" | "br";

const CORNER_POS: Record<Corner, string> = {
  tl: "top-0 left-0",
  tr: "top-0 right-0",
  bl: "bottom-0 left-0",
  br: "bottom-0 right-0",
};
const CORNER_TRANSFORM: Record<Corner, string | undefined> = {
  tl: undefined,
  tr: "scaleX(-1)",
  bl: "scaleY(-1)",
  br: "scaleX(-1) scaleY(-1)",
};

/**
 * Bronze filigree + chili corner ornament. Positions flush at the specified
 * corner inside a `relative overflow-hidden` framed panel — the border-radius
 * clips the outer edges so it nestles into the frame rather than floating.
 * A warm bronze drop-shadow ties it visually to the .bronze-frame border.
 */
export function CornerFlourish({
  className,
  corner = "tl",
}: {
  className?: string;
  corner?: Corner;
}) {
  return (
    <img
      src={IMAGES.ornamentCornerChili}
      alt=""
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute select-none object-contain",
        "drop-shadow-[0_0_12px_rgba(204,165,128,0.45)]",
        CORNER_POS[corner],
        className,
      )}
      style={CORNER_TRANSFORM[corner] ? { transform: CORNER_TRANSFORM[corner] } : undefined}
    />
  );
}
