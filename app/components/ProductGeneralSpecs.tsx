"use client";

import { useEffect, useState } from "react";

interface Row {
  label: string;
  value: string;
  reactive?: boolean; // true = can be updated from variant change
}

interface Props {
  staticRows: Row[];        // Brand, Tehnologie, Categorie — never change
  initialBtu: number | null;
  initialAvailability: string;
}

export default function ProductGeneralSpecs({ staticRows, initialBtu, initialAvailability }: Props) {
  const [btu, setBtu] = useState<number | null>(initialBtu);
  const [availability, setAvailability] = useState(initialAvailability);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ btu: number | null; availability: string }>).detail;
      if (detail?.btu !== undefined) setBtu(detail.btu);
      if (detail?.availability) setAvailability(detail.availability);
    };
    window.addEventListener("product-variant-change", handler);
    return () => window.removeEventListener("product-variant-change", handler);
  }, []);

  // Build the full row list, inserting reactive values in the right positions
  const rows: { label: string; value: string }[] = [];
  for (const r of staticRows) {
    if (r.label === "Capacitate" && btu) {
      rows.push({ label: "Capacitate", value: `${btu.toLocaleString("ro-MD")} BTU` });
    } else if (r.label === "Disponibilitate") {
      rows.push({ label: "Disponibilitate", value: availability });
    } else {
      rows.push(r);
    }
  }

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <div className="bg-[#f6f8fb] px-5 py-3 text-sm font-extrabold text-[#1d2353]">
        Informații generale
      </div>
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`flex items-center justify-between px-5 py-3 border-t border-gray-100 ${
            i % 2 === 1 ? "bg-[#fafbfc]" : ""
          }`}
        >
          <span className="text-sm text-gray-500">{row.label}</span>
          <span className="text-sm font-bold text-[#1d2353] text-right">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
