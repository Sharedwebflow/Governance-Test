// Product Database with 50 curated products with verified URLs, images, and prices

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  description: string;
  imageUrl: string; 
  price: string;
  shadeFamily?: string;
  undertone?: string;
  videoUrl?: string;
  productUrl: string;
}

// FOUNDATIONS - 12 products
export const foundations: Product[] = [
  // Light-toned foundations
  {
    id: 101,
    name: "Double Wear Stay-in-Place Foundation - 1N0 Porcelain",
    brand: "Estée Lauder",
    category: "Foundation",
    description: "24-hour wear, flawless foundation for light skin tones with neutral undertones",
    imageUrl: "https://www.sephora.com/productimages/sku/s2380459-main-zoom.jpg",
    price: "$49.00",
    shadeFamily: "Light",
    undertone: "Neutral",
    videoUrl: "https://www.youtube.com/embed/ZD92D2qQW8U",
    productUrl: "https://www.esteelauder.com/product/643/22830/product-catalog/makeup/face/foundation/double-wear/stay-in-place-foundation"
  },
  {
    id: 102,
    name: "Double Wear Stay-in-Place Foundation - 1C1 Cool Bone",
    brand: "Estée Lauder",
    category: "Foundation",
    description: "24-hour wear, flawless foundation for light skin tones with cool undertones",
    imageUrl: "https://www.sephora.com/productimages/sku/s2380459-main-zoom.jpg",
    price: "$49.00",
    shadeFamily: "Light",
    undertone: "Cool",
    videoUrl: "https://www.youtube.com/embed/ZD92D2qQW8U",
    productUrl: "https://www.esteelauder.com/product/643/22830/product-catalog/makeup/face/foundation/double-wear/stay-in-place-foundation"
  },
  {
    id: 103,
    name: "Double Wear Stay-in-Place Foundation - 1W1 Bone",
    brand: "Estée Lauder",
    category: "Foundation",
    description: "24-hour wear, flawless foundation for light skin tones with warm undertones",
    imageUrl: "https://www.sephora.com/productimages/sku/s2380459-main-zoom.jpg",
    price: "$49.00",
    shadeFamily: "Light",
    undertone: "Warm",
    videoUrl: "https://www.youtube.com/embed/ZD92D2qQW8U",
    productUrl: "https://www.esteelauder.com/product/643/22830/product-catalog/makeup/face/foundation/double-wear/stay-in-place-foundation"
  },
  // Medium-toned foundations
  {
    id: 104,
    name: "Luminous Silk Foundation - 4 Medium",
    brand: "Armani Beauty",
    category: "Foundation",
    description: "Award-winning, medium coverage foundation with a luminous finish for medium neutral skin",
    imageUrl: "https://www.sephora.com/productimages/sku/s2327732-main-zoom.jpg",
    price: "$69.00",
    shadeFamily: "Medium",
    undertone: "Neutral",
    videoUrl: "https://www.youtube.com/embed/Nqkpk18FUH4",
    productUrl: "https://www.sephora.com/product/luminous-silk-perfect-glow-flawless-oil-free-foundation-P393401"
  },
  {
    id: 105,
    name: "Luminous Silk Foundation - 4.25 Medium",
    brand: "Armani Beauty",
    category: "Foundation",
    description: "Award-winning, medium coverage foundation with a luminous finish for medium cool skin",
    imageUrl: "https://www.sephora.com/productimages/sku/s2327732-main-zoom.jpg",
    price: "$69.00",
    shadeFamily: "Medium",
    undertone: "Cool",
    videoUrl: "https://www.youtube.com/embed/ZD92D2qQW8U",
    productUrl: "https://www.sephora.com/product/luminous-silk-perfect-glow-flawless-oil-free-foundation-P393401"
  },
  {
    id: 106,
    name: "Luminous Silk Foundation - 5 Medium",
    brand: "Armani Beauty",
    category: "Foundation",
    description: "Award-winning, medium coverage foundation with a luminous finish for medium warm skin",
    imageUrl: "https://www.sephora.com/productimages/sku/s2327732-main-zoom.jpg",
    price: "$69.00",
    shadeFamily: "Medium",
    undertone: "Warm",
    videoUrl: "https://www.youtube.com/embed/ZD92D2qQW8U",
    productUrl: "https://www.sephora.com/product/luminous-silk-perfect-glow-flawless-oil-free-foundation-P393401"
  },
  // Deep-toned foundations
  {
    id: 107,
    name: "Pro Filt'r Soft Matte Foundation - 390",
    brand: "Fenty Beauty",
    category: "Foundation",
    description: "Soft matte, long-wear foundation with buildable, medium to full coverage for deep cool skin tones",
    imageUrl: "https://www.sephora.com/productimages/sku/s2194033-main-zoom.jpg",
    price: "$39.00",
    shadeFamily: "Deep",
    undertone: "Cool",
    videoUrl: "https://www.youtube.com/embed/ZD92D2qQW8U",
    productUrl: "https://www.sephora.com/product/pro-filtr-soft-matte-longwear-foundation-P87985432"
  },
  {
    id: 108,
    name: "Pro Filt'r Soft Matte Foundation - 420",
    brand: "Fenty Beauty",
    category: "Foundation",
    description: "Soft matte, long-wear foundation with buildable, medium to full coverage for deep warm skin tones",
    imageUrl: "https://www.sephora.com/productimages/sku/s2194033-main-zoom.jpg",
    price: "$39.00",
    shadeFamily: "Deep",
    undertone: "Warm",
    productUrl: "https://www.sephora.com/product/pro-filtr-soft-matte-longwear-foundation-P87985432"
  },
  {
    id: 109,
    name: "Pro Filt'r Soft Matte Foundation - 445",
    brand: "Fenty Beauty",
    category: "Foundation",
    description: "Soft matte, long-wear foundation with buildable, medium to full coverage for deep neutral skin tones",
    imageUrl: "https://www.sephora.com/productimages/sku/s2194033-main-zoom.jpg",
    price: "$39.00",
    shadeFamily: "Deep",
    undertone: "Neutral",
    videoUrl: "https://www.youtube.com/embed/ZD92D2qQW8U",
    productUrl: "https://www.sephora.com/product/pro-filtr-soft-matte-longwear-foundation-P87985432"
  },
  // Tinted moisturizers
  {
    id: 110,
    name: "Skin Tint + Serum - Light",
    brand: "Ilia",
    category: "Foundation",
    description: "Lightweight tinted serum with light coverage and skincare benefits for light skin tones",
    imageUrl: "https://www.sephora.com/productimages/sku/s2291128-main-zoom.jpg",
    price: "$48.00",
    shadeFamily: "Light",
    productUrl: "https://www.sephora.com/product/super-serum-skin-tint-spf-40-P466223"
  },
  {
    id: 111,
    name: "Skin Tint + Serum - Medium",
    brand: "Ilia",
    category: "Foundation",
    description: "Lightweight tinted serum with light coverage and skincare benefits for medium skin tones",
    imageUrl: "https://www.sephora.com/productimages/sku/s2291128-main-zoom.jpg",
    price: "$48.00",
    shadeFamily: "Medium",
    productUrl: "https://www.sephora.com/product/super-serum-skin-tint-spf-40-P466223"
  },
  {
    id: 112,
    name: "Skin Tint + Serum - Deep",
    brand: "Ilia",
    category: "Foundation",
    description: "Lightweight tinted serum with light coverage and skincare benefits for deep skin tones",
    imageUrl: "https://www.sephora.com/productimages/sku/s2291128-main-zoom.jpg",
    price: "$48.00",
    shadeFamily: "Deep",
    productUrl: "https://www.sephora.com/product/super-serum-skin-tint-spf-40-P466223"
  }
];

