import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Header } from "@/components/site/Header"
import { Footer } from "@/components/site/Footer"
import { Breadcrumbs } from "@/components/site/Breadcrumbs"
import { CtaBand } from "@/components/site/CtaBand"
import { BlogContent } from "@/components/blog/BlogContent"
import { blogPosts, type BlogPost } from "@/lib/blog-posts"
import type { InquiryType } from "@/lib/contact"

const fmt = (d: string) => d.replaceAll("-", ".")

// 記事のカテゴリ → 末尾のお問い合わせで選んでおく用件
const INQUIRY: Record<BlogPost["category"], InquiryType> = {
  "rental-car": "rental-car",
  maintenance: "maintenance",
  "camping-car": "other",
}

export function BlogPostView({ post }: { post: BlogPost }) {
  // 関連記事：同じカテゴリを優先し、足りなければ新しい順で埋める
  const others = [...blogPosts].filter((p) => p.slug !== post.slug).sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
  const related = [...others.filter((p) => p.category === post.category), ...others.filter((p) => p.category !== post.category)].slice(0, 3)

  return (
    <>
      <Header />
      <main>
        {/* 見出し */}
        <section className="asphalt relative pb-40 pt-28 md:pb-56 md:pt-36">
          <div className="mx-auto max-w-3xl px-5 md:px-8">
            <Breadcrumbs
              items={[
                { label: "ブログ", href: "/blog" },
                { label: post.title.length > 24 ? `${post.title.slice(0, 24)}…` : post.title, href: `/blog/${post.slug}` },
              ]}
              className="text-paper"
            />
            <p className="mt-10 flex items-center gap-3 text-xs font-bold">
              <span className="rounded-full bg-mustard px-3 py-1 text-ink">{post.categoryLabel}</span>
              <time dateTime={post.publishedAt} className="font-display text-base tracking-[0.2em] text-paper/60">
                {fmt(post.publishedAt)}
              </time>
              {post.updatedAt && post.updatedAt !== post.publishedAt && (
                <span className="text-paper/50">
                  （更新 <time dateTime={post.updatedAt}>{fmt(post.updatedAt)}</time>）
                </span>
              )}
            </p>
            <h1 className="mt-5 text-[1.75rem] font-black leading-[1.45] md:text-[2.6rem]">{post.title}</h1>
          </div>
        </section>

        {/* 本文（アイキャッチを見出しの帯に重ねる） */}
        <section className="paper pb-20 md:pb-28">
          <div className="mx-auto max-w-4xl px-5 md:px-8">
            <div className="relative -mt-32 aspect-[16/9] overflow-hidden rounded-2xl shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] md:-mt-44">
              <Image src={post.heroImage} alt={post.title} fill priority sizes="(min-width: 896px) 830px, 100vw" className="object-cover" />
            </div>
          </div>
          <article className="mx-auto mt-14 max-w-2xl px-5 md:px-0">
            <BlogContent blocks={post.content} />
            <Link href="/blog" className="mt-14 inline-flex items-center gap-2 text-sm font-bold text-ink/60 transition-colors hover:text-rust">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              ブログ一覧に戻る
            </Link>
          </article>
        </section>

        {/* 関連記事とお問い合わせ */}
        <section className="bg-paper-deep py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            {related.length > 0 && (
              <>
                <p className="mile text-rust" data-no="→">
                  MORE FROM THE ROAD
                </p>
                <ul className="mb-20 mt-6 grid gap-6 md:grid-cols-3">
                  {related.map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={`/blog/${p.slug}`}
                        className="group block h-full overflow-hidden rounded-xl bg-paper shadow-[0_16px_40px_-24px_rgba(40,25,10,0.6)] transition-transform duration-500 hover:-translate-y-1"
                      >
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <Image src={p.heroImage} alt="" fill sizes="(min-width: 768px) 32vw, 90vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                          <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-3 py-1 text-xs font-bold text-rust">{p.categoryLabel}</span>
                        </div>
                        <div className="p-5">
                          <time dateTime={p.publishedAt} className="font-display text-sm tracking-[0.2em] text-ink/55">
                            {fmt(p.publishedAt)}
                          </time>
                          <h2 className="mt-2 line-clamp-2 font-bold leading-relaxed text-ink">{p.title}</h2>
                          <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-rust">
                            読む
                            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <CtaBand
              title="車のことなら、なんでも。"
              text="レンタカー・車検・買取のご相談も、お電話一本でスムーズにご案内します。"
              type={INQUIRY[post.category]}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
