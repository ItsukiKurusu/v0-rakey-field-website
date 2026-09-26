import { Mail, MapPin, Phone, Smartphone } from "lucide-react"
import { ContactForm } from "@/components/site/ContactForm"
import { SITE } from "@/lib/site"
import { SectionHeading } from "./SectionHeading"

/** お問い合わせ（電話＋フォーム）と会社概要（ページの最後） */
export function InfoSection() {
  return (
    <section className="asphalt relative py-24 md:py-32">
      <div className="road-line absolute inset-x-0 top-0 opacity-70" aria-hidden="true" />

      {/* お問い合わせ */}
      <div id="contact" className="mx-auto grid max-w-6xl scroll-mt-24 gap-12 px-5 md:grid-cols-12 md:gap-14 md:px-8">
        <div className="md:col-span-5">
          <SectionHeading
            no="07"
            en="CONTACT"
            title={
              <>
                お気軽に
                <br />
                ご相談ください
              </>
            }
            lead="いちばん早いのはお電話です。フォームは24時間受け付けています。"
            tone="light"
          />
          <a
            href={SITE.tel.href}
            className="reveal mt-10 flex items-center gap-4 rounded-2xl bg-rust px-6 py-5 shadow-lg shadow-black/40 transition-colors hover:bg-[#c64d35]"
          >
            <Phone className="h-8 w-8 shrink-0" aria-hidden="true" />
            <span>
              <span className="block text-xs font-bold tracking-widest text-paper/80">お電話（{SITE.hours}・{SITE.closed}）</span>
              <span className="block font-display text-4xl tracking-wider md:text-5xl">{SITE.tel.display}</span>
            </span>
          </a>
          <ul className="reveal mt-6 space-y-3 text-sm text-paper/85">
            <li className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-mustard" aria-hidden="true" />
              携帯：
              <a href={SITE.mobile.href} className="font-bold underline-offset-4 hover:underline">
                {SITE.mobile.display}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-mustard" aria-hidden="true" />
              メール：
              <a href={`mailto:${SITE.email}`} className="font-bold underline-offset-4 hover:underline">
                {SITE.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-4 text-center font-display text-mustard">F</span>
              FAX：<span className="font-bold">{SITE.fax}</span>
            </li>
          </ul>
        </div>
        <div className="reveal md:col-span-7" style={{ "--reveal-delay": "0.1s" } as React.CSSProperties}>
          <ContactForm idPrefix="home-contact" />
        </div>
      </div>

      {/* 会社概要 */}
      <div id="company" className="mx-auto mt-24 grid max-w-6xl scroll-mt-24 gap-10 px-5 md:mt-32 md:grid-cols-12 md:gap-14 md:px-8">
        <div className="md:col-span-5">
          <SectionHeading no="08" en="COMPANY" title="会社概要" tone="light" />
        </div>
        <dl className="reveal divide-y divide-paper/15 border-y border-paper/15 text-sm md:col-span-7">
          {[
            ["社名", SITE.name],
            ["代表", SITE.representative],
            [
              "所在地",
              <>
                {SITE.address.postal} {SITE.address.full}
                <a href={SITE.address.mapUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1 text-mustard hover:underline">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  地図
                </a>
              </>,
            ],
            ["営業時間", `${SITE.hours}（${SITE.closed}）`],
            ["資格・許可", SITE.licenses.join(" ／ ")],
          ].map(([k, v]) => (
            <div key={String(k)} className="grid grid-cols-[6.5rem_1fr] gap-4 py-4">
              <dt className="font-bold text-paper/60">{k}</dt>
              <dd className="leading-relaxed text-paper">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
