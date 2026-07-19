import type { Metadata } from "next";
import { Suspense } from "react";
import { GeistSans } from "geist/font/sans";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { SiteHeader, SiteFooter, SiteFloatingContact, SiteDiscountPopup } from "./components/SiteChrome";
import ScrollToTop from "./components/ScrollToTop";
import { FavoritesProvider } from "./components/FavoritesProvider";
import { CartProvider } from "./components/CartProvider";
import { AuthProvider } from "./components/AuthProvider";
import { AuthModalProvider } from "./components/AuthModalProvider";
import AuthModal from "./components/AuthModal";
import { FloatingUIProvider } from "./components/FloatingUIState";
import { getSectionFlags, getHeaderCategories, getSocialLinks, getContactInfo } from "@/lib/siteSettings";
import JsonLd from "./components/JsonLd";

const BASE = "https://www.climatrapid.md";

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: "Climat Rapid — Condiționere & Climatizare Moldova",
    template: "%s | Climat Rapid",
  },
  description:
    "Magazin online de condiționere și sisteme de climatizare în Moldova. Vânzare, livrare și instalare profesională — Daikin, Mitsubishi, Gree, Midea la cele mai bune prețuri.",
  keywords: [
    "conditioner Moldova", "aer conditionat Moldova", "climatizare Chisinau",
    "conditioner Chisinau", "instalare aer conditionat Moldova",
    "Daikin Moldova", "Mitsubishi Electric Moldova", "Gree conditioner",
    "Midea aer conditionat", "conditioner ieftin Moldova",
    "pret conditioner Moldova", "magazin condiționere Moldova",
    "climatizare industriala Moldova", "multisplit Moldova",
    "Climat Rapid", "servire aer conditionat Chisinau",
  ],
  alternates: { canonical: BASE },
  openGraph: {
    title: "Climat Rapid — Condiționere & Climatizare Moldova",
    description: "Vânzare, livrare și instalare condiționere în Moldova. Daikin, Mitsubishi, Gree, Midea la cele mai bune prețuri.",
    locale: "ro_MD",
    type: "website",
    url: BASE,
    siteName: "Climat Rapid",
    images: [{ url: `${BASE}/og-image.png`, width: 1200, height: 630, alt: "Climat Rapid — Condiționere Moldova" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@climatrapid",
    title: "Climat Rapid — Condiționere & Climatizare Moldova",
    description: "Magazin online de condiționere și sisteme de climatizare. Livrare și instalare în Moldova.",
    images: [`${BASE}/og-image.png`],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sectionFlags, headerCategories, socialLinks, contactInfo, locale, messages] = await Promise.all([
    getSectionFlags(),
    getHeaderCategories(),
    getSocialLinks(),
    getContactInfo(),
    getLocale(),
    getMessages(),
  ]);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${BASE}/#business`,
        "name": "Climat Rapid",
        "url": BASE,
        "logo": `${BASE}/logo.png`,
        "description": "Magazin online de condiționere și sisteme de climatizare în Moldova. Vânzare, livrare și instalare profesională.",
        "telephone": contactInfo.phoneTel,
        "email": "climatrapid@gmail.com",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Chișinău",
          "addressRegion": "Chișinău",
          "addressCountry": "MD",
        },
        "areaServed": { "@type": "Country", "name": "Moldova" },
        "priceRange": "$$",
        "sameAs": [
          socialLinks.instagram,
          socialLinks.facebook,
          socialLinks.tiktok,
        ].filter(Boolean),
      },
      {
        "@type": "WebSite",
        "@id": `${BASE}/#website`,
        "url": BASE,
        "name": "Climat Rapid",
        "publisher": { "@id": `${BASE}/#business` },
        "potentialAction": {
          "@type": "SearchAction",
          "target": { "@type": "EntryPoint", "urlTemplate": `${BASE}/produse?search={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <html lang={locale} className={GeistSans.variable}>
      <body className="min-h-screen flex flex-col">
        <JsonLd data={orgJsonLd} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <AuthModalProvider>
              <FavoritesProvider>
                <CartProvider>
                  <Suspense fallback={null}>
                    <ScrollToTop />
                  </Suspense>
                  <SiteHeader {...sectionFlags} {...contactInfo} categories={headerCategories} />
                  {children}
                  <SiteFooter {...socialLinks} />
                  <FloatingUIProvider>
                    <SiteFloatingContact {...contactInfo} />
                    <SiteDiscountPopup />
                  </FloatingUIProvider>
                  <AuthModal />
                </CartProvider>
              </FavoritesProvider>
            </AuthModalProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
