"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { FadeInUp } from "@/components/shared/FadeInUp"

export function ShopBannerSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"])

  return (
    <section ref={ref} className="relative h-[520px] md:h-[640px] overflow-hidden">
      {/* Parallax background */}
      <motion.div className="absolute inset-0" style={{ y }}>
        <img
          src="/images/S__7413768_0.jpg"
          alt="RAKEY FIELD 店内"
          className="w-full h-full object-cover scale-110"
        />
        <div className="absolute inset-0 bg-foreground/65" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        <FadeInUp>
          <p className="text-primary text-xs tracking-[0.3em] uppercase font-bold mb-4">
            Our Shop
          </p>
          <h2
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-background leading-tight mb-6"
            style={{ fontFamily: "var(--font-bebas-neue), Impact, sans-serif" }}
          >
            Come &amp; Feel
            <br />
            The Vibe
          </h2>
          <p className="text-background/75 text-lg md:text-xl max-w-xl mx-auto leading-relaxed">
            アメリカンヴィンテージの世界が広がる空間へ。<br />
            車も雑貨も、気軽に立ち寄ってください。
          </p>
        </FadeInUp>
      </div>
    </section>
  )
}
