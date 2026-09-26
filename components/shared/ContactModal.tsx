"use client"

import { Phone } from "lucide-react"
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ContactForm } from "@/components/site/ContactForm"
import type { InquiryType } from "@/lib/contact"
import { SITE } from "@/lib/site"

/** サービスページのお問い合わせモーダル。type でご用件を選んだ状態にする */
export function ContactModal({ type = "other" }: { type?: InquiryType }) {
  return (
    <DialogContent data-lenis-prevent className="max-h-[90dvh] overflow-y-auto border-none bg-paper p-0 sm:max-w-xl">
      <DialogHeader className="px-6 pt-6 text-left md:px-8">
        <DialogTitle className="text-xl font-black text-ink">お問い合わせ</DialogTitle>
        <DialogDescription className="text-sm text-ink/70">
          お急ぎの方はお電話で：
          <a href={SITE.tel.href} className="ml-1 inline-flex items-center gap-1 font-bold text-rust">
            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
            {SITE.tel.display}
          </a>
        </DialogDescription>
      </DialogHeader>
      <ContactForm defaultType={type} />
    </DialogContent>
  )
}
