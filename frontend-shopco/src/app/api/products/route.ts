import { NextRequest, NextResponse } from "next/server";
import { Product } from "@/types/product.types";
import catalogFallback from "@/lib/giftstudio-catalog.json";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_giftstudio_web_99182";

function formatMedusaProduct(p: any, idx: number): Product {
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
    // Look up in fallback if available
    const fallbackItem = (catalogFallback as any[]).find(
      (item) => item.id === p.id || item.title === p.title
    );
    if (fallbackItem) price = fallbackItem.price;
  }

  return {
    id: p.id || `prod_${idx + 1}`,
    title: p.title,
    srcUrl: thumbnail,
    gallery: images.length > 0 ? images : [thumbnail],
    price: Math.round(price) || 1499,
    currency: "₹",
    discount: {
      amount: 0,
      percentage: idx % 3 === 0 ? 10 : 0,
    },
    rating: Number((4.7 + ((idx % 4) * 0.08)).toFixed(1)),
    category: p.subtitle || "Dua Gifts Special",
    description: p.description || "",
    variants: p.variants || [],
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryParam = searchParams.get("category");
  const queryParam = searchParams.get("query") || searchParams.get("q");
  const sortParam = searchParams.get("sort") || "most-popular";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const limitParam = parseInt(searchParams.get("limit") || "12", 10);
  const isFeatured = searchParams.get("featured") === "true";
  const isBestsellers = searchParams.get("bestsellers") === "true";

  let allProducts: Product[] = [];

  // 1. Fetch from Medusa backend
  try {
    const res = await fetch(`${MEDUSA_URL}/store/products?limit=100`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.products) && data.products.length > 0) {
        allProducts = data.products.map((p: any, idx: number) => formatMedusaProduct(p, idx));
      }
    }
  } catch (err) {
    console.warn("Medusa backend unreachable, using catalog cache:", (err as Error).message);
  }

  // 2. Fallback to synced catalog cache if backend returns empty
  if (allProducts.length === 0) {
    allProducts = (catalogFallback as Product[]).map((p) => ({
      ...p,
      currency: "₹",
    }));
  }

  // Categories list derived dynamically
  const uniqueCategories = Array.from(
    new Set(allProducts.map((p) => p.category).filter(Boolean))
  );

  // 3. Featured & Bestsellers shortcuts
  if (isFeatured) {
    const featured = allProducts
      .filter(
        (p) =>
          p.category?.includes("Boxes") ||
          p.category?.includes("Wedding") ||
          p.category?.includes("Frames") ||
          p.category?.includes("Custom")
      )
      .slice(0, 8);
    return NextResponse.json({ success: true, products: featured, total: featured.length });
  }

  if (isBestsellers) {
    const bestsellers = allProducts
      .filter(
        (p) =>
          p.category?.includes("Drinkware") ||
          p.category?.includes("Keepsakes") ||
          p.category?.includes("Apparel") ||
          p.category?.includes("Boxes")
      )
      .slice(0, 8);
    return NextResponse.json({ success: true, products: bestsellers, total: bestsellers.length });
  }

  // 4. Filtering
  let filtered = [...allProducts];

  if (categoryParam && categoryParam !== "all") {
    const catLower = categoryParam.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.category?.toLowerCase().includes(catLower) ||
        p.title.toLowerCase().includes(catLower)
    );
  }

  if (queryParam) {
    const qLower = queryParam.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(qLower) ||
        p.category?.toLowerCase().includes(qLower) ||
        p.description?.toLowerCase().includes(qLower)
    );
  }

  // 5. Sorting
  if (sortParam === "low-price") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortParam === "high-price") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortParam === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  // 6. Pagination
  const total = filtered.length;
  const totalPages = Math.ceil(total / limitParam) || 1;
  const startIndex = (pageParam - 1) * limitParam;
  const paginated = filtered.slice(startIndex, startIndex + limitParam);

  return NextResponse.json({
    success: true,
    products: paginated,
    total,
    page: pageParam,
    totalPages,
    limit: limitParam,
    categories: uniqueCategories,
  });
}
