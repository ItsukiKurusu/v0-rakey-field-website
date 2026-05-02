"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"

interface ParallaxSectionProps {
  children: React.ReactNode
  imageUrl: string
}

export function ParallaxSection({ children, imageUrl }: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])

  return (
    <div ref={ref} className="relative overflow-hidden">
      <motion.div className="absolute inset-0 -z-10" style={{ y }}>
        <img src={imageUrl} alt="" className="w-full h-[120%] object-cover" />
        <div className="absolute inset-0 bg-foreground/70" />
      </motion.div>
      {children}
    </div>
  )
}
