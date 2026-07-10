import Image from "next/image";
import Link from "next/link";
import NewsletterForm from "@/app/components/NewsletterForm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSectionFlags } from "@/lib/siteSettings";
import { prisma } from "@/lib/prisma";
import JsonLd from "@/app/components/JsonLd";

export const revalidate = 3600;

const DEMO_SLUG = "cum-alegi-conditionerul-potrivit";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug === DEMO_SLUG) {
    return {
      title: "Cum alegi conditionerul potrivit pentru casa ta? | Climat Rapid Blog",
      description: "Ghid complet pentru alegerea conditionerului ideal: BTU, inverter, clasă energetică și sfaturi de la experții Climat Rapid.",
    };
  }
  const post = await prisma.blogPost.findFirst({ where: { slug, published: true }, select: { title: true, description: true, image: true } });
  if (!post) return {};
  return {
    title: `${post.title} | Climat Rapid Blog`,
    description: post.description,
    openGraph: post.image ? { images: [{ url: post.image, alt: post.title }] } : undefined,
  };
}

const article = {
  title: "Cum alegi conditionerul potrivit pentru casa ta?",
  category: "Ghiduri & Sfaturi",
  date: "15 iunie 2026",
  author: "Echipa Climat Rapid",
  readTime: "7 min citire",
  image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
};

const categories = [
  { label: "Ghiduri & Sfaturi", count: 12 },
  { label: "Instalare", count: 8 },
  { label: "Mentenanță", count: 6 },
  { label: "Produse noi", count: 4 },
  { label: "Oferte", count: 9 },
];

const recentArticles = [
  {
    title: "Ce înseamnă BTU și cum îl calculezi?",
    date: "10 iunie 2026",
    slug: DEMO_SLUG,
    image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
  },
  {
    title: "Inverter vs Non-Inverter: care e mai bun?",
    date: "5 iunie 2026",
    slug: DEMO_SLUG,
    image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
  },
  {
    title: "Cât de des trebuie curățat filtrul?",
    date: "1 iunie 2026",
    slug: DEMO_SLUG,
    image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
  },
];

