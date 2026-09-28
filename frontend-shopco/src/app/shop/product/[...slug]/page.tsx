import ProductListSec from "@/components/common/ProductListSec";
import BreadcrumbProduct from "@/components/product-page/BreadcrumbProduct";
import Header from "@/components/product-page/Header";
import Tabs from "@/components/product-page/Tabs";
import { notFound } from "next/navigation";
import { Product } from "@/types/product.types";
import catalogFallback from "@/lib/giftstudio-catalog.json";

export const dynamic = "force-dynamic";

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || "http://localhost:9000";
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "pk_giftstudio_web_99182";

async function fetchProduct(idOrSlug: string): Promise<{ product: Product | null; related: Product[] }> {
  let product: Product | null = null;

  // 1. Try Medusa backend
  try {
    const res = await fetch(`${MEDUSA_URL}/store/products/${encodeURIComponent(idOrSlug)}`, {
      headers: { "x-publishable-api-key": PUBLISHABLE_KEY },
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (data.product) {
        const p = data.product;
        const images = (p.images || []).map((img: any) => img.url);
        product = {
          id: p.id,
          title: p.title,
          srcUrl: p.thumbnail || images[0] || "",
          gallery: images.length > 0 ? images : [p.thumbnail || ""],
          price: 1499,
          currency: "₹",
          discount: { amount: 0, percentage: 10 },
          rating: 4.9,
          category: p.subtitle || "Dua Gifts Special",
          description: p.description || "",
        };
      }
    }
  } catch (e) {
    // Continue to fallback
  }

  // 2. Query fallback catalog if not yet in Medusa or Medusa offline
  if (!product) {
    const found = (catalogFallback as Product[]).find(
      (p) =>
        String(p.id) === String(idOrSlug) ||
        p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").includes(idOrSlug.toLowerCase())
    );
    if (found) {
      product = { ...found, currency: "₹" };
    }
  }

  const related = (catalogFallback as Product[])
    .filter((p) => String(p.id) !== String(idOrSlug))
    .slice(0, 4)
    .map((p) => ({ ...p, currency: "₹" }));

  return { product, related };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string[] };
}) {
  const targetId = params.slug[0];
  const { product, related } = await fetchProduct(targetId);

  if (!product?.title) {
    notFound();
  }

  return (
    <main>
      <div className="max-w-frame mx-auto px-4 xl:px-0">
        <hr className="h-[1px] border-t-black/10 mb-5 sm:mb-6" />
        <BreadcrumbProduct title={product.title} />
        <section className="mb-11">
          <Header data={product} />
        </section>
        <Tabs />
      </div>
      <div className="mb-[50px] sm:mb-20">
        <ProductListSec title="You might also like" data={related} />
      </div>
    </main>
  );
}
