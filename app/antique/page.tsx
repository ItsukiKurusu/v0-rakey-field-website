"use client"

import { motion } from "framer-motion"
import { Package, Phone, ShoppingBag, Globe, Star, Truck } from "lucide-react"
import { Header } from "@/components/sections/Header"
import { Footer } from "@/components/sections/Footer"
import { FadeInUp } from "@/components/shared/FadeInUp"
import { ContactModal } from "@/components/shared/ContactModal"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"

const features = [
  { icon: Globe, text: "アメリカから直輸入" },
  { icon: ShoppingBag, text: "注文販売承ります" },
  { icon: Star, text: "アメリカンヴィンテージ中心" },
  { icon: Truck, text: "希少品もお取り寄せ可能" },
  { icon: Package, text: "コミック・ホットウィールなど" },
  { icon: Phone, text: "お気軽にご相談ください" },
]

export default function AntiquePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-center justify-center bg-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/images/comics.jpg"
              alt="アンティーク雑貨"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="relative z-10 text-center px-6 pt-24 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="inline-flex items-center gap-2 bg-primary/80 text-primary-foreground text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
                <Package className="h-3.5 w-3.5" />
                Antique Goods
              </div>
              <h1
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-background leading-tight mb-4"
                style={{ fontFamily: "var(--font-bebas-neue), Impact, sans-serif" }}
              >
                アンティーク雑貨
              </h1>
              <p className="text-2xl md:text-3xl font-bold text-primary mb-3">
                注文販売承ります！
              </p>
              <p className="text-background/70 text-lg max-w-xl mx-auto">
                アメリカから直輸入！<br className="md:hidden" />
                アメリカンヴィンテージを中心とした雑貨を取り揃えています。
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-10 flex flex-wrap justify-center gap-4"
            >
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 text-base">
                    注文・お問い合わせ
                  </Button>
                </DialogTrigger>
                <ContactModal />
              </Dialog>
              <a href="tel:0723394549">
                <Button size="lg" className="rounded-full px-8 text-base bg-white/15 text-white border border-white/50 hover:bg-white/25">
                  <Phone className="h-4 w-4 mr-2" />
                  072-339-4549
                </Button>
              </a>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-6">
            <FadeInUp>
              <p className="text-center text-xl font-bold text-foreground mb-10">
                アメリカから直輸入しています！
              </p>
            </FadeInUp>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {features.map((f, i) => (
                <FadeInUp key={i} delay={i * 0.07}>
                  <div className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <f.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-foreground leading-snug">{f.text}</span>
                  </div>
                </FadeInUp>
              ))}
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6">
            <FadeInUp>
              <div className="flex items-center gap-4 mb-3 justify-center">
                <div className="h-px w-8 bg-primary" />
                <span className="text-primary text-xs tracking-[0.25em] uppercase font-medium">Gallery</span>
                <div className="h-px w-8 bg-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
                取り扱い商品
              </h2>
            </FadeInUp>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {[
                { src: "/images/comics.jpg", label: "アメリカンコミック" },
                { src: "/images/Hot Wheels.jpg", label: "ホットウィール" },
              ].map((item, i) => (
                <FadeInUp key={i} delay={i * 0.1}>
                  <motion.div
                    className="rounded-2xl overflow-hidden border border-border bg-card"
                    whileHover={{ y: -4, boxShadow: "0 16px 40px -12px rgba(0,0,0,0.12)" }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="relative h-64 bg-muted">
                      <Image src={item.src} alt={item.label} fill className="object-cover" />
                    </div>
                    <div className="p-5">
                      <p className="font-bold text-foreground text-lg">{item.label}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">詳細はお問い合わせください</p>
                    </div>
                  </motion.div>
                </FadeInUp>
              ))}
            </div>
            <FadeInUp delay={0.3}>
              <p className="text-center text-sm text-muted-foreground mt-8">
                ※ 在庫は時期により異なります。お探しの商品はお気軽にご相談ください。
              </p>
            </FadeInUp>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-secondary">
          <div className="container mx-auto px-6 text-center">
            <FadeInUp>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                お探しの商品があればお気軽に！
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                注文販売も承っております。<br />
                まずはお電話またはメールでご相談ください。
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
