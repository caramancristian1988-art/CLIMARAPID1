import Link from "next/link";
import { getTranslations } from "next-intl/server";
import ProductCard from "./ProductCard";
import { localProductImages, localProductBadges, localProductNames } from "@/lib/productOverrides";
import { getSectionFlags } from "@/lib/siteSettings";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice: number | null;
  image: string | null;
  btu: number | null;
  technology: string;
  energyClass: string | null;
  rating: number;
  reviewCount: number;
  badge: string | null;
  installmentsEnabled?: boolean;
}

interface Props {
  products: Product[];
  title?: string;
  highlighted?: string;
  viewAllHref?: string;
  bg?: string;
  showDiscount?: boolean;
}

export default async function ProductsSection({ products, title, highlighted, viewAllHref = "/produse", bg = "bg-white", showDiscount = false }: Props) {
  const [{ ratesEnabled, installmentMonths }, t] = await Promise.all([
    getSectionFlags(),
    getTranslations("product"),
  ]);

  return (
    <section className={`py-16 ${bg}`}>
      <div className="max-w-7xl mx-auto px-4">
        {(title || highlighted) && (
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl font-extrabold text-[#111827] uppercase tracking-wide">
                {title} <span className="text-[#c7092b]">{highlighted}</span>
              </h2>
            </div>
            <Link
              href={viewAllHref}
              className="text-sm text-[#c7092b] hover:underline font-semibold flex items-center gap-1"
            >
              {t("viewAll")}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              {...product}
              name={localProductNames[product.slug] ?? product.name}
              image={localProductImages[product.slug] ?? product.image}
              badge={localProductBadges[product.slug] ?? product.badge}
              showDiscount={showDiscount}
              installmentsEnabled={ratesEnabled && product.installmentsEnabled !== false}
              installmentMonths={installmentMonths}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