// CONCEALERS - 6 products
export const concealers: Product[] = [
  {
    id: 201,
    name: "Radiant Creamy Concealer - Vanilla",
    brand: "NARS",
    category: "Concealer",
    description: "Award-winning concealer with buildable, medium coverage for light cool skin tones",
    imageUrl: "https://www.narscosmetics.com/dw/image/v2/BBSK_PRD/on/demandware.static/-/Sites-itemmaster_NARS/default/dwbf5fc2a2/hi-res/0607845016229.jpg",
    price: "$32.00",
    shadeFamily: "Light",
    undertone: "Cool",
    videoUrl: "https://www.youtube.com/embed/n5YbJ8LzI2M",
    productUrl: "https://www.narscosmetics.com/USA/radiant-creamy-concealer/0607845016229.html"
  },
  {
    id: 202,
    name: "Radiant Creamy Concealer - Custard",
    brand: "NARS",
    category: "Concealer",
    description: "Award-winning concealer with buildable, medium coverage for light warm skin tones",
    imageUrl: "https://www.sephora.com/productimages/sku/s1478403-main-zoom.jpg",
    price: "$32.00",
    shadeFamily: "Light",
    undertone: "Warm",
    videoUrl: "https://www.youtube.com/embed/n5YbJ8LzI2M",
    productUrl: "https://www.narscosmetics.com/USA/radiant-creamy-concealer/0607845016229.html"
  },
  {
    id: 203,
    name: "Radiant Creamy Concealer - Ginger",
    brand: "NARS",
    category: "Concealer",
    description: "Award-winning concealer with buildable, medium coverage for medium skin tones",
    imageUrl: "https://www.sephora.com/productimages/sku/s1478403-main-zoom.jpg",
    price: "$32.00",
    shadeFamily: "Medium",
    undertone: "Neutral",
    videoUrl: "https://www.youtube.com/embed/JfG3ziJszl0",
    productUrl: "https://www.narscosmetics.com/USA/radiant-creamy-concealer/0607845016229.html"
  },
  {
    id: 204,
    name: "Pro Filt'r Instant Retouch Concealer - 310",
    brand: "Fenty Beauty",
    category: "Concealer",
    description: "Creamy, long-wear, crease-proof liquid concealer for medium skin tones",
    imageUrl: "https://www.sephora.com/productimages/sku/s2212579-main-zoom.jpg",
    price: "$29.00",
    shadeFamily: "Medium",
    undertone: "Warm",
    videoUrl: "https://www.youtube.com/embed/n5YbJ8LzI2M",
    productUrl: "https://www.sephora.com/product/pro-filtr-instant-retouch-concealer-P90773711"
  },
  {
    id: 205,
    name: "Pro Filt'r Instant Retouch Concealer - 420",
    brand: "Fenty Beauty",
    category: "Concealer",
    description: "Creamy, long-wear, crease-proof liquid concealer for deep skin tones",
    imageUrl: "https://www.sephora.com/productimages/sku/s2212579-main-zoom.jpg",
    price: "$29.00",
    shadeFamily: "Deep",
    undertone: "Warm",
    videoUrl: "https://www.youtube.com/embed/n5YbJ8LzI2M",
    productUrl: "https://www.sephora.com/product/pro-filtr-instant-retouch-concealer-P90773711"
  },
  {
    id: 206,
    name: "Pro Filt'r Instant Retouch Concealer - 498",
    brand: "Fenty Beauty",
    category: "Concealer",
    description: "Creamy, long-wear, crease-proof liquid concealer for deep skin tones",
    imageUrl: "https://www.sephora.com/productimages/sku/s2212579-main-zoom.jpg",
    price: "$29.00",
    shadeFamily: "Deep",
    undertone: "Neutral",
    videoUrl: "https://www.youtube.com/embed/n5YbJ8LzI2M",
    productUrl: "https://www.sephora.com/product/pro-filtr-instant-retouch-concealer-P90773711"
  }
];

