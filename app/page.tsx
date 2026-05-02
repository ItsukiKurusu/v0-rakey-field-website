"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { LoadingAnimation } from "@/components/sections/LoadingAnimation"
import { CloudReveal } from "@/components/sections/CloudReveal"
import { Header } from "@/components/sections/Header"
import { HeroSlider } from "@/components/sections/HeroSlider"
import { ConceptSection } from "@/components/sections/ConceptSection"
import { OriginSection } from "@/components/sections/OriginSection"
import { ServicesSection } from "@/components/sections/ServicesSection"
import { GallerySection } from "@/components/sections/GallerySection"
import { CompanySection } from "@/components/sections/CompanySection"
import { ContactSection } from "@/components/sections/ContactSection"
import { Footer } from "@/components/sections/Footer"

// loading   → ローディング画面表示中
// revealing → 雲が割れるトランジション中（コンテンツは裏で準備済み）
// ready     → 演出完了・フル表示
type Phase = "loading" | "revealing" | "ready"

export default function Home() {
  const [phase, setPhase] = useState<Phase>("loading")

  return (
    <>
      <AnimatePresence>
        {phase === "loading" && (
          <LoadingAnimation onComplete={() => setPhase("revealing")} />
        )}
      </AnimatePresence>

      {phase !== "loading" && (
        <>
          <main className="min-h-screen">
            <Header />
            <HeroSlider />
            <ConceptSection />
            <OriginSection />
            <ServicesSection />
            <GallerySection />
            <CompanySection />
            <ContactSection />
            <Footer />
          </main>

          <AnimatePresence>
            {phase === "revealing" && (
              <CloudReveal onComplete={() => setPhase("ready")} />
            )}
          </AnimatePresence>
        </>
      )}
    </>
  )
}
