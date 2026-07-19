import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import {
  fallbackCategories,
  fallbackProducts,
  fallbackPopularProducts,
  fallbackOfferProducts,
} from "@/lib/fallbackData";
import Hero from "@/app/components/Hero";
import CategoryGrid from "@/app/components/CategoryGrid";
import ProductsSection from "@/app/components/ProductsSection";
import ServicesSection from "@/app/components/ServicesSection";
import TrustBar from "@/app/components/TrustBar";
import ReviewsSection from "@/app/components/ReviewsSection";

export const revalidate = 3600;

async function getData() {
  try {
    const [categories, products, popularProducts, reviews] = await Promise.all([
      prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.product.findMany({ take: 4, orderBy: { rating: "desc" } }),
      prisma.product.findMany({ take: 4, orderBy: { reviewCount: "desc" } }),
      prisma.review.findMany({
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, name: true, rating: true, text: true, product: true },
      }),
    ]);
    return {
      categories,
      products,
      popularProducts,
      offerProducts: fallbackOfferProducts.slice(0, 4),
      reviews,
    };
  } catch {
    return {
      categories: fallbackCategories,
      products: fallbackProducts,
      popularProducts: fallbackPopularProducts,
      offerProducts: fallbackOfferProducts.slice(0, 4),
      reviews: [],
    };
  }
}

export default async function HomePage() {
  const [{ categories, products, popularProducts, offerProducts, reviews }, t] = await Promise.all([
    getData(),
    getTranslations("home"),
  ]);

  return (
    <main>
      <Hero />
      <CategoryGrid categories={categories} />
      <ProductsSection
        products={products}
        title={t("productsTitle")}
        highlighted={t("recommended")}
      />
      <ProductsSection
        products={popularProducts}
        title={t("productsTitle")}
        highlighted={t("popular")}
        viewAllHref="/produse?sort=rating"
      />
      <ProductsSection
        products={offerProducts}
        title={t("offersTitle")}
        highlighted={t("offersHighlighted")}
        viewAllHref="/produse?oferte=1"
      />
      <ServicesSection />
      {reviews.length > 0 && <ReviewsSection reviews={reviews} />}
      <TrustBar />
    </main>
  );
}
