"use client"

import { FadeInUp } from "@/components/shared/FadeInUp"

export function ConceptSection() {
  return (
    <section id="concept" className="py-24 md:py-40 bg-background">
      <div className="container mx-auto px-6">
        <FadeInUp>
          <div className="flex items-center gap-4 mb-3 justify-center">
            <div className="h-px w-8 bg-primary" />
            <span className="text-primary text-xs tracking-[0.25em] uppercase font-medium">Concept</span>
            <div className="h-px w-8 bg-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-16 text-center">私たちの想い</h2>
        </FadeInUp>

        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <FadeInUp delay={0.15}>
            <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3]">
              <img
                src="/images/concept-photo.jpeg"
                alt="RAKEY FIELD 駐車場"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>
          </FadeInUp>

          <FadeInUp delay={0.25}>
            <div className="space-y-7">
              <p className="text-lg text-muted-foreground leading-[1.9]">
                私たちは、この地域（「堺市中区」「陶器」、「福田」）の人々のカーライフを一生涯サポートします。
              </p>
              <p className="text-lg text-muted-foreground leading-[1.9]">
                子どもたちが集い、遊び、大人になって車を買う、そして車の相談で立ち寄る。そんな場所を目指しています。
              </p>
              <p className="text-lg text-muted-foreground leading-[1.9]">
                陶器の人々の人生における車の相談事をトータル的にサポートします。
              </p>
            </div>
          </FadeInUp>
        </div>

        {/* 店内写真 */}
        <FadeInUp delay={0.35}>
          <div className="max-w-5xl mx-auto mt-14 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3] group">
              <img
                src="/images/S__7413768_0.jpg"
                alt="RAKEY FIELD 店内"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
              <p className="absolute bottom-4 left-5 text-background font-bold text-sm tracking-wide">店内の様子</p>
            </div>
            <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3] group">
              <img
                src="/images/S__7413769_0.jpg"
                alt="RAKEY FIELD 店内アンティーク雑貨"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 to-transparent" />
              <p className="absolute bottom-4 left-5 text-background font-bold text-sm tracking-wide">アメリカン雑貨も充実</p>
            </div>
          </div>
        </FadeInUp>
      </div>
    </section>
  )
}
