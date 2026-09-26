"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { ArrowRight } from "lucide-react"

export type BlogCard = {
  slug: string
  category: string
  categoryLabel: string
  title: string
  excerpt: string
  heroImage: string
  publishedAt: string
}

const fmt = (d: string) => d.replaceAll("-", ".")

/** ブログ一覧（カテゴリで絞り込み）。先頭の1件は大きく出す */
export function BlogList({ posts }: { posts: BlogCard[] }) {
  const cats = Array.from(new Map(posts.map((p) => [p.category, p.categoryLabel])).entries())
  const [cat, setCat] = useState<string>("all")
  const shown = cat === "all" ? posts : posts.filter((p) => p.category === cat)
  const [first, ...rest] = shown

  return (
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label="カテゴリで絞り込む">
        {[["all", "すべて"] as const, ...cats].map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setCat(k)}
            aria-pressed={cat === k}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition-colors ${
              cat === k ? "border-ink bg-ink text-paper" : "border-ink/20 text-ink/70 hover:border-ink/50 hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {first && (
        <Link
          href={`/blog/${first.slug}`}
          className="group mt-10 grid overflow-hidden rounded-2xl bg-paper shadow-[0_24px_50px_-30px_rgba(40,25,10,0.7)] md:grid-cols-12"
        >
          <div className="relative aspect-[16/10] overflow-hidden md:col-span-7 md:aspect-auto md:min-h-[360px]">
            <Image src={first.heroImage} alt="" fill priority sizes="(min-width: 768px) 55vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            <span className="absolute left-4 top-4 rounded-full bg-mustard px-3 py-1 font-display text-sm tracking-[0.2em] text-ink">LATEST</span>
          </div>
          <div className="flex flex-col justify-center p-7 md:col-span-5 md:p-10">
            <p className="flex items-center gap-3 text-xs font-bold">
              <span className="rounded-full bg-rust/10 px-3 py-1 text-rust">{first.categoryLabel}</span>
              <time dateTime={first.publishedAt} className="font-display text-sm tracking-[0.2em] text-ink/55">
                {fmt(first.publishedAt)}
              </time>
            </p>
            <h2 className="mt-4 text-xl font-black leading-snug text-ink md:text-2xl">{first.title}</h2>
            <p className="mt-4 line-clamp-3 text-sm leading-[1.9] text-ink/70">{first.excerpt}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-rust">
              続きを読む
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </div>
        </Link>
      )}

      {rest.length > 0 && (
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="group flex h-full flex-col overflow-hidden rounded-xl bg-paper shadow-[0_16px_40px_-24px_rgba(40,25,10,0.6)] transition-transform duration-500 hover:-translate-y-1"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={p.heroImage} alt="" fill sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-3 py-1 text-xs font-bold text-rust">{p.categoryLabel}</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <time dateTime={p.publishedAt} className="font-display text-sm tracking-[0.2em] text-ink/55">
                    {fmt(p.publishedAt)}
                  </time>
                  <h2 className="mt-2 line-clamp-2 font-bold leading-relaxed text-ink">{p.title}</h2>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-ink/65">{p.excerpt}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
