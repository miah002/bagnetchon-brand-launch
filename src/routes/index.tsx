import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Star } from "lucide-react";
import { Photo } from "@/components/Photo";
import { BaybayinWatermark } from "@/components/BaybayinWatermark";
import { SignatureCarousel } from "@/components/SignatureCarousel";
import { MessageUsHub } from "@/components/MessageUsHub";
import { ChiliDivider } from "@/components/Ornaments";
import { IMAGES } from "@/data/images";
import { MENU } from "@/data/menu";
import { useCart, formatPrice } from "@/context/CartContext";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { useState } from "react";
import { pageMeta } from "@/lib/seo";
import { subscribeEmail } from "@/lib/subscribers";
import { detectSource } from "@/lib/source";

export const Route = createFileRoute("/")({
  head: () =>
    pageMeta({
      title: "Crispy. Crackling. Criminally Good.",
      description:
        "Bagnet + Lechon in Anaheim, CA. Organic process, probiotic herbs & spices, meticulous humidity & temperature control. Order online or book catering.",
      path: "/",
      image: IMAGES.hero,
    }),
  component: Home,
});

const BESTSELLER_IDS = [
  "lechon-classic-full",
  "lechon-classic-pack",
  "lechon-spicy-full",
  "lechon-spicy-half",
];

