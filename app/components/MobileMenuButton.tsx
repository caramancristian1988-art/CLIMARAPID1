"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { SectionFlags } from "@/lib/siteSettings";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default function MobileMenuButton({
  produseEnabled = true,
  serviciiEnabled = true,
  proiecteEnabled = true,
  despreEnabled = true,
  blogEnabled = true,
  contactEnabled = true,
}: Partial<SectionFlags>) {
  const t = useTranslations("nav");

  const productsDropdown = [
    { href: "/produse?cat=conditioane-rezidentiale", label: t("residential") },
    { href: "/produse?cat=conditioane-comerciale", label: t("commercial") },
    { href: "/produse?cat=sisteme-multisplit", label: t("multisplit") },
    { href: "/produse?cat=conditioane-portabile", label: t("portable") },
    { href: "/produse?cat=accesorii-consumabile", label: t("accessories") },
  ];

  const servicesDropdown = [
    { href: "/servicii/instalare", label: t("installation") },
    { href: "/servicii/mentenanta", label: t("maintenance") },
    { href: "/servicii/diagnosticare", label: t("diagnostics") },
    { href: "/servicii/consultanta", label: t("consulting") },
    { href: "/servicii/multisplit", label: t("multisplitService") },
    { href: "/servicii/comerciale", label: t("commercialService") },
  ];

  const baseNavLinks = [
    { href: "/proiecte", label: t("projects"), enabled: proiecteEnabled },
    { href: "/despre", label: t("about"), enabled: despreEnabled },
    { href: "/blog", label: t("blog"), enabled: blogEnabled },
    { href: "/contact", label: t("contact"), enabled: contactEnabled },
  ].filter((l) => l.enabled);

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [produseOpen, setProduseOpen] = useState(false);
  const [serviciiOpen, setServiciiOpen] = useState(false);
  const [headerBottom, setHeaderBottom] = useState(0);

  function updateHeaderBottom() {
    const headerEl = document.getElementById("site-header");
    if (headerEl) setHeaderBottom(headerEl.getBoundingClientRect().bottom);
  }

  useEffect(() => {
    const headerEl = document.getElementById("site-header");
    if (!headerEl) return;
    const observer = new ResizeObserver(() => updateHeaderBottom());
    observer.observe(headerEl);
    return () => observer.disconnect();
  }, []);

  function openMenu() {
    updateHeaderBottom();
    setMounted(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
  }

  function closeMenu() {
    setOpen(false);
    setProduseOpen(false);
    setServiciiOpen(false);
  }

  function toggleMenu() {
    if (open) closeMenu();
    else openMenu();
  }

  useEffect(() => {
    if (!open && mounted) {
      const timeout = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted]);

  return (
    <>
      <button
        onClick={toggleMenu}
        className="relative flex items-center justify-center w-9 h-9 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        aria-label={t("menu")}
        aria-expanded={open}
      >
        <span className="relative flex flex-col items-center justify-center w-5 h-5 active:scale-90 transition-transform">
          <span
            className={`absolute h-0.5 w-5 bg-current rounded-full transition-all duration-[350ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
              open ? "rotate-45 translate-y-0" : "-translate-y-1.5"
            }`}
          />
          <span
            className={`absolute h-0.5 w-5 bg-current rounded-full transition-all duration-200 ease-[cubic-bezier(0.65,0,0.35,1)] ${
              open ? "opacity-0 scale-x-0" : "opacity-100 scale-x-100 delay-100"
            }`}
          />
          <span
            className={`absolute h-0.5 w-5 bg-current rounded-full transition-all duration-[350ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
              open ? "-rotate-45 translate-y-0" : "translate-y-1.5"
            }`}
          />
        </span>
      </button>

      {mounted && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-50" style={{ top: headerBottom }}>
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
            onClick={closeMenu}
            aria-hidden
          />

          <div
            className={`absolute inset-x-0 top-0 w-full max-h-full bg-white shadow-2xl flex flex-col transition-all ${
              open
                ? "duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] translate-y-0 opacity-100"
                : "duration-200 ease-in translate-y-[-12px] opacity-0"
            }`}
          >
            <div className="flex-1 overflow-y-auto">
              <nav className="flex flex-col px-2 py-3">
                {produseEnabled && (
                  <div
                    style={{ transitionDelay: open ? "75ms" : "0ms" }}
                    className={`transition-all duration-300 ease-out ${open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
                  >
                    <div className="flex items-center rounded-lg hover:bg-gray-50 transition-colors">
                      <Link
                        href="/produse"
                        onClick={closeMenu}
                        className="flex-1 px-3 py-3.5 text-[#1d2353] hover:text-[#c7092b] transition-colors text-[15px] font-bold"
                      >
                        {t("products")}
                      </Link>
                      <button
                        onClick={() => setProduseOpen((v) => !v)}
                        aria-label={t("showProductCategories")}
                        className="px-3 py-3.5 text-[#1d2353] hover:text-[#c7092b] transition-colors"
                      >
                        <ChevronIcon open={produseOpen} />
                      </button>
                    </div>
                    <div className={`overflow-hidden transition-all duration-200 ${produseOpen ? "max-h-96" : "max-h-0"}`}>
                      <div className="flex flex-col pb-1">
                        {productsDropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={closeMenu}
                            className="px-6 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-[#c7092b] transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {serviciiEnabled && (
                  <div
                    style={{ transitionDelay: open ? "110ms" : "0ms" }}
                    className={`transition-all duration-300 ease-out ${open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`}
                  >
                    <div className="flex items-center rounded-lg hover:bg-gray-50 transition-colors">
                      <Link
                        href="/servicii"
                        onClick={closeMenu}
                        className="flex-1 px-3 py-3.5 text-[#1d2353] hover:text-[#c7092b] transition-colors text-[15px] font-bold"
                      >
                        {t("services")}
                      </Link>
                      <button
                        onClick={() => setServiciiOpen((v) => !v)}
                        aria-label={t("showServiceCategories")}
                        className="px-3 py-3.5 text-[#1d2353] hover:text-[#c7092b] transition-colors"
                      >
                        <ChevronIcon open={serviciiOpen} />
                      </button>
                    </div>
                    <div className={`overflow-hidden transition-all duration-200 ${serviciiOpen ? "max-h-96" : "max-h-0"}`}>
                      <div className="flex flex-col pb-1">
                        {servicesDropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={closeMenu}
                            className="px-6 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-[#c7092b] transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {baseNavLinks.map((link, i) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    style={{ transitionDelay: open ? `${145 + i * 35}ms` : "0ms" }}
                    className={`px-3 py-3.5 rounded-lg text-[#1d2353] hover:bg-gray-50 hover:text-[#c7092b] transition-all duration-300 ease-out text-[15px] font-bold ${
                      open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 shrink-0">
              <a
                href="tel:+37369000000"
                className="flex items-center justify-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold py-3 rounded-xl transition-colors text-sm uppercase tracking-wide"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                </svg>
                +373 69 000 000
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
