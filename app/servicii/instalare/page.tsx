import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSectionFlags, getContactInfo } from "@/lib/siteSettings";
import JsonLd from "@/app/components/JsonLd";
import ServicePageJsonLd from "@/app/components/ServicePageJsonLd";
import { getPromoProducts } from "@/lib/promoProducts";
import { getServiceDetail } from "@/lib/serviceDetail";
import ProductsSection from "@/app/components/ProductsSection";
import ServiceStepIcon from "@/app/components/ServiceStepIcon";
import ServiceFeatureIcon from "@/app/components/ServiceFeatureIcon";

export const metadata: Metadata = {
  title: "Instalare condiționere",
  description:
    "Instalare profesională de condiționere și sisteme de climatizare în Chișinău și toată Moldova. Tehnicieni autorizați, lucrare curată și rapidă. Garanție pe manoperă.",
  keywords: [
    "instalare conditioner Moldova",
    "montaj aer conditionat Chisinau",
    "instalare climatizare Moldova",
    "instalare split system Moldova",
    "montaj conditioner Chisinau",
    "instalare inverter Moldova",
    "instalare Daikin Moldova",
    "instalare Mitsubishi Electric Moldova",
    "instalare aer conditionat pret",
    "echipa instalare climatizare",
    "Climat Rapid instalare",
  ],
  alternates: { canonical: "https://www.climatrapid.md/servicii/instalare" },
};

export const revalidate = 3600;

const defaultFeatures = [
  { title: "Echipă autorizată", desc: "Tehnicieni calificați și mereu la curent cu noile tehnologii.", icon: "award" },
  { title: "Montaj rapid și curat", desc: "Respectăm timpul tău și lăsăm spațiul curat după instalare.", icon: "clock" },
  { title: "Garanție inclusă", desc: "Oferim garanție pentru manoperă și echipamente.", icon: "shield" },
  { title: "Suport dedicat", desc: "Îți suntem alături înainte, în timpul și după instalare.", icon: "support" },
];

const defaultInclus = [
  "Consultanță și recomandare personalizată",
  "Montaj efectuat conform standardelor",
  "Verificare completă și testare sistem",
  "Instrucțiuni de utilizare și întreținere",
  "Garanție pentru manoperă și echipamente",
];

const defaultPasi = [
  {
    nr: "01",
    title: "Consultare",
    desc: "Analizăm nevoile tale și îți recomandăm soluția optimă pentru spațiul tău.",
    img: "/IMG_2838.PNG",
  },
  {
    nr: "02",
    title: "Montaj",
    desc: "Echipa noastră realizează instalarea rapid și eficient, cu atenție la fiecare detaliu.",
    img: "/IMG_2839.PNG",
  },
  {
    nr: "03",
    title: "Testare",
    desc: "Verificăm funcționarea și ne asigurăm că totul este perfect.",
    img: "/IMG_2840.PNG",
  },
];

const defaultTestimoniale = [
  {
    text: "Servicii excelente! Montajul a fost realizat rapid și foarte curat. Echipa a fost profesionistă și atentă la detalii.",
    name: "Andrei M.",
    city: "Chișinău",
    initials: "AM",
  },
  {
    text: "Foarte mulțumit de recomandări și de calitatea lucrării. Aerul condiționat funcționează perfect!",
    name: "Diana P.",
    city: "Bălți",
    initials: "DP",
  },
  {
    text: "Comunicare excelentă, preț corect și montaj fără dificultăți. Recomand cu încredere!",
    name: "Vlad G.",
    city: "Chișinău",
    initials: "VG",
  },
];

