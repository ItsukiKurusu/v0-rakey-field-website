import { Plus } from "lucide-react"
import type { Faq } from "@/lib/service-pages"

/** よくある質問。画面の表示と FAQPage の構造化データを同じデータから出す（食い違いを防ぐ） */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }
  return (
    <>
      <ul className="divide-y divide-ink/15 border-y border-ink/15">
        {faqs.map((f, i) => (
          <li key={f.q} className="reveal" style={{ "--reveal-delay": `${(i * 0.05).toFixed(2)}s` } as React.CSSProperties}>
            <details className="group py-1" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-start gap-4 py-5 [&::-webkit-details-marker]:hidden">
                <span className="font-display text-2xl leading-none text-rust">Q</span>
                <span className="flex-1 pt-0.5 font-bold leading-relaxed text-ink">{f.q}</span>
                <Plus className="mt-1 h-5 w-5 shrink-0 text-ink/50 transition-transform duration-300 group-open:rotate-45" aria-hidden="true" />
              </summary>
              <div className="flex gap-4 pb-6">
                <span className="font-display text-2xl leading-none text-teal">A</span>
                <p className="flex-1 pt-0.5 text-sm leading-[1.9] text-ink/75 md:text-[0.95rem]">{f.a}</p>
              </div>
            </details>
          </li>
        ))}
      </ul>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  )
}
