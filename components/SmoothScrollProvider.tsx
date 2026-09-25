"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import Lenis from "lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import "lenis/dist/lenis.css"

import { MotionContext, type Ticker } from "@/components/motion-state"

/**
 * スクロールの慣性（Lenis）と GSAP / ScrollTrigger を 1 本の RAF に統合する。
 * 全ページ（app/layout.tsx）に掛ける。トップだけだと下層とスクロールの手触りが変わるため。
 *
 * ## 動きを止める設定
 * OS の「視差効果を減らす／アニメーションを減らす」を既定値として尊重し、有効なら最初から
 * 演出を止めて Lenis も作らない（ネイティブスクロール）。ただしこの場でボタンを押した選択は
 * localStorage に残り、OS 設定より優先する。
 *   保存された選択あり … その通りにする
 *   保存された選択なし … OS 設定に従う
 */

const STORAGE_KEY = "rakey:motion-stopped"

export { useMotionState } from "@/components/motion-state"

/** gsap.ticker をそのまま渡す（関数の同一性が保たれるので remove も効く） */
const ticker: Ticker = {
  add: (fn) => gsap.ticker.add(fn),
  remove: (fn) => gsap.ticker.remove(fn),
}

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  // この場での選択。「まだ選んでいない」を null で区別する（false と混ぜると OS 設定を無視してしまう）
  const [motionChoice, setMotionChoice] = useState<boolean | null>(null)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()

  const motionStopped = motionChoice ?? prefersReducedMotion

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setPrefersReducedMotion(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY)
      if (saved === "1") setMotionChoice(true)
      else if (saved === "0") setMotionChoice(false)
    } catch {
      // localStorage が使えない環境でも動作は続ける
    }
    return () => mq.removeEventListener("change", sync)
  }, [])

  const setMotionStopped = (stopped: boolean) => {
    setMotionChoice(stopped)
    try {
      window.localStorage.setItem(STORAGE_KEY, stopped ? "1" : "0")
    } catch {
      /* 保存できなくてもこのセッション中は効く */
    }
  }

  useEffect(() => {
    document.documentElement.classList.toggle("motion-stopped", motionStopped)
    if (motionStopped) return

    gsap.registerPlugin(ScrollTrigger)
    // iOS のアドレスバー伸縮のたびに ScrollTrigger が測り直すのを防ぐ
    ScrollTrigger.config({ ignoreMobileResize: true })

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      anchors: true, // ページ内リンク（#contact など）も Lenis で滑らかに
      autoRaf: false, // RAF は gsap.ticker に一本化する
    })
    lenisRef.current = lenis
    // Lenis が実スクロールの持ち主なので、演出の位置を外から決めるにはこの実体に頼む（開発時のみ公開）
    if (process.env.NODE_ENV === "development") {
      ;(window as unknown as Record<string, unknown>).__lenis = lenis
    }

    // この 3 行はセット。欠けると二重に進むか、タブ復帰時にスクロールが飛ぶ
    lenis.on("scroll", ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
      if (process.env.NODE_ENV === "development") {
        delete (window as unknown as Record<string, unknown>).__lenis
      }
    }
  }, [motionStopped])

  // ページ遷移：位置を先頭へ戻し、遷移先の ScrollTrigger を測り直す
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true })
    if (motionStopped) window.scrollTo(0, 0)
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [pathname, motionStopped])

  return (
    <MotionContext.Provider value={{ motionStopped, prefersReducedMotion, setMotionStopped, ticker }}>
      {children}
      {/* OS 設定で止めている人にだけ、戻す手段を出す。ラベルは状態ではなく動作を書く */}
      {prefersReducedMotion && (
        <button
          type="button"
          onClick={() => setMotionStopped(!motionStopped)}
          className="fixed bottom-4 right-4 z-[60] rounded-full border border-neutral-300 bg-white/95 px-4 py-2 text-xs font-medium text-neutral-800 shadow-lg backdrop-blur-md transition-colors hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
        >
          {motionStopped ? "アニメーションを再生する" : "アニメーションを停止する"}
        </button>
      )}
    </MotionContext.Provider>
  )
}
