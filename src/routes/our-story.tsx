import { createFileRoute, Link } from "@tanstack/react-router";
import { Photo } from "@/components/Photo";
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

      <section className="reveal mx-auto max-w-3xl px-4 pt-16 md:px-8 md:pt-24">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">Our Story</p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl leading-[1.05]">
          The Journey of Bagnetchon.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          A shared vision — from the Pearl of the Orient to the tables of California.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        <div className="reveal">
          <Photo
            src={IMAGES.chefKitchenReal}
            alt="Chef Chedie and Mel Narcelles in the Bagnetchon kitchen"
            aspect="16/10"
            rounded="rounded-tl-[2.5rem] rounded-br-[2.5rem]"
            eager
            className="bronze-frame"
          />
        </div>
        <div className="reveal mt-10 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            Behind every crunch of Bagnetchon is a story of love, culture, and a shared lifelong
            journey. Founded in Buena Park, California by Chef-Formulator{" "}
            <strong className="text-foreground">Chedie Narcelles</strong> alongside his wife and
            ultimate partner in purpose, <strong className="text-foreground">Mel Narcelles</strong>,
            Bagnetchon was built on a promise: to bring the authentic joy of Filipino tradition
            across the globe.
          </p>
          <p>
            From the very beginning, Mel has been the cornerstone of the vision — believing in the
            dream, guiding the strategy, and walking hand-in-hand through every step of this
            culinary pilgrimage. Together they set out to bridge East and West, carrying the proud
            identity of the Pearl of the Orient directly to the tables of California.
          </p>

          <h2 className="font-display text-3xl text-foreground">
            Driven by community, crafting with purpose
          </h2>
          <p>
            Chef Chedie doesn't claim to be a doctor of medicine — but he is, deeply, a doctor of
            human connection. He listened to a generation that missed the comforting flavors of
            home, yet needed a better, more mindful way to enjoy them.
          </p>
          <p>
            So he threw out the commercial deep fryers. He engineered an organic, slow-rendering
            process driven by meticulous humidity and temperature control, infused with carefully
            selected probiotic herbs and spices. The result is a masterful fusion of bagnet and
            lechon — shatter-crisp, golden skin and rich flavor, without the heavy grease.
            Innovation born not from a lab, but from a heart that cares for its people.
          </p>
        </div>

        <div className="reveal mt-10 grid gap-5 sm:grid-cols-2">
          <div className="bronze-frame parchment rounded-2xl p-6">
            <h3 className="font-display text-xl text-primary">Our Mission</h3>
            <p className="mt-2 text-foreground/90">
              To bring the authentic joy of Filipino lechon to every table — freshly roasted,
              locally sourced, and globally excellent. We celebrate heritage through world-class
              flavor, master craftsmanship, and the irreplaceable spirit of <em>Bida ang saya</em>.
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

        <div className="reveal mt-10 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            From our family to yours, we invite you to sit down, hear the crackle, and celebrate the
            beautiful history we share.
          </p>
          <p className="font-display text-2xl italic text-primary">"Bida ang saya."</p>
        </div>

        <div className="reveal mt-10 flex flex-wrap gap-3">
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

      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Photo
            src={IMAGES.founders}
            alt="Chef Chedie and Mel Narcelles with family"
            aspect="1/1"
            rounded="rounded-tl-[2rem] rounded-br-[2rem]"
          />
          <Photo
            src={IMAGES.chefPortrait}
            alt="Chef Chedie Narcelles"
            aspect="1/1"
            rounded="rounded-tr-[2rem] rounded-bl-[2rem]"
          />
          <Photo
            src={IMAGES.foundersCouple}
            alt="Chedie and Mel Narcelles"
            aspect="1/1"
            rounded="rounded-tl-[2rem] rounded-br-[2rem]"
          />
          <Photo
            src={IMAGES.foundersLechon}
            alt="Chedie and Mel with a whole lechon"
            aspect="1/1"
            rounded="rounded-tr-[2rem] rounded-bl-[2rem]"
          />
        </div>
      </section>
    </div>
  );
}
