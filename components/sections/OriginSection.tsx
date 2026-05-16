"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { FadeInUp } from "@/components/shared/FadeInUp"

const originStories = [
  "子どもたちが、家族で乗っていた車に名前をつけた＝RAKEY（家族みんなの頭文字）",
  "子どもたちが作ったステッカーを車に貼っていた=今のロゴ",
  "元々ガレージの場所は趣味で借りていた",
  "露天を出して、地域の子どもたち向けに祭りをしていた",
  "みんながこの場所を『RAKEY FIELD』と呼ぶようになった",
]

export function OriginSection() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])

  return (
    <div ref={ref} className="relative overflow-hidden">
      {/* Parallax background */}
      <motion.div className="absolute inset-0 -z-10" style={{ y }}>
        <img
          src="/images/S__7413768_0.jpg"
          alt=""
          className="w-full h-[120%] object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      <section id="origin" className="py-24 md:py-40">
        <div className="container mx-auto px-6">
          <FadeInUp>
            <div className="flex items-center gap-4 mb-3 justify-center">
              <div className="h-px w-8 bg-primary" />
              <span className="text-primary text-xs tracking-[0.25em] uppercase font-medium">Story</span>
              <div className="h-px w-8 bg-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-16">
              RAKEY FIELDの由来
            </h2>
          </FadeInUp>

          <div className="max-w-2xl mx-auto">
            <div className="bg-background/90 rounded-2xl p-8 md:p-10 shadow-2xl border border-border">
              <div className="relative">
                <div className="absolute left-4 top-5 bottom-5 w-px bg-border" />
                <ul className="space-y-8">
                  {originStories.map((story, index) => (
                    <FadeInUp key={index} delay={index * 0.1}>
                      <li className="flex items-start gap-6">
                        <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center z-10">
                          <span className="text-primary-foreground text-xs font-bold">{index + 1}</span>
                        </div>
                        <p className="text-foreground text-base md:text-lg leading-relaxed pt-1">
                          {story}
                        </p>
                      </li>
                    </FadeInUp>
                  ))}
                </ul>
              </div>
            </div>

            <FadeInUp delay={0.6}>
              <div className="mt-8 max-w-sm mx-auto">
                <div className="rounded-2xl overflow-hidden shadow-lg bg-background/90 border border-border p-6">
                  <img
                    src="/images/logo-raw.jpg"
                    alt="RAKEY FIELD ロゴ"
                    className="w-full h-auto object-contain"
                  />
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    子どもたちが作ったオリジナルロゴ
                  </p>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>
    </div>
  )
}
