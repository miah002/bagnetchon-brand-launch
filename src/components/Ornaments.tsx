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
const CORNER_DEG: Record<Corner, number> = { tl: 0, tr: 90, bl: 270, br: 180 };

/**
 * SVG corner bracket — double L-mark with diamond vertex, same gold as the
 * bronze-frame border. Feels designed, not pasted. Use inside `relative
 * overflow-hidden` panels; border-radius clips outer SVG corners cleanly.
 */
export function CornerBracket({
  corner = "tl",
  className,
}: {
  corner?: Corner;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 52 52"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute select-none text-[var(--brand-gold)]",
        CORNER_POS[corner],
        className,
      )}
      style={{ transform: `rotate(${CORNER_DEG[corner]}deg)` }}
    >
      {/* Outer L-arm */}
      <path
        d="M4 48 L4 4 L48 4"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="square"
        fill="none"
        opacity="0.95"
      />
      {/* Inner L-arm — softer, adds depth */}
      <path
        d="M11 48 L11 11 L48 11"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="square"
        fill="none"
        opacity="0.4"
      />
      {/* Diamond at vertex */}
      <rect
        x="4"
        y="4"
        width="6"
        height="6"
        transform="rotate(45 7 7)"
        fill="currentColor"
        opacity="0.9"
      />
    </svg>
  );
}

/** @deprecated Use CornerBracket instead */
export function CornerFlourish({
  className,
  corner = "tl",
}: {
  className?: string;
  corner?: Corner;
}) {
  return <CornerBracket corner={corner} className={className} />;
}
