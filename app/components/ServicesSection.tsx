import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export default async function ServicesSection() {
  const t = await getTranslations("servicesSection");

  const services = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: t("s1"),
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      title: t("s2"),
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      ),
      title: t("s3"),
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: t("s4"),
    },
  ];

  return (
    <section className="py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Mobile layout ── */}
        <div className="lg:hidden rounded-3xl overflow-hidden bg-[#1d2353]">
          <div className="p-6">
            <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">
              {t("badge")}
            </p>
            <h2 className="text-xl font-extrabold text-white mb-2 leading-snug">
              {t("title")} {t("titleHighlighted")}
            </h2>
            <p className="text-xs text-white/60 leading-relaxed mb-4">
              {t("desc")}
            </p>
            <Link
              href="/servicii"
              className="self-start inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-4 py-2 rounded-lg transition-all text-xs uppercase tracking-wide mb-5"
            >
              {t("viewServices")}
            </Link>

            <div className="grid grid-cols-2 gap-3">
              {services.map((s) => (
                <div key={s.title} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full border border-white/25 flex items-center justify-center text-white/70 shrink-0">
                    {s.icon}
                  </div>
                  <span className="text-white text-[11px] font-medium leading-tight">{s.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-[200px]">
            <Image
              src="/tehnician.png"
              alt="Tehnician instalare aer condiționat"
              fill
              sizes="100vw"
              className="object-cover object-left-top"
            />
          </div>
        </div>

        {/* ── Desktop layout ── */}
        <div className="hidden lg:block">
          <div className="relative rounded-3xl overflow-hidden bg-[#e8eaf0] h-[280px]">

            <div className="absolute" style={{ left: "55%", right: 0, top: 0, bottom: 0 }}>
              <Image
                src="/tehnician.png"
                alt="Tehnician instalare aer condiționat"
                fill
                sizes="45vw"
                className="object-cover object-left-top"
                priority
              />
            </div>

            <svg
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
              aria-hidden="true"
            >
              <path
                d="M 0 0 L 67 0 Q 63 0 63 50 Q 63 100 62 100 L 0 100 Z"
                fill="#1d2353"
              />
            </svg>

            <div className="absolute inset-0 flex z-10 pointer-events-none">
              <div className="flex w-[60%] pointer-events-auto">

                <div className="flex flex-col justify-center px-10 py-10 w-[55%]">
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">
                    {t("badge")}
                  </p>
                  <h2 className="text-2xl lg:text-3xl font-extrabold text-white mb-3 leading-snug">
                    {t("title")} {t("titleHighlighted")}
                  </h2>
                  <p className="text-white/60 text-xs leading-relaxed mb-6">
                    {t("desc")}
                  </p>
                  <Link
                    href="/servicii"
                    className="self-start inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-5 py-2.5 rounded-lg transition-all text-xs uppercase tracking-wide"
                  >
                    {t("viewServices")}
                  </Link>
                </div>

                <div className="flex flex-col justify-center px-6 py-10 w-[45%] border-l border-white/10">
                  <ul className="space-y-4">
                    {services.map((s) => (
                      <li key={s.title} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full border border-white/25 flex items-center justify-center text-white/70 shrink-0">
                          {s.icon}
                        </div>
                        <span className="text-white text-sm font-medium">{s.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
