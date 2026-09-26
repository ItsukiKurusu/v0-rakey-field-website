import Link from "next/link"
import type { Metadata } from "next"
import { Header } from "@/components/site/Header"
import { Footer } from "@/components/site/Footer"
import { SERVICES } from "@/lib/site"

export const metadata: Metadata = {
  title: "ページが見つかりません",
  robots: { index: false },
}

/** 404：道に迷った看板 */
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="asphalt relative flex min-h-[80vh] items-center overflow-hidden pb-20 pt-32">
        <div className="mx-auto w-full max-w-4xl px-5 text-center md:px-8">
          <div className="mx-auto grid h-44 w-40 place-items-center rounded-[1rem_1rem_4rem_4rem] border-[6px] border-paper bg-paper text-ink shadow-[0_30px_60px_-25px_rgba(0,0,0,0.8)] md:h-52 md:w-48">
            <div>
              <p className="font-display text-lg tracking-[0.3em]">ROUTE</p>
              <p className="font-display text-7xl leading-none md:text-8xl">404</p>
            </div>
          </div>
          <p className="mt-10 font-display text-sm tracking-[0.35em] text-mustard">WRONG WAY</p>
          <h1 className="mt-3 text-3xl font-black md:text-4xl">道に迷ってしまったようです。</h1>
          <p className="mt-4 text-sm leading-[1.9] text-paper/70 md:text-base">
            お探しのページは、移動したか、なくなった可能性があります。
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-rust px-8 py-4 font-bold text-paper shadow-lg shadow-black/40 transition-colors hover:bg-[#c64d35]"
          >
            トップページへ戻る
          </Link>
          <ul className="mx-auto mt-12 flex max-w-2xl flex-wrap justify-center gap-2 text-sm">
            {SERVICES.map((s) => (
              <li key={s.href}>
                <Link href={s.href} className="block rounded-full border border-paper/25 px-4 py-2 font-bold text-paper/80 transition-colors hover:border-paper/60 hover:text-paper">
                  {s.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="road-line absolute inset-x-0 bottom-0 opacity-70" aria-hidden="true" />
      </main>
      <Footer />
    </>
  )
}
