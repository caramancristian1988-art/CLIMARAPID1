"use client";

import { useState } from "react";
import Link from "next/link";
import MessageStatusBadge from "../components/MessageStatusBadge";
import MoodBadge from "../components/MoodBadge";
import LinkedProductText from "../components/LinkedProductText";
import CopyableId from "../components/CopyableId";
import { markMessageReadAction, deleteMessageAction } from "@/lib/adminMessageActions";

interface Message {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  source: string;
  read: boolean;
  status: string;
  mood: string | null;
  createdAt: Date;
  products: { id: string; name: string; slug: string }[];
}

type Category = "oferte" | "contact" | "comenzi";

function categoryOf(source: string): Category {
  if (source.startsWith("Cere consultație")) return "oferte";
  if (source === "Comandă din coș") return "comenzi";
  return "contact";
}

const STATUS_ACCENT_COLORS: Record<string, string> = {
  in_asteptare: "#f59e0b",
  sunat: "#3b82f6",
  nu_raspunde: "#f97316",
  se_gandeste: "#eab308",
  programat: "#6366f1",
  in_lucru: "#0ea5e9",
  achitat: "#14b8a6",
  anulat: "#9ca3af",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ro-MD", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

export default function MessagesList({ messages: initialMessages }: { messages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Category>("oferte");

  function patchMessage(id: string, patch: Partial<Message>) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }

  function removeMessage(id: string) {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  function handleMarkRead(id: string) {
    patchMessage(id, { read: true });
    const formData = new FormData();
    formData.set("id", id);
    markMessageReadAction(formData);
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Sigur vrei să ștergi mesajul de la ${name}?`)) return;
    removeMessage(id);
    const formData = new FormData();
    formData.set("id", id);
    deleteMessageAction(formData);
  }

  if (messages.length === 0) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500">
        Nu există mesaje primite încă.
      </div>
    );
  }

  const offerMessages = messages.filter((m) => categoryOf(m.source) === "oferte");
  const contactMessages = messages.filter((m) => categoryOf(m.source) === "contact");
  const orderMessages = messages.filter((m) => categoryOf(m.source) === "comenzi");
  const visibleMessages = tab === "oferte" ? offerMessages : tab === "comenzi" ? orderMessages : contactMessages;

  const tabs: { value: Category; label: string; count: number }[] = [
    { value: "oferte", label: "Cereri ofertă", count: offerMessages.length },
    { value: "contact", label: "Contact", count: contactMessages.length },
    { value: "comenzi", label: "Comenzi din coș", count: orderMessages.length },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`text-sm font-bold px-4 py-2 rounded-xl transition-colors ${
              tab === t.value ? "bg-[#c7092b] text-white" : "bg-white border border-gray-200 text-gray-500 hover:text-[#1d2353]"
            }`}
          >
            {t.label} <span className="opacity-70">({t.count})</span>
          </button>
        ))}
      </div>

      {visibleMessages.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center text-gray-500">
          Nu există mesaje în această categorie.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {visibleMessages.map((m) => {
        const expanded = expandedId === m.id;
        return (
          <div
            key={m.id}
            style={{ borderLeftColor: STATUS_ACCENT_COLORS[m.status] ?? STATUS_ACCENT_COLORS.in_asteptare }}
            className={`bg-white border rounded-xl border-l-4 transition-colors ${
              m.read ? "border-gray-100" : "border-[#c7092b]/30"
            }`}
          >
            {/* Compact header — always visible */}
            <div className="relative flex items-center gap-2 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-xs text-[#1d2353] truncate">{m.name}</p>
                  {!m.read && (
                    <span className="text-[9px] font-bold text-[#c7092b] bg-[#fdf2f3] px-1.5 py-0.5 rounded-full uppercase shrink-0">
                      Nou
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 truncate mt-0.5">
                  {m.phone} · {formatDate(m.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : m.id)}
                aria-label={expanded ? "Restrânge" : "Detalii"}
                className="shrink-0 w-7 h-7 rounded-full border border-gray-200 text-gray-400 hover:text-[#c7092b] hover:border-[#c7092b] flex items-center justify-center transition-all"
              >
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Expanded details */}
            <div
              className={`grid transition-all duration-200 ease-out ${
                expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
              }`}
              style={{ display: "grid" }}
            >
              <div className={expanded ? "overflow-visible" : "overflow-hidden"}>
                <div className="px-3 pb-3 pt-1 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-2 flex-wrap">
                    <a href={`tel:${m.phone}`} className="hover:text-[#c7092b] transition-colors">{m.phone}</a>
                    {m.email && <a href={`mailto:${m.email}`} className="hover:text-[#c7092b] transition-colors">{m.email}</a>}
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full uppercase">
                      <LinkedProductText text={m.source} products={m.products} />
                    </span>
                  </div>

                  {m.products.length > 0 && (
                    <div className="flex flex-col gap-1.5 mt-2">
                      {m.products.map((p) => (
                        <div key={p.id} className="flex flex-col gap-0.5">
                          <div className="inline-flex items-center gap-2 text-[10px] font-bold text-[#c7092b] bg-[#fdf2f3] px-2 py-1 rounded-full w-fit max-w-full">
                            <Link
                              href={`/produse/${p.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 hover:underline transition-colors min-w-0"
                            >
                              <span className="uppercase shrink-0">Vezi produsul</span>
                              <span className="opacity-70 truncate max-w-[140px]">{p.name}</span>
                              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </Link>
                          </div>
                          <CopyableId id={p.id} />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <MessageStatusBadge id={m.id} status={m.status} onChange={(status) => patchMessage(m.id, { status })} />
                    <MoodBadge id={m.id} mood={m.mood} onChange={(mood) => patchMessage(m.id, { mood })} />
                    {!m.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkRead(m.id)}
                        className="text-xs font-bold text-[#1d2353] border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Marchează ca citit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id, m.name)}
                      aria-label="Șterge"
                      className="ml-auto text-gray-400 hover:text-[#c7092b] transition-colors p-1.5 rounded-lg hover:bg-[#fdf2f3]"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {m.message && (
                    <p className="text-sm text-gray-600 mt-3 leading-relaxed whitespace-pre-line">
                      <LinkedProductText text={m.message} products={m.products} />
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
          })}
        </div>
      )}
    </div>
  );
}
