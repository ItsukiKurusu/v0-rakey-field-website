import { Mail, MapPin, Phone, Smartphone } from "lucide-react"
import { SITE } from "@/lib/site"
import { SectionHeading } from "./SectionHeading"

/** 会社概要とお問い合わせ（ページの最後） */
export function InfoSection() {
  return (
    <section className="asphalt relative py-24 md:py-32">
      <div className="road-line absolute inset-x-0 top-0 opacity-70" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl gap-16 px-5 md:grid-cols-2 md:gap-14 md:px-8">
        {/* お問い合わせ */}
        <div id="contact" className="scroll-mt-24">
          <SectionHeading no="07" en="CONTACT" title="お気軽にご相談ください" tone="light" />
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

        {/* 会社概要 */}
        <div id="company" className="scroll-mt-24">
          <SectionHeading no="08" en="COMPANY" title="会社概要" tone="light" />
          <dl className="reveal mt-10 divide-y divide-paper/15 border-y border-paper/15 text-sm">
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
      </div>
    </section>
  )
}
