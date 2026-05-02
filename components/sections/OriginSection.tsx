"use client"

import { FadeInUp } from "@/components/shared/FadeInUp"
import { ParallaxSection } from "@/components/shared/ParallaxSection"

const originStories = [
  "子どもたちが、家族で乗っていた車に名前をつけた＝RAKEY（家族みんなの頭文字）",
  "子どもたちが作ったステッカーを車に貼っていた=今のロゴ",
  "元々ガレージの場所は趣味で借りていた",
  "露天を出して、地域の子どもたち向けに祭りをしていた",
  "みんながこの場所を『RAKEY FIELD』と呼ぶようになった",
]

export function OriginSection() {
  return (
    <ParallaxSection imageUrl="/images/30ebf32b-768b-4a9c-ba64.jpeg">
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
            <div className="bg-background/97 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-lg">
              <div className="relative">
                {/* Timeline vertical line */}
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
                <div className="relative rounded-2xl overflow-hidden shadow-lg bg-background/97 p-6">
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
    </ParallaxSection>
  )
}
