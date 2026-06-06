import { createFileRoute, Link } from "@tanstack/react-router";
import { Photo } from "@/components/Photo";
import { BaybayinWatermark } from "@/components/BaybayinWatermark";
import { IMAGES } from "@/data/images";
import { pageMeta } from "@/lib/seo";

export const Route = createFileRoute("/our-story")({
  head: () =>
    pageMeta({
      title: "Our Story",
      description:
        "From the hills of Ilocos to the coast of Florida. The story behind Bagnetchon — an Ilocano chef-formulator's healthier reinvention of bagnet and lechon.",
      path: "/our-story",
      image: IMAGES.chefKitchen,
    }),
  component: Story,
});

function Story() {
  return (
    <div className="relative">
      <BaybayinWatermark glyph="ᜈ" className="-left-10 top-20 text-foreground" size="text-[22rem]" />

      <section className="mx-auto max-w-3xl px-4 pt-16 md:px-8 md:pt-24">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">
          Our Story
        </p>
        <h1 className="mt-3 font-display text-5xl md:text-6xl leading-[1.05]">
          From the hills of Ilocos to the coast of Florida.
        </h1>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 md:px-8">
        <Photo
          src={IMAGES.chefKitchen}
          alt="Chef in the Bagnetchon kitchen"
          aspect="16/10"
          rounded="rounded-tl-[2.5rem] rounded-br-[2.5rem]"
          eager
        />
        <div className="prose-bagnet mt-10 space-y-6 text-lg leading-relaxed text-foreground/90">
          <p>
            Bagnetchon was born from an obsession. Our Ilocano chef-formulator
            grew up on bagnet — the crackle, the marrow-soft fat, the Sunday
            crowd around the table. But the deep fryer always felt at odds
            with the freshness he wanted.
          </p>
          <p>
            So he rebuilt it. An organic process, long marination with
            probiotic herbs and spices, and meticulous humidity and
            temperature control. No shortcuts. No deep frying. The skin still
            shatters — but the meat stays light, and you can taste every herb.
          </p>
          <p>
            We're a family-run operation, proud of our Filipino diaspora
            roots. Every batch is small. Every lechon is hand-finished. And
            every fiesta we cater is a chance to share something we believe
            in: that bagnet, done right, is one of the great pleasures of
            Filipino food.
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

      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Photo src={IMAGES.teamEvent} alt="Team at an event" aspect="1/1" rounded="rounded-tl-[2rem] rounded-br-[2rem]" />
          <Photo src={IMAGES.teamBooth} alt="Pop-up booth" aspect="1/1" rounded="rounded-tr-[2rem] rounded-bl-[2rem]" />
          <Photo src={IMAGES.teamAward} alt="Team with award" aspect="1/1" rounded="rounded-tl-[2rem] rounded-br-[2rem]" />
          <Photo src={IMAGES.lechonDisplay} alt="Lechon display" aspect="1/1" rounded="rounded-tr-[2rem] rounded-bl-[2rem]" />
        </div>
      </section>
    </div>
  );
}
