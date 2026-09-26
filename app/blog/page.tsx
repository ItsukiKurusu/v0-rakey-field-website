import { Header } from "@/components/site/Header"
import { Footer } from "@/components/site/Footer"
import { Breadcrumbs } from "@/components/site/Breadcrumbs"
import { CtaBand } from "@/components/site/CtaBand"
import { BlogList } from "@/components/blog/BlogList"
import { blogPosts } from "@/lib/blog-posts"

export default function BlogIndexPage() {
  // 新しい順。一覧に要る項目だけをクライアントへ渡す（本文は渡さない）
  const posts = [...blogPosts]
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .map(({ slug, category, categoryLabel, title, excerpt, heroImage, publishedAt }) => ({
      slug,
      category,
      categoryLabel,
      title,
      excerpt,
      heroImage,
      publishedAt,
    }))

  return (
    <>
      <Header />
      <main>
        <section className="asphalt relative overflow-hidden pb-16 pt-28 md:pb-20 md:pt-36">
          <p
            className="pointer-events-none absolute -bottom-[0.18em] left-0 select-none whitespace-nowrap font-slab text-[26vw] leading-none text-paper/[0.025] md:text-[15vw]"
            aria-hidden="true"
          >
            JOURNAL
          </p>
          <div className="relative mx-auto max-w-6xl px-5 md:px-8">
            <Breadcrumbs items={[{ label: "ブログ", href: "/blog" }]} className="text-paper" />
            <p className="mile mt-10 text-mustard" data-no="66">
              FROM THE ROAD
            </p>
            <h1 className="mt-5 text-[2.5rem] font-black leading-tight md:text-6xl">ブログ</h1>
            <p className="mt-5 max-w-xl text-[0.95rem] leading-[2] text-paper/75 md:text-base">
              キャンピングカーの旅の記録と、レンタカーや車検にまつわる、知って得する話。
            </p>
          </div>
          <div className="road-line absolute inset-x-0 bottom-0 opacity-70" aria-hidden="true" />
        </section>

        <section className="bg-paper-deep py-14 md:py-20">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <BlogList posts={posts} />
          </div>
        </section>

        <section className="bg-paper-deep pb-20 md:pb-28">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <CtaBand title="車のことなら、なんでも。" text="レンタカー・車検・買取のご相談も、お電話一本でスムーズにご案内します。" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
