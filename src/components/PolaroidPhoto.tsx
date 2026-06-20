import { cn } from "@/lib/utils";
import { Photo } from "./Photo";

interface PolaroidPhotoProps {
  src: string;
  alt: string;
  caption: string;
  /** Alternating tilt direction: "left" → sm:-rotate-2 | "right" → sm:rotate-1 */
  tilt?: "left" | "right";
  aspect?: string;
  objectPosition?: string;
  className?: string;
}

/**
 * Scrapbook-style "polaroid" photo frame. White card with image + caption.
 * Tilt is applied only at sm+ so it stacks cleanly on mobile.
 */
export function PolaroidPhoto({
  src,
  alt,
  caption,
  tilt = "left",
  aspect = "1/1",
  objectPosition = "center",
  className,
}: PolaroidPhotoProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-sm p-2 pb-7 shadow-warm transition-transform duration-300",
        tilt === "left"
          ? "sm:-rotate-2 sm:hover:rotate-0"
          : "sm:rotate-1 sm:hover:rotate-0",
        "hover:-translate-y-1",
        className,
      )}
    >
      <Photo
        src={src}
        alt={alt}
        aspect={aspect}
        objectPosition={objectPosition}
        rounded="rounded-none"
      />
      <p className="mt-2 px-1 text-center font-display text-xs uppercase tracking-wide text-muted-foreground">
        {caption}
      </p>
    </div>
  );
}