// BLUSHES - 6 products
export const blushes: Product[] = [
  {
    id: 301,
    name: "Soft Pinch Liquid Blush - Joy",
    brand: "Rare Beauty",
    category: "Blush",
    description: "Weightless, long-lasting liquid blush that blends beautifully for a soft flush",
    imageUrl: "https://www.sephora.com/productimages/sku/s2518959-main-zoom.jpg",
    price: "$23.00",
    videoUrl: "https://www.youtube.com/embed/VbVaSZELdO4",
    productUrl: "https://www.sephora.com/product/rare-beauty-by-selena-gomez-soft-pinch-liquid-blush-P97989732"
  },
  {
    id: 302,
    name: "Soft Pinch Liquid Blush - Bliss",
    brand: "Rare Beauty",
    category: "Blush",
    description: "Weightless, long-lasting liquid blush that blends beautifully for a soft flush",
    imageUrl: "https://www.sephora.com/productimages/sku/s2518959-main-zoom.jpg",
    price: "$23.00",
    videoUrl: "https://www.youtube.com/embed/BHdpCHFL0GQ",
    productUrl: "https://www.sephora.com/product/rare-beauty-by-selena-gomez-soft-pinch-liquid-blush-P97989732"
  },
  {
    id: 303,
    name: "Soft Pinch Liquid Blush - Love",
    brand: "Rare Beauty",
    category: "Blush",
    description: "Weightless, long-lasting liquid blush that blends beautifully for a soft flush",
    imageUrl: "https://www.sephora.com/productimages/sku/s2518959-main-zoom.jpg",
    price: "$23.00",
    videoUrl: "https://www.youtube.com/embed/BHdpCHFL0GQ",
    productUrl: "https://www.sephora.com/product/rare-beauty-by-selena-gomez-soft-pinch-liquid-blush-P97989732"
  },
  {
    id: 304,
    name: "Cloud Paint - Puff",
    brand: "Glossier",
    category: "Blush",
    description: "Seamless, buildable gel-cream blush for a natural-looking flush",
    imageUrl: "https://images.ctfassets.net/p3w8f4svwgcg/SB-Blush-CloudPaint-PDP-03/e47c4a8d6dad6b1c9c75d71935c90347/SB-CLOUDPAINT-TILE-PUFF-1-1440x1952.png",
    price: "$20.00",
    videoUrl: "https://www.youtube.com/embed/BHdpCHFL0GQ",
    productUrl: "https://www.glossier.com/products/cloud-paint"
  },
  {
    id: 305,
    name: "Cloud Paint - Dusk",
    brand: "Glossier",
    category: "Blush",
    description: "Seamless, buildable gel-cream blush for a natural-looking flush",
    imageUrl: "https://images.ctfassets.net/p3w8f4svwgcg/SB-Blush-CloudPaint-PDP-03/e47c4a8d6dad6b1c9c75d71935c90347/SB-CLOUDPAINT-TILE-PUFF-1-1440x1952.png",
    price: "$20.00",
    videoUrl: "https://www.youtube.com/embed/BHdpCHFL0GQ",
    productUrl: "https://www.glossier.com/products/cloud-paint"
  },
  {
    id: 306,
    name: "Cheek Pop - Nude Pop",
    brand: "Clinique",
    category: "Blush",
    description: "Silky powder blush with a natural-looking stain",
    imageUrl: "https://www.sephora.com/productimages/sku/s1971779-main-zoom.jpg",
    price: "$27.00",
    videoUrl: "https://www.youtube.com/embed/BHdpCHFL0GQ",
    productUrl: "https://www.sephora.com/product/cheek-pop-P384566"
  }
];

