"use client";

import { useEffect, useState } from "react";

interface Spec {
  label: string;
  value: string;
}

export default function ProductVariantSpecs({ initialSpecs }: { initialSpecs: Spec[] }) {
  const [specs, setSpecs] = useState<Spec[]>(initialSpecs);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ specs: Spec[] }>).detail;
      if (detail?.specs) setSpecs(detail.specs);
    };
    window.addEventListener("product-variant-specs", handler);
    return () => window.removeEventListener("product-variant-specs", handler);
  }, []);

  if (specs.length === 0) return null;

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <div className="bg-[#f6f8fb] px-5 py-3 text-sm font-extrabold text-[#1d2353]">
        Caracteristici tehnice
      </div>
      {specs.map((spec, i) => (
        <div
          key={`${spec.label}-${i}`}
          className={`flex items-center justify-between px-5 py-3 border-t border-gray-100 ${
            i % 2 === 1 ? "bg-[#fafbfc]" : ""
          }`}
        >
          <span className="text-sm text-gray-500">{spec.label}</span>
          <span className="text-sm font-bold text-[#1d2353] text-right">{spec.value}</span>
        </div>
      ))}
    </div>
  );
}
