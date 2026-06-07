export const SITE = {
  name: "Bagnetchon",
  tagline: "Crispy. Crackling. Criminally Good.",
  phone: "(562) 544-9882",
  phoneE164: "+15625449882",
  emailHello: "bagnetchon@gmail.com",
  emailCatering: "bagnetchon@gmail.com",
};

export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
}) {
  const fullTitle = `${opts.title} — Bagnetchon`;
  return {
    meta: [
      { title: fullTitle },
      { name: "description", content: opts.description },
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: opts.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: opts.path },
      ...(opts.image
        ? [
            { property: "og:image", content: opts.image },
            { name: "twitter:image", content: opts.image },
          ]
        : []),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: opts.description },
    ],
    links: [{ rel: "canonical", href: opts.path }],
  };
}

export const LOCAL_BUSINESS_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Bagnetchon",
  description:
    "Bagnet + Lechon — organic process, probiotic herbs & spices, meticulous humidity & temperature control.",
  telephone: SITE.phone,
  email: SITE.emailHello,
  servesCuisine: "Filipino",
  priceRange: "$$",
  areaServed: ["Anaheim", "Fullerton", "Garden Grove", "Irvine", "Cerritos", "West Covina", "Pomona", "Los Angeles"],
  address: {
    "@type": "PostalAddress",
    addressRegion: "CA",
    addressCountry: "US",
    addressLocality: "Anaheim",
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Friday", "Saturday", "Sunday"],
      opens: "11:00",
      closes: "20:00",
    },
  ],
};
