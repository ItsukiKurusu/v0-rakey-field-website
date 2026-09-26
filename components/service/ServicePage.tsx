import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Phone } from "lucide-react"
import { Header } from "@/components/site/Header"
import { Footer } from "@/components/site/Footer"
import { Breadcrumbs } from "@/components/site/Breadcrumbs"
import { ContactButton } from "@/components/site/ContactButton"
import { CtaBand } from "@/components/site/CtaBand"
import { SectionHeading } from "@/components/home/SectionHeading"
import { SERVICES, SITE } from "@/lib/site"
import { serviceMeta, type ServicePageData } from "@/lib/service-pages"
import { FaqList } from "./Faq"

// サービスの色（トップの看板と同じ）。bg は看板の地、on はその上の文字
const TONE = {
  rust: { bg: "bg-rust", on: "text-paper", text: "text-rust" },
  teal: { bg: "bg-teal", on: "text-paper", text: "text-teal" },
  mustard: { bg: "bg-mustard", on: "text-ink", text: "text-[#a8761c]" },
  blue: { bg: "bg-garage", on: "text-paper", text: "text-garage" },
  ink: { bg: "bg-ink", on: "text-paper", text: "text-ink" },
} as const

const delay = (s: number) => ({ "--reveal-delay": `${s.toFixed(2)}s` }) as React.CSSProperties

function Rivets() {
  return (
    <>
      {[["left-3", "top-3"], ["right-3", "top-3"], ["left-3", "bottom-3"], ["right-3", "bottom-3"]].map(([x, y]) => (
        <span key={x + y} className={`rivet ${x} ${y}`} aria-hidden="true" />
      ))}
    </>
  )
}

/**
 * サービスページの共通テンプレート（5ページで同じ骨組み・中身は lib/service-pages.ts）。
 * ヒーロー → 概要と特長 → メニュー（＋料金）→ 写真 → ご利用の流れ → よくある質問 → お問い合わせ → ほかのサービス
 */