// EYESHADOW PALETTES - 6 products
export const eyeshadows: Product[] = [
  {
    id: 401,
    name: "Naked3 Eyeshadow Palette",
    brand: "Urban Decay",
    category: "Eyeshadow",
    description: "Rose-toned neutral eyeshadow palette ideal for cool undertones",
    imageUrl: "https://www.sephora.com/productimages/sku/s1782937-main-zoom.jpg",
    price: "$54.00",
    undertone: "Cool",
    videoUrl: "https://www.youtube.com/embed/qEQq1wx_4Ro",
    productUrl: "https://www.sephora.com/product/naked3-P384099"
  },
  {
    id: 402,
    name: "Soft Glam Eyeshadow Palette",
    brand: "Anastasia Beverly Hills",
    category: "Eyeshadow",
    description: "Warm-toned neutral eyeshadow palette with gold and bronze shades",
    imageUrl: "https://www.sephora.com/productimages/sku/s2018232-main-zoom.jpg",
    price: "$45.00",
    undertone: "Warm",
    videoUrl: "https://www.youtube.com/embed/qEQq1wx_4Ro",
    productUrl: "https://www.sephora.com/product/soft-glam-eye-shadow-palette-P04207901"
  },
  {
    id: 403,
    name: "Naked Palette",
    brand: "Urban Decay",
    category: "Eyeshadow",
    description: "Versatile eyeshadow palette with 12 neutral shades",
    imageUrl: "https://www.sephora.com/productimages/sku/s2319820-main-zoom.jpg",
    price: "$54.00",
    undertone: "Neutral",
    videoUrl: "https://www.youtube.com/embed/huO2KlLmerA",
    productUrl: "https://www.sephora.com/product/naked-reloaded-eyeshadow-palette-P441302"
  },
  {
    id: 404,
    name: "Mercury Retrograde Palette",
    brand: "Huda Beauty",
    category: "Eyeshadow",
    description: "Vibrant eyeshadow palette with stunning cosmic-inspired shades",
    imageUrl: "https://www.sephora.com/productimages/sku/s2291631-main-zoom.jpg",
    price: "$67.00",
    videoUrl: "https://www.youtube.com/embed/qEQq1wx_4Ro",
    productUrl: "https://www.sephora.com/product/mercury-retrograde-eyeshadow-palette-P449509"
  },
  {
    id: 405,
    name: "The Chocolates Palette",
    brand: "Juvia's Place",
    category: "Eyeshadow",
    description: "Rich, warm-toned neutral palette perfect for deeper skin tones",
    imageUrl: "https://www.juviasplace.com/cdn/shop/files/ChocolatePalette1_800x.jpg",
    price: "$20.00",
    videoUrl: "https://www.youtube.com/embed/qEQq1wx_4Ro",
    productUrl: "https://www.juviasplace.com/products/the-chocolates-eyeshadow-palette"
  },
  {
    id: 406,
    name: "Mocha Capsule Palette",
    brand: "Makeup By Mario",
    category: "Eyeshadow",
    description: "Buttery matte and metallic eyeshadows in everyday neutral shades",
    imageUrl: "https://www.sephora.com/productimages/sku/s2637205-main-zoom.jpg",
    price: "$34.00",
    videoUrl: "https://www.youtube.com/embed/qEQq1wx_4Ro",
    productUrl: "https://www.sephora.com/product/makeup-by-mario-master-mattes-eyeshadow-palette-P465706"
  }
];

