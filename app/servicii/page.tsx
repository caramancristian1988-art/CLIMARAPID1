import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSectionFlags } from "@/lib/siteSettings";

export const metadata: Metadata = {
  title: "Servicii",
  description:
    "Servicii profesionale de instalare, mentenanță, diagnosticare și consultanță pentru sisteme de climatizare în Moldova. Echipă autorizată, prețuri corecte.",
  keywords: [
    "servicii climatizare Moldova",
    "instalare conditioner Chisinau",
    "mentenanta aer conditionat Moldova",
    "service conditioner Chisinau",
    "diagnosticare climatizare",
    "multisplit Moldova",
    "climatizare comerciala Moldova",
    "consultanta climatizare",
    "Climat Rapid servicii",
  ],
  alternates: { canonical: "https://www.climatrapid.md/servicii" },
};

export const revalidate = 3600;

const fallbackServiciiPrincipale = [
  {
    id: "fallback-1",
    image: "/IMG_2838.PNG",
    title: "Instalare condiționere",
    description: "Montaj rapid și sigur pentru apartamente, case, birouri și spații comerciale.",
    href: "/servicii/instalare",
  },
  {
    id: "fallback-2",
    image: "/IMG_2839.PNG",
    title: "Mentenanță & curățare",
    description: "Curățare profesională, igienizare, încărcare freon și verificări complete.",
    href: "/servicii/mentenanta",
  },
  {
    id: "fallback-3",
    image: "/IMG_2840.PNG",
    title: "Reparații",
    description: "Diagnosticare rapidă și reparații pentru orice tip de problemă.",
    href: "/servicii/diagnosticare",
  },
];

const fallbackServiciiAvansate = [
  {
    id: "fallback-4",
    image: "/IMG_2841.PNG",
    title: "Consultanță",
    description: "Te ajutăm să alegi sistemul potrivit pentru nevoile și bugetul tău.",
    href: "/servicii/consultanta",
  },
  {
    id: "fallback-5",
    image: "/IMG_2843.PNG",
    title: "Sisteme multisplit",
    description: "Climatizare pentru mai multe camere cu o singură unitate exterioară.",
    href: "/servicii/multisplit",
  },
  {
    id: "fallback-6",
    image: "/IMG_2842.PNG",
    title: "Sisteme comerciale HVAC",
    description: "Soluții profesionale pentru spații comerciale, birouri, hale și clădiri mari.",
    href: "/servicii/comerciale",
  },
];

const fallbackServiciiSuplimentare = [
  { id: "fallback-7", title: "Demontare & relocare", description: "Demontare aparat, mutare și reinstalare profesională." },
  { id: "fallback-8", title: "Verificări tehnice", description: "Verificare consum, test eficiență și detectare pierderi de freon." },
  { id: "fallback-9", title: "Abonamente service", description: "Întreținere periodică, vizite sezoniere și prioritate suport." },
];

const suplimentareIcons: Record<string, React.ReactNode> = {
  "Demontare & relocare": (
    <svg className="w-8 h-8 text-[#1d2353]" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="2" y="12" width="20" height="7" rx="1.5"/>
      <path d="M6 15.5h1M10 15.5h1M14 15.5h1"/>
      <path d="M2 19v1.5M22 19v1.5"/>
      <path d="M12 2v8"/>
      <path d="M9 7l3-5 3 5"/>
    </svg>
  ),
  "Verificări tehnice": (
    <svg className="w-8 h-8 text-[#1d2353]" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <rect x="5" y="3" width="14" height="18" rx="2"/>
      <path d="M9 3a2 2 0 0 0 4 0"/>
      <path d="M9 10l1 1 2-2"/>
      <path d="M14 10.5h2"/>
      <path d="M9 14l1 1 2-2"/>
      <path d="M14 14.5h2"/>
      <path d="M9 18l1 1 2-2"/>
      <path d="M14 18.5h2"/>
    </svg>
  ),
  "Abonamente service": (
    <svg className="w-8 h-8 text-[#1d2353]" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <path d="M8.5 12l2.5 2.5 4.5-4.5"/>
    </svg>
  ),
};

const genericServiceIcon = (
  <svg className="w-8 h-8 text-[#1d2353]" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
  </svg>
);

async function getServicesByCategorie() {
  try {
    const services = await prisma.service.findMany({ orderBy: [{ section: "asc" }, { order: "asc" }] });
    if (services.length === 0) throw new Error("empty");
    return {
      principale: services.filter((s) => s.section === "principale"),
      avansate: services.filter((s) => s.section === "avansate"),
      suplimentare: services.filter((s) => s.section === "suplimentare"),
    };
  } catch {
    return {
      principale: fallbackServiciiPrincipale,
      avansate: fallbackServiciiAvansate,
      suplimentare: fallbackServiciiSuplimentare,
    };
  }
}

