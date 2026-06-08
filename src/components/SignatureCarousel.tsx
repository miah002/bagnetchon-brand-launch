import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Photo } from "./Photo";
import { IMAGES } from "@/data/images";
import { cn } from "@/lib/utils";

const items = [
  { name: "Signature Bagnet", image: IMAGES.bagnetCloseup, tag: "Crisp · Cured · Twice-fried" },
  { name: "Lechon Belly", image: IMAGES.lechonDisplay, tag: "Glass-crackling skin" },
  { name: "Whole Lechon", image: IMAGES.hero, tag: "Fiesta centerpiece" },
  { name: "Crispy Sisig", image: IMAGES.sisigBagnet, tag: "Calamansi · Chili" },
];

export function SignatureCarousel() {
  const scroller = useRef<HTMLUListElement>(null);
  const ticking = useRef(false);
  const [idx, setIdx] = useState(0);

  const scrollTo = (i: number) => {
    const next = Math.max(0, Math.min(items.length - 1, i));
    setIdx(next);
    const el = scroller.current;
    if (!el) return;
    const card = el.children[next] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  // Keep active index in sync when the user swipes the list directly.
  const handleScroll = () => {
    if (ticking.current) return;
    ticking.current = true;
    requestAnimationFrame(() => {
      ticking.current = false;
      const el = scroller.current;
      if (!el) return;
      const center = el.scrollLeft + el.clientWidth / 2;
      let nearest = 0;
      let min = Infinity;
      Array.from(el.children).forEach((c, i) => {
        const child = c as HTMLElement;
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const dist = Math.abs(childCenter - center);
        if (dist < min) {
          min = dist;
          nearest = i;
        }
      });
      setIdx(nearest);
    });
  };

  return (
    <section aria-labelledby="roster-heading" className="relative">
      <div className="mx-auto flex max-w-7xl items-end justify-between gap-4 px-4 md:px-8">
        <div>
          <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">
            The Signature Roster
          </p>
          <h2 id="roster-heading" className="mt-2 font-display text-3xl md:text-5xl">
            Four cuts. One religion: crackle.
          </h2>
        </div>
        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            onClick={() => scrollTo(idx - 1)}
            aria-label="Previous"
            disabled={idx === 0}
            className="rounded-full border border-border p-3 hover:bg-muted disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollTo(idx + 1)}
            aria-label="Next"
            disabled={idx === items.length - 1}
            className="rounded-full border border-border p-3 hover:bg-muted disabled:opacity-40"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <ul
        ref={scroller}
        onScroll={handleScroll}
        className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it, i) => (
          <li
            key={it.name}
            className="snap-center shrink-0 basis-[82%] sm:basis-[55%] md:basis-[38%] lg:basis-[28%]"
          >
            <div className="overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] bg-card shadow-ambient transition-all duration-300 hover:-translate-y-1 hover:shadow-warm">
              <Photo
                src={it.image}
                alt={it.name}
                aspect="4/5"
                rounded="rounded-none"
                label={it.name}
                eager={i === 0}
              />
              <div className="p-5">
                <h3 className="font-display text-2xl">{it.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{it.tag}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Dot indicators */}
      <div className="mt-2 flex justify-center gap-1" role="group" aria-label="Carousel position">
        {items.map((it, i) => (
          <button
            key={it.name}
            type="button"
            aria-label={`Go to ${it.name}`}
            aria-current={idx === i}
            onClick={() => scrollTo(i)}
            className="group flex h-11 w-7 items-center justify-center"
          >
            <span
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                idx === i ? "w-6 bg-primary" : "w-2 bg-border group-hover:bg-muted-foreground",
              )}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
