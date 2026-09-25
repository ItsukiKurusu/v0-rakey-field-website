import Image from "next/image"
import { SITE } from "@/lib/site"
import { SectionHeading } from "./SectionHeading"

const PHOTOS = [
  { src: "/images/S__7413768_0.jpg", alt: "看板と雑貨が並ぶガレージの中", caption: "THE GARAGE", rotate: -4, className: "left-0 top-6 w-[62%] md:w-[58%]" },
  { src: "/images/c8e91041-abe4-41d1-9b89.jpeg", alt: "人工芝の駐車場とフェンス", caption: "OUR LOT", rotate: 5, className: "right-0 top-0 w-[48%] md:w-[46%]" },
  { src: "/images/impala.jpg", alt: "インパラ SS のボディの文字", caption: "IMPALA SS", rotate: -2, className: "right-[6%] bottom-0 w-[54%] md:w-[50%]" },
]

/** 私たちの想い（ヒーローのすぐ後） */
export function ConceptSection() {
  return (
    <section id="concept" className="paper relative overflow-hidden py-24 md:py-36">
      <div className="mx-auto grid max-w-6xl gap-16 px-5 md:grid-cols-12 md:gap-10 md:px-8">
        <div className="md:col-span-6 md:pt-6">
          <SectionHeading
            no="01"
            en="OUR CONCEPT"
            title={
              <>
                子どもたちが集い、
                <br />
                大人になって、
                <br />
                車の相談に立ち寄る。
              </>
            }
          />
          <div className="reveal mt-8 space-y-5 text-[0.95rem] leading-[2.1] text-ink/80 md:text-base" style={{ "--reveal-delay": "0.12s" } as React.CSSProperties}>
            <p>私たちは、この地域（堺市中区）の人々のカーライフを、一生涯サポートします。</p>
            <p>子どもたちが集い、遊び、大人になって車を買う。そして車の相談で、ふらっと立ち寄る。そんな場所を目指しています。</p>
            <p>買取・販売からレンタカー、車検、保険まで。人生の車の相談ごとを、まるごとお引き受けします。</p>
          </div>
          <p className="reveal mt-10 font-slab text-lg text-rust" style={{ "--reveal-delay": "0.2s" } as React.CSSProperties}>
            — {SITE.name}　<span className="font-sans text-sm font-bold text-ink/70">代表 {SITE.representative}</span>
          </p>
        </div>

        {/* 写真はポラロイドで散らして貼る */}
        <div className="relative h-[420px] md:col-span-6 md:h-[560px]">
          {PHOTOS.map((p, i) => (
            <figure
              key={p.src}
              className={`reveal polaroid absolute ${p.className}`}
              style={{ rotate: `${p.rotate}deg`, "--reveal-delay": `${0.1 + i * 0.12}s` } as React.CSSProperties}
            >
              <span className="tape -top-3 left-1/2 -translate-x-1/2 -rotate-3" aria-hidden="true" />
              <div className="relative aspect-[4/3] overflow-hidden bg-paper-deep">
                <Image src={p.src} alt={p.alt} fill sizes="(min-width: 768px) 28vw, 60vw" className="object-cover" />
              </div>
              <figcaption className="absolute inset-x-0 bottom-2 text-center font-display text-sm tracking-[0.3em] text-ink/70">
                {p.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
