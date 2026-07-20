import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPageHeader from "../../components/AdminPageHeader";
import DeleteButton from "../../components/DeleteButton";
import CopyableId from "../../components/CopyableId";
import ProductForm from "../ProductForm";
import { updateProductAction } from "@/lib/adminProductActions";
import { deleteProductFaqAction } from "@/lib/adminProductFaqActions";
import { deleteVariantAction } from "@/lib/adminProductVariantActions";
import { createAdminReviewAction, deleteAdminReviewAction } from "@/lib/adminReviewActions";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories, brandRows] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({ where: { brand: { not: null } }, distinct: ["brand"], select: { brand: true }, orderBy: { brand: "asc" } }),
  ]);
  if (!product) notFound();
  const brands = brandRows.map((b) => b.brand!).filter(Boolean);

  let faqs: Awaited<ReturnType<typeof prisma.productFaq.findMany>> = [];
  let productReviews: Awaited<ReturnType<typeof prisma.review.findMany>> = [];
  let variants: Awaited<ReturnType<typeof prisma.productVariant.findMany>> = [];
  try {
    [faqs, productReviews, variants] = await Promise.all([
      prisma.productFaq.findMany({ where: { productId: id }, orderBy: { order: "asc" } }),
      prisma.review.findMany({ where: { product: product.name }, orderBy: { createdAt: "desc" } }),
      prisma.productVariant.findMany({ where: { productId: id }, orderBy: { order: "asc" } }),
    ]);
  } catch {
    faqs = [];
    productReviews = [];
    variants = [];
  }

  return (
    <div>
      <AdminPageHeader
        title="Editează produs"
        action={
          <div className="flex items-center gap-4">
            <CopyableId id={product.id} className="inline-flex items-center gap-1.5 font-mono text-xs text-gray-400 hover:text-[#c7092b] transition-colors" />
            <Link
              href={`/produse/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[#c7092b] transition-colors"
            >
              Vezi pe site
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        }
      />
      <ProductForm action={updateProductAction} defaults={product} categories={categories} brands={brands} submitLabel="Salvează modificările" />

      {/* Variants section */}
      <div className="mt-8">
        <AdminPageHeader
          title="Variante BTU / m²"
          description="Dacă un model are mai multe capacități (9000, 12000 BTU...), adaugă fiecare ca variantă. Clientul le va selecta pe pagina produsului."
          action={
            <Link
              href={`/admin/produse/${product.id}/variante/nou`}
              className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Adaugă variantă
            </Link>
          }
        />

        {variants.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500 max-w-xl">
            Nicio variantă adăugată. Dacă produsul are o singură configurație, nu e necesar.
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden max-w-xl">
            <div className="divide-y divide-gray-100">
              {variants.map((v) => (
                <div key={v.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1d2353]">
                      {v.label}
                      {v.surface && <span className="ml-1 text-gray-400 font-normal">({v.surface} m²)</span>}
                      {v.btu && <span className="ml-1 text-gray-400 font-normal">/ {v.btu.toLocaleString()} BTU</span>}
                    </p>
                    <p className="text-xs text-gray-500">
                      {v.price.toLocaleString("ro-MD")} MDL
                      {v.oldPrice && ` (vechi: ${v.oldPrice.toLocaleString("ro-MD")} MDL)`}
                      {v.badge && ` · ${v.badge}`}
                      {" · "}{v.availability}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/admin/produse/${product.id}/variante/${v.id}`}
                      className="text-gray-400 hover:text-[#c7092b] transition-colors p-1.5 rounded-lg hover:bg-[#fdf2f3]"
                      aria-label="Editează"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 113 3L12 13l-4 1 1-4 8.5-8.5z" />
                      </svg>
                    </Link>
                    <DeleteButton action={deleteVariantAction} id={v.id} confirmText="Sigur vrei să ștergi această variantă?" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <AdminPageHeader
          title="Întrebări frecvente despre acest produs"
          description="Apar pe pagina produsului, sub recenzii. Opțional — dacă nu adaugi nimic, secțiunea nu apare deloc."
          action={
            <Link
              href={`/admin/produse/${product.id}/faq/nou`}
              className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-5 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Adaugă întrebare
            </Link>
          }
        />

        {faqs.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500 max-w-xl">
            Nu există întrebări adăugate pentru acest produs.
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden max-w-xl">
            <div className="divide-y divide-gray-100">
              {faqs.map((faq) => (
                <div key={faq.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1d2353] truncate">{faq.question}</p>
                    <p className="text-xs text-gray-500 truncate">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link
                      href={`/admin/produse/${product.id}/faq/${faq.id}`}
                      className="text-gray-400 hover:text-[#c7092b] transition-colors p-1.5 rounded-lg hover:bg-[#fdf2f3]"
                      aria-label="Editează"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.5-9.5a2.121 2.121 0 113 3L12 13l-4 1 1-4 8.5-8.5z" />
                      </svg>
                    </Link>
                    <DeleteButton action={deleteProductFaqAction} id={faq.id} confirmText="Sigur vrei să ștergi această întrebare?" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product reviews */}
      <div className="mt-8">
        <AdminPageHeader
          title="Recenzii produs"
          description="Recenziile clienților pentru acest produs. Cele adăugate manual sunt publicate direct."
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Review list */}
          <div>
            {productReviews.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500">
                Nu există recenzii pentru acest produs încă.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {productReviews.map((r) => (
                  <div
                    key={r.id}
                    className={`bg-white border rounded-2xl p-4 flex items-start gap-3 ${r.approved ? "border-gray-100" : "border-amber-200 bg-amber-50/30"}`}
                  >
                    <div className="w-9 h-9 rounded-full bg-[#1d2353] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {r.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm text-[#1d2353]">{r.name}</p>
                          {!r.approved && (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                              ÎN AȘTEPTARE
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Link
                            href={`/admin/recenzii/${r.id}`}
                            className="text-xs font-bold text-gray-400 hover:text-[#c7092b] transition-colors"
                          >
                            Editează
                          </Link>
                          <DeleteButton action={deleteAdminReviewAction} id={r.id} confirmText="Sigur vrei să ștergi această recenzie?" />
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(r.rating) ? "text-amber-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-1.5 leading-relaxed line-clamp-3">{r.text}</p>
                      {(r.pros || r.cons) && (
                        <div className="mt-2 flex flex-col gap-1">
                          {r.pros && (
                            <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg px-2.5 py-1.5">
                              <span className="font-bold">+ Plusuri:</span> {r.pros}
                            </p>
                          )}
                          {r.cons && (
                            <p className="text-xs text-[#c7092b] bg-red-50 rounded-lg px-2.5 py-1.5">
                              <span className="font-bold">− Minusuri:</span> {r.cons}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick-add form */}
          <form action={createAdminReviewAction} className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 h-fit">
            <p className="font-bold text-sm text-[#1d2353]">Adaugă recenzie</p>
            <input type="hidden" name="product" value={product.name} />
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-gray-600">Nume client <span className="text-[#c7092b]">*</span></span>
              <input
                name="name"
                required
                placeholder="Ion Popescu"
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c7092b]"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-gray-600">Text recenzie <span className="text-[#c7092b]">*</span></span>
              <textarea
                name="text"
                required
                rows={3}
                placeholder="Produs excelent, recomand!"
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c7092b] resize-none"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-gray-600">Rating <span className="text-[#c7092b]">*</span></span>
              <select
                name="rating"
                required
                defaultValue="5"
                className="border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#c7092b] bg-white"
              >
                <option value="5">5 stele</option>
                <option value="4">4 stele</option>
                <option value="3">3 stele</option>
                <option value="2">2 stele</option>
                <option value="1">1 stea</option>
              </select>
            </label>
            <button
              type="submit"
              className="self-start bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm uppercase tracking-wide"
            >
              Adaugă recenzie
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
