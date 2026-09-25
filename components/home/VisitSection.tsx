import Image from "next/image"
import { MapPin } from "lucide-react"
import { SITE } from "@/lib/site"

/** お店へ（ガレージの写真いっぱいに、モーテルの鍵札のような案内） */
export function VisitSection() {
  return (
    <section id="visit" className="relative isolate overflow-hidden bg-asphalt py-24 md:py-40">
      <Image src="/images/garage-soto-hiki.jpg" alt="RAKEY FIELD のガレージの外観" fill sizes="100vw" className="-z-10 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/40 to-black/10" aria-hidden="true" />
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="reveal paper max-w-md rounded-[18px] p-8 shadow-2xl md:p-10">
          <p className="mile text-rust" data-no="04">
            VISIT US
          </p>
          <h2 className="mt-5 text-[1.9rem] font-black leading-[1.4] text-ink md:text-[2.4rem]">
            ガレージへ、
            <br />
            気軽にどうぞ。
          </h2>
          <p className="mt-5 text-[0.95rem] leading-loose text-ink/75">
            アメリカンヴィンテージに囲まれた、小さなガレージです。車の相談がなくても、雑貨を見に立ち寄ってください。
          </p>
          <dl className="mt-7 grid grid-cols-[5.5rem_1fr] gap-y-3 border-t-2 border-dashed border-ink/25 pt-6 text-sm">
            <dt className="font-display tracking-[0.25em] text-rust">OPEN</dt>
            <dd className="font-bold text-ink">{SITE.hours}</dd>
            <dt className="font-display tracking-[0.25em] text-rust">CLOSED</dt>
            <dd className="font-bold text-ink">{SITE.closed}</dd>
            <dt className="font-display tracking-[0.25em] text-rust">ADDRESS</dt>
            <dd className="text-ink">
              {SITE.address.postal}
              <br />
              {SITE.address.full}
            </dd>
          </dl>
          <a
            href={SITE.address.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-bold text-paper transition-colors hover:bg-rust"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Google マップで見る
          </a>
        </div>
      </div>
    </section>
  )
}
