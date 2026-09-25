// スクロールと3Dの橋渡し。ここは進行度を「書くだけ」で、物は動かさない（描画側が減衰で追いつく）。
// DOM の言葉は CSS 変数（--t / --hero-title-opacity / --hero-cta）で配り、見た目は CSS に任せる。
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { HERO_CTA_FROM, HERO_LINES, HERO_TITLE_FADE, lineState } from "@/lib/heroLines"
import { SCROLL_DISTANCE } from "./constants"

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
const span = (v: number, a: number, b: number) => clamp01((v - a) / (b - a))

export function createChoreography(trigger: HTMLElement) {
  gsap.registerPlugin(ScrollTrigger)
  const targets = { progress: 0 }
  const findLines = () => Array.from(trigger.querySelectorAll<HTMLElement>("[data-hero-line]"))
  let lines = findLines()

  const applyProgress = (p: number) => {
    targets.progress = p
    const title = 1 - span(p, HERO_TITLE_FADE.start, HERO_TITLE_FADE.end)
    trigger.style.setProperty("--hero-title-opacity", title.toFixed(3))
    // 透明になった要素がクリックを吸わないように
    trigger.style.setProperty("--hero-title-events", title < 0.05 ? "none" : "auto")
    const cta = span(p, HERO_CTA_FROM, HERO_CTA_FROM + 0.04)
    trigger.style.setProperty("--hero-cta", cta.toFixed(3))
    trigger.style.setProperty("--hero-cta-events", cta > 0.5 ? "auto" : "none")
    // ホットリロードなどで要素が差し替わったら拾い直す
    if (lines.length > 0 && !lines[0].isConnected) lines = findLines()
    lines.forEach((el, i) => {
      const line = HERO_LINES.lines[i]
      if (line) el.style.setProperty("--t", lineState(p, line.from, line.to).toFixed(4))
    })
  }
  applyProgress(0)

  const st = ScrollTrigger.create({
    trigger,
    start: "top top",
    end: SCROLL_DISTANCE,
    pin: true,
    // Lenis が慣性を持っているので数値の scrub は使わない（二重に遅れてもたつく）
    scrub: true,
    onUpdate: (self) => applyProgress(self.progress),
  })

  return {
    targets,
    applyProgress,
    kill() {
      st.kill()
    },
  }
}
