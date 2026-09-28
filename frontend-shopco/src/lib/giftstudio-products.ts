import { Product } from "@/types/product.types";
import catalogData from "./giftstudio-catalog.json";

export const allGiftProducts: Product[] = (catalogData as Product[]).map((p) => ({
  ...p,
  currency: "₹",
}));

// Fast O(1) product lookup map for performance
const productMap = new Map<string, Product>();
for (const p of allGiftProducts) {
  productMap.set(String(p.id), p);
}

// Categorized subsets
export const newArrivalsGiftData: Product[] = allGiftProducts
  .filter(
    (p) =>
      p.category?.includes("Photo Frames") ||
      p.category?.includes("Wedding") ||
      p.category?.includes("Boxes") ||
      p.category?.includes("Customized")
  )
  .slice(0, 8);

export const topSellingGiftData: Product[] = allGiftProducts
  .filter(
    (p) =>
      p.category?.includes("Boxes") ||
      p.category?.includes("Drinkware") ||
      p.category?.includes("Spiritual") ||
      p.category?.includes("Keychains")
  )
  .slice(0, 8);

export const relatedGiftData: Product[] = allGiftProducts
  .filter(
    (p) =>
      p.category?.includes("Wedding") ||
      p.category?.includes("Apparel") ||
      p.category?.includes("Photo Frames")
  )
  .slice(0, 6);

export function getProductById(id: string | number): Product | undefined {
  return productMap.get(String(id));
}

export function getProductsByCategory(categoryName: string): Product[] {
  if (!categoryName || categoryName === "all") return allGiftProducts;
  const lower = categoryName.toLowerCase();
  return allGiftProducts.filter(
    (p) =>
      p.category?.toLowerCase().includes(lower) ||
      p.title.toLowerCase().includes(lower)
  );
}
