import type { Metadata } from "next";
import { Suspense } from "react";
import { GeistSans } from "geist/font/sans";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://www.climatrapid.md"),
  title: {
    default: "Climat Rapid — Condiționere & Climatizare Moldova",
    template: "%s | Climat Rapid",
  },
  description:
    "Magazin online de condiționere și sisteme de climatizare în Moldova. Vânzare, livrare și instalare profesională — Daikin, Mitsubishi, Gree, Midea la cele mai bune prețuri.",
  keywords: [
    "conditioner Moldova",
    "aer conditionat Moldova",
    "climatizare Chisinau",
    "conditioner Chisinau",
    "instalare aer conditionat Moldova",
    "Daikin Moldova",
    "Mitsubishi Electric Moldova",
    "Gree conditioner",
    "Midea aer conditionat",
    "conditioner ieftin Moldova",
    "pret conditioner Moldova",
    "magazin condiționere Moldova",
    "climatizare industriala Moldova",
    "multisplit Moldova",
    "Climat Rapid",
    "servire aer conditionat Chisinau",
  ],
  alternates: { canonical: "https://www.climatrapid.md" },
  openGraph: {
    title: "Climat Rapid — Condiționere & Climatizare Moldova",
    description:
      "Vânzare, livrare și instalare condiționere în Moldova. Daikin, Mitsubishi, Gree, Midea la cele mai bune prețuri.",
    locale: "ro_MD",
    type: "website",
    url: "https://www.climatrapid.md",
    siteName: "Climat Rapid",
  },
  twitter: {
    card: "summary_large_image",
    title: "Climat Rapid — Condiționere & Climatizare Moldova",
    description:
      "Magazin online de condiționere și sisteme de climatizare. Livrare și instalare în Moldova.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sectionFlags, headerCategories, socialLinks, contactInfo] = await Promise.all([
    getSectionFlags(),
    getHeaderCategories(),
    getSocialLinks(),
    getContactInfo(),
  ]);

  return (
    <html lang="ro" className={GeistSans.variable}>
      <body className="min-h-screen flex flex-col">
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
      </body>
    </html>
  );
}
