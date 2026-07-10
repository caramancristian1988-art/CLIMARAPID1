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
  title: "Climatizare comercială & industrială",
  description:
    "Soluții de climatizare pentru spații comerciale, birouri, magazine și hale industriale în Moldova. Proiectare, instalare și mentenanță sisteme de climatizare comerciale.",
  keywords: [
    "climatizare comerciala Moldova",
    "climatizare industriala Chisinau",
    "conditioner birou Moldova",
    "aer conditionat spatiu comercial",
    "instalare climatizare magazin Moldova",
    "sistem climatizare hala Moldova",
    "VRF Moldova",
    "canal de aer conditionat Moldova",
    "Climat Rapid comercial",
  ],
  alternates: { canonical: "https://www.climatrapid.md/servicii/comerciale" },
};

export const revalidate = 3600;

const defaultFeatures = [
  { title: "Capacități mari", desc: "Sisteme dimensionate pentru spații comerciale, hale și birouri.", icon: "building" },
  { title: "Proiectare personalizată", desc: "Calcul de sarcină termică și soluție adaptată clădirii tale.", icon: "blueprint" },
  { title: "Mentenanță programată", desc: "Contracte de service pentru funcționare continuă, fără pauze.", icon: "clock-alt" },
  { title: "Echipă specializată", desc: "Tehnicieni autorizați pentru instalații comerciale complexe.", icon: "users" },
];

const defaultInclus = [
  "Evaluare tehnică a spațiului comercial",
  "Proiectare sistem HVAC personalizat",
  "Montaj de către echipă specializată",
  "Punere în funcțiune și testare completă",
  "Contract de mentenanță disponibil",
];

const defaultPasi = [
  { nr: "01", title: "Audit tehnic", desc: "Evaluăm spațiul, sarcina termică și cerințele specifice afacerii tale.", img: "/IMG_2842.PNG" },
  { nr: "02", title: "Proiectare", desc: "Concepem soluția HVAC optimă pentru clădire, birou sau hală.", img: "/IMG_2839.PNG" },
  { nr: "03", title: "Implementare", desc: "Montăm și punem în funcțiune sistemul, cu testare completă.", img: "/IMG_2840.PNG" },
];

const defaultTestimoniale = [
  { text: "Au proiectat și montat sistemul HVAC pentru biroul nostru de 300mp fără nicio problemă. Echipă foarte profesionistă.", name: "Andrei P.", city: "Chișinău", initials: "AP" },
  { text: "Sistem comercial montat în hala noastră de producție, funcționează impecabil de la instalare.", name: "Olesea D.", city: "Bălți", initials: "OD" },
  { text: "Contractul de mentenanță ne-a scutit de bătăi de cap, totul e verificat periodic.", name: "Mihai R.", city: "Chișinău", initials: "MR" },
];

