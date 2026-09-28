import ProductListSec from "@/components/common/ProductListSec";
import Brands from "@/components/homepage/Brands";
import DressStyle from "@/components/homepage/DressStyle";
import Header from "@/components/homepage/Header";
import Reviews from "@/components/homepage/Reviews";
import { Product } from "@/types/product.types";
import { Review } from "@/types/review.types";
import {
  newArrivalsGiftData,
  topSellingGiftData,
} from "@/lib/giftstudio-products";
import { reviewsData } from "@/lib/reviews-data";

export const dynamic = "force-dynamic";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_giftstudio_web_99182";

async function getHomePageData(): Promise<{
  featured: Product[];
  topSelling: Product[];
  reviews: Review[];
}> {
  let featured: Product[] = newArrivalsGiftData;
  let topSelling: Product[] = topSellingGiftData;
  let reviews: Review[] = reviewsData;

  // 1. Fetch live products from Medusa backend
  try {
    const res = await fetch(`${MEDUSA_URL}/store/products?limit=20`, {
      headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.products) && data.products.length > 0) {
        const mapped: Product[] = data.products.map((p: any, idx: number) => {
          const images = (p.images || []).map((img: any) => img.url);
          return {
            id: p.id,
            title: p.title,
            srcUrl: p.thumbnail || images[0] || "",
            gallery: images.length > 0 ? images : [p.thumbnail || ""],
            price: 1499,
            currency: "₹",
            discount: { amount: 0, percentage: idx % 3 === 0 ? 10 : 0 },
            rating: 4.8,
            category: p.subtitle || "Dua Gifts Special",
            description: p.description || "",
          };
        });

        featured = mapped.slice(0, 8);
        topSelling = mapped.slice(8, 16);
      }
    }
  } catch (e) {
    // Keep resilient catalog fallback
  }

  return { featured, topSelling, reviews };
}

export default async function Home() {
  const { featured, topSelling, reviews } = await getHomePageData();

  return (
    <>
      <Header />
      <Brands />
      <main className="my-[40px] sm:my-[60px]">
        <ProductListSec
          title="FEATURED GIFT COLLECTIONS"
          data={featured}
          viewAllLink="/shop"
        />
        <div className="max-w-frame mx-auto px-4 xl:px-0">
          <hr className="h-[1px] border-t-black/[0.08] my-10 sm:my-14" />
        </div>
        <div className="mb-[40px] sm:mb-16">
          <ProductListSec
            title="BEST SELLING CUSTOM GIFTS"
            data={topSelling}
            viewAllLink="/shop"
          />
        </div>
        <div className="mb-[40px] sm:mb-16">
          <DressStyle />
        </div>
        <Reviews data={reviews} />
      </main>
    </>
  );
}
