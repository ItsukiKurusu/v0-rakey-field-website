/** セクションの見出し：マイル標（番号）＋英字＋日本語の見出し */
export function SectionHeading({
  no,
  en,
  title,
  lead,
  tone = "dark",
  align = "left",
}: {
  no: string
  en: string
  title: React.ReactNode
  lead?: React.ReactNode
  tone?: "dark" | "light"
  align?: "left" | "center"
}) {
  const sub = tone === "dark" ? "text-rust" : "text-mustard"
  const main = tone === "dark" ? "text-ink" : "text-paper"
  const body = tone === "dark" ? "text-ink/75" : "text-paper/75"
  return (
    <div className={`reveal ${align === "center" ? "text-center" : ""}`}>
      <p className={`mile ${sub}`} data-no={no}>
        {en}
      </p>
      <h2 className={`mt-5 text-[1.9rem] font-black leading-[1.4] tracking-wide md:text-[2.8rem] ${main}`}>{title}</h2>
      {lead && <p className={`mt-5 max-w-xl text-[0.95rem] leading-loose md:text-base ${body} ${align === "center" ? "mx-auto" : ""}`}>{lead}</p>}
    </div>
  )
}
