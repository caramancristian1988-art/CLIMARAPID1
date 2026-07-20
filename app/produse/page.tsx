import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSectionFlags } from "@/lib/siteSettings";
import {
  fallbackCategories,
  fallbackProducts,
  fallbackPopularProducts,
  fallbackOfferProducts,
  fallbackDiscountProducts,
} from "@/lib/fallbackData";
import ProductCard from "../components/ProductCard";
import LoadMoreButton from "../components/LoadMoreButton";
import ProductFilterSidebar from "../components/ProductFilterSidebar";
import {
  sortProducts,
  paginate,
  parseSort,
  parsePage,
  parseFilters,
  applyFilters,
} from "@/lib/productListing";
import { localProductImages, localProductBadges, localProductNames } from "@/lib/productOverrides";

export const metadata: Metadata = {
  title: "Condiționere & accesorii",
  description:
    "Magazin online condiționere Moldova — Daikin, Mitsubishi, Gree, Midea, Cooper&Hunter. Aparate rezidențiale, comerciale, sisteme multisplit. Livrare și instalare în toată Moldova.",
  keywords: [
    "conditioner Moldova pret",
    "magazin condiționere online Moldova",
    "Daikin pret Moldova",
    "Mitsubishi Electric conditioner Moldova",
    "Gree conditioner Moldova",
    "Midea aer conditionat Moldova",
    "Cooper Hunter Moldova",
    "aer conditionat ieftin Moldova",
    "multisplit pret Moldova",
    "aparate climatizare Moldova",
    "conditioner inverter Moldova",
    "Chisinau conditioner",
  ],
  alternates: { canonical: "https://www.climatrapid.md/produse" },
};

export const revalidate = 3600;

const KNOWN_BRANDS = [
  "Daikin", "Mitsubishi Electric", "Gree", "Midea", "Cooper&Hunter", "Electrolux",
  "LG", "Samsung", "Haier", "Panasonic", "Fujitsu", "Hitachi", "Carrier", "Trane",
  "Bosch", "Toshiba", "Ariston", "Hisense", "Whirlpool", "Sharp",
];

interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  createdAt: Date;
}

interface VariantPill {
  id: string;
  label: string;
  price: number;
  oldPrice: number | null;
  badge: string | null;
  isDefault: boolean;
}

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  oldPrice: number | null;
  image: string | null;
  btu: number | null;
  technology: string;
  brand: string | null;
  energyClass: string | null;
  rating: number;
  reviewCount: number;
  badge: string | null;
  availability: string;
  installmentsEnabled?: boolean;
  categoryId: string;
  createdAt: Date;
  variants: VariantPill[];
}

async function getData(): Promise<{ categories: CategoryRow[]; products: ProductRow[] }> {
  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          variants: {
            select: { id: true, label: true, price: true, oldPrice: true, badge: true, isDefault: true },
            orderBy: { order: "asc" },
          },
        },
      }),
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
      ].map((p) => ({ ...p, images: [] as string[], brand: null as string | null, variants: [] as VariantPill[] })),
    };
  }
}

