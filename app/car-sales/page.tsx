"use client"

import { motion } from "framer-motion"
import { Car, Phone, DollarSign, Search, Heart, CheckCircle } from "lucide-react"
import { Header } from "@/components/sections/Header"
import { Footer } from "@/components/sections/Footer"
import { FadeInUp } from "@/components/shared/FadeInUp"
import { ContactModal } from "@/components/shared/ContactModal"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"

const features = [
  { icon: DollarSign, text: "高価買取に挑戦" },
  { icon: Search, text: "ご希望の車もお探しします" },
  { icon: Heart, text: "大切な愛車を責任を持って対応" },
  { icon: Car, text: "国産・輸入車問わず対応" },
  { icon: CheckCircle, text: "明瞭な査定・説明" },
  { icon: Phone, text: "まずはお電話ください" },
]

const services = [
  {
    title: "自動車買取",
    description: "お車を手放される際はぜひご相談ください。大切な愛車を責任を持ってお預かりいたします。まずはお気軽にお電話を。",
  },
  {
    title: "自動車販売",
    description: "新車・中古車の販売を行っております。ご希望の車種・予算をお聞かせいただければ、ご提案いたします。",
  },
  {
    title: "車のお探し",
    description: "「こんな車が欲しい」というご要望にお応えします。お気に入りの一台を一緒に探しましょう。",
  },
  {
    title: "下取り・乗り換え",
    description: "現在お乗りの車の下取りも承ります。乗り換えをご検討中の方もお気軽にご相談ください。",
  },
]

export default function CarSalesPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-center justify-center bg-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/images/impala.jpg"
              alt="自動車買取・販売"
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
                <Car className="h-3.5 w-3.5" />
                Car Sales
              </div>
              <h1
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-background leading-tight mb-4"
                style={{ fontFamily: "var(--font-bebas-neue), Impact, sans-serif" }}
              >
                自動車<br />買取 / 販売
              </h1>
              <p className="text-2xl md:text-3xl font-bold text-primary mb-3">
                お車を手放される際はご相談ください！
              </p>
              <p className="text-background/70 text-lg max-w-xl mx-auto">
                大切な愛車を責任を持ってお預かりいたします。
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
                    買取・販売を相談する
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
                新車・中古車の買取から販売まで幅広く対応いたします！
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

        {/* Services Detail */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6">
            <FadeInUp>
              <div className="flex items-center gap-4 mb-3 justify-center">
                <div className="h-px w-8 bg-primary" />
                <span className="text-primary text-xs tracking-[0.25em] uppercase font-medium">Services</span>
                <div className="h-px w-8 bg-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
                サービス内容
              </h2>
            </FadeInUp>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
              {services.map((s, i) => (
                <FadeInUp key={i} delay={i * 0.08}>
                  <motion.div
                    className="bg-card p-7 rounded-2xl border border-border h-full"
                    whileHover={{ y: -4, boxShadow: "0 16px 40px -12px rgba(0,0,0,0.12)" }}
                    transition={{ duration: 0.25 }}
                  >
                    <h3 className="text-lg font-bold text-foreground mb-3">{s.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{s.description}</p>
                  </motion.div>
                </FadeInUp>
              ))}
            </div>

            {/* 一言バナー */}
            <FadeInUp delay={0.35}>
              <div className="mt-14 max-w-3xl mx-auto rounded-2xl bg-foreground px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-primary text-xs tracking-widest uppercase font-bold mb-2">One Stop Service</p>
                  <p className="text-2xl md:text-3xl font-bold text-background leading-snug">
                    買取も販売も、<br className="md:hidden" />お電話１本でOK！
                  </p>
                  <p className="text-background/60 text-sm mt-2">
                    まずはお気軽にご相談ください。丁寧にご対応いたします。
                  </p>
                </div>
                <a href="tel:0723394549" className="shrink-0">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-7 text-base font-bold whitespace-nowrap">
                    <Phone className="h-4 w-4 mr-2" />
                    072-339-4549
                  </Button>
                </a>
              </div>
            </FadeInUp>
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
                買取査定・販売のご相談はお気軽に。<br />
                お電話一本でスムーズにご案内いたします。
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
