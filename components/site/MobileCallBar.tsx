"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Mail, Phone } from "lucide-react"
import { SITE } from "@/lib/site"

/**
 * スマホ・タブレットの画面下に常に出す「電話する｜フォーム」。
 * トップの 3D ヒーローを見ている間だけは隠す（演出の邪魔をしない）。
 */
export function MobileCallBar() {
  const [overHero, setOverHero] = useState(false)

  useEffect(() => {
    const hero = document.querySelector("[data-hero]")
    if (!hero) return
    setOverHero(true)
    const io = new IntersectionObserver(([e]) => setOverHero(e.isIntersecting), { rootMargin: "0px 0px -35% 0px" })
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-paper/10 bg-asphalt/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md transition-transform duration-500 lg:hidden ${
        overHero ? "translate-y-full" : "translate-y-0"
      }`}
      inert={overHero}
    >
      <div className="grid grid-cols-[1.4fr_1fr] gap-2 p-2">
        <a href={SITE.tel.href} className="flex items-center justify-center gap-2 rounded-full bg-rust py-3 text-paper">
          <Phone className="h-5 w-5" aria-hidden="true" />
          <span className="font-display text-xl leading-none tracking-wider">{SITE.tel.display}</span>
        </a>
        <Link href="/#contact" className="flex items-center justify-center gap-2 rounded-full border border-paper/30 py-3 text-sm font-bold text-paper">
          <Mail className="h-4 w-4" aria-hidden="true" />
          フォーム
        </Link>
      </div>
    </div>
  )
}
