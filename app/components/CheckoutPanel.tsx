"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { submitContactMessageAction } from "@/lib/adminMessageActions";

type Status = "idle" | "error" | "success" | "pending";

export default function CheckoutPanel() {
  const { items, clearCart } = useCart();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const savings = items.reduce((sum, i) => sum + (i.oldPrice ? (i.oldPrice - i.price) * i.quantity : 0), 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const extra = String(data.get("extraMessage") ?? "").trim();

    const missing = [!name && "numele", !phone && "numărul de telefon"].filter(Boolean);
    if (missing.length > 0) {
      setErrorMsg(`Lipsește ${missing.join(" și ")}.`);
      setStatus("error");
      return;
    }

    const itemsList = items
      .map((i) => `${i.quantity}x ${i.name} — ${i.price.toLocaleString("ro-MD")} MDL/buc`)
      .join("\n");
    const message = [
      "Produse comandate:",
      itemsList,
      "",
      `Total: ${subtotal.toLocaleString("ro-MD")} MDL`,
      extra ? `\nMesaj client: ${extra}` : null,
    ]
      .filter((l) => l !== null)
      .join("\n");

    const submitData = new FormData();
    submitData.set("name", name);
    submitData.set("phone", phone);
    submitData.set("message", message);
    submitData.set("source", "Comandă din coș");
    submitData.set("productSlugs", items.map((i) => i.slug).join(","));
    submitData.set("productItems", JSON.stringify(items.map((i) => ({ slug: i.slug, name: i.name }))));

    setStatus("pending");
    const result = await submitContactMessageAction({}, submitData);

    if (result.error) {
      setErrorMsg(result.error);
      setStatus("error");
      return;
    }

    setStatus("success");
    clearCart();
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center py-16 max-w-md mx-auto">
        <div className="relative w-16 h-16 mb-5">
          <span className="absolute inset-0 rounded-full bg-green-200 animate-ping" />
          <div className="relative w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center animate-pop">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-[#1d2353] mb-2 animate-pop" style={{ animationDelay: "100ms" }}>
          Comanda ta a fost trimisă!
        </h2>
        <p className="text-sm text-gray-500 mb-8 animate-pop" style={{ animationDelay: "180ms" }}>
          Te vom contacta în cel mai scurt timp pentru confirmare.
        </p>
        <Link
          href="/produse"
          className="inline-flex items-center bg-[#1d2353] hover:bg-[#2a3470] text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm uppercase tracking-wide"
        >
          Continuă cumpărăturile
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <p className="text-gray-500 mb-6">Coșul tău este gol.</p>
        <Link
          href="/produse"
          className="inline-flex items-center bg-[#1d2353] hover:bg-[#2a3470] text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm uppercase tracking-wide"
        >
          Vezi produsele
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
      <form onSubmit={handleSubmit} noValidate className="border border-gray-100 rounded-2xl p-6 flex flex-col gap-3.5 h-fit">
        <h2 className="font-extrabold text-[#1d2353] text-lg mb-1">Datele tale</h2>

        {status === "error" && (
          <p className="text-sm text-[#c7092b] bg-[#fdf2f3] border border-[#fbd5d9] rounded-lg px-4 py-2.5">
            {errorMsg}
          </p>
        )}

        <input
          type="text"
          name="name"
          required
          placeholder="Nume complet"
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400"
        />
        <input
          type="tel"
          name="phone"
          required
          placeholder="Telefon"
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400"
        />
        <textarea
          name="extraMessage"
          placeholder="Mesaj suplimentar (opțional)"
          rows={3}
          className="border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#c7092b] placeholder:text-gray-400 resize-none"
        />

        <button
          type="submit"
          disabled={status === "pending"}
          className="bg-[#c7092b] hover:bg-[#a5071f] disabled:opacity-60 active:scale-95 text-white font-bold py-3.5 rounded-xl transition-all text-sm uppercase tracking-wide mt-1"
        >
          {status === "pending" ? "Se trimite..." : "Trimite comanda"}
        </button>
        <p className="text-center text-[11px] text-gray-400">
          Te contactăm telefonic pentru confirmare și stabilirea livrării/instalării.
        </p>
      </form>

      <div className="border border-gray-100 rounded-2xl p-6 h-fit">
        <h2 className="font-extrabold text-[#1d2353] mb-4">Sumar comandă</h2>

        <div className="flex flex-col gap-2.5 mb-4 max-h-64 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.slug} className="flex items-center gap-3 p-2.5 border border-gray-100 rounded-xl bg-[#fafbfc]">
              <span className="relative w-11 h-11 rounded-lg bg-white overflow-hidden shrink-0 border border-gray-100">
                {item.image ? (
                  <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                ) : (
                  <svg className="w-5 h-5 text-gray-300 absolute inset-0 m-auto" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 8H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2zM4 6h16V4H4v2z" />
                  </svg>
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#1d2353] line-clamp-1">{item.name}</p>
                <p className="text-xs text-gray-400">{item.quantity} × {item.price.toLocaleString("ro-MD")} MDL</p>
              </div>
            </div>
          ))}
        </div>

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
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="font-bold text-[#1d2353]">Total</span>
          <span className="font-extrabold text-xl text-[#1d2353]">{subtotal.toLocaleString("ro-MD")} MDL</span>
        </div>
      </div>
    </div>
  );
}
