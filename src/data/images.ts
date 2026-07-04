export const IMAGES = {
  hero: "/images/hero-whole-lechon.jpg",
  lechonCloseup: "/images/lechon-closeup.jpg",
  lechonDisplay: "/images/lechon-display.jpg",
  sisigBagnet: "/images/sisig-bagnet.jpg",
  bagnetCloseup: "/images/bagnet-closeup.jpg",
  dishPlatter: "/images/dish-platter.jpg",
  kareKare: "/images/kare-kare-spread.jpg",
  fiestaSpread: "/images/fiesta-spread.jpg",
  tastingBowls: "/images/tasting-bowls.jpg",
  chefKitchen: "/images/chef-kitchen.jpg",
  teamEvent: "/images/team-event.jpg",
  teamBooth: "/images/team-booth.jpg",
  teamAward: "/images/team-award.jpg",
  logo: "/images/logo-bagnetchon.png",
  // Authentic brand photos (founders, kitchen, live carving)
  chefKitchenReal: "/images/chef-kitchen-real.jpg",
  chefPortrait: "/images/chef-portrait.jpg",
  founders: "/images/founders.jpg",
  foundersCouple: "/images/founders-couple.jpg",
  foundersLechon: "/images/founders-lechon.jpg",
  cateringLechon: "/images/catering-lechon.jpg",
  cateringCarving: "/images/catering-carving.jpg",
  // Real catering event photos (client-supplied)
  cateringHero: "/images/catering-hero.jpg",
  cateringWedding: "/images/catering-wedding.jpg",
  cateringCrowd: "/images/catering-crowd.jpg",
  cateringCenterpiece: "/images/catering-centerpiece.jpg",
  cateringService: "/images/catering-service.jpg",
  cateringCouple: "/images/catering-couple.jpg",
  // Real dish photos (cropped from product sheets)
  menuSisig: "/images/sisig-bagnet.jpg",
  menuSarsa: "/images/menu-sarsa.jpg",
  // Updated real menu photos (client-supplied 2026-07, optimized ≤1200px)
  dishBellyHalf: "/images/dishes/half-lechon-belly.jpg",
  dishBellyFull: "/images/dishes/whole-lechon-belly.jpg",
  dishBellyTruffle1: "/images/dishes/truffled-lechon-belly-1.jpg",
  dishBellyTruffle2: "/images/dishes/truffled-lechon-belly-2.jpg",
  dishCochinillo1: "/images/dishes/cochinillo-1.jpg",
  dishDeLeche1: "/images/dishes/lechon-de-leche-1.jpg",
  dishLechonMedium: "/images/dishes/medium-lechon.jpg",
  dishLechonLarge: "/images/dishes/large-lechon.jpg",
  dishLechonXL1: "/images/dishes/xl-lechon-1.jpg",
  // Ornaments (transparent PNG art)
  ornamentCorner: "/images/ornament-corner.png",
  ornamentCornerV2: "/images/ornament-corner-v2.png",
  frameRail: "/images/frame-rail.png",
  // Seamless skeuomorphic textures (carved wood damask + woven parchment)
  textureWood: "/images/texture-wood.jpg",
  textureParchment: "/images/texture-parchment.jpg",
} as const;

export type ImageKey = keyof typeof IMAGES;
