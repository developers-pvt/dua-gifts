import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/types/product.types";
import catalogFallback from "@/lib/giftstudio-catalog.json";

export const dynamic = "force-dynamic";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_giftstudio_web_99182";

function formatMedusaProduct(p: any): Product {
  const images = (p.images || []).map((img: any) => img.url);
  const thumbnail =
    p.thumbnail ||
    images[0] ||
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800";

  let price = 1500;
  const v = p.variants?.[0];
  if (v && v.prices && v.prices.length > 0) {
    const inrP = v.prices.find((pr: any) => pr.currency_code === "inr");
    if (inrP) price = parseFloat(inrP.amount);
    else price = parseFloat(v.prices[0].amount);
  } else {
    const fallbackItem = (catalogFallback as any[]).find(
      (item) => item.id === p.id || item.title === p.title
    );
    if (fallbackItem) price = fallbackItem.price;
  }

  return {
    id: p.id,
    title: p.title,
    srcUrl: thumbnail,
    gallery: images.length > 0 ? images : [thumbnail],
    price: Math.round(price) || 1499,
    currency: "₹",
    discount: {
      amount: 0,
      percentage: 10,
    },
    rating: 4.9,
    category: p.subtitle || "Dua Gifts Special",
    description: p.description || "",
    variants: p.variants || [],
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const targetId = params.id;

  let product: Product | null = null;

  // 1. Query Medusa backend
  try {
    const res = await fetch(`${MEDUSA_URL}/store/products/${encodeURIComponent(targetId)}`, {
      headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.product) {
        product = formatMedusaProduct(data.product);
      }
    }
  } catch (err) {
    // Continue to fallback
  }

  // 2. Query fallback catalog if not found
  if (!product) {
    const found = (catalogFallback as Product[]).find(
      (p) =>
        String(p.id) === targetId ||
        p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").includes(targetId.toLowerCase())
    );
    if (found) {
      product = { ...found, currency: "₹" };
    }
  }

  if (!product) {
    return NextResponse.json(
      { success: false, error: "Product not found" },
      { status: 404 }
    );
  }

  // Related products from same category
  const relatedProducts = (catalogFallback as Product[])
    .filter((p) => String(p.id) !== String(product?.id))
    .slice(0, 4)
    .map((p) => ({ ...p, currency: "₹" }));

  return NextResponse.json({
    success: true,
    product,
    relatedProducts,
  });
}
