"use client"

import { useEffect } from "react"

/**
 * .reveal の要素が画面に入ったら data-shown を付ける（見た目は CSS）。ページに1つだけ置く。
 * 1つの IntersectionObserver で全部を見るので、要素がいくつあっても軽い。
 */
export function RevealObserver() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal:not([data-shown])"))
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.setAttribute("data-shown", ""))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.setAttribute("data-shown", "")
          io.unobserve(e.target)
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
