"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { ChevronDown, Menu, Phone, X } from "lucide-react"
import { SERVICES, SITE } from "@/lib/site"

const NAV = [
  { label: "ストーリー", href: "/#origin" },
  { label: "ギャラリー", href: "/#gallery" },
  { label: "ブログ", href: "/blog" },
  { label: "アクセス", href: "/#visit" },
]

/**
 * ヘッダー。トップの3Dヒーローの上にいる間は透明（白い文字）、抜けたら紙色の帯になる。
 * ヒーローの無いページでは最初から帯。
 */
export function Header() {
  const [overHero, setOverHero] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const hero = document.querySelector("[data-hero]")
    if (!hero) return
    setOverHero(true)
    const io = new IntersectionObserver(([e]) => setOverHero(e.isIntersecting && e.intersectionRatio > 0.02), {
      threshold: [0, 0.02, 0.1],
      rootMargin: "-64px 0px 0px 0px",
    })
    io.observe(hero)
    return () => io.disconnect()
  }, [])

  // メニューを開いている間は背景をスクロールさせない
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : ""
    return () => {
      document.documentElement.style.overflow = ""
    }
  }, [open])

  const clear = overHero && !open
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        clear ? "bg-transparent text-paper" : "border-b border-ink/10 bg-paper/92 text-ink backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:h-[72px] md:px-8">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="grid h-8 w-8 place-items-center rounded-[0.3rem_0.3rem_0.9rem_0.9rem] border-2 border-current font-display text-sm" aria-hidden="true">
            66
          </span>
          <span className="font-display text-[1.7rem] leading-none tracking-wide">RAKEY FIELD</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-bold lg:flex" aria-label="メイン">
          <div className="group relative">
            <button type="button" className="inline-flex items-center gap-1 py-6" aria-haspopup="true">
              サービス
              <ChevronDown className="h-4 w-4 transition-transform group-focus-within:rotate-180 group-hover:rotate-180" aria-hidden="true" />
            </button>
            <div className="invisible absolute left-1/2 top-full w-72 -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              <ul className="paper overflow-hidden rounded-xl p-2 text-ink shadow-xl">
                {SERVICES.map((s) => (
                  <li key={s.href}>
                    <Link href={s.href} className="flex items-baseline gap-3 rounded-lg px-3 py-2.5 hover:bg-paper-deep">
                      <span className="font-display text-sm tracking-[0.2em] text-rust">{s.no}</span>
                      <span>{s.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="underline-offset-8 hover:underline">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a href={SITE.tel.href} className="hidden items-center gap-2 font-display text-xl tracking-wider md:flex">
            <Phone className="h-4 w-4" aria-hidden="true" />
            {SITE.tel.display}
          </a>
          <Link href="/#contact" className="ml-3 hidden rounded-full bg-rust px-5 py-2.5 text-sm font-bold text-paper transition-colors hover:bg-[#c64d35] lg:inline-block">
            お問い合わせ
          </Link>
          <a href={SITE.tel.href} className="grid h-10 w-10 place-items-center rounded-full bg-rust text-paper md:hidden" aria-label={`電話する ${SITE.tel.display}`}>
            <Phone className="h-4 w-4" aria-hidden="true" />
          </a>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "メニューを閉じる" : "メニューを開く"}
          >
            {open ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* スマホ・タブレットのメニュー */}
      {open && (
        <div className="asphalt fixed inset-x-0 bottom-0 top-16 overflow-y-auto px-6 pb-10 pt-6 lg:hidden">
          <p className="font-display text-sm tracking-[0.35em] text-mustard">SERVICE</p>
          <ul className="mt-3 space-y-1">
            {SERVICES.map((s) => (
              <li key={s.href}>
                <Link href={s.href} onClick={() => setOpen(false)} className="flex items-baseline gap-3 py-2.5 text-lg font-bold">
                  <span className="font-display text-sm tracking-[0.2em] text-mustard">{s.no}</span>
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
          <div className="road-line my-6 opacity-60" aria-hidden="true" />
          <ul className="space-y-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} onClick={() => setOpen(false)} className="block py-2.5 text-lg font-bold">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/#contact" onClick={() => setOpen(false)} className="block py-2.5 text-lg font-bold">
                お問い合わせ・会社概要
              </Link>
            </li>
          </ul>
          <a href={SITE.tel.href} className="mt-8 flex items-center justify-center gap-3 rounded-full bg-rust py-4 font-display text-3xl tracking-wider">
            <Phone className="h-6 w-6" aria-hidden="true" />
            {SITE.tel.display}
          </a>
          <p className="mt-3 text-center text-xs text-paper/60">
            {SITE.hours}（{SITE.closed}）
          </p>
        </div>
      )}
    </header>
  )
}
