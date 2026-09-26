import { Clock, MapPin, Phone } from "lucide-react"
import { ContactButton } from "@/components/site/ContactButton"
import type { InquiryType } from "@/lib/contact"
import { SITE } from "@/lib/site"

/** お問い合わせの帯（電話を大きく、フォームは控えめに）。サービスページ・ブログの最後に置く */
export function CtaBand({ title, text, type = "other" }: { title: string; text: string; type?: InquiryType }) {
  return (
    <div className="reveal asphalt relative overflow-hidden rounded-3xl px-6 py-12 md:px-14 md:py-16">
      <div className="road-line absolute inset-x-0 top-0 opacity-70" aria-hidden="true" />
      <div className="grid items-center gap-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="font-display text-sm tracking-[0.35em] text-mustard">ONE CALL, THAT&apos;S ALL</p>
          <h2 className="mt-3 text-3xl font-black leading-tight md:text-4xl">{title}</h2>
          <p className="mt-4 text-sm leading-[1.9] text-paper/75 md:text-base">{text}</p>
          <ul className="mt-6 space-y-2 text-sm text-paper/80">
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-mustard" aria-hidden="true" />
              {SITE.hours}（{SITE.closed}）
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-mustard" aria-hidden="true" />
              {SITE.address.postal} {SITE.address.full}
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-3 md:col-span-6">
          <a
            href={SITE.tel.href}
            className="flex items-center justify-center gap-3 rounded-2xl bg-rust px-6 py-5 shadow-lg shadow-black/40 transition-colors hover:bg-[#c64d35]"
          >
            <Phone className="h-7 w-7" aria-hidden="true" />
            <span className="font-display text-4xl tracking-wider md:text-5xl">{SITE.tel.display}</span>
          </a>
          <ContactButton
            type={type}
            label="フォームで問い合わせる（24時間受付）"
            className="rounded-2xl border border-paper/30 px-6 py-4 text-sm text-paper hover:bg-paper/10"
          />
        </div>
      </div>
    </div>
  )
}