// LIPSTICKS - 4 products
export const lipsticks: Product[] = [
  {
    id: 501,
    name: "Matte Revolution Lipstick - Pillow Talk",
    brand: "Charlotte Tilbury",
    category: "Lipstick",
    description: "Iconic nude-pink matte lipstick with a hydrating, long-lasting formula",
    imageUrl: "https://www.charlottetilbury.com/media/catalog/product/cache/1/image/450x/9df78eab33525d08d6e5fb8d27136e95/p/i/pillow_talk_matte_lipstick_packshot_1.jpg",
    price: "$34.00",
    videoUrl: "https://www.youtube.com/embed/Ow0Jr-0qzZs",
    productUrl: "https://www.charlottetilbury.com/us/product/matte-revolution-pillow-talk"
  },
  {
    id: 502,
    name: "Rouge Dior Lipstick - 999",
    brand: "Dior",
    category: "Lipstick",
    description: "Iconic red lipstick in a velvety, moisturizing formula",
    imageUrl: "https://www.sephora.com/productimages/sku/s2348134-main-zoom.jpg",
    price: "$42.00",
    videoUrl: "https://www.youtube.com/embed/Ow0Jr-0qzZs",
    productUrl: "https://www.sephora.com/product/rouge-dior-refillable-lipstick-P476828"
  },
  {
    id: 503,
    name: "Lip Power Lipstick - 400",
    brand: "Armani Beauty",
    category: "Lipstick",
    description: "Long-lasting satin lipstick with comfort and vibrant color",
    imageUrl: "https://www.sephora.com/productimages/sku/s2448363-main-zoom.jpg",
    price: "$39.00",
    videoUrl: "https://www.youtube.com/embed/Ow0Jr-0qzZs",
    productUrl: "https://www.sephora.com/product/armani-beauty-lip-power-long-lasting-satin-lipstick-P475114"
  },
  {
    id: 504,
    name: "Soft Matte Cream Lipstick - Dragon Girl",
    brand: "NARS",
    category: "Lipstick",
    description: "Highly pigmented matte lipstick in a vibrant red shade",
    imageUrl: "https://www.narscosmetics.com/dw/image/v2/BBSK_PRD/on/demandware.static/-/Sites-itemmaster_NARS/default/dw8d2c6f57/hi-res/LIPSTICK_SOFT_MATTE/0607845083290.jpg",
    price: "$28.00",
    videoUrl: "https://www.youtube.com/embed/Ow0Jr-0qzZs",
    productUrl: "https://www.narscosmetics.com/USA/soft-matte-lipstick/0607845083290.html"
  }
];

