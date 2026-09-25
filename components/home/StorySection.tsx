import Image from "next/image"
import { SectionHeading } from "./SectionHeading"

const STEPS = [
  "子どもたちが、家族で乗っていた車に名前をつけた。家族みんなの頭文字で「RAKEY」。",
  "子どもたちが描いたステッカーを、その車に貼っていた。それが今のロゴです。",
  "このガレージは、もともと趣味のために借りていた場所。",
  "露店を出して、地域の子どもたちのためのお祭りも開いた。",
  "いつの間にか、みんながここを「RAKEY FIELD」と呼ぶようになった。",
]

/** RAKEY FIELD の由来（夜の道のような暗い地に、マイル標を立てて順に進む） */
export function StorySection() {
  return (
    <section id="origin" className="asphalt relative overflow-hidden py-24 md:py-36">
      <div className="road-line absolute inset-x-0 top-0 opacity-70" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl items-start gap-16 px-5 md:grid-cols-12 md:gap-12 md:px-8">
        {/* 子どもたちが描いたステッカー（今のロゴ） */}
        <div className="reveal md:sticky md:top-28 md:col-span-5">
          <figure className="relative mx-auto max-w-sm -rotate-3">
            <div className="rounded-[28px] bg-[#f7f3ea] p-3 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.8)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
                <Image src="/images/logo-raw.jpg" alt="子どもたちが描いた RAKEY のステッカー" fill sizes="(min-width: 768px) 30vw, 80vw" className="object-cover" />
              </div>
            </div>
            <figcaption className="mt-6 text-center text-sm leading-relaxed text-paper/70">
              子どもたちが描いた、最初のステッカー。
              <br />
              RAKEY は、家族みんなの頭文字。
            </figcaption>
          </figure>
        </div>

        <div className="md:col-span-7">
          <SectionHeading no="02" en="THE STORY" title="RAKEY FIELD の由来" tone="light" />
          <ol className="relative mt-12 space-y-10 pl-16 md:space-y-12">
            <span className="road-line-v absolute bottom-3 left-[1.35rem] top-3" aria-hidden="true" />
            {STEPS.map((text, i) => (
              <li key={text} className="reveal relative" style={{ "--reveal-delay": `${i * 0.08}s` } as React.CSSProperties}>
                <span className="absolute -left-16 top-0 grid h-11 w-11 place-items-center rounded-[0.4rem_0.4rem_1.3rem_1.3rem] border-2 border-paper bg-asphalt font-display text-xl text-paper">
                  {i + 1}
                </span>
                <p className="pt-2 text-[1.02rem] leading-[1.95] text-paper/90 md:text-lg">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
