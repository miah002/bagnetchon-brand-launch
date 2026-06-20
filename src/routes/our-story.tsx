import { createFileRoute, Link } from "@tanstack/react-router";
import { Photo } from "@/components/Photo";
import { PolaroidPhoto } from "@/components/PolaroidPhoto";
import { ChiliDivider } from "@/components/Ornaments";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { BaybayinWatermark } from "@/components/BaybayinWatermark";
import { IMAGES } from "@/data/images";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/our-story")({
  head: () =>
    pageMeta({
      title: "Our Story",
      description:
        "The journey of Bagnetchon — founded in Buena Park, California by Chef-Formulator Chedie Narcelles and his wife Mel. A healthier, organic reinvention of bagnet and lechon, bridging the Pearl of the Orient and the West.",
      path: "/our-story",
      image: IMAGES.founders,
    }),
  component: Story,
});

function Story() {
  const ref = useScrollReveal();
  return (
    <div className="relative" ref={ref as React.RefObject<HTMLDivElement>}>
      <BaybayinWatermark
        glyph="ᜈ"
        className="-left-10 top-20 text-foreground"
        size="text-[22rem]"
      />

      {/* ─── A. Editorial Hero ─────────────────────────────────────────── */}
      <section className="reveal mx-auto max-w-6xl px-4 pt-16 md:px-8 md:pt-24">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center">

          {/* Left: headline + lede */}
          <div className="md:col-span-7">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">
              Our Story
            </p>
            <h1 className="mt-3 font-display text-5xl md:text-6xl leading-[1.05]">
              The Journey of Bagnetchon.
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              A shared vision — from the Pearl of the Orient to the tables of California.
            </p>
          </div>

          {/* Right: chef portrait with name-plate */}
          <div className="md:col-span-5">
            <div className="relative">
              <Photo
                src={IMAGES.chefPortrait}
                alt="Chef Chedie Narcelles, Founder and Chef-Formulator of Bagnetchon"
                aspect="3/4"
                rounded="rounded-tl-[2.5rem] rounded-br-[2.5rem]"
                eager
                className="bronze-frame"
              />
              {/* Name-plate: absolutely positioned over the bottom of the portrait */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] parchment rounded-lg px-4 py-2 text-center shadow-md">
                <p className="font-display text-base text-foreground leading-tight">
                  Chef Chedie Narcelles
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Founder &amp; Chef-Formulator
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── B. Opening narrative (drop-cap) ──────────────────────────── */}
      <section className="reveal mx-auto max-w-3xl px-4 mt-16 md:px-8">
        <div className="space-y-6 text-lg leading-relaxed text-foreground/90">
          <p className="first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.7] first-letter:text-primary">
            Behind every crunch of Bagnetchon is a story of love, culture, and a shared lifelong
            journey. Founded in Buena Park, California by Chef-Formulator{" "}
            <strong className="text-foreground">Chedie Narcelles</strong> alongside his wife and
            ultimate partner in purpose,{" "}
            <strong className="text-foreground">Mel Narcelles</strong>, Bagnetchon was built on a
            promise: to bring the authentic joy of Filipino tradition across the globe.
          </p>
        </div>
      </section>

      {/* ─── C. Chapter 01 (image left, text right) ───────────────────── */}
      <section className="reveal mx-auto max-w-6xl px-4 mt-16 md:px-8">
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* Image */}
          <Photo
            src={IMAGES.founders}
            alt="Chedie and Mel Narcelles with family — the founding team of Bagnetchon"
            aspect="4/5"
            rounded="rounded-tl-[2.5rem] rounded-br-[2.5rem]"
          />

          {/* Text */}
          <div className="space-y-4">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-accent">
              Chapter 01
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground">
              A shared vision
            </h2>
            <div className="space-y-4 text-lg leading-relaxed text-foreground/90">
              <p>
                From the very beginning, Mel has been the cornerstone of the vision — believing
                in the dream, guiding the strategy, and walking hand-in-hand through every step
                of this culinary pilgrimage. Together they set out to bridge East and West,
                carrying the proud identity of the Pearl of the Orient directly to the tables
                of California.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ─── D. Pull-quote ─────────────────────────────────────────────── */}
      <section className="reveal mx-auto max-w-3xl px-4 mt-16 md:px-8">
        <ChiliDivider className="mb-8" />
        <blockquote className="text-center space-y-4">
          <p className="font-display text-2xl md:text-3xl italic text-primary leading-snug">
            "He doesn't claim to be a doctor of medicine — but he is, deeply, a doctor of human
            connection."
          </p>
          <footer className="text-sm text-muted-foreground uppercase tracking-[0.2em]">
            — On Chef Chedie
          </footer>
        </blockquote>
        <ChiliDivider className="mt-8" />
      </section>

      {/* ─── E. Chapter 02 (text left, image right) ───────────────────── */}
      <section className="reveal mx-auto max-w-6xl px-4 mt-16 md:px-8">
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* Text (placed first → left on desktop) */}
          <div className="space-y-4">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-accent">
              Chapter 02
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground">
              Crafting with purpose
            </h2>
            <div className="space-y-4 text-lg leading-relaxed text-foreground/90">
              <p>
                So he threw out the commercial deep fryers. He engineered an organic,
                slow-rendering process driven by meticulous humidity and temperature control,
                infused with carefully selected probiotic herbs and spices. The result is a
                masterful fusion of bagnet and lechon — shatter-crisp, golden skin and rich
                flavor, without the heavy grease. Innovation born not from a lab, but from a
                heart that cares for its people.
              </p>
            </div>
          </div>

          {/* Image (placed second → right on desktop) */}
          <Photo
            src={IMAGES.chefKitchenReal}
            alt="Chef Chedie Narcelles at work in the Bagnetchon kitchen"
            aspect="4/5"
            rounded="rounded-tr-[2.5rem] rounded-bl-[2.5rem]"
          />

        </div>
      </section>

      {/* ─── F. Mission / Vision cards ─────────────────────────────────── */}
      <section className="reveal mx-auto max-w-3xl px-4 mt-16 md:px-8">
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="bronze-frame parchment rounded-2xl p-6">
            <h3 className="font-display text-xl text-primary">Our Mission</h3>
            <p className="mt-2 text-foreground/90">
              To bring the authentic joy of Filipino lechon to every table — freshly roasted,
              locally sourced, and globally excellent. We celebrate heritage through world-class
              flavor, master craftsmanship, and the irreplaceable spirit of Filipino celebration.
            </p>
          </div>
          <div className="bronze-frame parchment rounded-2xl p-6">
            <h3 className="font-display text-xl text-primary">Our Vision</h3>
            <p className="mt-2 text-foreground/90">
              To stand as the global symbol of pride for Filipino innovation — a brand that unites
              diverse communities through taste, culture, and unparalleled excellence.
            </p>
          </div>
        </div>
      </section>

      {/* ─── G. Closing ────────────────────────────────────────────────── */}
      <section className="reveal mx-auto max-w-3xl px-4 mt-16 md:px-8">
        <div className="space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            From our family to yours, we invite you to sit down, hear the crackle, and celebrate
            the beautiful history we share.
          </p>
          <p className="font-display text-2xl italic text-primary">
            "Bagnet + Lechon — quality you can crunch."
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/menu"
            className="btn-sheen rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            Order the menu
          </Link>
          <Link
            to="/catering"
            className="rounded-full border-2 border-foreground px-6 py-3 font-semibold hover:bg-foreground hover:text-background"
          >
            Cater your event
          </Link>
        </div>
      </section>

      {/* ─── H. Family album (scrapbook polaroids) ─────────────────────── */}
      <section className="reveal mx-auto max-w-7xl px-4 mt-16 pb-20 md:px-8">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <PolaroidPhoto
            src={IMAGES.founders}
            alt="Chef Chedie and Mel Narcelles with the whole Bagnetchon family"
            caption="Buena Park, day one"
            tilt="left"
          />
          <PolaroidPhoto
            src={IMAGES.foundersCouple}
            alt="Chedie and Mel Narcelles — founders of Bagnetchon"
            caption="Partners in purpose"
            tilt="right"
          />
          <PolaroidPhoto
            src={IMAGES.foundersLechon}
            alt="Chedie and Mel Narcelles with a whole lechon at a Bagnetchon event"
            caption="First whole lechon"
            tilt="left"
            objectPosition="left center"
          />
          <PolaroidPhoto
            src={IMAGES.cateringCarving}
            alt="Live lechon carving at a Bagnetchon catering event"
            caption="On the line"
            tilt="right"
          />
        </div>
      </section>
    </div>
  );
}
