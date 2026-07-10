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

        return null
      })}
    </div>
  )
}
