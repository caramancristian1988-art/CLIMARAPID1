import Link from "next/link";
import Image from "next/image";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../components/AdminPageHeader";
import DeleteButton from "../components/DeleteButton";
import AdminProductFilters from "./AdminProductFilters";
import AdminPagination from "../components/AdminPagination";
import CopyableId from "../components/CopyableId";
import { deleteProductAction } from "@/lib/adminProductActions";

const PER_PAGE = 10;

const OBJECT_ID_RE = /^[0-9a-fA-F]{24}$/;
const SHORT_CODE_RE = /^[0-9a-fA-F]{1,23}$/;

async function getData(catFilter: string, sort: string, page: number, search: string) {
  // When search looks like a short product code (hex chars, not a full 24-char ObjectId),
  // convert _id to string in an aggregation pipeline so regex works on the hex representation.
  let shortCodeIds: string[] = [];
  if (search && SHORT_CODE_RE.test(search) && !OBJECT_ID_RE.test(search)) {
    try {
      const raw = await prisma.product.aggregateRaw({
        pipeline: [
          { $addFields: { _idStr: { $toString: "$_id" } } },
          { $match: { _idStr: { $regex: search.toLowerCase(), $options: "i" } } },
          { $project: { _id: 1 } },
        ],
      }) as unknown as Array<{ _id: { $oid: string } }>;
      shortCodeIds = raw.map((r) => r._id.$oid).filter(Boolean);
    } catch {
      shortCodeIds = [];
    }
  }

  const where: Prisma.ProductWhereInput = {
    ...(catFilter ? { categoryId: catFilter } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
            { brand: { contains: search, mode: "insensitive" } },
            ...(OBJECT_ID_RE.test(search) ? [{ id: search }] : []),
            ...(shortCodeIds.length > 0 ? [{ id: { in: shortCodeIds } }] : []),
          ],
        }
      : {}),
  };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "name-asc"
      ? { name: "asc" }
      : sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
      ? { price: "desc" }
      : { createdAt: "desc" };

  try {
    const [products, total, categories] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
        include: { category: true },
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({ orderBy: { name: "asc" } }),
    ]);
    return { products, total, categories };
  } catch {
    return { products: [], total: 0, categories: [] };
  }
}

function ProductRow({ product, deleteAction }: { product: Awaited<ReturnType<typeof getData>>["products"][number]; deleteAction: typeof deleteProductAction }) {
  return (
    <div className="flex items-start gap-3 p-4">
      <div className="relative w-12 h-12 rounded-xl bg-[#f6f8fb] overflow-hidden shrink-0 mt-0.5">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill className="object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 8H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2zM4 6h16V4H4v2z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-[#1d2353] line-clamp-2 leading-snug">{product.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <p className="text-xs text-gray-400">{product.category?.name ?? "Fără categorie"}</p>
          <CopyableId id={product.id} />
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-sm font-bold text-[#1d2353]">{product.price.toLocaleString("ro-MD")} MDL</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              product.availability === "Stoc epuizat" ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"
            }`}
          >
            {product.availability}
          </span>
          <div className="ml-auto flex items-center gap-0.5">
            <Link
              href={`/produse/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#c7092b] transition-colors p-1.5 rounded-lg hover:bg-[#fdf2f3]"
              aria-label="Vezi pe site"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
            <Link
              href={`/admin/produse/${product.id}`}
              className="text-gray-400 hover:text-[#c7092b] transition-colors p-1.5 rounded-lg hover:bg-[#fdf2f3]"
              aria-label="Editează"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 113 3L12 13l-4 1 1-4 8.5-8.5z" />
              </svg>
            </Link>
            <DeleteButton action={deleteAction} id={product.id} confirmText="Sigur vrei să ștergi acest produs?" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function AdminProdusePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;

  const catFilter = typeof query.cat === "string" ? query.cat : "";
  const sort = typeof query.sort === "string" ? query.sort : "newest";
  const search = typeof query.q === "string" ? query.q.trim() : "";
  const page = Math.max(1, Number(query.page) || 1);

  const { products, total, categories } = await getData(catFilter, sort, page, search);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div>
      <AdminPageHeader
        title="Produse"
        description="Catalogul de produse afișat pe site."
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/produse/categorii"
              className="inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 text-[#1d2353] font-bold px-5 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
            >
              Categorii (filtre)
            </Link>
            <Link
              href="/admin/produse/nou"
              className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Adaugă produs
            </Link>
          </div>
        }
      />

      <AdminProductFilters categories={categories} />
      <p className="text-xs text-gray-400 mb-4">{total} produse găsite</p>

      {products.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500">
          Nu există produse pentru acest filtru.
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="divide-y divide-gray-100">
            {products.map((p) => (
              <ProductRow key={p.id} product={p} deleteAction={deleteProductAction} />
            ))}
          </div>
        </div>
      )}

      <AdminPagination page={page} totalPages={totalPages} />
    </div>
  );
}