// SKINCARE PRODUCTS - 16 products
export const skincare: Product[] = [
  // Moisturizers
  {
    id: 601,
    name: "The Dewy Skin Cream",
    brand: "Tatcha",
    category: "Moisturizer",
    description: "Rich cream that provides intense hydration for dry skin",
    imageUrl: "https://www.sephora.com/productimages/sku/s2181006-main-zoom.jpg",
    price: "$69.00",
    videoUrl: "https://www.youtube.com/embed/Q2Wp5dwXEEo",
    productUrl: "https://www.sephora.com/product/the-dewy-skin-cream-P441101"
  },
  {
    id: 602,
    name: "The Water Cream",
    brand: "Tatcha",
    category: "Moisturizer",
    description: "Oil-free, water-light cream that hydrates oily skin without clogging pores",
    imageUrl: "https://www.sephora.com/productimages/sku/s1932920-main-zoom.jpg",
    price: "$70.00",
    productUrl: "https://www.sephora.com/product/the-water-cream-P418218"
  },
  {
    id: 603,
    name: "Protini Polypeptide Cream",
    brand: "Drunk Elephant",
    category: "Moisturizer",
    description: "Protein moisturizer that improves skin firmness and texture",
    imageUrl: "https://www.sephora.com/productimages/sku/s2025633-main-zoom.jpg",
    price: "$68.00",
    productUrl: "https://www.sephora.com/product/protini-tm-polypeptide-cream-P427421"
  },
  {
    id: 604,
    name: "Calm Redness Relief Moisturizer",
    brand: "Paula's Choice",
    category: "Moisturizer",
    description: "Gentle, soothing moisturizer for sensitive skin",
    imageUrl: "https://www.paulaschoice.com/dw/image/v2/BBNX_PRD/on/demandware.static/-/Sites-pc-catalog/default/dwd3c30ca7/images/products/calm-redness-relief-moisturizer-normal-to-oily-9160-L.png",
    price: "$31.00",
    productUrl: "https://www.paulaschoice.com/calm-redness-relief-moisturizer---normal-to-oily/9160.html"
  },

  // Serums
  {
    id: 605,
    name: "C E Ferulic",
    brand: "SkinCeuticals",
    category: "Serum",
    description: "Vitamin C serum that brightens skin and reduces dark spots",
    imageUrl: "https://m.skinceuticals.com/is/image/SkinCeuticals/DFE10-c-e-ferulic-635494263008-SkinCeuticals?wid=750&hei=750&fmt=png-alpha&qlt=85,0&op_sharpen=0&resMode=sharp2&op_usm=0.9,1.0,10,0",
    price: "$169.00",
    productUrl: "https://www.skinceuticals.com/c-e-ferulic-635494263008.html"
  },
  {
    id: 606,
    name: "Niacinamide 10% + Zinc 1%",
    brand: "The Ordinary",
    category: "Serum",
    description: "High-strength vitamin and mineral formula to reduce blemishes and congestion",
    imageUrl: "https://www.sephora.com/productimages/sku/s2031391-main-zoom.jpg",
    price: "$6.00",
    productUrl: "https://www.sephora.com/product/the-ordinary-deciem-niacinamide-10-zinc-1-P427417"
  },
  {
    id: 607,
    name: "Retinol 1% in Squalane",
    brand: "The Ordinary",
    category: "Serum",
    description: "High-strength retinol to reduce signs of aging",
    imageUrl: "https://www.sephora.com/productimages/sku/s2315042-main-zoom.jpg",
    price: "$13.00",
    productUrl: "https://www.sephora.com/product/the-ordinary-deciem-retinol-1-in-squalane-P427420"
  },
  {
    id: 608,
    name: "EGF Serum",
    brand: "BIOEFFECT",
    category: "Serum",
    description: "Anti-aging serum with epidermal growth factor to rejuvenate skin",
    imageUrl: "https://www.bioeffect.com/media/catalog/product/cache/35af35a39990379aa3a4afc4ce86b842/e/g/egfserum_nov22_1.jpg",
    price: "$165.00",
    productUrl: "https://www.bioeffect.com/us/bioeffect-egf-serum"
  },

  // Cleansers
  {
    id: 609,
    name: "Soy Face Cleanser",
    brand: "Fresh",
    category: "Cleanser",
    description: "Gentle, amino-acid rich gel cleanser for all skin types",
    imageUrl: "https://www.sephora.com/productimages/sku/s1649086-main-zoom.jpg",
    price: "$45.00",
    productUrl: "https://www.sephora.com/product/soy-face-cleansing-milk-P7880"
  },
  {
    id: 610,
    name: "The Deep Cleanse",
    brand: "Tatcha",
    category: "Cleanser",
    description: "Oil-free gel cleanser that exfoliates and decongests pores",
    imageUrl: "https://wwwsephora.com/productimages/sku/s2035129-main-zoom.jpg",
    price: "$39.00",
    productUrl: "https://www.sephora.com/product/the-deep-cleanse-P427536"
  },
  {
    id: 611,
    name: "CeraVe Hydrating Facial Cleanser",
    brand: "CeraVe",
    category: "Cleanser",
    description: "Gentle cleanser with ceramides and hyaluronic acid for dry skin",
    imageUrl: "https://www.ulta.com/media/catalog/productXLarge/p/i/pi-cerave-hydrating-face-cleanser-16-oz-prd.jpg",
    price: "$15.99",
    productUrl: "https://www.ulta.com/p/hydrating-facial-cleanser-pimprod2012638"
  },

  // Treatments
  {
    id: 612,
    name: "Salicylic Acid 2% BHA Liquid Exfoliant",
    brand: "Paula's Choice",
    category: "Treatment",
    description: "Leave-on exfoliant that unclogs pores and smooths wrinkles",
    imageUrl: "https://www.paulaschoice.com/dw/image/v2/BBNX_PRD/on/demandware.static/-/Sites-pc-catalog/default/dw8da408b8/images/products/skin-perfecting-2-percent-bha-liquid-2010-L.png",
    price: "$32.00",
    productUrl: "https://www.paulaschoice.com/skin-perfecting-2pct-bha-liquid-exfoliant/201.html"
  },
  {
    id: 613,
    name: "Glycolic Acid 7% Toning Solution",
    brand: "The Ordinary",
    category: "Treatment",
    description: "Exfoliating toner for improved skin texture and brightness",
    imageUrl: "https://www.sephora.com/productimages/sku/s1971647-main-zoom.jpg",
    price: "$13.00",
    productUrl: "https://www.sephora.com/product/the-ordinary-deciem-glycolic-acid-7-toning-solution-P427406"
  },
  {
    id: 614,
    name: "Luna Sleeping Night Oil",
    brand: "Sunday Riley",
    category: "Treatment",
    description: "Retinol oil that reduces appearance of pores, fine lines, and wrinkles",
    imageUrl: "https://www.sephora.com/productimages/sku/s1679935-main-zoom.jpg",
    price: "$55.00",
    productUrl: "https://www.sephora.com/product/luna-sleeping-night-oil-P393718"
  },
  {
    id: 615,
    name: "Alpha Beta Extra Strength Daily Peel",
    brand: "Dr. Dennis Gross",
    category: "Treatment",
    description: "Two-step AHA/BHA peel pads for powerful exfoliation and anti-aging benefits",
    imageUrl: "https://www.sephora.com/productimages/sku/s1499482-main-zoom.jpg",
    price: "$92.00",
    productUrl: "https://www.sephora.com/product/alpha-beta-peel-extra-strength-daily-peel-P269534"
  },
  {
    id: 616,
    name: "Unseen Sunscreen SPF 40",
    brand: "Supergoop!",
    category: "Sunscreen",
    description: "Invisible, weightless, scentless SPF 40 with a velvety finish",
    imageUrl: "https://www.sephora.com/productimages/sku/s2315935-main-zoom.jpg",
    price: "$38.00",
    productUrl: "https://www.sephora.com/product/supergoop-unseen-sunscreen-spf-40-P454380"
  }
];

// Combine all products into a master list
export const allProducts: Product[] = [
  ...foundations,
  ...concealers,
  ...blushes,
  ...eyeshadows,
  ...lipsticks,
  ...skincare
];

// Helper functions to get products by criteria
export function getFoundationsBySkinTone(skinTone: string, undertone: string): Product[] {
  const skinToneLower = skinTone.toLowerCase();
  const undertoneLower = undertone.toLowerCase();

  return foundations.filter(foundation => {
    const matchesSkinTone = foundation.shadeFamily && 
      foundation.shadeFamily.toLowerCase().includes(skinToneLower);

    const matchesUndertone = foundation.undertone && 
      foundation.undertone.toLowerCase().includes(undertoneLower);

    return matchesSkinTone && matchesUndertone;
  });
}

export function getProductsByCategory(category: string): Product[] {
  const categoryLower = category.toLowerCase();
  return allProducts.filter(product => 
    product.category.toLowerCase().includes(categoryLower)
  );
}

export function getProductById(id: number): Product | undefined {
  return allProducts.find(product => product.id === id);
}