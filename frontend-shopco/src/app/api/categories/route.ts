import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_giftstudio_web_99182";

const DEFAULT_CATEGORIES = [
  { id: "all", name: "All Gifts", handle: "all", description: "Explore the full curated Dua Gifts catalog" },
  { id: "Boxes", name: "Gift Boxes & Hampers", handle: "gift-boxes-baskets", description: "Curated luxury gift hampers and celebration boxes" },
  { id: "Wedding", name: "Nikah & Wedding Specials", handle: "nikah-wedding-specials", description: "Bespoke wedding and anniversary keepsakes" },
  { id: "Frames", name: "Photo & LED Lamps", handle: "photo-frames-led-lamps", description: "Personalized acrylic photo frames and warm LED keepsakes" },
  { id: "Spiritual", name: "Artisanal & Car Charms", handle: "islamic-art-car-accessories", description: "Handmade resin car hanging charms and calligraphy" },
  { id: "Drinkware", name: "Custom Mugs & Bottles", handle: "personalized-drinkware", description: "Custom smart temperature bottles & ceramic mugs" },
  { id: "Apparel", name: "Custom Apparel & Keepsakes", handle: "custom-apparel-keepsakes", description: "Couple matching t-shirts, hoodies, and personalized apparel" },
];

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${MEDUSA_URL}/store/product-categories`, {
      headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 300 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.product_categories) && data.product_categories.length > 0) {
        const categories = [
          { id: "all", name: "All Gifts", handle: "all", description: "All available gifts" },
          ...data.product_categories.map((c: any) => ({
            id: c.name.split(" ")[0],
            name: c.name,
            handle: c.handle,
            description: c.description,
          })),
        ];
        return NextResponse.json({ success: true, categories });
      }
    }
  } catch (e) {
    // Fall back to defaults
  }

  return NextResponse.json({ success: true, categories: DEFAULT_CATEGORIES });
}