const relatedArticles = [
  {
    title: "Top 5 conditionere pentru apartament în 2026",
    category: "Produse noi",
    date: "12 iunie 2026",
    slug: DEMO_SLUG,
    image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
  },
  {
    title: "Cum se calculează puterea necesară pentru o cameră?",
    category: "Ghiduri & Sfaturi",
    date: "8 iunie 2026",
    slug: DEMO_SLUG,
    image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
  },
  {
    title: "Mentenanța anuală: de ce este obligatorie?",
    category: "Mentenanță",
    date: "3 iunie 2026",
    slug: DEMO_SLUG,
    image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
  },
];

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const [{ blogEnabled }, { slug }] = await Promise.all([getSectionFlags(), params]);
  if (!blogEnabled) notFound();

  if (slug !== DEMO_SLUG) {
    const post = await prisma.blogPost.findFirst({
      where: { slug, published: true },
      select: { title: true, description: true, image: true, content: true, category: true, createdAt: true },
    });
    if (!post) notFound();
    const postArticle = {
      title: post.title,
      category: post.category ?? "General",
      date: post.createdAt.toLocaleDateString("ro-MD", { day: "numeric", month: "long", year: "numeric" }),
      author: "Echipa Climat Rapid",
      readTime: "5 min citire",
      image: post.image ?? "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
    };
    const BASE = "https://www.climatrapid.md";
    const absImage = post.image ? (post.image.startsWith("http") ? post.image : `${BASE}${post.image}`) : undefined;
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.description,
      "datePublished": post.createdAt.toISOString(),
      "dateModified": post.createdAt.toISOString(),
      ...(absImage ? { "image": [absImage] } : {}),
      "author": { "@type": "Organization", "name": "Climat Rapid", "url": BASE },
      "publisher": {
        "@type": "Organization",
        "name": "Climat Rapid",
        "url": BASE,
        "logo": { "@type": "ImageObject", "url": `${BASE}/logo.png` },
      },
      "mainEntityOfPage": { "@type": "WebPage", "@id": `${BASE}/blog/${slug}` },
    };
    return (
      <main>
        <JsonLd data={articleSchema} />
        <section className="relative h-[320px] sm:h-[420px] overflow-hidden">
          <Image src={postArticle.image} alt={postArticle.title} fill className="object-cover object-center" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          <div className="absolute inset-0 flex flex-col justify-end max-w-7xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
            <nav className="flex items-center gap-1.5 text-white/60 text-xs mb-4">
              <Link href="/" className="hover:text-white transition-colors">Acasă</Link><span>/</span>
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link><span>/</span>
              <span className="text-white/80 line-clamp-1">{postArticle.title}</span>
            </nav>
            <span className="inline-flex self-start bg-[#c7092b] text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wide mb-3">{postArticle.category}</span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4 max-w-3xl">{postArticle.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/70 text-xs sm:text-sm">
              <span>{postArticle.author}</span><span>·</span><span>{postArticle.date}</span><span>·</span><span>{postArticle.readTime}</span>
            </div>
          </div>
        </section>
        <section className="bg-[#f8fafc] py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <article className="bg-white rounded-2xl shadow-sm p-6 sm:p-10">
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-8 font-medium border-l-4 border-[#c7092b] pl-5">{post.description}</p>
              {post.content && (
                <div className="prose prose-sm sm:prose max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
              )}
            </article>
          </div>
        </section>
        <section className="bg-[#1d2353] py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">Ai nevoie de instalare sau mentenanță?</h2>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-8 py-4 rounded-xl transition-all text-sm uppercase tracking-wide">
              Solicită ofertă
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      {/* Schema.org BlogPosting */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: article.title,
            author: { "@type": "Organization", name: article.author },
            datePublished: "2026-06-15",
            publisher: {
              "@type": "Organization",
              name: "Climat Rapid",
              url: "https://climatrapid.md",
            },
          }),
        }}
      />

      <main>
        {/* ── HERO ── */}
        <section className="relative h-[320px] sm:h-[420px] lg:h-[500px] overflow-hidden">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

          <div className="absolute inset-0 flex flex-col justify-end max-w-7xl mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-white/60 text-xs mb-4" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-white transition-colors">Acasă</Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
              <span>/</span>
              <span className="text-white/80 line-clamp-1">{article.title}</span>
            </nav>

            {/* Category */}
            <span className="inline-flex self-start bg-[#c7092b] text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wide mb-3">
              {article.category}
            </span>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4 max-w-3xl">
              {article.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-white/70 text-xs sm:text-sm">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="3.3" />
                  <path d="M5 19.2c.9-3.6 3.6-5.7 7-5.7s6.1 2.1 7 5.7" />
                </svg>
                {article.author}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
                  <path d="M8 3v4M16 3v4M3.5 10.5h17M8 14.5h.01M12 14.5h.01M16 14.5h.01" />
                </svg>
                {article.date}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="8.5" />
                  <path d="M12 7.5V12l3.3 1.9" />
                </svg>
                {article.readTime}
              </span>
            </div>
          </div>
        </section>

        {/* ── CONTENT + SIDEBAR ── */}
        <section className="bg-[#f8fafc] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">

              {/* Article Content */}
              <article className="bg-white rounded-2xl shadow-sm p-6 sm:p-10">

                {/* Intro */}
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-8 font-medium border-l-4 border-[#c7092b] pl-5">
                  Alegerea unui conditioner potrivit poate părea complicată, dar cu câteva informații cheie, decizia devine mult mai ușoară. În acest ghid îți explicăm tot ce trebuie să știi înainte de a cumpăra.
                </p>

                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1d2353] mb-4 mt-8">
                  1. Calculează suprafața camerei
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Primul pas este să cunoști suprafața încăperii în care vei instala conditionerul. Regula generală este că ai nevoie de aproximativ <strong className="text-[#1d2353]">1000 BTU pentru fiecare 10 m²</strong>, dar aceasta variază în funcție de înălțimea tavanului, orientarea camerei și numărul de ferestre.
                </p>
                <ul className="space-y-2 mb-6 text-gray-600">
                  {[
                    "Cameră de 20 m² → 9.000 – 12.000 BTU",
                    "Cameră de 30 m² → 12.000 – 18.000 BTU",
                    "Cameră de 50 m² → 18.000 – 24.000 BTU",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-[#c7092b] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 20 20">
                        <circle cx="10" cy="10" r="8" />
                        <path d="M6.4 10.3l2.3 2.3 4.6-5.2" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                {/* Inline image */}
                <div className="relative h-[220px] sm:h-[300px] rounded-xl overflow-hidden my-8">
                  <Image
                    src={article.image}
                    alt="Conditioner instalat în cameră"
                    fill
                    className="object-cover"
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, 700px"
                  />
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1d2353] mb-4 mt-8">
                  2. Inverter sau Non-Inverter?
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Conditionerele <strong className="text-[#1d2353]">Inverter</strong> sunt mai eficiente energetic și mai silențioase. Ele ajustează continuu puterea compresorului în funcție de necesarul din cameră, ceea ce duce la economii de până la <strong className="text-[#1d2353]">40% la facturile de energie</strong>.
                </p>

                {/* Quote */}
                <blockquote className="border-l-4 border-[#1d2353] bg-[#1d2353]/5 rounded-r-xl px-6 py-4 my-6">
                  <p className="text-[#1d2353] font-semibold italic text-sm sm:text-base leading-relaxed">
                    "Un conditioner inverter de calitate se amortizează în 2-3 ani prin economia la factura de energie electrică, comparativ cu un model non-inverter de același preț."
                  </p>
                  <footer className="text-xs text-gray-500 mt-2">— Echipa Climat Rapid</footer>
                </blockquote>

                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1d2353] mb-4 mt-8">
                  3. Clasa energetică
                </h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Clasa energetică indică eficiența dispozitivului. Cele mai eficiente sunt <strong className="text-[#1d2353]">A+++</strong>, urmate de A++ și A+. Deși au un preț inițial mai mare, costurile de operare sunt semnificativ mai mici.
                </p>

                <h3 className="text-lg font-bold text-[#1d2353] mb-3 mt-6">
                  Funcții utile de bifat
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {[
                    {
                      icon: (
                        <svg className="w-6 h-6 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M12 3v18M5.2 7.5l13.6 9M18.8 7.5L5.2 16.5" />
                        </svg>
                      ),
                      title: "Modul răcire & încălzire",
                      desc: "Utilizabil tot anul",
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M12 3c3.5 4 6 7.4 6 10.5A6 6 0 016 13.5C6 10.4 8.5 7 12 3z" />
                        </svg>
                      ),
                      title: "Dezumidificare",
                      desc: "Reduce umiditatea excesivă",
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M5 9a10 10 0 0114 0M8 12.3a6 6 0 018 0M12 16h.01" />
                        </svg>
                      ),
                      title: "Control Wi-Fi",
                      desc: "Operare din aplicație",
                    },
                    {
                      icon: (
                        <svg className="w-6 h-6 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                          <path d="M3 8h11a2.5 2.5 0 100-5M3 16h14a2.5 2.5 0 110 5M3 12h8a2 2 0 100-4" />
                        </svg>
                      ),
                      title: "Purificare aer",
                      desc: "Filtre antibacteriene",
                    },
                  ].map((f) => (
                    <div key={f.title} className="flex items-start gap-3 bg-[#f8fafc] rounded-xl p-4">
                      <span className="shrink-0 mt-0.5">{f.icon}</span>
                      <div>
                        <p className="text-sm font-bold text-[#1d2353]">{f.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1d2353] mb-4 mt-8">
                  4. Branduri recomandate
                </h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  La Climat Rapid lucrăm cu branduri de top precum <strong className="text-[#1d2353]">Daikin, Mitsubishi Electric, Gree și LG</strong> — toate cu garanție extinsă și piese de schimb disponibile în Moldova.
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-6 border-t border-gray-100">
                  {["Conditioner", "BTU", "Inverter", "Eficiență energetică", "Climatizare"].map((tag) => (
                    <span key={tag} className="text-xs bg-[#f8fafc] border border-gray-200 text-gray-600 px-3 py-1 rounded-full hover:border-[#c7092b] hover:text-[#c7092b] transition-colors cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              </article>

              {/* Sidebar */}
              <aside className="flex flex-col gap-6">

                {/* Search */}
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <h3 className="text-sm font-extrabold text-[#1d2353] uppercase tracking-wider mb-3">Caută articole</h3>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Caută în blog..."
                      className="w-full h-10 pl-4 pr-10 rounded-lg border border-gray-200 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#1d2353] transition-colors"
                    />
                    <button className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center bg-[#c7092b] rounded-r-lg text-white">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <circle cx="10.5" cy="10.5" r="6.5" />
                        <path d="M19.5 19.5l-4.7-4.7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Categories */}
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <h3 className="text-sm font-extrabold text-[#1d2353] uppercase tracking-wider mb-4">Categorii</h3>
                  <ul className="space-y-2">
                    {categories.map((cat) => (
                      <li key={cat.label}>
                        <Link
                          href="/blog"
                          className="flex items-center justify-between text-sm text-gray-600 hover:text-[#c7092b] transition-colors group py-1.5 border-b border-gray-50"
                        >
                          <span className="flex items-center gap-2">
                            <svg className="w-3 h-3 text-[#c7092b] opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                              <path d="M8 5l7 7-7 7" />
                            </svg>
                            {cat.label}
                          </span>
                          <span className="text-xs bg-[#f8fafc] text-gray-500 px-2 py-0.5 rounded-full">{cat.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recent articles */}
                <div className="bg-white rounded-2xl shadow-sm p-5">
                  <h3 className="text-sm font-extrabold text-[#1d2353] uppercase tracking-wider mb-4">Articole recente</h3>
                  <div className="flex flex-col gap-4">
                    {recentArticles.map((a) => (
                      <Link key={a.slug} href={`/blog/${a.slug}`} className="flex gap-3 group">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                          <Image src={a.image} alt={a.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" sizes="64px" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#1d2353] leading-snug group-hover:text-[#c7092b] transition-colors line-clamp-2">{a.title}</p>
                          <p className="text-[11px] text-gray-400 mt-1">{a.date}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Contact button */}
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 bg-[#1d2353] hover:bg-[#161b3d] text-white font-bold px-5 py-4 rounded-2xl transition-all text-sm uppercase tracking-wide shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
                    <path d="M10.5 18.3h3" />
                  </svg>
                  Contactează-ne
                </Link>

                {/* Promo banner */}
                <div className="bg-[#1d2353] rounded-2xl p-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#c7092b]/20 rounded-full -translate-y-8 translate-x-8" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-6 -translate-x-6" />
                  <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-2">Servicii Climat Rapid</p>
                  <h4 className="text-base font-extrabold mb-2 leading-snug">Instalare profesională în 24h</h4>
                  <p className="text-xs text-white/60 mb-4 leading-relaxed">Echipă certificată, garanție pe lucrare, prețuri transparente.</p>
                  <Link
                    href="/servicii"
                    className="inline-flex items-center gap-1.5 bg-[#c7092b] hover:bg-[#a5071f] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                  >
                    Află mai multe
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

              </aside>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="bg-[#1d2353] py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Servicii profesionale</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-4 max-w-2xl mx-auto leading-tight">
              Ai nevoie de instalare sau mentenanță pentru aerul condiționat?
            </h2>
            <p className="text-white/60 text-sm sm:text-base mb-8 max-w-lg mx-auto leading-relaxed">
              Echipa noastră de specialiști certificați este disponibilă în toată Moldova. Răspuns rapid, prețuri corecte.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#c7092b] hover:bg-[#a5071f] text-white font-bold px-8 py-4 rounded-xl transition-all text-sm uppercase tracking-wide shadow-lg hover:shadow-[#c7092b]/30 hover:-translate-y-0.5"
            >
              Solicită ofertă
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* ── RELATED ARTICLES ── */}
        <section className="bg-[#f8fafc] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-xl font-extrabold text-[#1d2353] uppercase tracking-wide mb-8">
              Articole <span className="text-[#c7092b]">similare</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((a) => (
                <Link key={a.slug} href={`/blog/${a.slug}`} className="group bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={a.image}
                      alt={a.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  <div className="p-5">
                    <span className="text-[10px] font-bold text-[#c7092b] uppercase tracking-wide">{a.category}</span>
                    <h3 className="text-sm font-bold text-[#1d2353] mt-1.5 mb-2 leading-snug group-hover:text-[#c7092b] transition-colors line-clamp-2">
                      {a.title}
                    </h3>
                    <p className="text-xs text-gray-400">{a.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── NEWSLETTER ── */}
        <section className="bg-white border-t border-gray-100 py-12">
          <div className="max-w-xl mx-auto px-4 text-center">
            <div className="w-12 h-12 bg-[#c7092b]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-[#c7092b]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <path d="M4 7l7.4 5.6a1 1 0 001.2 0L20 7" />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold text-[#1d2353] mb-2">
              Abonează-te la noutăți
            </h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Primești săptămânal ghiduri, oferte exclusive și noutăți din lumea climatizării.
            </p>
            <div className="bg-[#1d2353] rounded-2xl p-1">
              <NewsletterForm />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
