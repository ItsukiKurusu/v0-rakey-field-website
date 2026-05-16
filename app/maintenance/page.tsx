"use client"

import { motion } from "framer-motion"
import { Wrench, Phone, Shield, CheckCircle, AlertTriangle, ClipboardCheck } from "lucide-react"
import { Header } from "@/components/sections/Header"
import { Footer } from "@/components/sections/Footer"
import { FadeInUp } from "@/components/shared/FadeInUp"
import { ContactModal } from "@/components/shared/ContactModal"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"

const features = [
  { icon: ClipboardCheck, text: "定期点検・整備" },
  { icon: CheckCircle, text: "車検対応" },
  { icon: Wrench, text: "板金・塗装" },
  { icon: AlertTriangle, text: "交通事故対応" },
  { icon: Shield, text: "保険対応も相談可能" },
  { icon: Phone, text: "電話一本でご相談OK" },
]

const services = [
  {
    title: "定期点検・メンテナンス",
    description: "エンジンオイル交換からタイヤ・ブレーキ点検まで、愛車のコンディションを保つメンテナンスを承ります。",
  },
  {
    title: "車検",
    description: "法定点検を含む車検を丁寧に対応いたします。車検の時期が近づいたらお気軽にご連絡ください。",
  },
  {
    title: "板金・塗装",
    description: "ぶつけてしまった傷やへこみも、丁寧に修復いたします。小さな傷からしっかり対応します。",
  },
  {
    title: "交通事故対応",
    description: "事故後の修理・保険手続きのご相談も承ります。お困りの際はまずお電話ください。",
  },
]

export default function MaintenancePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-center justify-center bg-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/images/garage.jpg"
              alt="メンテナンス・車検・板金"
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
                <Wrench className="h-3.5 w-3.5" />
                Maintenance
              </div>
              <h1
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-background leading-tight mb-4"
                style={{ fontFamily: "var(--font-bebas-neue), Impact, sans-serif" }}
              >
                メンテナンス
              </h1>
              <p className="text-2xl md:text-3xl font-bold text-primary mb-3">
                交通事故対応もお任せください！
              </p>
              <p className="text-background/70 text-lg max-w-xl mx-auto">
                定期点検から車検、板金修理まで、<br className="md:hidden" />
                お車のメンテナンスはすべてお任せください。
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
                    今すぐ相談する
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
                お車のことならなんでもお任せください！
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
                対応メニュー
              </h2>
            </FadeInUp>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
              {services.map((s, i) => (
                <FadeInUp key={i} delay={i * 0.08}>
                  <motion.div
                    className="bg-card p-6 rounded-2xl border border-border h-full"
                    whileHover={{ y: -4, boxShadow: "0 16px 40px -12px rgba(0,0,0,0.12)" }}
                    transition={{ duration: 0.25 }}
                  >
                    <h3 className="text-lg font-bold text-foreground mb-2">{s.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{s.description}</p>
                  </motion.div>
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
                事故対応もお気軽にご相談ください。<br />
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
