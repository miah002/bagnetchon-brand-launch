import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Photo } from "./Photo";
import { IMAGES } from "@/data/images";

const items = [
  { name: "Signature Bagnet", image: IMAGES.bagnetCloseup, tag: "Crisp · Cured · Twice-fried" },
  { name: "Lechon Belly", image: IMAGES.lechonDisplay, tag: "Glass-crackling skin" },
  { name: "Whole Lechon", image: IMAGES.hero, tag: "Fiesta centerpiece" },
  { name: "Crispy Sisig", image: IMAGES.sisigBagnet, tag: "Calamansi · Chili" },
];

export function SignatureCarousel() {
  const scroller = useRef<HTMLUListElement>(null);
  const [idx, setIdx] = useState(0);

  const scrollTo = (i: number) => {
    const next = Math.max(0, Math.min(items.length - 1, i));
    setIdx(next);
    const el = scroller.current;
    if (!el) return;
    const card = el.children[next] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
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
            className="rounded-full border border-border p-3 hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollTo(idx + 1)}
            aria-label="Next"
            className="rounded-full border border-border p-3 hover:bg-muted"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <ul
        ref={scroller}
        className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 md:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it, i) => (
          <li
            key={it.name}
            className="snap-center shrink-0 basis-[82%] sm:basis-[55%] md:basis-[38%] lg:basis-[28%]"
          >
            <div className="overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] bg-card shadow-ambient">
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
    </section>
  );
}
