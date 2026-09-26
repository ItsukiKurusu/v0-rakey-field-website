import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import type { BlogContentBlock } from "@/lib/blog-posts"

function renderInline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-bold text-ink [background:linear-gradient(transparent_62%,rgba(217,164,65,0.45)_62%)]">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  )
}

export function BlogContent({ blocks }: { blocks: BlogContentBlock[] }) {
  return (
    <div className="space-y-7 text-ink">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          const Tag = block.level === 2 ? "h2" : "h3"
          return (
            <Tag
              key={i}
              className={
                block.level === 2
                  ? "relative border-l-[6px] border-mustard pl-4 pt-1 text-2xl font-black leading-snug md:text-[1.75rem] mt-14"
                  : "text-xl font-black leading-snug md:text-[1.35rem] mt-10 flex items-center gap-2 before:h-2 before:w-2 before:shrink-0 before:rounded-full before:bg-rust"
              }
            >
              {block.text}
            </Tag>
          )
        }

        if (block.type === "paragraph") {
          return (
            <p key={i} className="text-base leading-[2.05] text-ink/85 md:text-[1.05rem]">
              {renderInline(block.text)}
            </p>
          )
        }

        if (block.type === "image") {
          return (
            <div key={i} className="overflow-hidden rounded-xl shadow-[0_20px_40px_-24px_rgba(40,25,10,0.7)]">
              <Image
                src={block.src}
                alt={block.alt}
                width={block.width}
                height={block.height}
                className="w-full h-auto"
                sizes="(max-width: 768px) 100vw, 700px"
              />
            </div>
          )
        }

        if (block.type === "video") {
          return (
            <div key={i} className="overflow-hidden rounded-xl shadow-[0_20px_40px_-24px_rgba(40,25,10,0.7)]">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video src={block.src} controls className="w-full h-auto" />
            </div>
          )
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul"
          return (
            <ListTag
              key={i}
              className={`space-y-2 rounded-xl bg-white/40 py-5 pl-10 pr-5 text-ink/85 marker:font-bold marker:text-rust ${block.ordered ? "list-decimal" : "list-disc"}`}
            >
              {block.items.map((item, j) => (
                <li key={j} className="leading-[1.9]">
                  {item}
                </li>
              ))}
            </ListTag>
          )
        }

        if (block.type === "table") {
          return (
            <div key={i} className="overflow-x-auto rounded-xl border border-ink/15 bg-white/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-ink text-paper">
                    {block.headers.map((h, j) => (
                      <th
                        key={j}
                        className="whitespace-nowrap px-4 py-3 text-left font-bold"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, j) => (
                    <tr key={j} className="border-t border-ink/10 even:bg-paper-deep/40">
                      {row.map((cell, k) => (
                        <td key={k} className="px-4 py-3 text-ink/85">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }

        if (block.type === "callout") {
          return (
            <div
              key={i}
              className="rounded-xl border-2 border-dashed border-mustard bg-mustard/10 p-5 font-bold leading-[1.9] text-ink"
            >
              {block.text}
            </div>
          )
        }

        if (block.type === "cta") {
          return (
            <div key={i} className="rounded-xl bg-ink p-6 text-paper md:p-7">
              <p className="mb-5 font-bold leading-[1.9]">{block.text}</p>
              <Link
                href={block.href}
                className="inline-flex items-center gap-2 rounded-full bg-rust px-5 py-2.5 text-sm font-bold text-paper transition-colors hover:bg-[#c64d35]"
              >
                {block.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}
