"use client"

import { Header } from "@/components/sections/Header"
import { HeroSection } from "@/components/hero66/HeroSection"
import { ConceptSection } from "@/components/sections/ConceptSection"
import { OriginSection } from "@/components/sections/OriginSection"
import { ServicesSection } from "@/components/sections/ServicesSection"
import { ShopBannerSection } from "@/components/sections/ShopBannerSection"
import { GallerySection } from "@/components/sections/GallerySection"
import { CompanySection } from "@/components/sections/CompanySection"
import { ContactSection } from "@/components/sections/ContactSection"
import { Footer } from "@/components/sections/Footer"

// ローディング画面と雲の演出は廃止し、3Dヒーロー（ルート66）に置き換えた。
// 本文は最初から描かれる（SSR にも入る）。
export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <ConceptSection />
      <OriginSection />
      <ServicesSection />
      <ShopBannerSection />
      <GallerySection />
      <CompanySection />
      <ContactSection />
      <Footer />
    </main>
  )
}
