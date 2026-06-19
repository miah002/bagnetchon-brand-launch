import { cn } from "@/lib/utils";

/** Small red chili with a green leaf — brand accent mark. */
export function ChiliMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 10C10 4 19 5 27 10c4 2 8 4 9 9-4-1-7-3-12-4-7 4-17 3-20-5Z" fill="#A62615" />
      <path d="M4 10C2 8 2 4 4 3c2 1 3 3 3 6-1 1-2 1-3 1Z" fill="#45A046" />
    </svg>
  );
}

/** Centered chili flanked by tapering bronze rules — a section divider. */
export function ChiliDivider({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-4", className)} aria-hidden="true">
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--brand-gold)]/80 sm:w-20" />
      <ChiliMark className="h-5 w-auto shrink-0" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--brand-gold)]/80 sm:w-20" />
    </div>
  );
}

/**
 * Bronze filigree corner flourish. Decorative; place absolutely inside a
 * framed wood panel. Use `flip` to mirror for the opposite corner.
 */
export function CornerFlourish({ className, flip }: { className?: string; flip?: boolean }) {
  return (
    <svg
      viewBox="0 0 88 88"
      fill="none"
      aria-hidden="true"
      className={cn("text-[var(--brand-gold)]", className)}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
    >
      <g stroke="currentColor" strokeLinecap="round">
        <path d="M6 82V30C6 16 16 6 30 6h52" strokeWidth="2.5" />
        <path d="M16 82C16 44 44 16 82 16" strokeWidth="1.5" opacity="0.75" />
        <path
          d="M30 30c0-8 7-12 14-10-3 1-6 3-6 8 5 1 9-1 12-5-1 6-6 11-13 11-4 0-7-2-7-4Z"
          strokeWidth="1.5"
          opacity="0.9"
        />
      </g>
      <circle cx="30" cy="30" r="2.5" fill="currentColor" />
    </svg>
  );
}
