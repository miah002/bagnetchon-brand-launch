export const IMAGES = {
  hero: "/images/hero-whole-lechon.jpg",
  lechonCloseup: "/images/lechon-closeup.jpg",
  lechonDisplay: "/images/lechon-display.jpg",
  sisigBagnet: "/images/sisig-bagnet.jpg",
  dinakdakan: "/images/dinakdakan.jpg",
  bagnetCloseup: "/images/bagnet-closeup.jpg",
  dishPlatter: "/images/dish-platter.jpg",
  kareKare: "/images/kare-kare-spread.jpg",
  fiestaSpread: "/images/fiesta-spread.jpg",
  tastingBowls: "/images/tasting-bowls.jpg",
  chefKitchen: "/images/chef-kitchen.jpg",
  teamEvent: "/images/team-event.jpg",
  teamBooth: "/images/team-booth.jpg",
  teamAward: "/images/team-award.jpg",
  logo: "/images/logo-bagnetchon.jpg",
} as const;

export type ImageKey = keyof typeof IMAGES;
