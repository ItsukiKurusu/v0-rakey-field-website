// 形状づくりに使う小さな数学関数。three に依存しない。

export type V2 = readonly [number, number]

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/**
 * 単調3次エルミート補間（Fritsch–Carlson）。
 * キー間で行き過ぎない（オーバーシュートしない）ので、車体の輪郭線に向く。
 * keys は x の昇順。範囲外は端の値で止める。
 */
export function pchip(keys: ReadonlyArray<V2>): (x: number) => number {
  const n = keys.length
  const xs = keys.map((k) => k[0])
  const ys = keys.map((k) => k[1])
  const h: number[] = []
  const d: number[] = []
  for (let i = 0; i < n - 1; i++) {
    h[i] = xs[i + 1] - xs[i]
    d[i] = (ys[i + 1] - ys[i]) / h[i]
  }
  const m: number[] = new Array(n).fill(0)
  m[0] = d[0]
  m[n - 1] = d[n - 2]
  for (let i = 1; i < n - 1; i++) {
    if (d[i - 1] * d[i] <= 0) m[i] = 0
    else {
      const w1 = 2 * h[i] + h[i - 1]
      const w2 = h[i] + 2 * h[i - 1]
      m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i])
    }
  }
  return (x: number) => {
    if (x <= xs[0]) return ys[0]
    if (x >= xs[n - 1]) return ys[n - 1]
    let i = 0
    while (x > xs[i + 1]) i++
    const t = (x - xs[i]) / h[i]
    const t2 = t * t
    const t3 = t2 * t
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i] +
      (t3 - 2 * t2 + t) * h[i] * m[i] +
      (-2 * t3 + 3 * t2) * ys[i + 1] +
      (t3 - t2) * h[i] * m[i + 1]
    )
  }
}

/**
 * 求心 Catmull-Rom で点列を滑らかにつなぎ、区間ごとに決まった数で標本化する。
 * 区間ごとの数を固定するので、どの断面でも「同じ番号の点＝同じ部位」になり、
 * 断面をつないだときに稜線（肩のエッジなど）がまっすぐ通る。
 * counts[i] は点 i→i+1 の区間の分割数。戻り値は始点〜終点を含む。
 */
export function sampleChain(points: ReadonlyArray<V2>, counts: ReadonlyArray<number>): V2[] {
  const out: V2[] = []
  const n = points.length
  const get = (i: number): V2 => {
    if (i < 0) {
      // 端は鏡像の点で延長する（端の接線が自然になる）
      const [a, b] = [points[0], points[1]]
      return [2 * a[0] - b[0], 2 * a[1] - b[1]]
    }
    if (i >= n) {
      const [a, b] = [points[n - 1], points[n - 2]]
      return [2 * a[0] - b[0], 2 * a[1] - b[1]]
    }
    return points[i]
  }
  for (let i = 0; i < n - 1; i++) {
    const p0 = get(i - 1)
    const p1 = get(i)
    const p2 = get(i + 1)
    const p3 = get(i + 2)
    const c = counts[i]
    for (let k = 0; k < c; k++) out.push(centripetal(p0, p1, p2, p3, k / c))
  }
  out.push(points[n - 1])
  return out
}

function centripetal(p0: V2, p1: V2, p2: V2, p3: V2, u: number): V2 {
  const dt = (a: V2, b: V2) => Math.max(1e-6, Math.pow(Math.hypot(b[0] - a[0], b[1] - a[1]), 0.5))
  const t0 = 0
  const t1 = t0 + dt(p0, p1)
  const t2 = t1 + dt(p1, p2)
  const t3 = t2 + dt(p2, p3)
  const t = lerp(t1, t2, u)
  const mix = (a: V2, b: V2, ta: number, tb: number): V2 => {
    const w = (t - ta) / (tb - ta)
    return [a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w]
  }
  const a1 = mix(p0, p1, t0, t1)
  const a2 = mix(p1, p2, t1, t2)
  const a3 = mix(p2, p3, t2, t3)
  const b1 = mix(a1, a2, t0, t2)
  const b2 = mix(a2, a3, t1, t3)
  return mix(b1, b2, t1, t2)
}

/** 折れ線を一定間隔で標本化し直す（長さで正規化した t も返す）。 */
export function resamplePolyline(pts: ReadonlyArray<V2>, count: number): V2[] {
  const acc = [0]
  for (let i = 1; i < pts.length; i++) {
    acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  }
  const total = acc[acc.length - 1]
  const out: V2[] = []
  let j = 0
  for (let k = 0; k < count; k++) {
    const s = (total * k) / (count - 1)
    while (j < pts.length - 2 && acc[j + 1] < s) j++
    const seg = acc[j + 1] - acc[j] || 1
    const w = (s - acc[j]) / seg
    out.push([lerp(pts[j][0], pts[j + 1][0], w), lerp(pts[j][1], pts[j + 1][1], w)])
  }
  return out
}
