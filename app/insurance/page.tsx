"use client"

import { motion } from "framer-motion"
import { Shield, Phone, Car, Heart, FileText, CheckCircle } from "lucide-react"
import { Header } from "@/components/sections/Header"
import { Footer } from "@/components/sections/Footer"
import { FadeInUp } from "@/components/shared/FadeInUp"
import { ContactModal } from "@/components/shared/ContactModal"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"

const features = [
  { icon: Car, text: "自動車保険" },
  { icon: Heart, text: "生命保険" },
  { icon: Shield, text: "損害保険" },
  { icon: FileText, text: "保険の見直し相談" },
  { icon: CheckCircle, text: "わかりやすくご説明" },
  { icon: Phone, text: "お気軽にご相談ください" },
]

const insuranceTypes = [
  {
    icon: Car,
    title: "自動車保険",
    description: "車を購入・所有される方に合った自動車保険をご提案。任意保険の新規加入や見直しも承ります。",
  },
  {
    icon: Heart,
    title: "生命保険",
    description: "ご家族の将来に備える生命保険のご相談を承ります。ライフステージに合ったプランをご提案します。",
  },
  {
    icon: Shield,
    title: "損害保険",
    description: "火災保険・傷害保険など各種損害保険のご相談も対応しております。",
  },
]

export default function InsurancePage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-center justify-center bg-foreground overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <Image
              src="/images/garage-2.jpg"
              alt="保険サービス"
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
                <Shield className="h-3.5 w-3.5" />
                Insurance
              </div>
              <h1
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-background leading-tight mb-4"
                style={{ fontFamily: "var(--font-bebas-neue), Impact, sans-serif" }}
              >
                生命保険・損害保険<br />自動車保険
              </h1>
              <p className="text-2xl md:text-3xl font-bold text-primary mb-3">
                保険のご相談も承ります！
              </p>
              <p className="text-background/70 text-lg max-w-xl mx-auto">
                お車と一緒に、保険のこともまとめてご相談ください。
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
                    保険を相談する
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
                お車のことも保険のことも、まとめてご相談いただけます！
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

        {/* Insurance Types */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-6">
            <FadeInUp>
              <div className="flex items-center gap-4 mb-3 justify-center">
                <div className="h-px w-8 bg-primary" />
                <span className="text-primary text-xs tracking-[0.25em] uppercase font-medium">Services</span>
                <div className="h-px w-8 bg-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
                取り扱い保険
              </h2>
            </FadeInUp>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {insuranceTypes.map((ins, i) => (
                <FadeInUp key={i} delay={i * 0.08}>
                  <motion.div
                    className="bg-card p-6 rounded-2xl border border-border h-full"
                    whileHover={{ y: -4, boxShadow: "0 16px 40px -12px rgba(0,0,0,0.12)" }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <ins.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{ins.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{ins.description}</p>
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
                保険のご相談はお気軽に
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                現在の保険の見直しや新規加入など、<br />
                何でもお気軽にご相談ください。
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
