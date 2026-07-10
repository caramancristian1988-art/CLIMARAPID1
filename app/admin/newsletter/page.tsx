import { prisma } from "@/lib/prisma";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import NewsletterComposer from "./NewsletterComposer";

export const dynamic = "force-dynamic";

export default async function NewsletterAdminPage() {
  const [subscribers, categories, brandsRaw] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.product.findMany({ select: { brand: true }, distinct: ["brand"] }),
  ]);

  const brands = brandsRaw
    .map((b) => b.brand)
    .filter((b): b is string => !!b)
    .sort();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Newsletter"
        description={`${subscribers.length} abonat${subscribers.length !== 1 ? "ți" : ""}`}
      />
      <div className="mt-6">
        <NewsletterComposer
          subscribers={subscribers.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() }))}
          categories={categories}
          brands={brands}
        />
      </div>
    </div>
  );
}
