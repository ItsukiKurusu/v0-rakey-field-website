"use client"

import { motion } from "framer-motion"
import { Car, Key, Wrench, Shield, Package } from "lucide-react"
import { FadeInUp } from "@/components/shared/FadeInUp"

const services = [
  {
    icon: Car,
    title: "自動車 買取/販売",
    description: "新車・中古車の買取から販売まで幅広く対応いたします。",
  },
  {
    icon: Key,
    title: "レンタカー",
    description: "必要な時に、必要な車を。短期から長期まで柔軟に対応いたします。",
  },
  {
    icon: Package,
    title: "アンティーク雑貨 輸入販売",
    description: "アメリカンヴィンテージを中心とした雑貨を取り揃えています。",
  },
  {
    icon: Wrench,
    title: "メンテナンス・車検・板金",
    description: "定期点検から車検、板金修理まで、お車のメンテナンスはお任せください。",
  },
  {
    icon: Shield,
    title: "生命保険・損害保険",
    description: "お車と一緒に、保険のご相談も承ります。",
  },
]

export function ServicesSection() {
  return (
    <section id="services" className="py-24 md:py-40 bg-secondary">
      <div className="container mx-auto px-6">
        <FadeInUp>
          <div className="flex items-center gap-4 mb-3 justify-center">
            <div className="h-px w-8 bg-primary" />
            <span className="text-primary text-xs tracking-[0.25em] uppercase font-medium">Services</span>
            <div className="h-px w-8 bg-primary" />
          </div>
          <div className="text-center mb-4">
            <p className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
              おまかせください！
            </p>
            <p className="text-3xl md:text-4xl font-bold text-primary">
              お電話１本ですべてOKです！
            </p>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.15}>
          <div className="text-center mb-14 mt-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">サービス一覧</h2>
            <p className="text-muted-foreground">車のことならなんでも承ります。</p>
          </div>
        </FadeInUp>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <FadeInUp key={index} delay={index * 0.08}>
              <motion.div
                className="bg-card p-7 rounded-2xl border border-border h-full cursor-default"
                whileHover={{ y: -6, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.12)" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <service.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{service.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
              </motion.div>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  )
}
