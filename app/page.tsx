import { Header } from "@/components/site/Header"
import { Footer } from "@/components/site/Footer"
import { HeroSection } from "@/components/hero66/HeroSection"
import { ConceptSection } from "@/components/home/ConceptSection"
import { StorySection } from "@/components/home/StorySection"
import { ServicesSection } from "@/components/home/ServicesSection"
import { VisitSection } from "@/components/home/VisitSection"
import { GallerySection } from "@/components/home/GallerySection"
import { JournalSection } from "@/components/home/JournalSection"
import { InfoSection } from "@/components/home/InfoSection"
import { RevealObserver } from "@/components/home/RevealObserver"

// トップ：3Dヒーロー（ルート66）→ 想い → 由来 → サービス → お店へ → 風景 → ブログ → 問い合わせ・会社概要。
// ヒーロー以外はサーバーで描く（スクロールで現れる動きだけ小さなクライアント部品）。
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <ConceptSection />
        <StorySection />
        <ServicesSection />
        <VisitSection />
        <GallerySection />
        <JournalSection />
        <InfoSection />
      </main>
      <Footer />
      <RevealObserver />
    </>
  )
}
