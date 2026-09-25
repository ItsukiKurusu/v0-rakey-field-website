import Image from "next/image"
import Link from "next/link"
import { SERVICES, SITE } from "@/lib/site"

const LINKS = [
  { label: "私たちの想い", href: "/#concept" },
  { label: "RAKEY FIELD の由来", href: "/#origin" },
  { label: "ギャラリー", href: "/#gallery" },
  { label: "ブログ", href: "/blog" },
  { label: "アクセス", href: "/#visit" },
  { label: "お問い合わせ・会社概要", href: "/#contact" },
]

/** フッター（夜の道の終わり） */
export function Footer() {
  return (
    <footer className="asphalt relative overflow-hidden border-t border-paper/10 pb-10 pt-16">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-12 md:px-8">
        <div className="md:col-span-5">
          <Link href="/" className="inline-flex items-center gap-4">
            <span className="relative h-16 w-20 -rotate-6 overflow-hidden rounded-xl bg-[#f7f3ea] p-1">
              <span className="relative block h-full w-full overflow-hidden rounded-lg">
                <Image src="/images/logo-raw.jpg" alt="" fill sizes="80px" className="object-cover" />
              </span>
            </span>
            <span className="font-display text-4xl leading-none tracking-wide">RAKEY FIELD</span>
          </Link>
          <p className="mt-5 text-sm leading-relaxed text-paper/70">{SITE.tagline}</p>
          <address className="mt-6 space-y-1 text-sm not-italic text-paper/80">
            <p>
              {SITE.address.postal} {SITE.address.full}
            </p>
            <p>
              TEL <a href={SITE.tel.href} className="font-bold hover:underline">{SITE.tel.display}</a>　FAX {SITE.fax}
            </p>
            <p>
              {SITE.hours}（{SITE.closed}）
            </p>
          </address>
        </div>
        <nav className="grid grid-cols-2 gap-8 text-sm md:col-span-7" aria-label="フッター">
          <div>
            <p className="font-display tracking-[0.3em] text-mustard">SERVICE</p>
            <ul className="mt-4 space-y-2.5">
              {SERVICES.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="text-paper/80 hover:text-paper hover:underline">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-display tracking-[0.3em] text-mustard">RAKEY FIELD</p>
            <ul className="mt-4 space-y-2.5">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-paper/80 hover:text-paper hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
      <div className="road-line mx-auto mt-14 max-w-6xl opacity-40" aria-hidden="true" />
      <p className="mx-auto mt-6 max-w-6xl px-5 font-display text-sm tracking-[0.25em] text-paper/50 md:px-8">
        © {new Date().getFullYear()} RAKEY FIELD — SAKAI, OSAKA
      </p>
    </footer>
  )
}
