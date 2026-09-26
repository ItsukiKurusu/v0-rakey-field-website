import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { SITE_URL } from "@/lib/site"

export type Crumb = { label: string; href: string }

/** パンくず（画面表示と BreadcrumbList の構造化データを同じデータから出す） */
export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  const all = [{ label: "ホーム", href: "/" }, ...items]
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: `${SITE_URL}${c.href === "/" ? "" : c.href}`,
    })),
  }
  return (
    <nav aria-label="パンくずリスト" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-xs font-bold tracking-wide">
        {all.map((c, i) => (
          <li key={c.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3 w-3 opacity-50" aria-hidden="true" />}
            {i === all.length - 1 ? (
              <span aria-current="page" className="opacity-90">
                {c.label}
              </span>
            ) : (
              <Link href={c.href} className="opacity-60 transition-opacity hover:opacity-100">
                {c.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </nav>
  )
}