function Home() {
  const ref = useScrollReveal();
  const { add } = useCart();
  const [subbed, setSubbed] = useState(false);
  const [subError, setSubError] = useState(false);

  const bestsellers = BESTSELLER_IDS.map((id) => MENU.find((m) => m.id === id)!);

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>}>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <BaybayinWatermark
          glyph="ᜊ"
          className="-left-16 top-10 text-foreground"
          size="text-[26rem]"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 md:grid-cols-12 md:gap-12 md:px-8 md:pb-28 md:pt-16">
          <div className="md:col-span-6">
            <p className="font-display text-xs uppercase tracking-[0.35em] text-primary">
              From the hills of Ilocos to the heart of California
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl md:text-7xl">
              Crispy.
              <br />
              Crackling.
              <br />
              <span className="text-brand-red">Criminally Good.</span>
            </h1>
            <p
              aria-hidden="true"
              className="mt-4 font-[Noto_Sans_Tagalog] text-lg text-muted-foreground"
            >
              ᜊᜄ᜔ᜈᜒᜆ᜔ᜎᜒᜆ᜔ᜐᜓᜈ᜔
            </p>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Bagnet + Lechon. An Ilocano chef-formulator's healthier take — long-marinated,
              slow-rendered, never deep-fried. Quality you can crunch.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/menu"
                className="btn-sheen inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-warm"
              >
                Order Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/catering"
                className="inline-flex items-center gap-2 rounded-full border-2 border-foreground px-6 py-3 font-semibold hover:bg-foreground hover:text-background"
              >
                Cater Your Event
              </Link>
            </div>
          </div>

          <div className="relative md:col-span-6">
            <div className="absolute -left-6 -top-6 hidden h-32 w-32 rounded-full bg-accent/40 blur-2xl md:block" />
            <Photo
              src={IMAGES.hero}
              alt="A whole lechon, glass-crackling skin, fresh from the spit"
              aspect="4/5"
              rounded="rounded-tl-[3rem] rounded-br-[3rem]"
              eager
              className="bronze-frame shadow-warm"
            />
            <div className="absolute -bottom-6 -right-2 hidden rounded-2xl bg-card p-4 shadow-ambient md:block">
              <p className="font-display text-sm uppercase tracking-widest text-primary">
                Glass crackle
              </p>
              <p className="text-xs text-muted-foreground">Audible at 6 ft.</p>
            </div>
          </div>
        </div>
      </section>

      <ChiliDivider className="reveal mx-auto max-w-7xl px-4 pt-6 md:px-8" />

      {/* SIGNATURE ROSTER */}
      <div className="reveal py-12 md:py-20">
        <SignatureCarousel />
      </div>

      {/* OUR STORY */}
      <section
        aria-labelledby="story-heading"
        className="relative overflow-hidden bg-secondary py-16 md:py-24"
      >
        <BaybayinWatermark
          glyph="ᜆ"
          className="-right-10 bottom-0 text-foreground"
          size="text-[22rem]"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 md:grid-cols-2 md:px-8">
          <div className="reveal">
            <Photo
              src={IMAGES.chefKitchenReal}
              alt="Chef Chedie and Mel Narcelles in the Bagnetchon kitchen"
              aspect="4/5"
              rounded="rounded-tr-[2.5rem] rounded-bl-[2.5rem]"
            />
          </div>
          <div className="reveal">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">
              Our Story
            </p>
            <h2 id="story-heading" className="mt-3 font-display text-4xl md:text-5xl">
              A healthier bagnet, reinvented in Anaheim, CA.
            </h2>
            <p className="mt-5 text-muted-foreground">
              Our Ilocano chef-formulator threw out the deep fryer and rebuilt bagnet from the
              ground up — an organic process, long marinations with probiotic herbs &amp; spices,
              meticulous humidity and temperature control. The result is shatter-crisp without the
              guilt, and a flavor that travels straight from the hills of Ilocos to your table.
            </p>
            <p className="mt-4 font-display text-lg italic text-foreground">
              "Bagnet + Lechon — quality you can crunch."
            </p>
            <Link
              to="/our-story"
              className="mt-6 inline-flex items-center gap-2 font-semibold text-primary hover:underline"
            >
              Learn More <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* BESTSELLERS */}
      <section aria-labelledby="best-heading" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">
              Weekend Bestsellers
            </p>
            <h2 id="best-heading" className="mt-2 font-display text-3xl md:text-5xl">
              What sells out by Saturday night.
            </h2>
          </div>
          <Link to="/menu" className="text-sm font-semibold text-primary hover:underline">
            See full menu →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestsellers.map((item, i) => (
            <article
              key={item.id}
              className="reveal group flex flex-col overflow-hidden rounded-2xl bg-card shadow-ambient transition-all duration-300 hover:-translate-y-1 hover:shadow-warm"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="relative">
                <Photo
                  src={item.image}
                  alt={item.name}
                  aspect="1/1"
                  rounded={
                    i % 2 === 0
                      ? "rounded-none rounded-tl-[2rem] rounded-br-[2rem]"
                      : "rounded-none rounded-tr-[2rem] rounded-bl-[2rem]"
                  }
                />
                {item.badge && (
                  <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wider text-accent-foreground">
                    {item.badge}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-xl">{item.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-display text-lg font-semibold text-primary">
                    {formatPrice(item.price ?? 0)}
                  </span>
                  <button
                    type="button"
                    onClick={() => add(item.id)}
                    className="btn-sheen rounded-full bg-foreground px-4 py-2 text-xs font-semibold uppercase tracking-wider text-background hover:bg-brand-red"
                  >
                    Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CATERING BANNER */}
      <section className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="reveal bronze-frame wood-surface corner-socket relative grid overflow-hidden rounded-3xl text-brand-cream md:grid-cols-2">
          <img src={IMAGES.ornamentCornerV2} alt="" aria-hidden="true" className="corner-art corner-art-tl" />
          <img src={IMAGES.ornamentCornerV2} alt="" aria-hidden="true" className="corner-art corner-art-tr" />
          <img src={IMAGES.ornamentCornerV2} alt="" aria-hidden="true" className="corner-art corner-art-bl" />
          <img src={IMAGES.ornamentCornerV2} alt="" aria-hidden="true" className="corner-art corner-art-br" />
          <Photo
            src={IMAGES.teamEvent}
            alt="Bagnetchon catering at a Filipino fiesta"
            aspect="4/3"
            rounded="rounded-none"
          />
          <div className="relative z-10 flex flex-col justify-center p-8 md:p-12">
            <p className="font-display text-sm uppercase tracking-[0.3em] text-accent">Catering</p>
            <h2 className="embossed mt-3 font-display text-4xl md:text-5xl">
              Feed your fiesta — 10 to 500 guests.
            </h2>
            <p className="mt-4 text-brand-cream/80">
              Birthdays, weddings, corporate, debuts. We bring the lechon, the crackle, and the
              lola-approved dipping sauces.
            </p>
            <Link
              to="/catering"
              className="btn-sheen mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-accent-foreground"
            >
              Inquire Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section aria-labelledby="gallery-heading" className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="reveal">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">
            From our kitchen
          </p>
          <h2 id="gallery-heading" className="mt-2 font-display text-3xl md:text-5xl">
            A scrapbook of crackle.
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Photo
            src={IMAGES.dishPlatter}
            alt="Bagnet pinakbet platter"
            aspect="3/4"
            rounded="rounded-tl-[2rem] rounded-br-[2rem]"
            className="reveal"
          />
          <Photo
            src={IMAGES.teamBooth}
            alt="Bagnetchon pop-up booth"
            aspect="3/4"
            rounded="rounded-tr-[2rem] rounded-bl-[2rem] md:mt-10"
            className="reveal"
          />
          <Photo
            src={IMAGES.tastingBowls}
            alt="Tasting bowls"
            aspect="3/4"
            rounded="rounded-tl-[2rem] rounded-br-[2rem]"
            className="reveal"
          />
          <Photo
            src={IMAGES.teamAward}
            alt="Team holding award"
            aspect="3/4"
            rounded="rounded-tr-[2rem] rounded-bl-[2rem] md:mt-10"
            className="reveal"
          />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            {
              q: "The crackle is unreal. Brought back memories of my lola's kitchen — but lighter, somehow.",
              n: "Maria S.",
              loc: "Coral Springs",
            },
            {
              q: "Catered our 80-person debut. The whole lechon got a standing ovation. I'm not kidding.",
              n: "James T.",
              loc: "Irvine, CA",
            },
          ].map((t) => (
            <figure
              key={t.n}
              className="reveal rounded-2xl border border-border bg-card p-8 shadow-ambient"
            >
              <div className="flex gap-1 text-accent" aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 font-display text-2xl leading-snug">"{t.q}"</blockquote>
              <figcaption className="mt-4 text-sm text-muted-foreground">
                — {t.n}, {t.loc}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* WHERE WE CRACKLE */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-8">
        <div className="reveal">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">
            Where we crackle
          </p>
          <h2 className="mt-2 font-display text-3xl md:text-5xl">
            Southern California, end to end.
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              ["Orange County", "Anaheim · Irvine · Garden Grove"],
              ["Los Angeles", "LA · Cerritos · West Covina"],
              ["Inland Empire", "Pomona · Fullerton · Catering"],
            ].map(([area, info]) => (
              <li
                key={area}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4"
              >
                <span className="font-display text-lg font-semibold">{area}</span>
                <span className="text-sm text-muted-foreground">{info}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="mx-auto max-w-3xl px-4 py-16 text-center md:px-8">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-primary">Lechon Drops</p>
        <h2 className="mt-2 font-display text-3xl md:text-4xl">
          New batches, weekend menus, fiesta deals.
        </h2>
        <form
          className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row"
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const email = String(fd.get("email") ?? "");
            const hp = String(fd.get("company") ?? "");
            setSubError(false);
            try {
              await subscribeEmail(email, detectSource(), hp);
              setSubbed(true);
            } catch {
              setSubError(true);
            }
          }}
        >
          <label htmlFor="newsletter" className="sr-only">
            Email
          </label>
          {/* Honeypot: hidden from users; bots that fill it are rejected server-side. */}
          <input
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
          />
          <input
            id="newsletter"
            type="email"
            name="email"
            required
            placeholder="you@email.com"
            className="flex-1 rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            className="btn-sheen rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            Join
          </button>
        </form>
        {subbed && <p className="mt-3 text-sm text-brand-green">Thank you! You're on the list.</p>}
        {subError && (
          <p role="alert" className="mt-3 text-sm text-destructive">
            Something went wrong — please try again.
          </p>
        )}
      </section>

      {/* MESSAGE US */}
      <div className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <MessageUsHub />
      </div>
    </div>
  );
}
