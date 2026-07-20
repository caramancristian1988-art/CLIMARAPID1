"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "../components/CartProvider";

export default function CosPage() {
  const { items, cartCount, removeFromCart, updateQuantity } = useCart();
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const savings = items.reduce((sum, i) => sum + (i.oldPrice ? (i.oldPrice - i.price) * i.quantity : 0), 0);

  return (
    <main className="bg-white min-h-[60vh]">
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
            <span>›</span>
            <span className="text-gray-600">Coș</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1d2353]">
            Coșul <span className="text-[#c7092b]">tău</span>
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {cartCount > 0 ? `${cartCount} produs${cartCount === 1 ? "" : "e"} în coș` : "Coșul tău este gol."}
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          {items.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
              {/* Items */}
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <div
                    key={item.cartKey}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 border border-gray-100 rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <Link href={`/produse/${item.slug}`} className="relative w-20 h-20 shrink-0 bg-[#f6f8fb] rounded-xl overflow-hidden">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill className="object-contain" sizes="80px" />
                        ) : (
                          <svg className="w-8 h-8 text-gray-200 absolute inset-0 m-auto" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 8H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2zM4 6h16V4H4v2z" />
                          </svg>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link href={`/produse/${item.slug}`} className="font-bold text-sm text-[#0f172a] hover:text-[#c7092b] transition-colors line-clamp-2">
                          {item.name}
                        </Link>
                        <div className="flex items-center gap-2 flex-wrap mt-1">
                          <p className="text-sm font-extrabold text-gray-900">
                            {item.price.toLocaleString("ro-MD")} MDL
                          </p>
                          {item.oldPrice && (
                            <>
                              <p className="text-xs text-gray-400 line-through">
                                {item.oldPrice.toLocaleString("ro-MD")} MDL
                              </p>
                              <span className="text-[11px] font-bold text-white bg-[#c7092b] px-1.5 py-0.5 rounded">
                                -{Math.round((1 - item.price / item.oldPrice) * 100)}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
                      <div className="flex items-center gap-2 border border-gray-200 rounded-lg shrink-0">
                        <button
                          onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#c7092b] disabled:text-gray-300 transition-colors"
                          aria-label="Scade cantitatea"
                        >
                          −
                        </button>
                        <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-[#c7092b] transition-colors"
                          aria-label="Crește cantitatea"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                        <p className="text-sm font-extrabold text-[#1d2353] sm:w-24 sm:text-right">
                          {(item.price * item.quantity).toLocaleString("ro-MD")} MDL
                        </p>

                        <button
                          onClick={() => removeFromCart(item.cartKey)}
                          aria-label="Elimină din coș"
                          className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-[#c7092b] hover:bg-gray-50 rounded-lg transition-colors shrink-0"
                        >
                          <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="border border-gray-100 rounded-2xl p-6 h-fit">
                <h2 className="font-extrabold text-[#1d2353] mb-4">Sumar comandă</h2>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">{subtotal.toLocaleString("ro-MD")} MDL</span>
                </div>
                {savings > 0 && (
                  <div className="flex items-center justify-between text-sm text-emerald-600 mb-2">
                    <span>Economisești</span>
                    <span className="font-bold">−{savings.toLocaleString("ro-MD")} MDL</span>
                  </div>
                )}
                <p className="text-xs text-gray-400 mb-4">Costul instalării și livrării se stabilește la confirmarea comenzii.</p>
                <div className="flex items-center justify-between border-t border-gray-100 pt-4 mb-6">
                  <span className="font-bold text-[#1d2353]">Total</span>
                  <span className="font-extrabold text-xl text-[#1d2353]">{subtotal.toLocaleString("ro-MD")} MDL</span>
                </div>
                <Link
                  href="/finalizare-comanda"
                  className="w-full flex items-center justify-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold h-12 rounded-xl transition-colors text-sm uppercase tracking-wide"
                >
                  Finalizează comanda
                </Link>
                <Link
                  href="/produse"
                  className="w-full flex items-center justify-center gap-2 mt-3 text-[#1d2353] hover:text-[#c7092b] font-bold h-12 rounded-xl transition-colors text-sm"
                >
                  Continuă cumpărăturile
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500 mb-6">Adaugă produse în coș pentru a continua.</p>
              <Link
                href="/produse"
                className="inline-flex items-center bg-[#1d2353] hover:bg-[#2a3470] text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm uppercase tracking-wide"
              >
                Vezi produsele
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
