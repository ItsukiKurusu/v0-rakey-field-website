import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { blogPosts } from "@/lib/blog-posts"
import { SectionHeading } from "./SectionHeading"

const fmt = (d: string) => d.replaceAll("-", ".")

/** ブログの新着3件（キャンピングカーの旅・車の豆知識） */
export function JournalSection() {
  const posts = [...blogPosts].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1)).slice(0, 3)
  return (
    <section id="journal" className="bg-paper-deep py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading no="06" en="FROM THE ROAD" title="ブログ" lead="キャンピングカーの旅の記録と、車にまつわる役立つ話。" />
          <Link href="/blog" className="reveal inline-flex items-center gap-2 self-start font-bold text-rust hover:underline md:self-auto">
            すべての記事を見る
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.map((p, i) => (
            <li key={p.slug} className="reveal" style={{ "--reveal-delay": `${i * 0.08}s` } as React.CSSProperties}>
              <Link href={`/blog/${p.slug}`} className="group block h-full overflow-hidden rounded-xl bg-paper shadow-[0_16px_40px_-24px_rgba(40,25,10,0.6)] transition-transform duration-500 hover:-translate-y-1">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image src={p.heroImage} alt="" fill sizes="(min-width: 768px) 32vw, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-3 py-1 text-xs font-bold text-rust">{p.categoryLabel}</span>
                </div>
                <div className="p-5">
                  <time dateTime={p.publishedAt} className="font-display text-sm tracking-[0.2em] text-ink/55">
                    {fmt(p.publishedAt)}
                  </time>
                  <h3 className="mt-2 line-clamp-2 font-bold leading-relaxed text-ink">{p.title}</h3>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
