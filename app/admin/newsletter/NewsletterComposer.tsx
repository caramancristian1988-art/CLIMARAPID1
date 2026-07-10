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

  const [subject, setSubject] = useState("");
  const [offerLabel, setOfferLabel] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState<{ text: string; ok: boolean } | null>(null);

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
  useEffect(() => { setPage(1); }, [search, categoryId, brand]);

  const allSubsSelected = subscribers.length > 0 && selectedSubscribers.size === subscribers.length;

  function toggleAllSubscribers() {
    setSelectedSubscribers(allSubsSelected ? new Set() : new Set(subscribers.map((s) => s.id)));
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
    if (!selectedSubscribers.size || !subject.trim()) return;
    setSending(true);
    setSentMsg(null);
    const res = await fetch("/api/newsletter/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscriberIds: Array.from(selectedSubscribers),
        productIds: Array.from(selectedProducts),
        subject: subject.trim(),
        offerLabel: offerLabel.trim(),
        message: message.trim(),
      }),
    });
    const data = await res.json();
    setSending(false);
    if (res.ok) {
      setSentMsg({ text: `Trimis la ${data.sent} abonat${data.sent !== 1 ? "ți" : ""}!`, ok: true });
      setSelectedProducts(new Set());
      setSubject("");
      setOfferLabel("");
      setMessage("");
    } else {
      setSentMsg({ text: data.error || "Eroare la trimitere", ok: false });
    }
  }

  const canSend = selectedSubscribers.size > 0 && subject.trim();

  return (
    <div className="flex flex-col gap-6">
      {/* Products */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-gray-700 mr-1">Produse pentru ofertă</span>
          <input
            type="text"
            placeholder="Caută după nume sau ID produs..."
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
          {selectedProducts.size > 0 && (
            <span className="ml-auto text-xs font-semibold text-[#c7092b]">{selectedProducts.size} selectate</span>
          )}
        </div>

        <div className="p-4">
          {loadingProducts ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-9 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-gray-100 animate-pulse h-40" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">Niciun produs găsit</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-9 gap-3">
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
                      <div className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-[#c7092b] flex items-center justify-center shadow">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <div className="bg-gray-50 h-24 relative">
                      {p.image ? (
                        <Image src={p.image} alt={p.name} fill className="object-contain p-1.5" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-1.5">
                      <p className="text-[10px] font-semibold text-gray-800 leading-tight line-clamp-2 mb-0.5">{p.name}</p>
                      <p className="text-xs font-bold text-[#c7092b]">{p.price.toLocaleString("ro-RO")} Lei</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">{totalProducts} produse</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
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
                className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom: subscribers + compose */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Subscribers */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-semibold text-gray-700">
              Abonați
              {selectedSubscribers.size > 0 && (
                <span className="ml-2 text-[#c7092b]">{selectedSubscribers.size} din {subscribers.length} selectați</span>
              )}
            </span>
            <div className="flex gap-2">
              <button
                onClick={toggleAllSubscribers}
                className="text-xs font-semibold text-[#c7092b] hover:opacity-75 transition-opacity"
              >
                {allSubsSelected ? "Deselectează tot" : "Selectează tot"}
              </button>
            </div>
          </div>
          <div className="overflow-y-auto max-h-72 divide-y divide-gray-50">
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
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{s.email}</p>
                    <p className="text-[11px] text-gray-400">
                      Abonat pe {new Date(s.createdAt).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Compose panel */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-semibold text-gray-700">Trimite o ofertă</span>
          </div>
          <div className="p-5 flex flex-col gap-4 flex-1">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Subiect <span className="text-[#c7092b]">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ofertă specială luna aceasta"
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#c7092b] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Etichetă ofertă <span className="text-gray-400 font-normal">(opțional)</span>
              </label>
              <input
                type="text"
                value={offerLabel}
                onChange={(e) => setOfferLabel(e.target.value)}
                placeholder="-20% doar astăzi, doar pentru tine"
                className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#c7092b] transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Mesaj <span className="text-gray-400 font-normal">(opțional)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Scrie oferta pe care vrei să o trimiți abonaților..."
                rows={5}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#c7092b] transition-colors resize-none"
              />
            </div>

            {sentMsg && (
              <p className={`text-sm font-medium ${sentMsg.ok ? "text-green-600" : "text-red-500"}`}>
                {sentMsg.ok ? "✓ " : "✗ "}{sentMsg.text}
              </p>
            )}

            <button
              onClick={handleSend}
              disabled={!canSend || sending}
              className="w-full py-2.5 rounded-lg bg-[#c7092b] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {sending ? "Se trimite..." : `Trimite către ${selectedSubscribers.size} abonat${selectedSubscribers.size !== 1 ? "ți" : ""} selectat${selectedSubscribers.size !== 1 ? "ți" : ""}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
