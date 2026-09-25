// 車体の下半分（ベルトラインより下）を、前後方向に並べた断面をつないで1枚の面として作る。
//
// 断面（右半分）の点の並び：床の中心 → 床 → ロッカーの角(E) → 側面 → 肩の稜線 → 天面 → 中心
// E は「アーチの切り口」専用の列。アーチのない所ではロッカーの角に、アーチの所では
// アーチの円の上に置く。E の列が常に辺としてつながるので、アーチの縁が円を正確になぞる。
import * as THREE from "three"
import { lerp, pchip, sampleChain, smoothstep, type V2 } from "./math"
import { SPEC } from "./spec"

const B = SPEC.body
const CAB = SPEC.cabin
const prof = {
  yS: pchip(B.shoulderY),
  wS: pchip(B.shoulderW),
  wM: pchip(B.maxW),
  wK: pchip(B.rockerW),
  yB: pchip(B.bottomY),
  crown: pchip(B.crown),
}

export const shoulderAt = (x: number): V2 => [prof.wS(x), prof.yS(x)]

// 区間ごとの分割数（キー点 13 個 → 区間 12）
const COUNTS = [5, 3, 3, 5, 5, 5, 5, 3, 2, 5, 2, 4]
const E_INDEX = COUNTS[0] + COUNTS[1] // ロッカーの角（キー点 2）の標本番号
export const CREASE_INDEX = COUNTS.slice(0, 8).reduce((a, b) => a + b, 0) // 肩の稜線（キー点 8）
export const HALF_COUNT = COUNTS.reduce((a, b) => a + b, 0) + 1

// 室内の床の高さ。キャビンの下は天面をここまで掘り下げて、室内（内張り・床）にする
const FLOOR_Y = 0.42
/** 0 = 天面そのまま、1 = 床まで掘り下げる。前はダッシュボード、後ろはリアトレイの傾斜になる */
export const tubDepth = (x: number) =>
  smoothstep(CAB.end + 0.05, CAB.end + 0.4, x) * (1 - smoothstep(CAB.start - 0.4, CAB.start - 0.06, x))

/** 断面の右半分（z ≥ 0）。床の中心から天面の中心まで。 */
export function sectionRight(x: number): V2[] {
  const yS = prof.yS(x)
  const wS = prof.wS(x)
  const wM = prof.wM(x)
  const wK = prof.wK(x)
  const yB = prof.yB(x)
  const yM = B.maxWidthY
  const top = yS + prof.crown(x)
  const d = tubDepth(x)
  // ボンネット中央の一段高い面（左右に折り目が走る）。カウルの手前から先端の手前まで
  const hood = smoothstep(SPEC.lines.hoodRearX, SPEC.lines.hoodRearX + 0.25, x) * (1 - smoothstep(2.2, 2.42, x))
  const keys: V2[] = [
    [0, yB],
    [wK - 0.14, yB],
    [wK - 0.03, yB + 0.03], // E：ロッカーの角
    // 前後端は床が高いので、下から上へ高さが単調に増えるよう詰める（折り返すと角の丸めで外へ飛び出す）
    [wK + 0.012, Math.min(yB + 0.11, yM - 0.2)],
    [wM - 0.012, yM - 0.17],
    [wM, yM], // 胴の一番ふくらむ所
    [wM - 0.02, yM + 0.5 * (yS - 0.075 - yM)],
    [wS + 0.024, yS - 0.075], // 肩は大きく丸く（Bボディは稜線が立たない）
    [wS, yS - 0.006], // 肩の稜線
    // 天面。キャビンの下では内張り → 床へ落とし込む
    [wS - lerp(0.1, 0.1, d), lerp(yS + 0.4 * (top - yS) + 0.008, yS - 0.3, d)],
    [0.44, lerp(top - 0.004 - 0.012 * hood, FLOOR_Y, d)], // 折り目の外側（一段低い）
    [0.39, lerp(top - 0.002, FLOOR_Y, d)], // 折り目の内側（中央の高い面）
    [0, lerp(top, FLOOR_Y, d)],
  ]
  return sampleChain(keys, COUNTS)
}

/** 天面（肩の稜線 → 中心）の点列。キャビンの両端をここへ溶け込ませる。 */
export const topCurveRight = (x: number): V2[] => sectionRight(x).slice(CREASE_INDEX)

/** アーチの切り口の高さ。アーチの外なら null。 */
function archCut(x: number): number | null {
  const { radius: R, centerY } = SPEC.arch
  for (const xa of [SPEC.wheel.x, -SPEC.wheel.x]) {
    const dx = x - xa
    if (Math.abs(dx) < R) return centerY + Math.sqrt(R * R - dx * dx)
  }
  return null
}

