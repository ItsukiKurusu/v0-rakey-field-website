/**
 * トップの3Dヒーロー（ルート66）の幕ごとに1行ずつ出す言葉。
 * from / to はスクロールの生の進行度（0..1）で、components/hero66/constants.ts の幕と同じ物差し。
 * `|` は折り返してよい位置（塊の途中では割らない）。
 * three に依存しないので、ページ側から読んでも 3D の JS は増えない。
 */
export const HERO_LINES = {
  fade: 0.22,
  lines: [
    { text: "地域の人々の|カーライフを、|一生涯サポートします。", from: 0.13, to: 0.3 },
    { text: "車のことなら、|なんでも。", from: 0.31, to: 0.53 },
    { text: "子どもたちが名付けた、|家族の場所。", from: 0.58, to: 0.81 },
    { text: "お電話一本で、|すべてOK。", from: 0.87, to: 1 },
  ],
} as const

/** 冒頭の見出し（h1）が消えていく区間。DOM からは消さない（SEO のため） */
export const HERO_TITLE_FADE = { start: 0.045, end: 0.11 } as const

/** 最後の行と一緒に出る、電話・フォームのボタン */
export const HERO_CTA_FROM = 0.9

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)

/** 行の状態。-1 = まだ、-1→0 = 入る、0 = 表示中、0→1 = 消える、1 = 消えた */
export function lineState(p: number, from: number, to: number): number {
  const f = (to - from) * HERO_LINES.fade
  if (p <= from + f) return clamp01((p - from) / f) - 1
  if (to >= 1) return 0 // 最後の行は出したまま次の場面へ
  if (p >= to - f) return clamp01((p - (to - f)) / f)
  return 0
}
