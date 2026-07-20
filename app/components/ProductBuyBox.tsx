"use client";

import { useEffect, useState } from "react";
import AddToCartButton from "./AddToCartButton";
import ProductOfferModal from "./ProductOfferModal";

export interface ProductVariantData {
  id: string;
  label: string;
  btu: number | null;
  surface: number | null;
  price: number;
  oldPrice: number | null;
  badge: string | null;
  isDefault: boolean;
  availability: string;
  specifications: { label: string; value: string }[];
}

interface Props {
  variants: ProductVariantData[];
  productId: string;
  productName: string;
  productSlug: string;
  displayImage: string | null;
  basePrice: number;
  baseOldPrice: number | null;
  baseAvailability: string;
  baseSpecs: { label: string; value: string }[];
  installmentsEnabled: boolean;
  installmentMonths: number;
}


export default function ProductBuyBox({
  variants,
  productId,
  productName,
  productSlug,
  displayImage,
  basePrice,
  baseOldPrice,
  baseAvailability,
  baseSpecs,
  installmentsEnabled,
  installmentMonths,
}: Props) {
  const hasVariants = variants.length > 0;

  const defaultIdx = hasVariants
    ? Math.max(0, variants.findIndex((v) => v.isDefault))
    : null;

  const [selectedIdx, setSelectedIdx] = useState<number | null>(defaultIdx);

  const selected = selectedIdx !== null ? variants[selectedIdx] : null;
  const price = selected?.price ?? basePrice;
  const oldPrice = selected?.oldPrice ?? baseOldPrice;
  const availability = selected?.availability ?? baseAvailability;
  const inStock = availability !== "Stoc epuizat";
  const discount = oldPrice && oldPrice > price ? Math.round((1 - price / oldPrice) * 100) : null;
  const discountAmount = oldPrice && discount ? Math.round(oldPrice - price) : null;
  const variantLabel = selected?.label;
  const cartName = variantLabel ? `${productName} — ${variantLabel}` : productName;

  const activeSpecs =
    selected && selected.specifications.length > 0 ? selected.specifications : baseSpecs;

  // Broadcast active specs to ProductVariantSpecs (below the fold)
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("product-variant-specs", { detail: { specs: activeSpecs } })
    );
  }, [selectedIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-5">
      {/* Variant selector — first so user selects before buying */}
      {hasVariants && (
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-[#1d2353] mb-3">
            Selectează capacitatea
          </p>
          <div className="flex flex-wrap gap-1.5">
            {variants.map((v, i) => {
              const isSelected = selectedIdx === i;
              const vDiscount =
                v.oldPrice && v.oldPrice > v.price
                  ? Math.round((1 - v.price / v.oldPrice) * 100)
                  : null;
              const pillBadge = v.badge ?? (vDiscount ? `-${vDiscount}%` : null);
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedIdx(i)}
                  className={`relative flex flex-col items-start px-2.5 py-1.5 rounded-lg border transition-all duration-150 ${
                    isSelected
                      ? "border-[#c7092b] bg-[#fdf2f3]"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {pillBadge && (
                    <span className="absolute -top-1.5 -right-1.5 bg-[#c7092b] text-white text-[9px] font-extrabold px-1 py-0.5 rounded leading-tight">
                      {pillBadge}
                    </span>
                  )}
                  <span
                    className={`text-xs font-extrabold leading-tight whitespace-nowrap ${
                      isSelected ? "text-[#c7092b]" : "text-[#1d2353]"
                    }`}
                  >
                    {v.label}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                    {v.price.toLocaleString("ro-MD")} MDL
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Price + buy */}
      <div className="border border-gray-100 rounded-2xl p-5">
        <div className="mb-1">
          {oldPrice && discount && (
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-sm text-gray-400 line-through">
                {oldPrice.toLocaleString("ro-MD")} MDL
              </span>
              <span className="inline-flex items-center bg-[#c7092b] text-white text-xs font-extrabold px-2.5 py-1 rounded-md">
                -{discountAmount?.toLocaleString("ro-MD")} MDL
              </span>
              <span className="inline-flex items-center bg-[#fdf2f3] text-[#c7092b] text-xs font-extrabold px-2.5 py-1 rounded-md">
                -{discount}%
              </span>
            </div>
          )}
          <span className="text-2xl font-extrabold text-gray-900">
            {price.toLocaleString("ro-MD")} MDL
          </span>
        </div>

        {installmentsEnabled && (
          <div className="inline-flex items-center gap-2 bg-[#eef1fb] rounded-lg px-3 py-2 mb-4">
            <span className="bg-[#1d2353] text-white text-[10px] font-extrabold px-2 py-1 rounded uppercase tracking-wide">
              Rate
            </span>
            <span className="text-xs font-bold text-[#1d2353]">
              în {installmentMonths} luni, de la{" "}
              {Math.ceil(price / installmentMonths).toLocaleString("ro-MD")} lei/lună
            </span>
          </div>
        )}

        <div className="flex items-stretch gap-3 mb-3">
          <AddToCartButton
            slug={productSlug}
            name={cartName}
            price={price}
            oldPrice={oldPrice}
            image={displayImage}
            inStock={inStock}
            variantLabel={variantLabel}
            className={`${installmentsEnabled ? "flex-[3]" : "flex-1"} h-12 rounded-xl text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${
              inStock
                ? "bg-[#c7092b] hover:bg-[#a5071f] text-white"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {inStock ? "Adaugă în coș" : "Stoc epuizat"}
          </AddToCartButton>

          {installmentsEnabled && (
            <ProductOfferModal
              productId={productId}
              productName={cartName}
              productImage={displayImage}
              title="Cumpără în rate"
              sourceLabel="Cerere achiziție în rate"
              className="flex-[2] h-12 flex items-center justify-center border-2 border-[#1d2353] text-[#1d2353] hover:bg-[#1d2353] hover:text-white font-bold rounded-xl transition-all duration-300 text-sm uppercase tracking-wide text-center hover:-translate-y-0.5 hover:shadow-md active:scale-95 active:translate-y-0"
            >
              Cumpără în rate
            </ProductOfferModal>
          )}
        </div>

        <ProductOfferModal
          productId={productId}
          productName={cartName}
          productImage={displayImage}
          className="w-full h-11 flex items-center justify-center gap-2 border border-gray-300 hover:border-[#c7092b] hover:text-[#c7092b] text-gray-600 text-sm font-bold rounded-xl transition-colors active:scale-95"
        >
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Cere consultație
        </ProductOfferModal>
      </div>
    </div>
  );
}