/** 右半分の点列を、高さ c のアーチで切る。 */
function cutSection(pts: V2[], c: number): V2[] {
  const flange = SPEC.arch.flange
  // 側面（E より上）で c をまたぐ所の z
  let zc = pts[E_INDEX][0]
  for (let i = E_INDEX; i < CREASE_INDEX; i++) {
    const [z0, y0] = pts[i]
    const [z1, y1] = pts[i + 1]
    if (y0 <= c && y1 >= c) {
      zc = z0 + ((z1 - z0) * (c - y0)) / (y1 - y0 || 1)
      break
    }
  }
  return pts.map(([z, y], i): V2 => {
    if (i < E_INDEX - 1) return [Math.min(z, zc - flange), c] // 床 → アーチの天井
    if (i === E_INDEX - 1) return [zc - flange, c] // 内側への折れ込み
    if (i === E_INDEX) return [zc, c] // 切り口
    if (i < CREASE_INDEX && y < c) return [zc, c] // 切り口より下の側面は E に畳む
    return [z, y]
  })
}

/** 外向き法線（(z,y) 平面）。右半分は下 → 上へ反時計回りに進むので、接線を -90° 回す。 */
function outwardNormals(pts: V2[]): V2[] {
  return pts.map((_, i) => {
    const a = pts[Math.max(0, i - 1)]
    const b = pts[Math.min(pts.length - 1, i + 1)]
    const tz = b[0] - a[0]
    const ty = b[1] - a[1]
    const l = Math.hypot(tz, ty) || 1
    return [ty / l, -tz / l]
  })
}

type Station = { x: number; half: V2[] }

/** 前後端の角を丸める断面（x を進めながら内側へずらす）。 */
function roundedEnd(end: "front" | "rear"): Station[] {
  const r = end === "front" ? B.frontRound : B.rearRound
  const face = end === "front" ? SPEC.frontFace : SPEC.rearFace
  const dir = end === "front" ? 1 : -1
  const base = face - dir * r.x
  const out: Station[] = []
  for (let k = 1; k <= r.steps; k++) {
    const th = (k / r.steps) * (Math.PI / 2)
    const x = base + dir * r.x * Math.sin(th)
    const pts = sectionRight(x)
    const n = outwardNormals(pts)
    const f = 1 - Math.cos(th)
    out.push({
      x,
      half: pts.map(([z, y], i): V2 => {
        // 中心線上の点は z を動かさない（左右の継ぎ目を割らない）
        const dz = i === 0 || i === pts.length - 1 ? 0 : -n[i][0] * r.z * f
        return [Math.max(0, z + dz), y - n[i][1] * r.y * f]
      }),
    })
  }
  return end === "front" ? out : out.reverse()
}

function stations(): Station[] {
  const R = SPEC.arch.radius
  const xs: Station[] = []
  const push = (x: number, cut: boolean) => {
    const pts = sectionRight(x)
    const c = cut ? archCut(x) : null
    xs.push({ x, half: c === null ? pts : cutSection(pts, c) })
  }
  const archStations = (xa: number) => {
    // 角度で刻む：縁の近く（円が縦になる所）ほど細かくなる
    push(xa - R, false)
    const n = 44
    for (let k = 0; k <= n; k++) {
      const th = Math.PI * (1 - k / n)
      const x = xa + R * Math.cos(th)
      const c = SPEC.arch.centerY + R * Math.sin(th)
      const pts = sectionRight(x)
      xs.push({ x, half: cutSection(pts, c) })
    }
    push(xa + R, false)
  }

  const rearStart = SPEC.rearFace + B.rearRound.x
  const frontEnd = SPEC.frontFace - B.frontRound.x
  const wx = SPEC.wheel.x
  const step = 0.04
  const plain = (a: number, b: number) => {
    const n = Math.max(1, Math.round((b - a) / step))
    for (let k = 1; k < n; k++) push(a + ((b - a) * k) / n, false)
  }

  xs.push(...roundedEnd("rear"))
  push(rearStart, false)
  plain(rearStart, -wx - R)
  archStations(-wx)
  plain(-wx + R, wx - R)
  archStations(wx)
  plain(wx + R, frontEnd)
  push(frontEnd, false)
  xs.push(...roundedEnd("front"))
  return xs
}

