"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

const heroImages = [
  "/images/e1100f09-74ca-4a8c-a6bd.jpeg",
  "/images/S__7413768_0.jpg",
  "/images/30ebf32b-768b-4a9c-ba64.jpeg",
  "/images/S__7413769_0.jpg",
  "/images/c8e91041-abe4-41d1-9b89.jpeg",
]

export function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background with Ken Burns effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        >
          <motion.img
            src={heroImages[currentIndex]}
            alt="RAKEY FIELD"
            className="w-full h-full object-cover"
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 7, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/25 to-foreground/55" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          className="text-center px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.p
            className="text-background/75 text-xs md:text-sm tracking-[0.35em] uppercase mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.8 }}
          >
            Sakai City, Osaka
          </motion.p>
          <h1
            className="text-7xl md:text-[10rem] font-bold tracking-wider text-background leading-none"
            style={{ fontFamily: "var(--font-bebas-neue), Impact, sans-serif" }}
          >
            RAKEY
            <br />
            FIELD
          </h1>
          <motion.p
            className="text-base md:text-lg text-background/80 max-w-lg mx-auto leading-relaxed mt-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            地域の人々のカーライフを、一生涯サポートします。
          </motion.p>
        </motion.div>
      </div>

      {/* Slide Indicators */}
      <motion.div
        className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.7 }}
      >
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-0.5 rounded-full transition-all duration-500 ${
              index === currentIndex ? "bg-background w-10" : "bg-background/40 w-4"
            }`}
            aria-label={`スライド ${index + 1}`}
          />
        ))}
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0 }}
      >
        <span className="text-background/45 text-[10px] tracking-[0.2em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-background/45" />
        </motion.div>
      </motion.div>
    </section>
  )
}
