"use client";

import Link from "next/link";
import { useFavorites } from "./FavoritesProvider";
import { useCart } from "./CartProvider";

export default function AccountStats() {
  const { favorites } = useFavorites();
  const { cartCount } = useCart();

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Link
        href="/favorite"
        aria-label="Produse favorite"
        className="border border-gray-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
      >
        <span className="w-11 h-11 rounded-full bg-[#fdf2f3] text-[#c7092b] flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </span>
        <div>
          <p className="text-2xl font-extrabold text-[#1d2353] leading-none mb-1">{favorites.length}</p>
          <p className="text-sm text-gray-500">Produse favorite</p>
        </div>
      </Link>
      <Link
        href="/cos"
        className="border border-gray-100 rounded-2xl p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
      >
        <span className="w-11 h-11 rounded-full bg-[#fdf2f3] text-[#c7092b] flex items-center justify-center shrink-0">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </span>
        <div>
          <p className="text-2xl font-extrabold text-[#1d2353] leading-none mb-1">{cartCount}</p>
          <p className="text-sm text-gray-500">Produse în coș</p>
        </div>
      </Link>
    </div>
  );
}
