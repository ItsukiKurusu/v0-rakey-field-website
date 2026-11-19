import { Children, Fragment, type ReactNode } from "react"
import { loadDefaultJapaneseParser } from "budoux"

const parser = loadDefaultJapaneseParser()

/** 文字列を BudouX で文節に分け、文節の切れ目にだけ <wbr> を入れる */
function split(text: string): ReactNode {
  const chunks = parser.parse(text)
  if (chunks.length <= 1) return text
  return chunks.map((c, i) => (
    <Fragment key={i}>
      {i > 0 && <wbr />}
      {c}
    </Fragment>
  ))
}

/**
 * 日本語の見出しを「文節の途中で折り返さない」ようにする。
 * 例：「なんで／も。」→「なんでも。」がひとかたまりで次の行へ。
 * keep-all で文字単位の改行を止め、<wbr> の位置（文節の切れ目）でだけ折り返す。
 * それでも1文節が行より長いときは overflow-wrap:break-word ではみ出しを防ぐ（anywhere と違い、表の列幅を文節より細くしない）。
 * Safari を含むすべてのブラウザで効く（CSS の word-break:auto-phrase は Chrome 系のみのため）。
 * 子どもに <br /> などの要素が混ざっていても、文字列の部分だけを分ける。
 */
export function Phrase({ children }: { children: ReactNode }) {
  const content = Children.map(children, (child) => (typeof child === "string" ? split(child) : child))
  return <span className="[word-break:keep-all] [overflow-wrap:break-word]">{content}</span>
}
