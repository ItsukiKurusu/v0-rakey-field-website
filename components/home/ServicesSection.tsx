import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Phone } from "lucide-react"
import { SERVICES, SITE } from "@/lib/site"
import { SectionHeading } from "./SectionHeading"

const COLORS = {
  rust: "bg-rust text-paper",
  teal: "bg-teal text-paper",
  // マスタードは明るいので文字を墨色に（白だと読めない）
  mustard: "bg-mustard text-ink",
  blue: "bg-garage text-paper",
  ink: "bg-ink text-paper",
} as const

/** 5つのサービス（沿道のブリキ看板） */
export function ServicesSection() {
  return (
    <section id="services" className="paper relative py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading
          no="03"
          en="ROADSIDE SERVICE"
          title="車のことなら、なんでも。"
          lead="買う・売る・借りる・直す・備える。ひとつのお店で、車のことはまるごと相談できます。"
        />

        <ul className="mt-14 grid gap-6 md:grid-cols-6 md:gap-7">
          {SERVICES.map((s, i) => (
            <li
              key={s.href}
              className={`reveal ${i < 2 ? "md:col-span-3" : "md:col-span-2"}`}
              style={{ "--reveal-delay": `${(i % 3) * 0.08}s` } as React.CSSProperties}
            >
              <Link
                href={s.href}
                className={`tin-sign group flex h-full flex-col overflow-hidden p-4 transition-transform duration-500 hover:-translate-y-1.5 hover:rotate-[-0.4deg] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${COLORS[s.color]}`}
              >
                {[["left-3", "top-3"], ["right-3", "top-3"], ["left-3", "bottom-3"], ["right-3", "bottom-3"]].map(([x, y]) => (
                  <span key={x + y} className={`rivet ${x} ${y}`} aria-hidden="true" />
                ))}
                <div className={`relative overflow-hidden rounded-md ${i < 2 ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
                  <Image
                    src={s.image}
                    alt=""
                    fill
                    sizes={i < 2 ? "(min-width: 768px) 46vw, 90vw" : "(min-width: 768px) 30vw, 90vw"}
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-2 top-2 rounded-sm bg-black/55 px-2 py-0.5 font-display text-sm tracking-[0.25em] text-paper backdrop-blur-sm">
                    NO.{s.no}
                  </span>
                </div>
                <div className="flex flex-1 flex-col px-2 pb-2 pt-5">
                  <p className="font-slab text-[1.7rem] leading-none tracking-wide md:text-[2rem]">{s.en}</p>
                  <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed opacity-85">{s.text}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">
                    詳しく見る
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* 電話の帯 */}
        <div className="reveal asphalt mt-16 flex flex-col items-start gap-5 rounded-2xl px-6 py-7 md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <p className="font-display text-sm tracking-[0.35em] text-mustard">ONE CALL, THAT&apos;S ALL</p>
            <p className="mt-1 text-xl font-black md:text-2xl">お電話一本で、すべてOK。</p>
          </div>
          <a
            href={SITE.tel.href}
            className="inline-flex items-center gap-3 rounded-full bg-rust px-7 py-4 font-display text-3xl tracking-wider text-paper shadow-lg shadow-black/30 transition-colors hover:bg-[#c64d35] md:text-4xl"
          >
            <Phone className="h-6 w-6" aria-hidden="true" />
            {SITE.tel.display}
          </a>
        </div>
      </div>
    </section>
  )
}
