import Image from "next/image"
import { SectionHeading } from "./SectionHeading"

// 大小を混ぜた格子。PC は 4 列×3 行、スマホは 2 列×4 行で隙間なく埋まるように span を決めている
const SHOTS = [
  { src: "/images/impala7.jpg", alt: "ガレージの前に停まるインパラ SS", caption: "IMPALA SS", span: "col-span-2 md:row-span-2" },
  { src: "/images/garage.jpg", alt: "看板やナンバープレートが並ぶガレージの奥", caption: "THE WALL", span: "md:col-span-2" },
  { src: "/images/hot-wheels.jpg", alt: "壁一面のホットウィール", caption: "HOT WHEELS", span: "" },
  { src: "/images/garage2-tate.jpg", alt: "板壁に掛けたキーホルダーとナンバープレート", caption: "KEY TAGS", span: "md:row-span-2" },
  { src: "/images/garage-soto.jpg", alt: "外壁の看板（ACDelco・ルート405・ブタの標識）", caption: "SIGNS", span: "" },
  { src: "/images/S__7413769_0.jpg", alt: "ソファとショーケースのあるガレージの中", caption: "LOUNGE", span: "" },
  { src: "/images/impala-mae.jpg", alt: "インパラ SS の正面", caption: "FRONT VIEW", span: "" },
]

/** ガレージの風景 */
export function GallerySection() {
  return (
    <section id="gallery" className="paper py-24 md:py-36">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <SectionHeading no="05" en="SNAPSHOTS" title="ガレージの風景" />
        <ul className="mt-12 grid auto-rows-[160px] grid-cols-2 gap-3 md:auto-rows-[200px] md:grid-cols-4 md:gap-4">
          {SHOTS.map((s, i) => (
            <li
              key={s.src}
              className={`reveal group relative overflow-hidden rounded-lg bg-paper-deep ${s.span}`}
              style={{ "--reveal-delay": `${(i % 4) * 0.06}s` } as React.CSSProperties}
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                sizes="(min-width: 768px) 50vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-3 pb-2 pt-8 font-display text-sm tracking-[0.3em] text-paper">
                {s.caption}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
