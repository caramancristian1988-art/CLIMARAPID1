"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import FavoriteButton from "./FavoriteButton";
import AddToCartButton from "./AddToCartButton";

interface VariantPill {
  id: string;
  label: string;
  price: number;
  oldPrice: number | null;
  badge: string | null;
  isDefault: boolean;
}

interface ProductCardProps {
  name: string;
  slug: string;
  price: number;
  oldPrice?: number | null;
  image?: string | null;
  btu?: number | null;
  technology?: string | null;
  energyClass?: string | null;
  rating: number;
  reviewCount: number;
  badge?: string | null;
  showDiscount?: boolean;
  installmentsEnabled?: boolean;
  installmentMonths?: number;
  variants?: VariantPill[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(rating);
        return (
          <svg
            key={star}
            className={`w-4 h-4 ${filled ? "text-amber-400" : "text-gray-200"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      })}
    </div>
  );
}

export default function ProductCard({
  name,
  slug,
  price,
  oldPrice,
  image,
  btu,
  technology,
  energyClass,
  rating,
  reviewCount,
  badge,
  installmentsEnabled,
  installmentMonths = 4,
  variants,
}: ProductCardProps) {
  const t = useTranslations("product");

  const hasVariants = variants && variants.length > 0;
  const defaultVariantIdx = hasVariants
    ? Math.max(0, variants!.findIndex((v) => v.isDefault))
    : null;

  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number | null>(defaultVariantIdx);

  // On cards: show only m²-based variants, deduplicated by surface number.
  // This removes BTU-exterior variants and duplicate surfaces (e.g. same m² in different colors/types).
  const cardVariants: { originalIdx: number; label: string; id: string }[] = (() => {
    if (!hasVariants) return [];
    const seenM2 = new Set<string>();
    return variants!
      .map((v, originalIdx) => ({ v, originalIdx }))
      .filter(({ v }) => {
        if (!v.label.includes("m²")) return false;
        const m = v.label.match(/^(\d+)/);
        const key = m ? m[1] : v.label;
        if (seenM2.has(key)) return false;
        seenM2.add(key);
        return true;
      })
      .map(({ v, originalIdx }) => ({ originalIdx, label: v.label, id: v.id }));
  })();

  const selectedVariant = selectedVariantIdx !== null && hasVariants ? variants![selectedVariantIdx] : null;
  const displayPrice = selectedVariant?.price ?? price;
  const displayOldPrice = selectedVariant?.oldPrice ?? oldPrice;
  const displayVariantLabel = selectedVariant?.label;

  const discount = displayOldPrice ? Math.round((1 - displayPrice / displayOldPrice) * 100) : null;
  const discountAmount = displayOldPrice ? Math.round(displayOldPrice - displayPrice) : null;
  const displayBadge = badge ?? (discount ? `-${discount}%` : null);

  const specs = [
    btu ? `${(btu / 1000).toFixed(0)}000 BTU` : null,
    technology || null,
    energyClass ? `${t("class")} ${energyClass}` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="group bg-white rounded-2xl border border-transparent overflow-hidden h-full flex flex-col transition-all duration-300 hover:border-gray-200 hover:shadow-xl active:border-gray-200 active:shadow-xl focus-within:border-gray-200 focus-within:shadow-xl hover:-translate-y-1">
      {/* Image area */}
      <div className="relative h-[180px] sm:h-[240px] lg:h-[280px] flex items-center justify-center bg-white overflow-hidden">
        <Link href={`/produse/${slug}`} className="w-full h-full flex items-center justify-center">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
              className="object-contain"
            />
          ) : (
            <svg className="w-24 h-24 text-gray-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 8H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2zM4 6h16V4H4v2z" />
            </svg>
          )}
        </Link>

        {/* Badge */}
        {displayBadge && (
          <span className="absolute top-2 left-2 sm:top-4 sm:left-4 max-w-[calc(100%-2.75rem)] sm:max-w-[70%] bg-[#c7092b] text-white text-[10px] sm:text-xs font-bold rounded-full px-2.5 sm:px-3.5 py-1 uppercase tracking-wide truncate shadow-sm">
            {displayBadge}
          </span>
        )}

        {/* Favorite */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
          <FavoriteButton
            product={{ slug, name, price: displayPrice, oldPrice: displayOldPrice, image, btu, technology, energyClass, rating, reviewCount, badge }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Name */}
        <Link href={`/produse/${slug}`}>
          <h3 className="text-[13px] sm:text-[15px] lg:text-[17px] font-bold text-[#0f172a] leading-snug line-clamp-3 mb-2 hover:text-[#c7092b] transition-colors">
            {name}
          </h3>
        </Link>

        {/* Specs */}
        {specs && (
          <p className="text-xs text-gray-500 mb-3">{specs}</p>
        )}

        {/* Variant pills — only m² variants, deduplicated */}
        {cardVariants.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3 overflow-hidden max-h-[56px]">
            {cardVariants.map(({ originalIdx, label, id }) => (
              <button
                key={id}
                onClick={(e) => { e.preventDefault(); setSelectedVariantIdx(originalIdx); }}
                className={`text-[11px] font-bold px-2 py-1 rounded-full border transition-all ${
                  selectedVariantIdx === originalIdx
                    ? "bg-[#1d2353] text-white border-[#1d2353]"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2 mb-4">
          <StarRating rating={rating} />
          <span className="text-sm text-gray-500">({reviewCount})</span>
        </div>

        {/* Price + actions */}
        <div className="mt-auto">
          <div className="mb-2">
            {displayOldPrice && discount && (
              <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                <span className="text-xs text-gray-400 line-through">
                  {displayOldPrice.toLocaleString("ro-MD")} MDL
                </span>
                <span className="inline-flex items-center bg-[#c7092b] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  -{discountAmount?.toLocaleString("ro-MD")} MDL
                </span>
                <span className="inline-flex items-center bg-[#fdf2f3] text-[#c7092b] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  -{discount}%
                </span>
              </div>
            )}
            <span className="text-base sm:text-lg lg:text-xl font-extrabold text-gray-900">
              {displayPrice.toLocaleString("ro-MD")} MDL
            </span>
          </div>

          {installmentsEnabled !== false && (
            <div className="inline-flex items-center gap-1.5 bg-[#eef1fb] rounded-full px-2.5 py-1 mb-3">
              <span className="bg-[#1d2353] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                {t("rate")}
              </span>
              <span className="text-[10px] font-bold text-[#1d2353]">
                {t("from")} {Math.ceil(displayPrice / installmentMonths).toLocaleString("ro-MD")} {t("perMonth")}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2">
            <AddToCartButton
              slug={slug}
              name={displayVariantLabel ? `${name} — ${displayVariantLabel}` : name}
              price={displayPrice}
              oldPrice={displayOldPrice ?? null}
              image={image ?? null}
              variantLabel={displayVariantLabel}
              className="flex-1 h-9 sm:h-11 bg-[#c7092b] hover:bg-[#a5071f] text-white text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 uppercase tracking-wide disabled:bg-gray-200 disabled:text-gray-400 active:scale-95 hover:shadow-md"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="hidden sm:inline">{t("addToCart")}</span>
            </AddToCartButton>
            <button
              onClick={() => { window.location.href = `/produse/${slug}`; }}
              className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center border border-gray-200 rounded-full shrink-0 text-gray-400 hover:border-[#c7092b] hover:text-[#c7092b] hover:shadow-md transition-all active:scale-95"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
