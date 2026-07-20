import { prisma } from "./prisma";
import {
  fallbackCategories,
  fallbackProducts,
  fallbackPopularProducts,
  fallbackOfferProducts,
  fallbackDiscountProducts,
} from "./fallbackData";
import { applyFilters, parseFilters } from "./productListing";
import { localProductImages, localProductNames } from "./productOverrides";

export interface SearchResult {
  slug: string;
  name: string;
  image: string | null;
  price: number;
  oldPrice: number | null;
}

async function getSearchableData() {
  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany(),
      prisma.product.findMany({ orderBy: { createdAt: "desc" } }),
    ]);
    if (categories.length === 0 || products.length === 0) throw new Error("empty");
    return { categories, products };
  } catch {
    return {
      categories: fallbackCategories,
      products: [
        ...fallbackProducts,
        ...fallbackPopularProducts,
        ...fallbackOfferProducts,
        ...fallbackDiscountProducts,
      ].map((p) => ({ ...p, images: [] as string[], brand: null as string | null, specifications: [] as { label: string; value: string }[], popupEnabled: false, installmentsEnabled: true, model: null as string | null, surface: null as number | null, wifi: null as boolean | null, features: null as string | null, refrigerant: null as string | null, seer: null as number | null, scop: null as number | null, color: null as string | null, productType: null as string | null })),
    };
  }
}

export async function searchProducts(query: string, limit = 6): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const { categories, products } = await getSearchableData();
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
  const filters = parseFilters({ q: trimmed });
  const matched = applyFilters(
    products,
    filters,
    undefined,
    (p) => `${categoryNameById.get(p.categoryId) ?? ""} ${p.id} ${p.id.slice(-6)}`
  );

  return matched.slice(0, limit).map((p) => ({
    slug: p.slug,
    name: localProductNames[p.slug] ?? p.name,
    image: localProductImages[p.slug] ?? p.image ?? null,
    price: p.price,
    oldPrice: p.oldPrice ?? null,
  }));
}
