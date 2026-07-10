import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSectionFlags } from "@/lib/siteSettings";
import { prisma } from "@/lib/prisma";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog — Ghiduri și sfaturi despre climatizare",
  description:
    "Ghiduri practice, sfaturi de la experți și noutăți despre condiționere, instalare, mentenanță și economie de energie. Blog Climat Rapid Moldova.",
  keywords: [
    "blog climatizare Moldova",
    "ghid conditioner Moldova",
    "sfaturi aer conditionat",
    "cum aleg conditioner",
    "mentenanta conditioner sfaturi",
    "economie energie conditioner",
    "instalare aer conditionat ghid",
    "noutati climatizare Moldova",
  ],
  alternates: { canonical: "https://www.climatrapid.md/blog" },
};

const FALLBACK_ARTICLE = {
  slug: "cum-alegi-conditionerul-potrivit",
  title: "Cum alegi aparatul de aer condiționat potrivit pentru casa ta?",
  excerpt: "Află tot ce trebuie să știi pentru a alege un aparat de aer condiționat potrivit și eficient.",
  category: "Ghiduri",
  categoryColor: "bg-[#c7092b]",
  date: "20 Mai 2026",
  readTime: "5 min read",
  image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
};

async function getArticles() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: { slug: true, title: true, description: true, category: true, image: true, createdAt: true },
    });
    if (posts.length > 0) {
      return posts.map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.description,
        category: p.category ?? "General",
        categoryColor: "bg-[#c7092b]",
        date: p.createdAt.toLocaleDateString("ro-MD", { day: "numeric", month: "long", year: "numeric" }),
        readTime: "5 min read",
        image: p.image ?? "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
      }));
    }
  } catch {
    // fall through to static fallback
  }
  return [FALLBACK_ARTICLE];
}

const filterTabs = [
  { label: "Toate articolele", href: "/blog" },
  { label: "Ghiduri", href: "/blog/categorie/ghiduri" },
  { label: "Sfaturi", href: "/blog/categorie/sfaturi" },
  { label: "Întreținere", href: "/blog/categorie/intretinere" },
  { label: "Noutăți", href: "/blog/categorie/noutati" },
  { label: "Tehnologie", href: "/blog/categorie/tehnologie" },
];

export default async function BlogPage() {
  const [{ blogEnabled }, articles] = await Promise.all([getSectionFlags(), getArticles()]);
  if (!blogEnabled) notFound();

  return (
    <main className="bg-white">

        {/* ── HEADER SECTION ── */}

        {/* MOBILE hero (sm:hidden) */}
        <section className="sm:hidden relative h-[300px] overflow-hidden">
          <Image
            src="/IMG_2826.PNG"
            alt="Blog Climat Rapid"
            fill
            className="object-cover object-[center_25%]"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/85 from-10% via-white/50 via-40% to-transparent to-70% pointer-events-none" />
          <div className="absolute top-0 left-0 z-10 flex flex-col justify-start px-4 pt-4">
            <nav className="flex items-center gap-1 text-[10px] text-gray-500 mb-3">
              <Link href="/" className="hover:text-[#c7092b] transition-colors">Acasă</Link>
              <span>›</span>
              <span className="text-gray-700">Blog</span>
            </nav>
            <h1 className="text-2xl font-extrabold text-[#1d2353] mb-2">Blog</h1>
            <p className="text-gray-700 text-xs max-w-[180px] leading-relaxed">
              Sfaturi utile, ghiduri și noutăți despre climatizare, eficiența energetică și confortul casei tale.
            </p>
          </div>
        </section>

        {/* DESKTOP hero (hidden sm:block) */}
        <section className="hidden sm:block relative bg-white overflow-hidden h-[340px] lg:h-[380px]">
          <div className="absolute inset-0 flex justify-end">
            <div className="w-[65%] h-full relative">
              <Image
                src="/IMG_2824.PNG"
                alt="Blog Climat Rapid"
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
              <span className="text-gray-600">Blog</span>
            </nav>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-[#1d2353] mb-4">Blog</h1>
            <p className="text-gray-700 text-sm lg:text-[17px] max-w-xs lg:max-w-sm leading-relaxed">
              Sfaturi utile, ghiduri și noutăți despre climatizare, eficiența energetică și confortul casei tale.
            </p>
          </div>
        </section>

        {/* ── FILTER TABS ── */}
        <section className="border-y border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between gap-4 py-3">
              {/* Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto scroll-smooth" style={{scrollbarWidth:"none"}}>
                {filterTabs.map((tab, i) => (
                  <Link
                    key={tab.href}
                    href={tab.href}
                    className={`shrink-0 text-xs font-bold px-4 py-2 rounded-full transition-all ${
                      i === 0
                        ? "bg-[#1d2353] text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>
              {/* Sort dropdown */}
              <div className="hidden sm:flex items-center shrink-0">
                <select className="text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1d2353] bg-white">
                  <option>Cele mai noi</option>
                  <option>Cele mai vechi</option>
                  <option>Populare</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* ── ARTICLES GRID ── */}
        <section className="bg-white py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <Link
                  key={article.slug}
                  href={`/blog/${article.slug}`}
                  className="group flex flex-col rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {/* Category badge on image */}
                    <span className={`absolute bottom-3 left-3 ${article.categoryColor} text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide`}>
                      {article.category}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-5">
                    <h2 className="text-sm font-bold text-[#1d2353] leading-snug mb-2 line-clamp-2 group-hover:text-[#c7092b] transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 flex-1 mb-4">
                      {article.excerpt}
                    </p>
                    {/* Footer meta */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-50">
                      <div className="w-5 h-5 shrink-0">
                        <Image
                          src="/Untitled-2.png"
                          alt="Climat Rapid"
                          width={20}
                          height={20}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-gray-500">Climat Rapid</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-[11px] text-gray-400">{article.date}</span>
                      <span className="text-gray-300">·</span>
                      <span className="text-[11px] text-gray-400">{article.readTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── NEWSLETTER ── */}
        <section className="bg-[#f8fafc] border-t border-gray-100 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1d2353] mb-1">
                  Rămâi la curent cu noutățile și sfaturile noastre
                </h2>
                <p className="text-sm text-gray-500">
                  Abonează-te și primești cele mai utile informații direct pe email.
                </p>
              </div>
              <form className="flex gap-0 rounded-xl overflow-hidden border border-gray-200 shrink-0 w-full sm:w-auto shadow-sm">
                <input
                  type="email"
                  placeholder="Emailul tău"
                  className="h-12 px-5 text-sm text-gray-700 placeholder-gray-400 bg-white focus:outline-none w-full sm:w-64"
                />
                <button
                  type="submit"
                  className="h-12 px-6 bg-[#c7092b] hover:bg-[#a5071f] text-white text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-colors shrink-0"
                >
                  Abonează-te
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M3 11.5L20 4l-7 17-2.5-7.5L3 11.5z" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </section>

    </main>
  );
}
