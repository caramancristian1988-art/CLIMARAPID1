import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://www.climatrapid.md";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/produse`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/servicii`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/servicii/instalare`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/servicii/mentenanta`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/servicii/diagnosticare`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/servicii/consultanta`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/servicii/multisplit`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/servicii/comerciale`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/despre`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/faq`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/proiecte`, changeFrequency: "weekly", priority: 0.4 },
    { url: `${BASE_URL}/confidentialitate`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/termeni`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const [categories, products, blogPosts] = await Promise.all([
      prisma.category.findMany({ select: { slug: true } }),
      prisma.product.findMany({ select: { slug: true, createdAt: true } }),
      prisma.blogPost.findMany({ select: { slug: true, createdAt: true }, where: { published: true } }),
    ]);

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
      url: `${BASE_URL}/produse/${c.slug}`,
      changeFrequency: "daily",
      priority: 0.8,
    }));

    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${BASE_URL}/produse/${p.slug}`,
      lastModified: p.createdAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((b) => ({
      url: `${BASE_URL}/blog/${b.slug}`,
      lastModified: b.createdAt,
      changeFrequency: "monthly",
      priority: 0.5,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
  } catch {
    return staticRoutes;
  }
}
