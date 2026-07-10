"use client"

import { motion } from "framer-motion"
import { Phone, Calendar, ArrowRight, BookOpen } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/sections/Header"
import { Footer } from "@/components/sections/Footer"
import { FadeInUp } from "@/components/shared/FadeInUp"
import { blogPosts } from "@/lib/blog-posts"

export default function BlogIndexPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[45vh] flex items-center justify-center bg-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image src="/images/garage.jpg" alt="RAKEY FIELD ブログ" fill className="object-cover" priority />
          </div>
          <div className="relative z-10 text-center px-6 pt-24 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/80 text-primary-foreground text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
                <BookOpen className="h-3.5 w-3.5" />
                Blog
              </div>
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-background leading-tight mb-4"
                style={{ fontFamily: "var(--font-bebas-neue), Impact, sans-serif" }}
              >
                RAKEY FIELD BLOG
              </h1>
              <p className="text-background/70 text-lg max-w-xl mx-auto">
                レンタカーや車検にまつわる、知って得する情報をお届けします。
              </p>
            </motion.div>
          </div>
        </section>

        {/* Post list */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {blogPosts.map((post, i) => (
                <FadeInUp key={post.slug} delay={i * 0.08}>
                  <Link href={`/blog/${post.slug}`} className="group block h-full">
                    <motion.article
                      className="h-full flex flex-col rounded-2xl overflow-hidden border border-border bg-card"
                      whileHover={{ y: -4, boxShadow: "0 16px 40px -12px rgba(0,0,0,0.12)" }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="relative h-48 bg-muted">
                        <Image src={post.heroImage} alt={post.title} fill className="object-cover" />
                        <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                          {post.categoryLabel}
                        </span>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <time dateTime={post.publishedAt}>{post.publishedAt}</time>
                        </div>
                        <h2 className="text-lg font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h2>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                          {post.excerpt}
                        </p>
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-primary mt-4">
                          続きを読む
                          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </motion.article>
                  </Link>
                </FadeInUp>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-6 text-center">
            <FadeInUp>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                まずはお電話ください
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                レンタカー・車検のご相談も、お電話一本でスムーズにご案内いたします。
              </p>
              <a href="tel:0723394549">
                <span className="inline-flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-4 text-lg font-bold transition-colors">
                  <Phone className="h-5 w-5" />
                  072-339-4549
                </span>
              </a>
              <p className="text-sm text-muted-foreground mt-6">
                〒599-8242 大阪府堺市中区陶器北845-7
              </p>
            </FadeInUp>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