/** 右半分 → 左右そろった閉じた輪（右：下→上、左：上→下）。 */
function fullLoop(half: V2[]): V2[] {
  const left: V2[] = []
  for (let i = half.length - 2; i >= 1; i--) left.push([-half[i][0], half[i][1]])
  return [...half, ...left]
}

export type BodyModel = {
  geometry: THREE.BufferGeometry
  /** 側面の高さ y における右側面の z（前後端の丸め・アーチは考慮しない） */
  zAtY: (x: number, y: number) => number
  /** 前端/後端の高さ y での平面形（x,z）。面の中心 → 角 → 側面の順 */
  endOutline: (end: "front" | "rear", y: number, reach?: number) => V2[]
}

export function buildBody(): BodyModel {
  const st = stations()
  const loops = st.map((s) => fullLoop(s.half))
  const C = loops[0].length
  const S = st.length
  const x0 = st[0].x
  const x1 = st[S - 1].x

  const pos: number[] = []
  const uv: number[] = []
  for (let s = 0; s < S; s++) {
    for (let c = 0; c < C; c++) {
      const [z, y] = loops[s][c]
      pos.push(st[s].x, y, z)
      uv.push((st[s].x - x0) / (x1 - x0), c / C)
    }
  }
  // 区画：0 = 塗装、1 = 室内（キャビンの下に掘り下げた天面）
  const idx: number[] = []
  const interior: number[] = []
  const vi = (s: number, c: number) => s * C + (c % C)
  const rightIndex = (c: number) => (c % C < HALF_COUNT ? c % C : C - (c % C))
  for (let s = 0; s < S - 1; s++) {
    const inTub = tubDepth((st[s].x + st[s + 1].x) / 2) > 0.001
    for (let c = 0; c < C; c++) {
      const a = vi(s, c)
      const b = vi(s, c + 1)
      const d = vi(s + 1, c)
      const e = vi(s + 1, c + 1)
      const onTop = Math.min(rightIndex(c), rightIndex(c + 1)) >= CREASE_INDEX
      ;(inTub && onTop ? interior : idx).push(a, d, b, b, d, e)
    }
  }

  // 前後の蓋（平らな面。法線を分けたいので頂点は別に持つ）
  const cap = (s: number, facing: 1 | -1) => {
    const loop = loops[s]
    const contour = loop.map(([z, y]) => new THREE.Vector2(z, y))
    const tris = THREE.ShapeUtils.triangulateShape(contour, [])
    const base = pos.length / 3
    for (const [z, y] of loop) {
      pos.push(st[s].x, y, z)
      uv.push(facing > 0 ? 1 : 0, 0)
    }
    for (const [a, b, c] of tris) {
      // 三角形の向きを面の向きにそろえる
      const [za, ya] = loop[a]
      const [zb, yb] = loop[b]
      const [zc, yc] = loop[c]
      const nx = (zb - za) * (yc - ya) - (yb - ya) * (zc - za) // (z,y) 平面の外積の符号
      // (z,y) で反時計回り ⇔ -x 向きの法線
      const ccw = nx > 0
      if ((facing < 0) === ccw) idx.push(base + a, base + b, base + c)
      else idx.push(base + a, base + c, base + b)
    }
  }
  cap(0, -1)
  cap(S - 1, 1)

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2))
  geometry.setIndex([...idx, ...interior])
  geometry.addGroup(0, idx.length, 0)
  geometry.addGroup(idx.length, interior.length, 1)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()

  const zOnSide = (half: V2[], y: number): number | null => {
    for (let i = E_INDEX; i < CREASE_INDEX + 2 && i < half.length - 1; i++) {
      const [z0, y0] = half[i]
      const [z1, y1] = half[i + 1]
      if ((y0 - y) * (y1 - y) <= 0 && y0 !== y1) return z0 + ((z1 - z0) * (y - y0)) / (y1 - y0)
    }
    return null
  }

  const zAtY = (x: number, y: number) => zOnSide(sectionRight(x), y) ?? prof.wM(x)

  const endOutline = (end: "front" | "rear", y: number, reach = 0.45): V2[] => {
    // 端の面 → 丸め → 側面（reach m まで）の順に、各断面と高さ y の交点をたどる
    const ordered = end === "front" ? [...st].reverse() : st
    const face = ordered[0]
    const out: V2[] = []
    const zFace = zOnSide(face.half, y) ?? 0
    out.push([face.x, 0], [face.x, zFace])
    for (const s of ordered.slice(1)) {
      if (Math.abs(s.x - face.x) > reach) break
      const z = zOnSide(s.half, y)
      if (z !== null) out.push([s.x, z])
    }
    return out
  }

  return { geometry, zAtY, endOutline }
}
