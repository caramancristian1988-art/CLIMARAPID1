import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import FaqAccordion, { type FaqItem } from "@/app/components/FaqAccordion";
import JsonLd from "@/app/components/JsonLd";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Întrebări frecvente",
  description: "Răspunsuri la cele mai frecvente întrebări despre condiționere, instalare, garanție și servicii Climat Rapid în Moldova.",
  keywords: [
    "intrebari conditioner Moldova",
    "FAQ climatizare",
    "cum aleg conditioner Moldova",
    "garantie conditioner Moldova",
    "instalare conditioner pret Moldova",
    "intretinere aer conditionat Moldova",
  ],
  alternates: { canonical: "https://www.climatrapid.md/faq" },
};

const FALLBACK_FAQS: FaqItem[] = [
  { question: "Ce tipuri de aparate de aer condiționat vindeți?", answer: "Oferim o gamă variată: aparate rezidențiale, comerciale, sisteme multisplit și accesorii de la branduri de top." },
  { question: "Oferiți servicii de instalare?", answer: "Da, echipa noastră asigură instalarea profesională a tuturor aparatelor achiziționate de la noi." },
  { question: "Care este garanția pentru produse?", answer: "Toate produsele beneficiază de garanție conform specificațiilor producătorului, minim 12 luni." },
  { question: "Livrați în toată Moldova?", answer: "Da, livrăm în Chișinău și în toate localitățile din Moldova. Detalii pe pagina de Livrare și plată." },
];

async function getFaqs(): Promise<FaqItem[]> {
  try {
    const faqs = await prisma.faq.findMany({ orderBy: { order: "asc" } });
    if (faqs.length === 0) throw new Error("empty");
    return faqs.map((f) => ({ question: f.question, answer: f.answer }));
  } catch {
    return FALLBACK_FAQS;
  }
}

export default async function FaqPage() {
  const faqs = await getFaqs();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((f) => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": { "@type": "Answer", "text": f.answer },
    })),
  };

  return (
    <main className="bg-white min-h-screen">
      <JsonLd data={faqSchema} />
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
          <span>›</span>
          <span className="text-gray-600">Întrebări frecvente</span>
        </nav>

        <p className="text-[#c7092b] text-[11px] font-extrabold tracking-widest uppercase mb-3">Suport</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1d2353] leading-tight mb-3">
          Întrebări frecvente
        </h1>
        <p className="text-gray-500 text-[15px] leading-relaxed mb-10">
          Găsești mai jos răspunsuri la cele mai comune întrebări. Dacă nu găsești ce cauți,{" "}
          <Link href="/contact" className="text-[#c7092b] hover:underline">contactează-ne</Link>.
        </p>

        <FaqAccordion faqs={faqs} />

        <div className="mt-12 bg-[#f8fafc] rounded-2xl p-6 text-center border border-gray-100">
          <p className="font-bold text-[#1d2353] mb-1">Nu ai găsit răspunsul?</p>
          <p className="text-sm text-gray-500 mb-4">Echipa noastră îți stă la dispoziție pentru orice întrebare.</p>
          <Link
            href="/contact"
            className="inline-flex items-center bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm uppercase tracking-wide"
          >
            Contactează-ne
          </Link>
        </div>
      </div>
    </main>
  );
}
