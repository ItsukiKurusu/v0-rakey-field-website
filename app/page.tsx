"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { LoadingAnimation } from "@/components/sections/LoadingAnimation"
import { Header } from "@/components/sections/Header"
import { HeroSlider } from "@/components/sections/HeroSlider"
import { ConceptSection } from "@/components/sections/ConceptSection"
import { OriginSection } from "@/components/sections/OriginSection"
import { ServicesSection } from "@/components/sections/ServicesSection"
import { GallerySection } from "@/components/sections/GallerySection"
import { CompanySection } from "@/components/sections/CompanySection"
import { ContactSection } from "@/components/sections/ContactSection"
import { Footer } from "@/components/sections/Footer"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingAnimation onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {!isLoading && (
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
      )}
    </>
  )
}
