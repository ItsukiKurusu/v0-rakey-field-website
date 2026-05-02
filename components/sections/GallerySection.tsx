"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { FadeInUp } from "@/components/shared/FadeInUp"

const galleryItems = [
  { image: "/images/comics.jpg" },
  { image: "/images/garage-soto-hiki.jpg" },
  { image: "/images/garage-soto.jpg" },
  { image: "/images/garage.jpg" },
  { image: "/images/garage2-tate.jpg" },
  { image: "/images/Hot Wheels.jpg" },
  { image: "/images/impala.jpg" },
  { image: "/images/impala-mae.JPG" },
]

export function GallerySection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryItems.length)
  }

  const getVisibleItems = () => [
    galleryItems[currentIndex],
    galleryItems[(currentIndex + 1) % galleryItems.length],
    galleryItems[(currentIndex + 2) % galleryItems.length],
  ]

  return (
    <section className="py-24 md:py-40 bg-background">
      <div className="container mx-auto px-6">
        <FadeInUp>
          <div className="flex items-center gap-4 mb-3 justify-center">
            <div className="h-px w-8 bg-primary" />
            <span className="text-primary text-xs tracking-[0.25em] uppercase font-medium">Gallery</span>
            <div className="h-px w-8 bg-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-14">
            ギャラリー
          </h2>
        </FadeInUp>

        <div className="max-w-6xl mx-auto">
          <FadeInUp delay={0.1}>
            {/* Navigation + Images — buttons are inside the flow, no absolute positioning */}
            <div className="flex items-center gap-3 md:gap-5">
              <button
                onClick={handlePrev}
                className="flex-shrink-0 p-2.5 md:p-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                aria-label="前の画像"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
                <AnimatePresence mode="wait">
                  {getVisibleItems().map((item, index) => (
                    <motion.div
                      key={`${currentIndex}-${index}`}
                      className="relative rounded-2xl overflow-hidden shadow-md bg-card aspect-[4/3]"
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.4, delay: index * 0.06 }}
                    >
                      <img
                        src={item.image}
                        alt="ギャラリー画像"
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <button
                onClick={handleNext}
                className="flex-shrink-0 p-2.5 md:p-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
                aria-label="次の画像"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {galleryItems.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary w-6"
                      : "bg-border w-2 hover:bg-primary/50"
                  }`}
                  aria-label={`画像 ${index + 1} に移動`}
                />
              ))}
            </div>
          </FadeInUp>
        </div>
      </div>
    </section>
  )
}
