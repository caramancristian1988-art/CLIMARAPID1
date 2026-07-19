import Link from "next/link";
import Image from "next/image";
import { getTranslations } from "next-intl/server";

export default async function Hero() {
  const t = await getTranslations("hero");

  const heroBenefits = [
    {
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17 8C8 10 5.9 16.17 3.82 19.92 2.73 18.13 1 15.88 1 13c0-4.97 4.03-9 9-9 2.43 0 4.64.96 6.25 2.52L17 8zm7 9.99c-.15-4.04-2.56-7.5-6-9.17V6.5a6.5 6.5 0 010 13 6.57 6.57 0 01-4.01-1.37l-.65.65A7.965 7.965 0 0018 21c3.87 0 7.06-2.76 7.79-6.4L24 17.99z"/>
        </svg>
      ),
      title: t("benefit1Title"),
      desc: t("benefit1Desc"),
    },
    {
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.5 5H11L7 12h4.5L9 19l9-10h-4.5z"/>
        </svg>
      ),
      title: t("benefit2Title"),
      desc: t("benefit2Desc"),
    },
    {
      icon: (
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
        </svg>
      ),
      title: t("benefit3Title"),
      desc: t("benefit3Desc"),
    },
  ];

  return (
    <section className="bg-white">

      {/* ── MOBILE ── */}
      <div className="sm:hidden relative min-h-[600px]">
        <Image
          src="/photo_2026-06-15_15-45-41.jpg"
          alt="Aparat de aer condiționat"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-white/90 from-5% via-white/50 via-30% to-transparent to-55%" />

        <div className="absolute inset-0 flex flex-col justify-between max-w-7xl mx-auto px-5 py-8">
          <div>
            <h1 className="text-2xl font-extrabold text-[#111827] leading-tight mb-2 drop-shadow-sm">
              {t("title1")}{" "}
              <span className="text-[#c7092b] block">{t("title2")}</span>
            </h1>
            <p className="text-xs text-gray-800 leading-relaxed mb-4 max-w-[55%]">
              {t("subtitleMobile")}
            </p>
            <div className="flex flex-col gap-2 max-w-[60%]">
              <Link
                href="/produse"
                className="text-center bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-4 py-2.5 rounded-md transition-all text-xs uppercase tracking-wide"
              >
                {t("viewProducts")}
              </Link>
              <Link
                href="/despre"
                className="text-center border-2 border-[#1d2353] text-[#1d2353] hover:bg-[#1d2353] hover:text-white font-bold px-4 py-2.5 rounded-md transition-all text-xs uppercase tracking-wide"
              >
                {t("learnMore")}
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {heroBenefits.map((b) => (
              <div key={b.title} className="flex items-center gap-2 bg-white/30 backdrop-blur-sm rounded-xl px-3 py-2 self-start">
                <div className="w-7 h-7 bg-[#c7092b] rounded-full flex items-center justify-center shrink-0">
                  {b.icon}
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-gray-900 tracking-wide">{b.title}</div>
                  <div className="text-[9px] text-gray-500 mt-0.5">{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden sm:block relative h-[calc(100vh-230px)] min-h-[440px] max-h-[700px]">
        <Image
          src="/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png"
          alt="Aparat de aer condiționat în sufragerie"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-white/90 from-5% via-white/50 via-30% to-transparent to-55%" />

        <div className="absolute inset-0 flex flex-col justify-between max-w-7xl mx-auto px-6 py-8 lg:py-10">
          <div>
            <h1 className="text-4xl lg:text-5xl xl:text-[52px] font-extrabold text-[#111827] leading-tight mb-3 drop-shadow-sm">
              {t("title1")}{" "}
              <span className="text-[#c7092b] block">{t("title2")}</span>
            </h1>
            <p className="text-base text-gray-800 leading-relaxed mb-6 max-w-md">
              {t("subtitle")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/produse"
                className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-7 py-3 rounded-md transition-all text-sm uppercase tracking-wide"
              >
                {t("viewProducts")}
              </Link>
              <Link
                href="/despre"
                className="inline-flex items-center gap-2 border-2 border-[#1d2353] text-[#1d2353] hover:bg-[#1d2353] hover:text-white font-bold px-7 py-3 rounded-md transition-all text-sm uppercase tracking-wide"
              >
                {t("learnMore")}
              </Link>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <div className="flex flex-row flex-wrap gap-3">
              {heroBenefits.map((b) => (
                <div key={b.title} className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 shadow-sm">
                  <div className="w-10 h-10 bg-[#c7092b] rounded-full flex items-center justify-center shrink-0">
                    {b.icon}
                  </div>
                  <div>
                    <div className="text-[12px] font-extrabold text-gray-900 tracking-wide">{b.title}</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
