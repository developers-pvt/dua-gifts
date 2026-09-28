export interface MarketplaceProduct {
  id: string;
  marketplace: "Flipkart" | "Shopsy" | "Meesho" | "Amazon" | "Nykaa" | "Myntra";
  platformName: string;
  badge: string;
  title: string;
  category: "Electronics" | "Fashion & Ethnic" | "Jewelry & Watches" | "Beauty & Fragrance" | "Home & Decor" | "Gourmet & Chocolates";
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  ratingCount: number;
  imageUrl: string;
  galleryImages: string[];
  sourceUrl: string;
  deliveryEstimate: string;
  freeDelivery: boolean;
  sellerName: string;
  verifiedSeller: boolean;
  description: string;
  highlights: string[];
  options?: {
    name: string;
    values: string[];
  };
}

export const MARKETPLACE_CATALOG: MarketplaceProduct[] = [
  // --- FLIPKART PRODUCTS ---
  {
    id: "fk_smartwatch_01",
    marketplace: "Flipkart",
    platformName: "Flipkart",
    badge: "Flipkart Assured",
    title: "Fire-Boltt Ninja Call Pro Plus 1.83\" HD Bluetooth Calling Smartwatch with AI Voice & 120 Sports Modes",
    category: "Electronics",
    price: 1299,
    originalPrice: 4999,
    discountPercentage: 74,
    rating: 4.3,
    ratingCount: 142850,
    imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600",
    galleryImages: [
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
    ],
    sourceUrl: "https://www.flipkart.com/fire-boltt-ninja-call-pro-plus-smartwatch/p/itm1299pro",
    deliveryEstimate: "Delivery by Tomorrow, 11 PM",
    freeDelivery: true,
    sellerName: "FlashTech Retail India",
    verifiedSeller: true,
    description: "Upgrade your lifestyle with India's best-selling Bluetooth calling smartwatch. Features large 1.83-inch HD touch screen, SpO2 & 24/7 heart rate monitor, IP67 water resistance, and sleek metallic finish.",
    highlights: [
      "1.83\" HD Display with 280 Nits Brightness",
      "Bluetooth Calling with Inbuilt Speaker & Mic",
      "120+ Sports Modes & Health Suite",
      "Up to 8 Days Battery Life on Single Charge",
    ],
    options: {
      name: "Strap Color",
      values: ["Jet Black", "Navy Blue", "Champagne Gold", "Silver Grey"],
    },
  },
  {
    id: "fk_earbuds_02",
    marketplace: "Flipkart",
    platformName: "Flipkart",
    badge: "Flipkart Assured",
    title: "boAt Airdopes 141 ANC TWS Earbuds with 32dB Active Noise Cancellation & 42H Playtime",
    category: "Electronics",
    price: 1399,
    originalPrice: 5990,
    discountPercentage: 76,
    rating: 4.4,
    ratingCount: 89430,
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600",
    galleryImages: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600",
      "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=600",
    ],
    sourceUrl: "https://www.flipkart.com/boat-airdopes-141-anc-true-wireless/p/itm141anc",
    deliveryEstimate: "Delivery in 2 Days",
    freeDelivery: true,
    sellerName: "ImagineMarketing Official",
    verifiedSeller: true,
    description: "Immerse in crystal clear sound with boAt Signature Audio, 32dB active noise cancellation, ENx quad mics for HD calls, and ASAP Charge technology.",
    highlights: [
      "32dB Active Noise Cancellation",
      "ENx Quad Mics for Crystal Clear Calls",
      "42 Hours Massive Total Playback",
      "BEAST Mode with 50ms Low Latency",
    ],
    options: {
      name: "Color",
      values: ["Gunmetal Black", "Cider White", "Emerald Green"],
    },
  },
  {
    id: "fk_wildstone_03",
    marketplace: "Flipkart",
    platformName: "Flipkart",
    badge: "Flipkart Assured",
    title: "Wild Stone Ultra Sensual & Edge Luxury Eau De Parfum Gift Hamper Pack (100ml x 2)",
    category: "Beauty & Fragrance",
    price: 849,
    originalPrice: 1499,
    discountPercentage: 43,
    rating: 4.5,
    ratingCount: 35120,
    imageUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600",
    galleryImages: [
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600",
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600",
    ],
    sourceUrl: "https://www.flipkart.com/wild-stone-luxury-perfume-combo/p/itmedge100",
    deliveryEstimate: "Delivery in 2 Days",
    freeDelivery: true,
    sellerName: "McNROE Consumer Products",
    verifiedSeller: true,
    description: "Captivating and long-lasting French fragrance duo for men. Features warm aromatic notes of patchouli, cedarwood, lavender, and citrus zest.",
    highlights: [
      "Long-lasting 12+ Hour Fragrance",
      "Exquisite French Oil Craftsmanship",
      "Perfect Luxury Grooming Gift for Men",
    ],
  },
  {
    id: "fk_cadbury_04",
    marketplace: "Flipkart",
    platformName: "Flipkart",
    badge: "Flipkart Assured",
    title: "Cadbury Celebrations Rich Dry Fruit Chocolate Festive Gift Pack (216g)",
    category: "Gourmet & Chocolates",
    price: 450,
    originalPrice: 500,
    discountPercentage: 10,
    rating: 4.6,
    ratingCount: 62900,
    imageUrl: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600",
    galleryImages: [
      "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600",
    ],
    sourceUrl: "https://www.flipkart.com/cadbury-celebrations-rich-dry-fruit/p/itmcdb216",
    deliveryEstimate: "Delivery by Tomorrow, 8 PM",
    freeDelivery: true,
    sellerName: "Mondelez India Retail",
    verifiedSeller: true,
    description: "Celebrate festivals and cherished moments with Cadbury Celebrations Rich Dry Fruit chocolate box. Roasted almonds, cashews, and raisins enrobed in smooth dairy milk.",
    highlights: [
      "Roasted Whole Almonds & Cashews",
      "Signature Rich Dairy Milk Chocolate",
      "Festive Gift-Ready Gold Embossed Box",
    ],
  },

  // --- SHOPSY PRODUCTS ---
  {
    id: "sp_mug_warmer_01",
    marketplace: "Shopsy",
    platformName: "Shopsy by Flipkart",
    badge: "SuperSeller",
    title: "Aesthetic Ceramic Coffee Mug Gift Set with Smart 55°C Heating Warmer Coaster & Golden Spoon",
    category: "Home & Decor",
    price: 349,
    originalPrice: 999,
    discountPercentage: 65,
    rating: 4.4,
    ratingCount: 18230,
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600",
    galleryImages: [
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600",
      "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=600",
    ],
    sourceUrl: "https://www.shopsy.in/ceramic-mug-heater-coaster-set/p/spmug55",
    deliveryEstimate: "Delivered in 3 Days across India",
    freeDelivery: true,
    sellerName: "Shopsy HomeTrends",
    verifiedSeller: true,
    description: "Keep tea, coffee, or milk warm all day with this electric temperature-regulated heating pad and matching emerald green ceramic mug. Beautiful festive gift box included.",
    highlights: [
      "Maintains Constant 55°C Ideal Temperature",
      "Auto Gravity Induction Sensor Switch",
      "Premium Gold Foil Gift Box Packaging",
    ],
    options: {
      name: "Mug Color",
      values: ["Emerald Green", "Blush Pink", "Pearl White"],
    },
  },
  {
    id: "sp_wallet_combo_02",
    marketplace: "Shopsy",
    platformName: "Shopsy by Flipkart",
    badge: "Top Value",
    title: "Men's Luxury Genuine Leather Slim RFID Wallet, Reversible Belt & Metal Keychain Gift Combo",
    category: "Fashion & Ethnic",
    price: 399,
    originalPrice: 1299,
    discountPercentage: 69,
    rating: 4.3,
    ratingCount: 24100,
    imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600",
    galleryImages: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600",
    ],
    sourceUrl: "https://www.shopsy.in/mens-leather-wallet-belt-gift-set/p/splthr3in1",
    deliveryEstimate: "Delivered in 3 Days across India",
    freeDelivery: true,
    sellerName: "UrbanCraft India",
    verifiedSeller: true,
    description: "The complete executive accessories gift set for brothers, husbands, fathers, or colleagues. Includes RFID-blocking bi-fold wallet, durable leather belt, and matching keychain.",
    highlights: [
      "RFID Secure Anti-Theft Card Shielding",
      "Genuine Top-Grain Finish Leather",
      "Comes in Hardcover Matte Gift Box",
    ],
    options: {
      name: "Leather Shade",
      values: ["Classic Black", "Vintage Brown", "Tan Camel"],
    },
  },
  {
    id: "sp_spotify_plaque_03",
    marketplace: "Shopsy",
    platformName: "Shopsy by Flipkart",
    badge: "Trending #1",
    title: "Personalized Custom Spotify Acrylic Song Plaque with Scannable QR Code & Solid Wooden LED Stand",
    category: "Home & Decor",
    price: 379,
    originalPrice: 899,
    discountPercentage: 58,
    rating: 4.7,
    ratingCount: 31200,
    imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600",
    galleryImages: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600",
    ],
    sourceUrl: "https://www.shopsy.in/personalized-spotify-acrylic-photo-frame/p/spspotify01",
    deliveryEstimate: "Delivered in 2-3 Days",
    freeDelivery: true,
    sellerName: "PersonalizeNow Hub",
    verifiedSeller: true,
    description: "Capture your favorite melody and couple memory forever! High-grade crystal clear acrylic plaque with scannable Spotify code that plays your chosen song on any phone.",
    highlights: [
      "Custom Couple Photo & Favorite Song Title",
      "Real Scannable Spotify Track Code",
      "Warm LED Illumination Base Stand Included",
    ],
  },
  {
    id: "sp_korean_pendant_04",
    marketplace: "Shopsy",
    platformName: "Shopsy by Flipkart",
    badge: "Bestseller",
    title: "Korean Anti-Tarnish Butterfly Rose Gold Pendant Necklace with Velvet Jewelry Gift Case",
    category: "Jewelry & Watches",
    price: 299,
    originalPrice: 799,
    discountPercentage: 62,
    rating: 4.5,
    ratingCount: 15400,
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600",
    galleryImages: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600",
    ],
    sourceUrl: "https://www.shopsy.in/rose-gold-butterfly-pendant-necklace/p/sprosependant",
    deliveryEstimate: "Delivered in 3 Days",
    freeDelivery: true,
    sellerName: "ShineVibe Jewels",
    verifiedSeller: true,
    description: "Dainty and sparkling Korean rose gold pendant with cubic zirconia stones. Waterproof, hypoallergenic, and sweatproof for daily wear.",
    highlights: [
      "Anti-Tarnish Stainless Steel Core",
      "18K Rose Gold Micron Plating",
      "Includes Velvet Travel Jewelry Case",
    ],
  },

  // --- MEESHO PRODUCTS ---
  {
    id: "ms_kurta_set_01",
    marketplace: "Meesho",
    platformName: "Meesho",
    badge: "Meesho Trusted",
    title: "Jaipuri Handblock Printed Pure Cotton Anarkali Kurta with Pant & Mulmul Dupatta Set",
    category: "Fashion & Ethnic",
    price: 899,
    originalPrice: 1999,
    discountPercentage: 55,
    rating: 4.4,
    ratingCount: 42100,
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
    galleryImages: [
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
    ],
    sourceUrl: "https://www.meesho.com/jaipuri-cotton-anarkali-suit-set/p/msanarkali",
    deliveryEstimate: "Free Delivery in 3-4 Days",
    freeDelivery: true,
    sellerName: "Jaipur Fab Crafts",
    verifiedSeller: true,
    description: "Authentic Sanganeri hand-block printed pure 60-60 cotton 3-piece ethnic suit. Breathable, elegant, and perfect for festivals, poojas, and family celebrations.",
    highlights: [
      "100% Breathable Jaipur Cotton",
      "Intricate Gotta Patti Neckline Embroidery",
      "Full Flared 4-Meter Anarkali Ghera",
    ],
    options: {
      name: "Size",
      values: ["S (36)", "M (38)", "L (40)", "XL (42)", "XXL (44)"],
    },
  },
  {
    id: "ms_brass_urli_02",
    marketplace: "Meesho",
    platformName: "Meesho",
    badge: "Handmade In India",
    title: "Traditional Handcrafted Brass Urli Bowl with Peacock Handles for Floating Flowers & Tealights",
    category: "Home & Decor",
    price: 649,
    originalPrice: 1499,
    discountPercentage: 56,
    rating: 4.6,
    ratingCount: 22800,
    imageUrl: "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=600",
    galleryImages: [
      "https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=600",
    ],
    sourceUrl: "https://www.meesho.com/handcrafted-brass-urli-bowl/p/msurli12",
    deliveryEstimate: "Free Delivery in 3 Days",
    freeDelivery: true,
    sellerName: "Moradabad Brass Works",
    verifiedSeller: true,
    description: "Enhance your entryway or pooja room with this timeless golden brass Urli bowl. Fill with water, rose petals, and floating candles for an auspicious Indian festive welcome.",
    highlights: [
      "Cast in Heavy Duty Virgin Brass",
      "Traditional Royal Peacock Motifs",
      "Ideal for Diwali, Housewarming & Weddings",
    ],
  },
  {
    id: "ms_evil_eye_bracelet_03",
    marketplace: "Meesho",
    platformName: "Meesho",
    badge: "Meesho Choice",
    title: "Handmade Turkish Evil Eye 925 Sterling Silver Plated Adjustable Nazar Bracelet with Card",
    category: "Jewelry & Watches",
    price: 249,
    originalPrice: 699,
    discountPercentage: 64,
    rating: 4.5,
    ratingCount: 19500,
    imageUrl: "https://images.unsplash.com/photo-1611591475870-13d806a683a3?w=600",
    galleryImages: [
      "https://images.unsplash.com/photo-1611591475870-13d806a683a3?w=600",
    ],
    sourceUrl: "https://www.meesho.com/evil-eye-silver-plated-bracelet/p/msevil09",
    deliveryEstimate: "Free Delivery in 3 Days",
    freeDelivery: true,
    sellerName: "AuraAesthetics",
    verifiedSeller: true,
    description: "Ward off negativity and protect loved ones with this delicate blue nazar protection bracelet. Comes with a personalized protection blessing card.",
    highlights: [
      "Genuine Blue Lampwork Glass Evil Eye",
      "925 Sterling Silver Plated Chain",
      "Adjustable Length for All Wrist Sizes",
    ],
  },
  {
    id: "ms_scented_candles_04",
    marketplace: "Meesho",
    platformName: "Meesho",
    badge: "Artisanal",
    title: "Luxury Pastel Bubble Scented Soy Wax Candles with French Lavender & Vanilla Aroma (Set of 4)",
    category: "Home & Decor",
    price: 299,
    originalPrice: 799,
    discountPercentage: 62,
    rating: 4.6,
    ratingCount: 16800,
    imageUrl: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600",
    galleryImages: [
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600",
    ],
    sourceUrl: "https://www.meesho.com/pastel-bubble-soy-candles-set/p/mscandle04",
    deliveryEstimate: "Free Delivery in 3 Days",
    freeDelivery: true,
    sellerName: "LuxeAromas India",
    verifiedSeller: true,
    description: "Hand-poured 100% natural organic soy wax candles. Clean burning, smoke-free, and infused with calming therapeutic essential oils.",
    highlights: [
      "Organic Soy Wax with Cotton Wicks",
      "Infused with French Lavender & Warm Vanilla",
      "Smokeless 25+ Hour Burn Time Per Candle",
    ],
  },

  // --- AMAZON INDIA PRODUCTS ---
  {
    id: "amz_marshall_01",
    marketplace: "Amazon",
    platformName: "Amazon India",
    badge: "Prime Exclusive",
    title: "Marshall Willen 10W Ultra-Compact Portable Bluetooth Speaker with 15+ Hours Playtime & IP67 Dust/Waterproof",
    category: "Electronics",
    price: 9999,
    originalPrice: 14999,
    discountPercentage: 33,
    rating: 4.7,
    ratingCount: 12400,
    imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600",
    galleryImages: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600",
    ],
    sourceUrl: "https://www.amazon.in/dp/B0B24Z854N/marshall-willen-speaker",
    deliveryEstimate: "Prime One-Day Delivery to Metro Cities",
    freeDelivery: true,
    sellerName: "Appario Retail Private Ltd",
    verifiedSeller: true,
    description: "Iconic Marshall heavy-rock heritage in a pocket-sized speaker. Delivers colossal stereo sound, rugged rubberized exterior, and flexible mounting strap.",
    highlights: [
      "Iconic Marshall Brass Knob & Vintage Tolex",
      "15+ Hours Continuous Portable Playback",
      "Built-in Microphone for Hands-free Calls",
      "IP67 Rugged Dust and Waterproof Rating",
    ],
    options: {
      name: "Edition",
      values: ["Black & Brass", "Cream Vintage"],
    },
  },
  {
    id: "amz_ferrero_02",
    marketplace: "Amazon",
    platformName: "Amazon India",
    badge: "Amazon Fulfilled",
    title: "Ferrero Rocher Premium Italian Whole Hazelnut Pralines Chocolates Diamond Gift Box (24 Pieces, 300g)",
    category: "Gourmet & Chocolates",
    price: 995,
    originalPrice: 1195,
    discountPercentage: 17,
    rating: 4.8,
    ratingCount: 45900,
    imageUrl: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=600",
    galleryImages: [
      "https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=600",
    ],
    sourceUrl: "https://www.amazon.in/dp/B000R7X9A0/ferrero-rocher-diamond-24",
    deliveryEstimate: "Prime Same-Day Delivery Available",
    freeDelivery: true,
    sellerName: "Ferrero India Official",
    verifiedSeller: true,
    description: "Crispy wafer shell filled with rich chocolate hazelnut cream and a crunchy whole roasted hazelnut inside, coated with milk chocolate and hazelnut pieces.",
    highlights: [
      "Imported Whole Roasted Italian Hazelnuts",
      "Individually Wrapped in Golden Foil",
      "Iconic Transparent Diamond Keepsake Box",
    ],
  },
  {
    id: "amz_titan_watch_03",
    marketplace: "Amazon",
    platformName: "Amazon India",
    badge: "Amazon Fulfilled",
    title: "Titan Neo Analog Men's Black Textured Dial Genuine Leather Quartz Watch (Model: NM1805SL02)",
    category: "Jewelry & Watches",
    price: 2995,
    originalPrice: 4495,
    discountPercentage: 33,
    rating: 4.5,
    ratingCount: 28900,
    imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600",
    galleryImages: [
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600",
    ],
    sourceUrl: "https://www.amazon.in/dp/B07YWH82Z1/titan-neo-analog-watch",
    deliveryEstimate: "Prime One-Day Delivery",
    freeDelivery: true,
    sellerName: "Titan Company Limited",
    verifiedSeller: true,
    description: "Sophisticated minimalism from Titan India. Features deep black textured dial, mineral glass crystal, 50m water resistance, and durable dark brown genuine leather strap.",
    highlights: [
      "Precision Japanese Quartz Movement",
      "50M Water Resistance (5 ATM)",
      "2-Year Official Titan India Warranty",
    ],
  },
  {
    id: "amz_parker_pen_04",
    marketplace: "Amazon",
    platformName: "Amazon India",
    badge: "Amazon Fulfilled",
    title: "Parker Classic Stainless Steel Gold Trim Ballpoint Pen with Luxury Hard Case Box & Refill",
    category: "Home & Decor",
    price: 550,
    originalPrice: 750,
    discountPercentage: 27,
    rating: 4.6,
    ratingCount: 38200,
    imageUrl: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600",
    galleryImages: [
      "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600",
    ],
    sourceUrl: "https://www.amazon.in/dp/B00LM54N6Q/parker-classic-gold-pen",
    deliveryEstimate: "Prime One-Day Delivery",
    freeDelivery: true,
    sellerName: "Luxor Writing Instruments",
    verifiedSeller: true,
    description: "The timeless corporate and personal keepsake gift. Polished stainless steel body with 23K gold plated clip and Quinkflow blue ink refill.",
    highlights: [
      "Solid Stainless Steel Metal Barrel",
      "23K Gold Plated Signature Arrow Clip",
      "Smooth Smudge-Free Quinkflow Technology",
    ],
  },

  // --- NYKAA LUXE BEAUTY ---
  {
    id: "ny_derma_co_01",
    marketplace: "Nykaa",
    platformName: "Nykaa Luxe",
    badge: "Nykaa Verified",
    title: "The Derma Co 10% Vitamin C Radiance Glow Skincare Gift Hamper (Serum + Face Wash + Sunscreen)",
    category: "Beauty & Fragrance",
    price: 1349,
    originalPrice: 1897,
    discountPercentage: 29,
    rating: 4.6,
    ratingCount: 26500,
    imageUrl: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600",
    galleryImages: [
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600",
    ],
    sourceUrl: "https://www.nykaa.com/the-derma-co-vitamin-c-glow-kit/p/nyderma03",
    deliveryEstimate: "Delivery in 2 Days across India",
    freeDelivery: true,
    sellerName: "Honasa Consumer Ltd",
    verifiedSeller: true,
    description: "Designed by dermatologists for bright, radiant Indian skin. Treats dark spots, pigmentation, and provides broad spectrum SPF 50 sun protection.",
    highlights: [
      "10% Pure Vitamin C + Niacinamide",
      "Clinically Proven to Fade Dark Spots in 3 Weeks",
      "Dermatologically Tested & Fragrance Free",
    ],
  },
  {
    id: "ny_bbw_cherry_02",
    marketplace: "Nykaa",
    platformName: "Nykaa Luxe",
    badge: "Luxury Import",
    title: "Bath & Body Works Japanese Cherry Blossom Fragrance Gift Set (Body Mist 236ml + Shower Gel 295ml)",
    category: "Beauty & Fragrance",
    price: 2699,
    originalPrice: 3598,
    discountPercentage: 25,
    rating: 4.7,
    ratingCount: 19100,
    imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600",
    galleryImages: [
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600",
    ],
    sourceUrl: "https://www.nykaa.com/bath-body-works-japanese-cherry-blossom-gift-set/p/nybbw01",
    deliveryEstimate: "Delivery in 2 Days",
    freeDelivery: true,
    sellerName: "Apparel Group India",
    verifiedSeller: true,
    description: "An intoxicating blend of Japanese cherry blossom, Asian pear, fresh mimosa petals, white jasmine, and blushing sandalwood. The ultimate luxury pampering gift.",
    highlights: [
      "America's #1 Fragrance Collection",
      "Infused with Nourishing Aloe & Vitamin E",
      "Packaged in Deluxe Signature Gift Bag",
    ],
  },
];

export function searchMarketplaceProducts(query: string, marketplace?: string, category?: string): MarketplaceProduct[] {
  let list = MARKETPLACE_CATALOG;

  if (marketplace && marketplace !== "all") {
    list = list.filter((p) => p.marketplace.toLowerCase() === marketplace.toLowerCase());
  }

  if (category && category !== "all") {
    list = list.filter((p) => p.category.toLowerCase().includes(category.toLowerCase()));
  }

  if (!query || !query.trim()) {
    return list;
  }

  const q = query.toLowerCase().trim();
  return list.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.marketplace.toLowerCase().includes(q) ||
      p.highlights.some((h) => h.toLowerCase().includes(q))
  );
}
