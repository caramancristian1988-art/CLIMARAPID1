"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale();

  function setLocale(newLocale: string) {
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-0.5">
      <button
        onClick={() => setLocale("ro")}
        title="Română"
        className={`text-lg leading-none px-1 py-0.5 rounded transition-opacity ${locale === "ro" ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
        aria-label="Română"
      >
        🇷🇴
      </button>
      <button
        onClick={() => setLocale("ru")}
        title="Русский"
        className={`text-lg leading-none px-1 py-0.5 rounded transition-opacity ${locale === "ru" ? "opacity-100" : "opacity-40 hover:opacity-70"}`}
        aria-label="Русский"
      >
        🇷🇺
      </button>
    </div>
  );
}
