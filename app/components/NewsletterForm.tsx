"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function NewsletterForm() {
  const t = useTranslations("footer");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "exists">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else if (res.status === 409) {
        setStatus("exists");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        {t("subscribeSuccess")}
      </div>
    );
  }

  if (status === "exists") {
    return (
      <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {t("alreadySubscribed")}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("emailPlaceholder")}
        required
        className="w-full h-11 pl-4 pr-14 rounded-lg border border-white/20 bg-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:bg-white/15 transition-all"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        style={{ backgroundColor: "#c7092b" }}
        className="absolute right-0 top-0 h-11 w-11 rounded-r-lg flex items-center justify-center text-white hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {status === "loading" ? (
          <span className="text-xs font-bold">...</span>
        ) : (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        )}
      </button>
      {status === "error" && (
        <p className="absolute -bottom-5 left-0 text-[11px] text-red-400">{t("subscribeError")}</p>
      )}
    </form>
  );
}
