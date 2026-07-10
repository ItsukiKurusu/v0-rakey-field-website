import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { BlogContentBlock } from "@/lib/blog-posts"

export function BlogContent({ blocks }: { blocks: BlogContentBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          const Tag = block.level === 2 ? "h2" : "h3"
          return (
            <Tag
              key={i}
              className={
                block.level === 2
                  ? "text-2xl md:text-3xl font-bold text-foreground pt-4"
                  : "text-xl md:text-2xl font-bold text-foreground pt-2"
              }
            >
              {block.text}
            </Tag>
          )
        }

        if (block.type === "paragraph") {
          return (
            <p key={i} className="text-base text-foreground/80 leading-relaxed">
              {block.text}
            </p>
          )
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul"
          return (
            <ListTag
              key={i}
              className={`space-y-2 pl-5 text-foreground/80 ${block.ordered ? "list-decimal" : "list-disc"}`}
            >
              {block.items.map((item, j) => (
                <li key={j} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ListTag>
          )
        }

        if (block.type === "table") {
          return (
            <div key={i} className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-secondary">
                    {block.headers.map((h, j) => (
                      <th
                        key={j}
                        className="px-4 py-3 text-left font-bold text-foreground whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, j) => (
                    <tr key={j} className="border-t border-border">
                      {row.map((cell, k) => (
                        <td key={k} className="px-4 py-3 text-foreground/80">
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
              className="rounded-2xl bg-primary/10 border border-primary/20 p-5 text-foreground font-medium leading-relaxed"
            >
              {block.text}
            </div>
          )
        }

        if (block.type === "cta") {
          return (
            <div key={i} className="rounded-2xl bg-primary/10 border border-primary/20 p-6">
              <p className="text-foreground font-medium leading-relaxed mb-4">{block.text}</p>
              <Link
                href={block.href}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
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