export default async function InstalareePage() {
  const { serviciiEnabled } = await getSectionFlags();
  const { phone, phoneTel } = await getContactInfo();
  if (!serviciiEnabled) notFound();
  const produse = await getPromoProducts();
  const {
    detailImage,
    heroImageDesktop,
    steps: pasi,
    features,
    checklist: inclus,
    testimonials: testimoniale,
  } = await getServiceDetail("/servicii/instalare", {
    detailImage: "/IMG_2963.PNG",
    heroImageDesktop: "/instalare.png",
    steps: defaultPasi,
    features: defaultFeatures,
    checklist: defaultInclus,
    testimonials: defaultTestimoniale,
  });

  return (
    <div className="bg-white text-[#1d2353]">
      <ServicePageJsonLd name="Instalare conditionere" description="Instalare profesionala de conditionere si sisteme de climatizare in Chisinau si toata Moldova." slug="servicii/instalare" phone={phoneTel} />

      {/* ── HERO – MOBILE ── */}
      <section className="sm:hidden relative overflow-hidden" style={{ height: "110vw", minHeight: 400 }}>
        <Image
          src={detailImage}
          alt="Instalare condiționere"
          fill
          className="object-cover object-bottom"
          priority
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, white 0%, white 44%, transparent 64%)" }} />
        <div className="absolute inset-x-0 top-0 px-4 pt-4">
          <nav className="flex items-center gap-1 text-[10px] text-gray-500 mb-3">
            <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
            <span>›</span>
            <Link href="/servicii" className="hover:text-[#c7092b] transition-colors">Servicii</Link>
            <span>›</span>
            <span className="text-[#1d2353] font-medium">Instalare condiționere</span>
          </nav>
          <p className="text-[#c7092b] text-[10px] font-bold tracking-widest uppercase mb-2">SERVICIU</p>
          <h1 className="text-2xl font-extrabold leading-tight text-[#1d2353]">
            Instalare <span className="text-[#c7092b]">condiționere</span>
          </h1>
          <div className="w-8 h-[3px] bg-[#c7092b] mt-3 mb-3" />
          <p className="text-gray-700 text-xs max-w-[220px] leading-relaxed">
            Instalăm sisteme de climatizare eficiente și fiabile, adaptate perfect spațiului tău.
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Link href="/contact" className="inline-flex items-center gap-1.5 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-4 py-2.5 rounded-lg text-[11px] uppercase tracking-wide transition-colors">
              Solicită ofertă
            </Link>
          </div>
        </div>
      </section>

      {/* ── HERO – DESKTOP ── */}
      <section className="hidden sm:flex relative min-h-[420px] overflow-hidden">
        <Image
          src={heroImageDesktop}
          alt="Instalare condiționere"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, white, transparent 60%)" }} />
        <div className="absolute inset-0 flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-12">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
            <span>›</span>
            <Link href="/servicii" className="hover:text-[#c7092b] transition-colors">Servicii</Link>
            <span>›</span>
            <span className="text-[#1d2353] font-medium">Instalare condiționere</span>
          </nav>
          <p className="text-[#c7092b] text-xs font-bold tracking-widest uppercase mb-3">SERVICIU</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            Instalare<br />
            <span className="text-[#c7092b]">condiționere</span>
          </h1>
          <div className="w-10 h-[3px] bg-[#c7092b] mb-5" />
          <p className="text-sm text-gray-600 leading-relaxed max-w-xs mb-8">
            Instalăm sisteme de climatizare eficiente și fiabile,
            adaptate perfect spațiului tău pentru confort
            maxim în orice sezon.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-6 py-3 rounded-xl text-sm uppercase tracking-wide transition-colors"
            >
              Solicită ofertă
            </Link>
            <Link
              href="/servicii/instalare#detalii"
              className="inline-flex items-center gap-2 border border-[#1d2353] text-[#1d2353] hover:bg-gray-50 font-bold px-6 py-3 rounded-xl text-sm uppercase tracking-wide transition-colors"
            >
              Vezi detalii
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES BAR ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col gap-2 p-6">
              <ServiceFeatureIcon icon={f.icon} />
              <p className="font-bold text-sm text-[#1d2353] mt-1">{f.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DESPRE SERVICIU ── */}
      <section id="detalii" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Stânga: text */}
        <div>
          <p className="text-[#c7092b] text-xs font-bold tracking-widest uppercase mb-3">DESPRE SERVICIU</p>
          <h2 className="text-2xl lg:text-3xl font-extrabold leading-snug mb-4">
            Confortul tău este<br />prioritatea noastră
          </h2>
          <div className="w-8 h-[3px] bg-[#c7092b] mb-5" />
          <p className="text-sm text-gray-500 leading-relaxed">
            Ne ocupăm de întregul proces de instalare, de la evaluare și recomandare până la montajul complet și testarea sistemului. Lucrăm rapid, eficient și oferim garanție pentru manoperă și echipamente.
          </p>
        </div>
        {/* Dreapta: checklist */}
        <div className="flex flex-col justify-center gap-4 px-6 py-8 bg-white rounded-2xl shadow-md border border-gray-100">
          {inclus.map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[#fdf2f3] text-[#c7092b] flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="text-sm text-gray-700 leading-snug">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CUM LUCRĂM ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-xs font-extrabold tracking-widest uppercase text-[#1d2353] mb-1">CUM LUCRĂM</p>
        <div className="w-8 h-[3px] bg-[#c7092b] mb-8" />
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {pasi.map((pas, i) => (
            <div key={pas.nr} className="flex items-stretch gap-3 flex-1">
              {/* Step card: image left + text right */}
              <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-gray-100 flex-1 bg-white">
                <ServiceStepIcon title={pas.title} className="relative w-28 lg:w-36 shrink-0 self-stretch" />
                <div className="px-4 py-4 flex flex-col gap-1">
                  <span className="text-2xl font-extrabold text-[#c7092b] leading-none">{pas.nr}</span>
                  <p className="font-bold text-sm mt-1">{pas.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{pas.desc}</p>
                </div>
              </div>
              {/* Arrow between steps */}
              {i < pasi.length - 1 && (
                <div className="hidden sm:flex items-center shrink-0">
                  <svg className="w-5 h-5 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── REDUCERI LA PRODUSE ── */}
      <ProductsSection
        products={produse}
        title="Reduceri"
        highlighted="la produse"
        viewAllHref="/produse?oferte=1"
        showDiscount
      />

      {/* ── TESTIMONIALE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-xs font-extrabold tracking-widest uppercase text-[#1d2353] mb-1">CE SPUN CLIENȚII NOȘTRI</p>
        <div className="w-8 h-[3px] bg-[#c7092b] mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {testimoniale.map((t) => (
            <div key={t.name} className="bg-[#1d2353] rounded-2xl p-6 flex flex-col gap-4 relative">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                ))}
              </div>
              <svg className="absolute top-5 right-5 w-8 h-8 text-white/10" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
              </svg>
              <p className="text-white/80 text-sm leading-relaxed">{t.text}</p>
              <div className="flex items-center gap-3 mt-auto pt-3 border-t border-white/10">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#c7092b] to-[#8b0618] flex items-center justify-center text-white text-sm font-extrabold shrink-0 ring-2 ring-white/20">
                  {t.initials}
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{t.name}</p>
                  <p className="text-white/50 text-xs">{t.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-[#1d2353] rounded-2xl px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white font-extrabold text-xl lg:text-2xl leading-snug max-w-xs">
              Ai nevoie de instalarea unui aparat de aer condiționat?
            </p>
            <p className="text-white/60 text-sm mt-2">
              Contactează-ne acum și primește o ofertă personalizată pentru proiectul tău.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <Link
              href="/contact"
              className="bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-8 py-3 rounded-xl text-sm uppercase tracking-wide transition-colors whitespace-nowrap"
            >
              CONTACTEAZĂ-NE
            </Link>
            <a
              href={`tel:${phoneTel}`}
              className="flex items-center gap-3 text-white hover:text-white/80 transition-colors"
            >
              <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <span className="font-bold text-lg tracking-wide">{phone}</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
