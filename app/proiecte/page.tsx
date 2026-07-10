import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Proiecte realizate",
  description: "Portofoliu de proiecte de instalare și climatizare realizate de echipa Climat Rapid în Moldova. Case, birouri, spații comerciale climatizate profesional.",
  keywords: [
    "proiecte climatizare Moldova",
    "instalari realizate Chisinau",
    "portofoliu Climat Rapid",
    "proiecte aer conditionat Moldova",
    "referinte climatizare Moldova",
  ],
  alternates: { canonical: "https://www.climatrapid.md/proiecte" },
};

export const revalidate = 3600;

async function getProjects() {
  try {
    return await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return [];
  }
}

async function isProiecteEnabled() {
  try {
    const settings = await prisma.settings.findFirst();
    return settings?.proiecteEnabled ?? false;
  } catch {
    return false;
  }
}

export default async function ProiectePage() {
  if (!(await isProiecteEnabled())) notFound();

  const projects = await getProjects();

  return (
    <main className="bg-white">
      {/* MOBILE hero */}
      <section className="sm:hidden relative h-[300px] overflow-hidden">
        <Image
          src="/IMG_2851.PNG"
          alt="Proiecte Climat Rapid"
          fill
          className="object-cover object-bottom"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/85 from-10% via-white/50 via-40% to-transparent to-70% pointer-events-none" />
        <div className="absolute top-0 left-0 z-10 flex flex-col justify-start px-4 pt-4">
          <nav className="flex items-center gap-1 text-[10px] text-gray-500 mb-3">
            <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
            <span>›</span>
            <span className="text-gray-700">Proiecte</span>
          </nav>
          <h1 className="text-2xl font-extrabold text-[#1d2353] mb-2">Proiecte realizate</h1>
          <p className="text-gray-700 text-xs max-w-[200px] leading-relaxed">
            O parte din lucrările de instalare și climatizare realizate de echipa noastră.
          </p>
        </div>
      </section>

      {/* DESKTOP hero */}
      <section className="hidden sm:block relative bg-white overflow-hidden h-[340px] lg:h-[380px]">
        <div className="absolute inset-0 flex justify-end">
          <div className="w-[65%] h-full relative">
            <Image
              src="/IMG_2848.PNG"
              alt="Proiecte Climat Rapid"
              fill
              className="object-cover object-center"
              priority
              sizes="65vw"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-white from-25% via-white/60 via-40% to-transparent to-65% pointer-events-none" />
        <div className="absolute inset-0 flex flex-col justify-start pt-3 px-8 lg:px-12">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
            <span>›</span>
            <span className="text-gray-600">Proiecte</span>
          </nav>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#1d2353] mb-4">Proiecte realizate</h1>
          <p className="text-gray-700 text-sm lg:text-[17px] max-w-xs lg:max-w-sm leading-relaxed">
            O parte din lucrările de instalare și climatizare realizate de echipa noastră în Moldova.
          </p>
        </div>
      </section>

      {/* GRID */}
      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">Momentan nu există proiecte publicate.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p) => (
                <div
                  key={p.id}
                  className="group flex flex-col rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white"
                >
                  <div className="relative h-52 bg-[#f6f8fb] overflow-hidden">
                    {p.images[0] ? (
                      <Image
                        src={p.images[0]}
                        alt={p.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20 8H4a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2v-8a2 2 0 00-2-2zM4 6h16V4H4v2z" />
                        </svg>
                      </div>
                    )}
                    {p.images.length > 1 && (
                      <span className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                        +{p.images.length - 1} foto
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 p-5">
                    <h2 className="text-sm font-bold text-[#1d2353] leading-snug mb-2 line-clamp-2">{p.title}</h2>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pb-16">
        <div className="bg-[#1d2353] rounded-2xl px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-white font-bold text-lg">Vrei un proiect similar la tine?</p>
            <p className="text-white/60 text-sm mt-0.5">Cere o ofertă gratuită pentru instalare sau mentenanță.</p>
          </div>
          <Link
            href="/contact"
            className="shrink-0 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-8 py-3 rounded-xl flex items-center gap-2 transition-colors text-sm uppercase tracking-wide"
          >
            CONTACTEAZĂ-NE
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
