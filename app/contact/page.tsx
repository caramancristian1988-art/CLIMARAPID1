import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { fallbackProducts } from "@/lib/fallbackData";
import { getSectionFlags, getContactInfo } from "@/lib/siteSettings";
import ProductsSection from "../components/ProductsSection";
import FaqAccordion, { type FaqItem } from "../components/FaqAccordion";
import ContactForm from "../components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactează Climat Rapid pentru condiționere, instalare și service în Moldova. Suntem disponibili telefonic, prin email sau online. Chisinau și toată Moldova.",
  keywords: [
    "contact Climat Rapid",
    "instalare aer conditionat Chisinau",
    "service climatizare Moldova",
    "comanda conditioner Moldova",
    "oferta conditioner Moldova",
    "telefon Climat Rapid",
    "consultanta climatizare Moldova",
  ],
  alternates: { canonical: "https://www.climatrapid.md/contact" },
};

export const revalidate = 3600;

const FALLBACK_FAQS: FaqItem[] = [
  {
    question: "Cât durează instalarea unui aparat de aer condiționat?",
    answer: "Instalarea standard durează în medie 2-3 ore, în funcție de complexitatea sistemului și de configurația spațiului.",
  },
  {
    question: "Oferiți garanție pentru produse și instalare?",
    answer: "Da, toate produsele vin cu garanție de producător, iar manopera de instalare este garantată de echipa noastră.",
  },
  {
    question: "Asigurați service și mentenanță?",
    answer: "Da, oferim contracte de mentenanță programată și intervenții de service pentru toate aparatele instalate de noi.",
  },
];

async function getRecommendedProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { rating: "desc" },
      take: 4,
    });
    if (products.length === 0) throw new Error("empty");
    return products;
  } catch {
    return fallbackProducts.slice(0, 4);
  }
}

async function getFaqs(): Promise<FaqItem[]> {
  try {
    const faqs = await prisma.faq.findMany({ orderBy: { order: "asc" } });
    if (faqs.length === 0) throw new Error("empty");
    return faqs.map((f) => ({ question: f.question, answer: f.answer }));
  } catch {
    return FALLBACK_FAQS;
  }
}

