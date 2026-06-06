import { cn } from "@/lib/utils";

interface BaybayinWatermarkProps {
  glyph?: "ᜃ" | "ᜆ" | "ᜊ" | "ᜎ" | "ᜈ";
  className?: string;
  size?: string;
}

export function BaybayinWatermark({
  glyph = "ᜊ",
  className,
  size = "text-[18rem]",
}: BaybayinWatermarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "baybayin-watermark absolute pointer-events-none select-none",
        size,
        className,
      )}
    >
      {glyph}
    </span>
  );
}
