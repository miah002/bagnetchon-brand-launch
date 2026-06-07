import { useState } from "react";
import { cn } from "@/lib/utils";

interface PhotoProps {
  src: string;
  alt: string;
  className?: string;
  aspect?: string; // e.g. "4/3", "1/1", "16/9"
  label?: string;
  rounded?: string;
  eager?: boolean;
}

/**
 * Lazy, no-layout-shift image with an elegant on-brand fallback when missing.
 */
export function Photo({
  src,
  alt,
  className,
  aspect = "4/3",
  label,
  rounded = "rounded-2xl",
  eager = false,
}: PhotoProps) {
  const [errored, setErrored] = useState(false);

  return (
    <div
      className={cn(
        "group relative overflow-hidden bg-muted",
        rounded,
        className,
      )}
      style={{ aspectRatio: aspect }}
    >
      {!errored ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setErrored(true)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="photo-fallback absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <span
            className="baybayin-watermark text-[8rem]"
            aria-hidden="true"
            style={{ opacity: 0.12 }}
          >
            ᜊ
          </span>
          <span className="absolute bottom-3 left-0 right-0 font-display text-xs uppercase tracking-[0.2em] text-brand-charcoal/60">
            {label ?? alt}
          </span>
        </div>
      )}
    </div>
  );
}
