"use client"

import { CheckCircle2 } from "lucide-react"
import { FadeInUp } from "@/components/shared/FadeInUp"

const companyInfo = [
  { label: "社名", value: "RAKEY FIELD" },
  { label: "代表", value: "清水 健 (Ken Shimizu)" },
  { label: "住所", value: "〒599-8242 大阪府堺市中区陶器北845-7" },
]

const qualifications = [
  "古物商許可",
  "レンタカー事業者証明書",
  "損害保険募集人資格",
]

export function CompanySection() {
  return (
    <section id="company" className="py-24 md:py-40 bg-background">
      <div className="container mx-auto px-6">
        <FadeInUp>
          <div className="flex items-center gap-4 mb-3 justify-center">
            <div className="h-px w-8 bg-primary" />
            <span className="text-primary text-xs tracking-[0.25em] uppercase font-medium">Company</span>
            <div className="h-px w-8 bg-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-16">会社概要</h2>
        </FadeInUp>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          <FadeInUp delay={0.1}>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-5 pb-3 border-b border-border tracking-wide uppercase">
                プロフィール
              </h3>
              <div className="space-y-0">
                {companyInfo.map((info, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-baseline py-4 border-b border-border/60 last:border-0 gap-1 sm:gap-0"
                  >
                    <span className="text-xs text-muted-foreground tracking-wide sm:w-16 flex-shrink-0">
                      {info.label}
                    </span>
                    <span className="text-foreground sm:ml-6">{info.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-5 pb-3 border-b border-border tracking-wide uppercase">
                資格・許可
              </h3>
              <ul className="space-y-5">
                {qualifications.map((qual, index) => (
                  <li key={index} className="flex items-center gap-3 text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{qual}</span>
                  </li>
                ))}
              </ul>
            </div>
          </FadeInUp>
        </div>
      </div>
    </section>
  )
}