export default async function ProdusePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { produseEnabled, ratesEnabled, installmentMonths } = await getSectionFlags();
  if (!produseEnabled) notFound();

  const query = await searchParams;
  const sort = parseSort(query.sort);
  const page = parsePage(query.page);
  const filters = parseFilters(query);

  const { categories, products: baseProducts } = await getData();

  const categoryById = new Map(categories.map((c) => [c.id, c.slug]));
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]));
  const products = applyFilters(
    baseProducts,
    filters,
    (p) => categoryById.get(p.categoryId) ?? "",
    (p) => `${categoryNameById.get(p.categoryId) ?? ""} ${p.id} ${p.id.slice(-6)}`
  );

  const categoryOptions = categories.map((cat) => ({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    count: baseProducts.filter((p) => p.categoryId === cat.id).length,
  }));

  const energyClassOptions = Array.from(new Set(baseProducts.map((p) => p.energyClass).filter((v): v is string => Boolean(v))))
    .sort()
    .reverse()
    .map((value) => ({ value, count: baseProducts.filter((p) => p.energyClass === value).length }));

  const priceBounds = baseProducts.reduce(
    (acc, p) => ({ min: Math.min(acc.min, p.price), max: Math.max(acc.max, p.price) }),
    { min: baseProducts[0]?.price ?? 0, max: baseProducts[0]?.price ?? 0 }
  );

  const technologyOptions = Array.from(new Set(baseProducts.map((p) => p.technology)))
    .sort()
    .map((value) => ({ value, count: baseProducts.filter((p) => p.technology === value).length }));

  // Brand counts are "optimistic": computed against every other active filter
  // except the brand filter itself, so picking one brand doesn't hide the rest.
  const productsForBrandFacet = applyFilters(
    baseProducts,
    { ...filters, brands: [] },
    (p) => categoryById.get(p.categoryId) ?? "",
    (p) => categoryNameById.get(p.categoryId) ?? ""
  );
  const brandOptions = Array.from(new Set(baseProducts.map((p) => p.brand).filter((v): v is string => Boolean(v))))
    .map((value) => ({ value, count: productsForBrandFacet.filter((p) => p.brand === value).length }))
    .filter((opt) => opt.count > 0)
    .sort((a, b) => {
      const aKnown = KNOWN_BRANDS.includes(a.value);
      const bKnown = KNOWN_BRANDS.includes(b.value);
      if (aKnown !== bKnown) return aKnown ? -1 : 1;
      return a.value.localeCompare(b.value);
    });

  const offersCount = baseProducts.filter((p) => p.oldPrice != null).length;

  const sorted = sortProducts(products, sort);
  const { items, page: currentPage, hasMore } = paginate(sorted, page);

  return (
    <main className="bg-white">

      {/* Breadcrumb */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-1">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
            <span>›</span>
            <span className="text-gray-600">Produse</span>
          </nav>
        </div>
      </section>

      {/* ── PRODUCTS GRID ── */}
      <section className="bg-white pt-2 pb-10 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <ProductFilterSidebar
              sort={sort}
              categories={categoryOptions}
              technologies={technologyOptions}
              energyClasses={energyClassOptions}
              brands={brandOptions}
              priceBounds={priceBounds}
              offersCount={offersCount}
            />

            <div className="flex-1 min-w-0">
              {filters.query ? (
                <p className="text-sm text-gray-500 mb-3 sm:mb-6">
                  {products.length} rezultate pentru <span className="font-bold text-[#1d2353]">&ldquo;{filters.query}&rdquo;</span>
                </p>
              ) : (
                <p className="text-sm text-gray-400 mb-3 sm:mb-6">{products.length} produse găsite</p>
              )}

              {items.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-5">
                  {items.map((product) => (
                    <ProductCard
                      key={product.id}
                      {...product}
                      name={localProductNames[product.slug] ?? product.name}
                      image={localProductImages[product.slug] ?? product.image}
                      badge={localProductBadges[product.slug] ?? product.badge}
                      showDiscount={filters.offersOnly}
                      installmentsEnabled={ratesEnabled && product.installmentsEnabled !== false}
                      installmentMonths={installmentMonths}
                      variants={product.variants}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-gray-500">
                    {filters.query
                      ? `Niciun produs nu corespunde căutării "${filters.query}".`
                      : filters.offersOnly
                      ? "Momentan nu există oferte speciale active."
                      : "Niciun produs nu corespunde filtrelor selectate."}
                  </p>
                </div>
              )}

              <LoadMoreButton
                basePath="/produse"
                page={currentPage}
                sort={sort}
                hasMore={hasMore}
                extraParams={{
                  ...(filters.query ? { q: filters.query } : {}),
                  ...(filters.offersOnly ? { oferte: "1" } : {}),
                  ...(filters.categorySlugs.length > 0 ? { cat: filters.categorySlugs.join(",") } : {}),
                  ...(filters.technologies.length > 0 ? { tehnologie: filters.technologies.join(",") } : {}),
                  ...(filters.energyClasses.length > 0 ? { energie: filters.energyClasses.join(",") } : {}),
                  ...(filters.brands.length > 0 ? { brand: filters.brands.join(",") } : {}),
                  ...(filters.priceMin !== null ? { pretMin: String(filters.priceMin) } : {}),
                  ...(filters.priceMax !== null ? { pretMax: String(filters.priceMax) } : {}),
                }}
              />
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