export default async function ComercialePage() {
  const { serviciiEnabled } = await getSectionFlags();
  const { phone, phoneTel } = await getContactInfo();
  if (!serviciiEnabled) notFound();
  const produse = await getPromoProducts("conditioane-comerciale");
  const {
    detailImage,
    heroImageDesktop,
    steps: pasi,
    features,
    checklist: inclus,
    testimonials: testimoniale,
  } = await getServiceDetail("/servicii/comerciale", {
    detailImage: "/IMG_2967.PNG",
    heroImageDesktop: "/Sisteme%20comerciale.png",
    steps: defaultPasi,
    features: defaultFeatures,
    checklist: defaultInclus,
    testimonials: defaultTestimoniale,
  });

  return (
    <div className="bg-white text-[#1d2353]">
      <ServicePageJsonLd name="Sisteme comerciale de climatizare" description="Sisteme de climatizare pentru spatii comerciale in Moldova." slug="servicii/comerciale" phone={phoneTel} />

      {/* ── HERO – MOBILE ── */}
      <section className="sm:hidden relative overflow-hidden" style={{ height: "110vw", minHeight: 400 }}>
        <Image src={detailImage} alt="Sisteme comerciale HVAC" fill className="object-cover object-bottom" priority />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, white 0%, white 44%, transparent 64%)" }} />
        <div className="absolute inset-x-0 top-0 px-4 pt-4">
          <nav className="flex items-center gap-1 text-[10px] text-gray-500 mb-3">
            <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
            <span>›</span>
            <Link href="/servicii" className="hover:text-[#c7092b] transition-colors">Servicii</Link>
            <span>›</span>
            <span className="text-[#1d2353] font-medium">Sisteme comerciale HVAC</span>
          </nav>
          <p className="text-[#c7092b] text-[10px] font-bold tracking-widest uppercase mb-2">SERVICIU</p>
          <h1 className="text-2xl font-extrabold leading-tight text-[#1d2353]">
            Sisteme comerciale<br />
            <span className="text-[#c7092b]">HVAC</span>
          </h1>
          <div className="w-8 h-[3px] bg-[#c7092b] mt-3 mb-3" />
          <p className="text-gray-700 text-xs max-w-[220px] leading-relaxed">
            Soluții profesionale pentru spații comerciale, birouri, hale și clădiri mari.
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
        <Image src={heroImageDesktop} alt="Sisteme comerciale HVAC" fill className="object-cover object-right" priority />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, white, transparent 60%)" }} />
        <div className="absolute inset-0 flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-12">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
            <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
            <span>›</span>
            <Link href="/servicii" className="hover:text-[#c7092b] transition-colors">Servicii</Link>
            <span>›</span>
            <span className="text-[#1d2353] font-medium">Sisteme comerciale HVAC</span>
          </nav>
          <p className="text-[#c7092b] text-xs font-bold tracking-widest uppercase mb-3">SERVICIU</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
            Sisteme comerciale<br />
            <span className="text-[#c7092b]">HVAC</span>
          </h1>
          <div className="w-10 h-[3px] bg-[#c7092b] mb-5" />
          <p className="text-sm text-gray-600 leading-relaxed max-w-xs mb-8">
            Soluții profesionale pentru spații comerciale, birouri, hale și clădiri mari.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/contact" className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-6 py-3 rounded-xl text-sm uppercase tracking-wide transition-colors">
              Solicită ofertă
            </Link>
            <Link href="/servicii/comerciale#detalii" className="inline-flex items-center gap-2 border border-[#1d2353] text-[#1d2353] hover:bg-gray-50 font-bold px-6 py-3 rounded-xl text-sm uppercase tracking-wide transition-colors">
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
        <div>
          <p className="text-[#c7092b] text-xs font-bold tracking-widest uppercase mb-3">DESPRE SERVICIU</p>
          <h2 className="text-2xl lg:text-3xl font-extrabold leading-snug mb-4">
            Confort climatic pentru<br />afacerea ta
          </h2>
          <div className="w-8 h-[3px] bg-[#c7092b] mb-5" />
          <p className="text-sm text-gray-500 leading-relaxed">
            Proiectăm și instalăm sisteme HVAC dimensionate corect pentru birouri, magazine, hale de producție și clădiri mari, cu accent pe eficiență energetică și funcționare continuă.
          </p>
        </div>
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
              <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-gray-100 flex-1 bg-white">
                <ServiceStepIcon title={pas.title} className="relative w-28 lg:w-36 shrink-0 self-stretch" />
                <div className="px-4 py-4 flex flex-col gap-1">
                  <span className="text-2xl font-extrabold text-[#c7092b] leading-none">{pas.nr}</span>
                  <p className="font-bold text-sm mt-1">{pas.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{pas.desc}</p>
                </div>
              </div>
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
              Ai nevoie de un sistem HVAC comercial?
            </p>
            <p className="text-white/60 text-sm mt-2">Solicită o evaluare gratuită pentru afacerea ta.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <Link href="/contact" className="bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-8 py-3 rounded-xl text-sm uppercase tracking-wide transition-colors whitespace-nowrap">
              CONTACTEAZĂ-NE
            </Link>
            <a href={`tel:${phoneTel}`} className="flex items-center gap-3 text-white hover:text-white/80 transition-colors">
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
