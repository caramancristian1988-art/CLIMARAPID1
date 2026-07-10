"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  oldPrice?: number | null;
  image?: string | null;
  brand?: string | null;
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
}

interface Props {
  subscribers: Subscriber[];
  categories: Category[];
  brands: string[];
}

export default function NewsletterComposer({ subscribers, categories, brands }: Props) {
  const [selectedSubscribers, setSelectedSubscribers] = useState<Set<string>>(new Set());
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    const params = new URLSearchParams({ page: String(page), search, categoryId, brand });
    const res = await fetch(`/api/newsletter/products?${params}`);
    const data = await res.json();
    setProducts(data.products);
    setTotalPages(data.pages || 1);
    setTotalProducts(data.total || 0);
    setLoadingProducts(false);
  }, [page, search, categoryId, brand]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // reset page on filter change
  useEffect(() => { setPage(1); }, [search, categoryId, brand]);

  const allSubsSelected = subscribers.length > 0 && selectedSubscribers.size === subscribers.length;

  function toggleAllSubscribers() {
    if (allSubsSelected) {
      setSelectedSubscribers(new Set());
    } else {
      setSelectedSubscribers(new Set(subscribers.map((s) => s.id)));
    }
  }

  function toggleSubscriber(id: string) {
    setSelectedSubscribers((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleProduct(id: string) {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleSend() {
    if (!selectedSubscribers.size || !selectedProducts.size) return;
    setSending(true);
    setSentMsg("");
    const res = await fetch("/api/newsletter/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscriberIds: Array.from(selectedSubscribers),
        productIds: Array.from(selectedProducts),
      }),
    });
    const data = await res.json();
    setSending(false);
    if (res.ok) {
      setSentMsg(`✓ Newsletter trimis la ${data.sent} abonat${data.sent !== 1 ? "ți" : ""}!`);
      setSelectedProducts(new Set());
    } else {
      setSentMsg(`Eroare: ${data.error}`);
    }
  }

  const canSend = selectedSubscribers.size > 0 && selectedProducts.size > 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Send bar */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-5 py-4">
        <div className="text-sm text-gray-600">
          <span className="font-semibold text-gray-900">{selectedSubscribers.size}</span> abonat{selectedSubscribers.size !== 1 ? "ți" : ""} ·{" "}
          <span className="font-semibold text-gray-900">{selectedProducts.size}</span> produs{selectedProducts.size !== 1 ? "e" : ""} selectate
        </div>
        <div className="flex items-center gap-3">
          {sentMsg && (
            <span className={`text-sm font-medium ${sentMsg.startsWith("✓") ? "text-green-600" : "text-red-600"}`}>{sentMsg}</span>
          )}
          <button
            onClick={handleSend}
            disabled={!canSend || sending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#c7092b] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? (
              <span className="animate-pulse">Se trimite...</span>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
                Trimite newsletter
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
        {/* Subscribers panel */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-semibold text-gray-700">Abonați ({subscribers.length})</span>
            <button
              onClick={toggleAllSubscribers}
              className="text-xs font-semibold text-[#c7092b] hover:opacity-75 transition-opacity"
            >
              {allSubsSelected ? "Deselectează toți" : "Selectează toți"}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[520px] divide-y divide-gray-50">
            {subscribers.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">Niciun abonat</div>
            ) : (
              subscribers.map((s) => (
                <label key={s.id} className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedSubscribers.has(s.id)}
                    onChange={() => toggleSubscriber(s.id)}
                    className="w-4 h-4 accent-[#c7092b] shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.email}</p>
                    <p className="text-[11px] text-gray-400">
                      {new Date(s.createdAt).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Products panel */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col">
          {/* Filters */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex flex-wrap gap-2">
            <input
              type="text"
              placeholder="Caută produs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[140px] h-8 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#c7092b]"
            />
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-8 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#c7092b] bg-white"
            >
              <option value="">Toate categoriile</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="h-8 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#c7092b] bg-white"
            >
              <option value="">Toate brandurile</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            {(search || categoryId || brand) && (
              <button
                onClick={() => { setSearch(""); setCategoryId(""); setBrand(""); }}
                className="h-8 px-3 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Resetează
              </button>
            )}
          </div>

          {/* Grid */}
          <div className="p-4 flex-1">
            {loadingProducts ? (
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="rounded-xl bg-gray-100 animate-pulse h-48" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center text-gray-400 text-sm">Niciun produs găsit</div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {products.map((p) => {
                  const selected = selectedProducts.has(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleProduct(p.id)}
                      className={`relative cursor-pointer rounded-xl border-2 overflow-hidden transition-all ${
                        selected ? "border-[#c7092b] shadow-md" : "border-transparent hover:border-gray-200"
                      }`}
                    >
                      {selected && (
                        <div className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-[#c7092b] flex items-center justify-center shadow">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="bg-gray-50 h-28 relative">
                        {p.image ? (
                          <Image src={p.image} alt={p.name} fill className="object-contain p-2" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 mb-1">{p.name}</p>
                        <p className="text-sm font-bold text-[#c7092b]">{p.price.toLocaleString("ro-RO")} Lei</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400">{totalProducts} produse</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                      p === page ? "bg-[#c7092b] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
