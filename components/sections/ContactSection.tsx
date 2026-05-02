"use client"

import { Phone, Mail, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { FadeInUp } from "@/components/shared/FadeInUp"
import { ContactModal } from "@/components/shared/ContactModal"

export function ContactSection() {
  return (
    <section id="contact" className="py-24 md:py-40 bg-secondary">
      <div className="container mx-auto px-6">
        <FadeInUp>
          <div className="flex items-center gap-4 mb-3 justify-center">
            <div className="h-px w-8 bg-primary" />
            <span className="text-primary text-xs tracking-[0.25em] uppercase font-medium">Contact</span>
            <div className="h-px w-8 bg-primary" />
          </div>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">お問い合わせ</h2>
            <p className="text-muted-foreground">お気軽にご相談ください</p>
          </div>
        </FadeInUp>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <FadeInUp delay={0.1}>
              <div className="bg-card p-7 rounded-2xl border border-border h-full">
                <h3 className="text-sm font-semibold text-foreground mb-5 tracking-wide uppercase">
                  お電話
                </h3>
                <div className="space-y-3">
                  <a
                    href="tel:072-339-4549"
                    className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">TEL</span>
                      <span className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        072-339-4549
                      </span>
                    </div>
                  </a>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">FAX</span>
                      <span className="text-foreground">072-339-4551</span>
                    </div>
                  </div>
                  <a
                    href="tel:090-1893-0467"
                    className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">MOBILE</span>
                      <span className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        090-1893-0467
                      </span>
                    </div>
                  </a>
                </div>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.2}>
              <div className="bg-card p-7 rounded-2xl border border-border h-full">
                <h3 className="text-sm font-semibold text-foreground mb-5 tracking-wide uppercase">
                  メール・営業時間
                </h3>
                <div className="space-y-3">
                  <a
                    href="mailto:haegiwa.com@icloud.com"
                    className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">メール</span>
                      <span className="text-sm text-foreground break-all group-hover:text-primary transition-colors">
                        haegiwa.com@icloud.com
                      </span>
                    </div>
                  </a>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">営業時間</span>
                      <span className="text-foreground">10:00 〜 18:00</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">定休日</span>
                      <span className="text-foreground">不定休</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInUp>
          </div>

          <FadeInUp delay={0.3}>
            <div className="bg-card p-7 rounded-2xl border border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-0.5">所在地</span>
                    <span className="text-foreground">〒599-8242 大阪府堺市中区陶器北845-7</span>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 flex-shrink-0">
                      フォームで問い合わせ
                    </Button>
                  </DialogTrigger>
                  <ContactModal />
                </Dialog>
              </div>
            </div>
          </FadeInUp>
        </div>
      </div>
    </section>
  )
}
