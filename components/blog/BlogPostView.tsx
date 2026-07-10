"use client"

import { motion } from "framer-motion"
import { Calendar, Phone, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/sections/Header"
import { Footer } from "@/components/sections/Footer"
import { FadeInUp } from "@/components/shared/FadeInUp"
import { ContactModal } from "@/components/shared/ContactModal"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { BlogContent } from "@/components/blog/BlogContent"
import type { BlogPost } from "@/lib/blog-posts"

export function BlogPostView({ post }: { post: BlogPost }) {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[45vh] flex items-center justify-center bg-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-25">
            <Image src={post.heroImage} alt={post.title} fill className="object-cover" priority />
          </div>
          <div className="relative z-10 text-center px-6 pt-28 pb-16 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/80 text-primary-foreground text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
                {post.categoryLabel}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-background leading-snug mb-4">
                {post.title}
              </h1>
              <div className="flex items-center justify-center gap-1.5 text-background/60 text-sm">
                <Calendar className="h-3.5 w-3.5" />
                <time dateTime={post.publishedAt}>{post.publishedAt}</time>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-6">
            <div className="max-w-2xl mx-auto">
              <FadeInUp>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  ブログ一覧に戻る
                </Link>
              </FadeInUp>
              <FadeInUp delay={0.05}>
                <BlogContent blocks={post.content} />
              </FadeInUp>
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
              <div className="flex flex-wrap justify-center gap-4">
                <a href="tel:0723394549">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 text-lg font-bold">
                    <Phone className="h-5 w-5 mr-2" />
                    072-339-4549
                  </Button>
                </a>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="rounded-full px-8 text-base border-border">
                      メールで問い合わせる
                    </Button>
                  </DialogTrigger>
                  <ContactModal />
                </Dialog>
              </div>
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