export function ServicePage({ data }: { data: ServicePageData }) {
  const meta = serviceMeta(data.slug)
  const tone = TONE[meta.color]
  const others = SERVICES.filter((s) => s.href !== meta.href)
  let n = 0
  const no = () => String(++n).padStart(2, "0")

  return (
    <>
      <Header />
      <main>
        {/* ───── ヒーロー ───── */}
        <section className="asphalt relative overflow-hidden pb-20 pt-28 md:pb-28 md:pt-36">
          <p
            className="pointer-events-none absolute -bottom-[0.18em] left-0 select-none whitespace-nowrap font-slab text-[26vw] leading-none text-paper/[0.025] md:text-[15vw]"
            aria-hidden="true"
          >
            {meta.en}
          </p>
          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 md:grid-cols-12 md:gap-10 md:px-8">
            <div className="md:col-span-7">
              <Breadcrumbs items={[{ label: meta.title, href: meta.href }]} className="text-paper" />
              <p className="mile mt-10 text-mustard" data-no={meta.no}>
                {meta.en}
              </p>
              <h1 className="mt-5 text-[2.5rem] font-black leading-[1.2] tracking-tight md:text-6xl">{data.title}</h1>
              <p className="mt-5 text-lg font-bold leading-relaxed text-mustard md:text-2xl">{data.catch}</p>
              <p className="mt-5 max-w-xl text-[0.95rem] leading-[2] text-paper/75 md:text-base">{data.lead}</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href={SITE.tel.href}
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-rust px-7 py-3.5 font-display text-2xl tracking-wider text-paper shadow-lg shadow-black/40 transition-colors hover:bg-[#c64d35]"
                >
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  {SITE.tel.display}
                </a>
                <ContactButton
                  type={data.slug}
                  className="rounded-full border border-paper/35 px-7 py-4 text-sm text-paper hover:bg-paper/10"
                />
              </div>
            </div>

            {/* 看板に入れた写真 */}
            <div className="relative md:col-span-5">
              <figure className={`tin-sign relative rotate-2 p-3 ${tone.bg}`}>
                <Rivets />
                <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                  <Image src={data.heroImage} alt={data.heroAlt} fill priority sizes="(min-width: 768px) 40vw, 90vw" className="object-cover" />
                </div>
                <figcaption className={`px-2 pb-1 pt-3 font-slab text-2xl tracking-wide ${tone.on}`}>
                  NO.{meta.no} {meta.en}
                </figcaption>
              </figure>
              {data.tag && (
                <div className="absolute -bottom-8 -left-3 grid h-32 w-32 -rotate-12 place-items-center rounded-full bg-mustard text-center text-ink shadow-[0_14px_30px_-10px_rgba(0,0,0,0.7)] ring-4 ring-asphalt md:-left-10 md:h-36 md:w-36">
                  <p className="leading-tight">
                    <span className="block text-xs font-bold">{data.tag.top}</span>
                    <span className="block font-display text-[2.6rem] leading-[0.9] tracking-wide md:text-5xl">{data.tag.big}</span>
                    <span className="block text-[0.65rem] font-bold">{data.tag.bottom}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="road-line absolute inset-x-0 bottom-0 opacity-70" aria-hidden="true" />
        </section>

        {/* ───── 概要と特長（道路標識のひし形） ───── */}
        <section className="paper py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-12 md:gap-10 md:px-8">
            <div className="md:col-span-5">
              <SectionHeading no={no()} en="WHY US" title={data.intro.title} lead={data.intro.text} />
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:col-span-7 md:gap-4">
              {data.highlights.map((h, i) => (
                <li
                  key={h.text}
                  className="reveal flex flex-col items-center gap-4 rounded-xl border border-ink/10 bg-white/35 px-3 pb-5 pt-6 text-center"
                  style={delay((i % 3) * 0.06)}
                >
                  <span className="grid h-12 w-12 rotate-45 place-items-center rounded-md border-[3px] border-ink bg-mustard shadow-[0_4px_0_rgba(42,36,30,0.25)]">
                    <h.icon className="h-5 w-5 -rotate-45 text-ink" aria-hidden="true" />
                  </span>
                  <span className="text-sm font-bold leading-snug text-ink">{h.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ───── メニュー（＋料金） ───── */}
        <section className="bg-paper-deep py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <SectionHeading no={no()} en="MENU" title={data.menuTitle} />
            <div className={`mt-12 grid gap-8 ${data.price ? "md:grid-cols-12" : ""}`}>
              <ol className={`grid gap-4 ${data.price ? "md:col-span-7" : data.menu.length === 3 ? "md:grid-cols-3 md:gap-5" : "md:grid-cols-2 md:gap-5"}`}>
                {data.menu.map((m, i) => (
                  <li
                    key={m.title}
                    className="reveal flex gap-5 rounded-xl bg-paper p-6 shadow-[0_14px_30px_-22px_rgba(40,25,10,0.7)] md:p-7"
                    style={delay((i % 2) * 0.08)}
                  >
                    <span className={`font-slab text-4xl leading-none ${tone.text}`}>{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="text-lg font-black text-ink">{m.title}</h3>
                      <p className="mt-2 text-sm leading-[1.9] text-ink/75">{m.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              {data.price && (
                <div className="md:col-span-5">
                  <div className={`reveal tin-sign sticky top-28 p-8 md:p-10 ${tone.bg} ${tone.on}`} style={delay(0.1)}>
                    <Rivets />
                    <p className="font-display text-sm tracking-[0.35em] opacity-80">PRICE</p>
                    <p className="mt-1 text-lg font-bold">{data.price.title}</p>
                    <p className="mt-6 flex items-end gap-2">
                      <span className="font-display text-7xl leading-none tracking-wide md:text-8xl">{data.price.amount}</span>
                    </p>
                    <p className="mt-2 text-sm font-bold">{data.price.unit}</p>
                    <ul className="mt-6 space-y-2 border-t border-current/25 pt-5 text-xs leading-relaxed opacity-85">
                      {data.price.notes.map((t) => (
                        <li key={t}>※ {t}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ───── 写真 ───── */}
        {data.gallery && (
          <section className="paper overflow-hidden py-20 md:py-28">
            <div className="mx-auto max-w-6xl px-5 md:px-8">
              <SectionHeading no={no()} en="SNAPSHOTS" title={data.gallery.title} />
              <ul className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-6">
                {data.gallery.photos.map((p, i) => (
                  <li key={p.src} className="reveal" style={delay(i * 0.08)}>
                    <figure className="polaroid relative mx-auto max-w-sm" style={{ rotate: `${[-2.5, 1.5, -1][i % 3]}deg` }}>
                      <span className="tape -top-3 left-1/2 -translate-x-1/2 rotate-[-3deg]" aria-hidden="true" />
                      <div className="relative aspect-square overflow-hidden">
                        <Image src={p.src} alt={p.alt} fill sizes="(min-width: 640px) 30vw, 90vw" className="object-cover" />
                      </div>
                      <figcaption className="absolute inset-x-0 bottom-2 text-center font-display text-sm tracking-[0.3em] text-ink/70">
                        {p.caption}
                      </figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* ───── ご利用の流れ（道を進む） ───── */}
        <section className="asphalt relative py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <SectionHeading no={no()} en="HOW IT WORKS" title="ご利用の流れ" tone="light" />
            <ol className="relative mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
              <div className="road-line absolute left-0 right-0 top-[1.35rem] hidden opacity-50 md:block" aria-hidden="true" />
              <div className="road-line-v absolute bottom-0 left-[1.3rem] top-0 opacity-40 md:hidden" aria-hidden="true" />
              {data.flow.map((f, i) => (
                <li key={f.title} className="reveal relative flex gap-5 md:block" style={delay(i * 0.1)}>
                  <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-[0.35rem_0.35rem_1.2rem_1.2rem] border-2 border-mustard bg-asphalt font-display text-xl text-mustard">
                    {i + 1}
                  </span>
                  <div className="md:mt-6">
                    <h3 className="text-lg font-black">{f.title}</h3>
                    <p className="mt-2 text-sm leading-[1.9] text-paper/70">{f.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ───── よくある質問 ───── */}
        <section className="paper py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-12 md:px-8">
            <div className="md:col-span-4">
              <SectionHeading no={no()} en="FAQ" title="よくある質問" />
            </div>
            <div className="md:col-span-8">
              <FaqList faqs={data.faqs} />
            </div>
          </div>
        </section>

        {/* ───── お問い合わせ ───── */}
        <section className="bg-paper-deep py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <CtaBand title={data.cta.title} text={data.cta.text} type={data.slug} />

            {/* ほかのサービス */}
            <div className="mt-20">
              <p className="mile text-rust" data-no="→">
                OTHER SERVICES
              </p>
              <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
                {others.map((s) => (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      className={`tin-sign group flex h-full flex-col justify-between gap-6 p-5 transition-transform duration-300 hover:-translate-y-1 ${TONE[s.color].bg} ${TONE[s.color].on}`}
                    >
                      <span className="font-display text-sm tracking-[0.25em] opacity-80">NO.{s.no}</span>
                      <span>
                        <span className="block font-slab text-xl leading-none md:text-2xl">{s.en}</span>
                        <span className="mt-2 flex items-center justify-between gap-2 text-sm font-bold">
                          {s.title}
                          <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
