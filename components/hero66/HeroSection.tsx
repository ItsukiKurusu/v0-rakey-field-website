"use client"

// トップの3Dヒーロー。文字（h1・幕ごとの言葉・ボタン）は HTML で先に出し、3D は準備ができたら重ねる。
// 3D の本体は dynamic import（ssr: false）で、トップ以外のページの JS を増やさない。
import dynamic from "next/dynamic"
import { useCallback, useEffect, useState } from "react"
import { Phone } from "lucide-react"
import { useMotionState } from "@/components/motion-state"
import { HERO_LINES } from "@/lib/heroLines"

// 準備が長引いても、ここまで待ったらスクロールを返す（通信が極端に遅い・どこかで止まった場合の保険）
const LOCK_TIMEOUT_MS = 12000

const HeroCanvas = dynamic(() => import("./HeroCanvas"), { ssr: false })

export function HeroSection() {
  const [ready, setReady] = useState(false)
  const [loaded, setLoaded] = useState(0)
  const { motionStopped, setScrollLocked } = useMotionState()

  // 3D の準備中はスクロールを止める。止めないと、待っている間のスクロールで
  // 準備ができた瞬間に物語の途中から始まってしまう。
  // ページの途中で開き直した人（位置の復元）は止めない
  useEffect(() => {
    if (ready || motionStopped || window.scrollY > 40) return
    window.scrollTo(0, 0)
    setScrollLocked(true)
    const t = window.setTimeout(() => setScrollLocked(false), LOCK_TIMEOUT_MS)
    return () => {
      window.clearTimeout(t)
      setScrollLocked(false)
    }
  }, [ready, motionStopped, setScrollLocked])

  const onReady = useCallback(() => {
    setLoaded(1)
    setReady(true)
  }, [])

  return (
    <section
      data-hero
      aria-label="RAKEY FIELD"
      className={`relative h-svh min-h-[560px] w-full overflow-hidden bg-[#1b1916] text-white ${ready ? "hero-ready" : ""}`}
    >
      <div className="hero-poster" aria-hidden="true" />
      <HeroCanvas onReady={onReady} onProgress={setLoaded} />
      <div className="hero-vignette" aria-hidden="true" />

      {/* 冒頭の見出し（スクロールで消えるが、DOM には残す） */}
      <div className="relative z-10 flex h-full flex-col justify-end px-5 pb-28 md:justify-center md:px-16 md:pb-0">
        <div className="hero-title max-w-2xl">
          <p className="font-display text-sm tracking-[0.32em] text-white/80 md:text-base">
            SAKAI CITY, OSAKA — GET YOUR KICKS
          </p>
          <h1 className="mt-2 font-display text-[23vw] leading-[0.82] tracking-wide drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)] md:text-[10rem]">
            RAKEY
            <br />
            FIELD
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-white/90 md:text-base">
            堺市中区の地域密着カーショップ。
            <br />
            中古車・レンタカー・車検・保険・アメリカン雑貨まで。
          </p>
        </div>
      </div>

      {/* 幕ごとの言葉。スマホは下、PC は左の3分の1に縦中央 */}
      <div className="pointer-events-none absolute inset-x-0 bottom-36 z-10 px-5 md:inset-y-0 md:left-16 md:right-auto md:flex md:w-[38vw] md:items-center md:px-0">
        <div className="hero-lines">
          {HERO_LINES.lines.map((line) => (
            <p
              key={line.text}
              data-hero-line
              className="hero-line text-[1.7rem] font-bold leading-snug tracking-wide drop-shadow-[0_2px_14px_rgba(0,0,0,0.8)] md:text-[2.6rem]"
            >
              {line.text.split("|").map((chunk) => (
                <span key={chunk} className="inline-block">
                  {chunk}
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>

      {/* 最後の幕で出る問い合わせ */}
      <div className="hero-cta absolute inset-x-0 bottom-10 z-10 flex flex-wrap gap-3 px-5 md:bottom-16 md:left-16 md:right-auto md:px-0">
        <a
          href="tel:0723394549"
          className="inline-flex items-center gap-2 rounded-full bg-[#b5402a] px-6 py-3 font-bold shadow-lg shadow-black/30 transition-colors hover:bg-[#c94c33] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          072-339-4549
        </a>
        <a
          href="#contact"
          className="inline-flex items-center rounded-full border border-white/70 bg-black/25 px-6 py-3 font-bold backdrop-blur-sm transition-colors hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          フォームで相談する
        </a>
      </div>

      {/* スクロールの合図（見出しと一緒に消える）。準備中は「エンジンを温めている」ゲージ */}
      <div className="hero-title pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center" aria-hidden="true">
        {ready || motionStopped ? (
          <>
            <span className="font-display text-xs tracking-[0.4em] text-white/70">SCROLL</span>
            <span className="mx-auto mt-2 block h-10 w-px animate-pulse bg-white/60" />
          </>
        ) : (
          <span className="block">
            <span className="font-display text-xs tracking-[0.4em] text-white/70">WARMING UP</span>
            <span className="mx-auto mt-3 block h-1 w-28 overflow-hidden rounded-full bg-white/20">
              <span
                className="block h-full origin-left rounded-full bg-[#d9a441] transition-transform duration-500 ease-out"
                style={{ transform: `scaleX(${Math.max(0.06, loaded)})` }}
              />
            </span>
          </span>
        )}
      </div>
    </section>
  )
}
