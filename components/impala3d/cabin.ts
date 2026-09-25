// キャビン（ベルトラインより上：窓・ピラー・屋根）。
// 断面の右半分：ベルト → 側面（タンブルホーム）→ 屋根の縁の丸み → 屋根/ガラスの中心。
// 面の区画を (前後位置, 断面の番号) で決めて、ガラス・塗装・黒い縁などに塗り分ける。
// 前後端では車体の天面の曲線へ溶け込ませ、フロントガラスとリアガラスの付け根を車体に密着させる。
import * as THREE from "three"
import { lerp, pchip, resamplePolyline, sampleChain, smoothstep, type V2 } from "./math"
import { shoulderAt, topCurveRight } from "./body"
import { SPEC } from "./spec"

const CAB = SPEC.cabin
const prof = {
  H: pchip(CAB.topY),
  wTop: pchip(CAB.topW),
  crown: pchip(CAB.topCrown),
}

// 区間：ベルト→中腹 / 中腹→屋根の縁の下 / 縁の丸み / 屋根の外側 / 屋根の内側
const COUNTS = [5, 5, 4, 6, 5]
const SIDE_END = COUNTS[0] + COUNTS[1] // 側面の終わり（丸みの始まり）
const TOP_START = SIDE_END + COUNTS[2] // 屋根面の始まり
const HALF = COUNTS.reduce((a, b) => a + b, 0) + 1

export const CABIN_GROUPS = { paint: 0, glass: 1, black: 2, chrome: 3 } as const

function nominal(x: number): V2[] {
  const [wS, yS] = shoulderAt(x)
  const belt: V2 = [wS, yS - 0.006] // 車体の肩の稜線と同じ点
  const H = prof.H(x)
  const wTop = prof.wTop(x)
  const crown = prof.crown(x)
  const edgeY = H - crown
  const drop = Math.min(0.045, 0.3 * Math.max(0, edgeY - belt[1]))
  const Hs = edgeY - drop
  const keys: V2[] = [
    belt,
    [lerp(belt[0], wTop, 0.35) + 0.012, belt[1] + 0.45 * (Hs - belt[1])],
    [wTop + 0.008, Hs],
    [wTop - 0.045, H - crown * 0.78],
    [wTop * 0.5, H - crown * 0.25],
    [0, H],
  ]
  return sampleChain(keys, COUNTS)
}

/** 両端で車体の天面へ寄せた断面（右半分）。 */
function section(x: number): V2[] {
  const nom = nominal(x)
  const w =
    smoothstep(0, CAB.blend, CAB.start - x) * smoothstep(0, CAB.blend, x - CAB.end)
  if (w >= 1) return nom
  // 車体の天面の曲線を、キャビンの断面と同じ数の点に取り直す（わずかに浮かせて重なりのちらつきを防ぐ）
  const top = resamplePolyline(topCurveRight(x), nom.length)
  return nom.map((p, i): V2 => [lerp(top[i][0], p[0], w), lerp(top[i][1] + 0.002, p[1], w)])
}

function groupOf(x: number, col: number): number {
  const G = CABIN_GROUPS
  const inRange = (r: { front: number; rear: number }) => x < r.front && x > r.rear
  if (col < SIDE_END) {
    if (!inRange(CAB.sideGlass)) return G.paint // A ピラーの付け根・C ピラー（縁取りも付けない）
    if (col === 0) return G.black // ベルトのゴム
    if (col === SIDE_END - 1) return G.chrome // 窓枠の上のモール
    if (inRange(CAB.bPillar) || inRange(CAB.quarterDivider)) return G.black
    return G.glass
  }
  if (col < TOP_START) return G.paint // ピラー・屋根の縁
  const border = col === TOP_START // ガラスの周りの黒い縁（セラミックの黒）
  if (x > CAB.windshieldTop) {
    if (x > CAB.start - 0.05) return G.black // カウル
    if (border || x < CAB.windshieldTop + 0.035) return G.black
    return G.glass
  }
  if (x < CAB.rearGlassTop) {
    if (x < CAB.end + 0.03) return G.black
    if (border || x > CAB.rearGlassTop - 0.035) return G.black
    return G.glass
  }
  return G.paint
}

/** キャビン側面（ピラー・窓）の高さ y での z と、その点の傾き（タンブルホーム角）。 */
export function cabinSideAt(x: number, y: number): { z: number; tilt: number } {
  const half = section(x)
  for (let i = 0; i < SIDE_END; i++) {
    const [z0, y0] = half[i]
    const [z1, y1] = half[i + 1]
    if (y0 <= y && y1 >= y && y1 !== y0) {
      const t = (y - y0) / (y1 - y0)
      return { z: z0 + (z1 - z0) * t, tilt: Math.atan2(z0 - z1, y1 - y0) }
    }
  }
  return { z: half[SIDE_END][0], tilt: 0 }
}

/** 屋根・ガラス面の高さ（中心からの距離 z）。ワイパーなどを面に沿わせるのに使う。 */
export function cabinTopY(x: number, z: number): number {
  const half = section(x)
  for (let i = TOP_START; i < half.length - 1; i++) {
    const [z0, y0] = half[i]
    const [z1, y1] = half[i + 1]
    if (z0 >= z && z1 <= z) return y0 + ((y1 - y0) * (z - z0)) / (z1 - z0 || 1)
  }
  return half[half.length - 1][1]
}

export function buildCabin(): THREE.BufferGeometry {
  // 区画の境目に断面を置き、塗り分けの線をまっすぐにする
  const marks = [
    CAB.sideGlass.front, CAB.sideGlass.rear, CAB.bPillar.front, CAB.bPillar.rear,
    CAB.quarterDivider.front, CAB.quarterDivider.rear, CAB.windshieldTop, CAB.windshieldTop + 0.035,
    CAB.rearGlassTop, CAB.rearGlassTop - 0.035, CAB.start - 0.05, CAB.end + 0.03,
  ]
  const xs = new Set<number>()
  const n = Math.round((CAB.start - CAB.end) / 0.03)
  for (let k = 0; k <= n; k++) xs.add(CAB.end + ((CAB.start - CAB.end) * k) / n)
  for (const m of marks) xs.add(m)
  const stations = [...xs].sort((a, b) => a - b)

  const C = HALF * 2 - 1 // 開いた輪（右ベルト → 屋根 → 左ベルト）
  const pos: number[] = []
  for (const x of stations) {
    const half = section(x)
    const loop: V2[] = [...half, ...half.slice(0, -1).reverse().map(([z, y]): V2 => [-z, y])]
    for (const [z, y] of loop) pos.push(x, y, z)
  }

  const byGroup: number[][] = [[], [], [], []]
  const colOf = (c: number) => (c < HALF ? c : C - 1 - c) // 左半分は右の番号に読み替え
  for (let s = 0; s < stations.length - 1; s++) {
    const xm = (stations[s] + stations[s + 1]) / 2
    for (let c = 0; c < C - 1; c++) {
      const a = s * C + c
      const b = a + 1
      const d = a + C
      const e = d + 1
      // 右半分は外向きが (a,d,b)。左半分も同じ並びで外向きになる（輪の向きが連続しているため）
      const col = Math.min(colOf(c), colOf(c + 1))
      byGroup[groupOf(xm, col)].push(a, d, b, b, d, e)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
  const all: number[] = []
  byGroup.forEach((g, i) => {
    geometry.addGroup(all.length, g.length, i)
    all.push(...g)
  })
  geometry.setIndex(all)
  geometry.computeVertexNormals()
  return geometry
}