export default async function ContactPage() {
  const { contactEnabled } = await getSectionFlags();
  if (!contactEnabled) notFound();

  const products = await getRecommendedProducts();
  const faqs = await getFaqs();
  const { phone, phoneTel, phoneDigits, email } = await getContactInfo();

  return (
    <div className="bg-white text-[#1B2A4A]">
      {/* ── HERO SECTION ── */}
      <section className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[300px] lg:min-h-[400px] items-center gap-0 lg:gap-8 py-6 lg:py-0">

            {/* LEFT */}
            <div className="relative z-10 pt-2 pb-6 lg:py-10">
              <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
                <Link href="/" className="hover:text-[#E31E24] transition-colors">Acasă</Link>
                <span>›</span>
                <span className="text-[#1B2A4A] font-medium">Contact</span>
              </nav>
              <p className="text-[#E31E24] text-xs font-bold tracking-widest uppercase mb-3">
                CONTACT
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                Contactează{" "}
                <span className="text-[#E31E24]">Climat Rapid</span>
              </h1>
              <div className="w-10 h-[3px] bg-[#E31E24] mb-5" />
              <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                Ai nevoie de ajutor pentru alegerea unui conditioner, instalare sau
                mentenanță? Scrie-ne și revenim rapid cu o soluție potrivită.
              </p>
            </div>

            {/* RIGHT: Image */}
            <div
              className="relative w-full -mt-6 lg:mt-0 rounded-t-3xl lg:rounded-none overflow-hidden lg:h-full lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-[52%]"
              style={{ aspectRatio: "1774/887" }}
            >
              <Image
                src="/tehnician.png"
                alt="Tehnician Climat Rapid instalând un aparat de aer condiționat"
                fill
                className="object-cover object-center"
                priority
                sizes="(max-width: 1024px) 100vw, 52vw"
              />
              {/* Mobile top fade */}
              <div
                className="absolute inset-x-0 top-0 h-16 lg:hidden pointer-events-none"
                style={{ background: "linear-gradient(to bottom, white 0%, rgba(255,255,255,0.85) 30%, rgba(255,255,255,0.45) 60%, transparent 100%)" }}
              />
              {/* Desktop left fade — blends the photo's light background into the page */}
              <div
                className="absolute inset-0 hidden lg:block pointer-events-none"
                style={{ background: "linear-gradient(to right, white 0%, rgba(255,255,255,0.7) 18%, rgba(255,255,255,0.15) 40%, transparent 60%)" }}
              />
            </div>

          </div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="max-w-7xl mx-auto px-4 pb-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
            </div>
            <p className="font-bold text-sm">Telefon</p>
            <p className="text-[#E31E24] font-bold text-sm">{phone}</p>
            <a
              href={`tel:${phoneTel}`}
              className="w-full border border-[#1B2A4A] text-[#1B2A4A] text-xs font-bold py-2.5 rounded hover:bg-[#1B2A4A] hover:text-white transition-colors"
            >
              SUNĂ ACUM
            </a>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <p className="font-bold text-sm">WhatsApp</p>
            <p className="text-green-500 font-bold text-sm">{phone}</p>
            <a
              href={`https://wa.me/${phoneDigits}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full border border-green-500 text-green-500 text-xs font-bold py-2.5 rounded hover:bg-green-500 hover:text-white transition-colors"
            >
              SCRIE PE WHATSAPP
            </a>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#7360f2">
                <path d="M11.996 0C5.372 0 0 5.372 0 11.996c0 2.49.76 4.868 2.19 6.88L.757 23.054a.47.47 0 00.572.607l4.332-1.384a11.94 11.94 0 006.335 1.719c6.624 0 11.996-5.372 11.996-11.996C23.992 5.372 18.62 0 11.996 0zm6.46 16.46c-.26.733-1.29 1.341-2.114 1.519-.563.12-1.298.216-3.772-.81-3.164-1.31-5.203-4.522-5.362-4.732-.153-.21-1.283-1.706-1.283-3.254 0-1.548.81-2.305 1.097-2.62.26-.286.566-.357.755-.357.187 0 .374.002.538.01.173.009.404-.065.633.483.235.562.797 1.942.866 2.083.07.14.116.305.023.49-.089.19-.133.307-.262.472-.13.165-.274.368-.39.495-.13.14-.265.293-.113.574.15.28.67 1.106 1.44 1.791 1.001.893 1.846 1.17 2.127 1.3.28.13.44.108.602-.065.163-.174.698-.813.883-1.092.186-.28.373-.233.628-.14.255.093 1.627.768 1.906.908.28.14.466.21.535.327.069.116.069.673-.191 1.408z"/>
              </svg>
            </div>
            <p className="font-bold text-sm">Viber</p>
            <p className="text-purple-500 font-bold text-sm">{phone}</p>
            <a
              href={`viber://chat?number=${phoneDigits}`}
              className="w-full border border-purple-500 text-purple-500 text-xs font-bold py-2.5 rounded hover:bg-purple-500 hover:text-white transition-colors"
            >
              SCRIE PE VIBER
            </a>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center gap-3 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-[#E31E24]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </div>
            <p className="font-bold text-sm">Email</p>
            <p className="text-[#E31E24] font-bold text-xs">
              {email}
            </p>
            <a
              href={`mailto:${email}`}
              className="w-full border border-[#1B2A4A] text-[#1B2A4A] text-xs font-bold py-2.5 rounded hover:bg-[#1B2A4A] hover:text-white transition-colors"
            >
              TRIMITE EMAIL
            </a>
          </div>
        </div>
      </section>

      {/* Form + Sidebar */}
      <section className="max-w-7xl mx-auto px-4 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Form */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Trimite-ne un mesaj</h2>
            <ContactForm />
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#1B2A4A] rounded-full flex items-center justify-center text-white text-lg">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
                  </svg>
                </div>
                <p className="font-bold">Program</p>
              </div>
              <div className="flex flex-col gap-1 text-sm text-gray-600">
                <p>Luni - Vineri: 09:00 - 18:00</p>
                <p>Sâmbătă: 10:00 - 14:00</p>
                <p>Duminică: Închis</p>
              </div>
            </div>

            <div className="border border-gray-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#1B2A4A] rounded-full flex items-center justify-center text-white text-lg">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/>
                    <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
                  </svg>
                </div>
                <p className="font-bold">Suport clienți</p>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Echipa noastră îți stă la dispoziție pentru orice întrebare
                legată de produse, instalare sau service.
              </p>
              <Link
                href="#faq"
                className="text-[#E31E24] font-bold text-xs mt-4 block hover:underline"
              >
                ÎNTREBĂRI FRECVENTE →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-7xl mx-auto px-4 pb-14">
        <h2 className="text-2xl font-bold mb-2">Întrebări frecvente</h2>
        <div className="w-10 h-[3px] bg-[#E31E24] mb-6" />
        <FaqAccordion faqs={faqs} />
      </section>

      {/* Recommended products */}
      <ProductsSection products={products} viewAllHref="/produse" />
    </div>
  );
}