export default async function ServiciiPage() {
  const { serviciiEnabled } = await getSectionFlags();
  if (!serviciiEnabled) notFound();

  const { principale, avansate, suplimentare: serviciiSuplimentare } = await getServicesByCategorie();
  const serviciiToate = [...principale, ...avansate];

  return (
    <div className="bg-white text-[#1d2353]">
      {/* Hero – MOBILE */}
      <section className="sm:hidden relative overflow-hidden" style={{ height: "90vw", minHeight: 340 }}>
        <Image
          src="/IMG_2851.PNG"
          alt="Servicii climatizare"
          fill
          className="object-cover object-bottom"
          priority
        />
        {/* alb solid sus pentru text, transparent complet jos pentru condiționer */}
        <div className="absolute inset-0" style={{
          background: "linear-gradient(to bottom, white 0%, white 25%, transparent 45%)"
        }} />
        {/* text în zona albă */}
        <div className="absolute inset-x-0 top-0 px-4 pt-4">
          <nav className="flex items-center gap-1 text-[10px] text-gray-500 mb-3">
            <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
            <span>›</span>
            <span className="text-[#1d2353] font-medium">Servicii</span>
          </nav>
          <p className="text-[#c7092b] text-[10px] font-bold tracking-widest uppercase mb-2">SERVICII</p>
          <h1 className="text-2xl font-extrabold leading-tight text-[#1d2353]">
            Soluții complete{" "}
            <span className="text-[#c7092b]">pentru confortul tău.</span>
          </h1>
          <div className="w-8 h-[3px] bg-[#c7092b] mt-3" />
        </div>
      </section>

      {/* Hero – DESKTOP */}
      <section className="hidden sm:flex relative h-[45vh] min-h-[320px] overflow-hidden">
        <Image
          src="/IMG_2848.PNG"
          alt="Servicii climatizare"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 from-5% via-white/60 via-35% to-transparent to-65%" />
        <div className="absolute inset-0 flex flex-col justify-center max-w-7xl mx-auto px-6 lg:px-12">
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-5">
            <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
            <span>›</span>
            <span className="text-[#1d2353] font-medium">Servicii</span>
          </nav>
          <p className="text-[#c7092b] text-xs font-bold tracking-widest uppercase mb-3">SERVICII</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-4 text-[#1d2353]">
            Soluții complete{" "}
            <span className="text-[#c7092b] block">pentru confortul tău.</span>
          </h1>
          <div className="w-10 h-[3px] bg-[#c7092b] mb-5" />
          <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
            Oferim servicii profesionale de instalare, mentenanță și reparații
            pentru orice tip de sistem de climatizare.
          </p>
        </div>
      </section>

      {/* Servicii */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-8 sm:pt-0 pb-14">
        <p className="text-xs font-extrabold tracking-widest uppercase text-[#1d2353] mb-1">
          SERVICIILE NOASTRE
        </p>
        <div className="w-8 h-[3px] bg-[#c7092b] mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
          {serviciiToate.map((s) => (
            <Link key={s.id} href={s.href ?? "/servicii"} className="group flex flex-col rounded-xl bg-white/60 border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative" style={{ aspectRatio: "1/1" }}>
                {s.image && (
                  <Image
                    src={s.image}
                    alt={s.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              <div className="px-3 sm:px-6 pt-3 sm:pt-4 pb-4 sm:pb-10 flex flex-col gap-2 sm:gap-6">
                <h3 className="text-sm sm:text-base font-bold group-hover:text-[#c7092b] transition-colors">{s.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{s.description}</p>
                <span className="text-[#c7092b] text-[11px] sm:text-xs font-bold flex items-center gap-1 group-hover:gap-2 transition-all mt-1">
                  AFLĂ MAI MULTE
                  <svg className="w-3 sm:w-3.5 h-3 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Servicii suplimentare */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-14">
        <p className="text-xs font-extrabold tracking-widest uppercase text-[#1d2353] mb-1">
          SERVICII SUPLIMENTARE
        </p>
        <div className="w-8 h-[3px] bg-[#c7092b] mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
          {serviciiSuplimentare.map((s) => (
            <div key={s.id} className="flex items-start gap-2 sm:gap-4 p-3 sm:p-5 border border-gray-100 rounded-2xl hover:shadow-sm transition-shadow">
              <div className="shrink-0 w-10 sm:w-14 h-10 sm:h-14 bg-gray-50 rounded-xl flex items-center justify-center">
                {suplimentareIcons[s.title] ?? genericServiceIcon}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs sm:text-sm mb-1">{s.title}</p>
                <p className="text-[11px] sm:text-xs text-gray-500 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
        <div className="bg-[#1d2353] rounded-2xl px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-[#c7092b] rounded-full flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-lg">Ai nevoie de o intervenție rapidă?</p>
              <p className="text-white/60 text-sm mt-0.5">Echipa noastră este pregătită să te ajute.</p>
            </div>
          </div>
          <Link
            href="/contact"
            className="shrink-0 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-colors text-sm uppercase tracking-wide"
          >
            CONTACTEAZĂ-NE
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
