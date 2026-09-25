// 外装・室内の部品。車体（body.ts）の輪郭をたどって、面にぴったり沿わせる。
import * as THREE from "three"
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js"
import type { BodyModel } from "./body"
import { cabinSideAt, cabinTopY } from "./cabin"
import type { ImpalaMaterials } from "./materials"
import type { V2 } from "./math"
import { SPEC } from "./spec"

type End = "front" | "rear"
const faceX = (end: End) => (end === "front" ? SPEC.frontFace : SPEC.rearFace)

// ── 平面形の折れ線のための道具 ────────────────────────────────

function arcLengths(pts: V2[]) {
  const acc = [0]
  for (let i = 1; i < pts.length; i++) {
    acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  }
  return acc
}

function pointAtS(pts: V2[], acc: number[], s: number): V2 {
  let i = 0
  while (i < pts.length - 2 && acc[i + 1] < s) i++
  const w = (s - acc[i]) / (acc[i + 1] - acc[i] || 1)
  return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * w, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * w]
}

/** 折れ線上で、ある量（z や奥行き）が初めて v に達する弧長。 */
function sWhere(pts: V2[], acc: number[], f: (p: V2) => number, v: number): number {
  for (let i = 0; i < pts.length - 1; i++) {
    const a = f(pts[i])
    const b = f(pts[i + 1])
    if ((a - v) * (b - v) <= 0 && a !== b) return acc[i] + ((acc[i + 1] - acc[i]) * (v - a)) / (b - a)
  }
  return acc[acc.length - 1]
}

/** 平面形の外向き法線（x,z）。折れ線は面の中心 → 側面の向き。 */
function outwardAt(pts: V2[], acc: number[], s: number, end: End): V2 {
  const ds = 0.004
  const a = pointAtS(pts, acc, Math.max(0, s - ds))
  const b = pointAtS(pts, acc, Math.min(acc[acc.length - 1], s + ds))
  const tx = b[0] - a[0]
  const tz = b[1] - a[1]
  const l = Math.hypot(tx, tz) || 1
  // 前：中心 → +z へ進むとき外向き = +x。後ろは逆
  return end === "front" ? [tz / l, -tx / l] : [-tz / l, tx / l]
}

/** 左右対称にする：z を反転し、三角形の向きも裏返す。 */
function mirrorZ(g: THREE.BufferGeometry) {
  const m = g.clone()
  m.scale(1, 1, -1)
  const idx = m.index
  if (idx) {
    const a = idx.array as Uint32Array | Uint16Array
    for (let i = 0; i < a.length; i += 3) [a[i + 1], a[i + 2]] = [a[i + 2], a[i + 1]]
    idx.needsUpdate = true
  }
  m.computeVertexNormals()
  return m
}

function meshPair(g: THREE.BufferGeometry, mat: THREE.Material, name: string) {
  const r = new THREE.Mesh(g, mat)
  const l = new THREE.Mesh(mirrorZ(g), mat)
  r.name = `${name}_R`
  l.name = `${name}_L`
  return [r, l]
}

// ── 端の面に沿う帯（ヘッドライト・テールランプ） ─────────────────

/**
 * 前後端の面に沿って、高さ y0〜y1 の帯を作る（右側のみ）。
 * from/to は折れ線上の範囲を返す関数（弧長）。offset だけ外へ浮かせる。
 */
function endStrip(
  body: BodyModel,
  end: End,
  y0: number,
  y1: number,
  from: (pts: V2[], acc: number[]) => number,
  to: (pts: V2[], acc: number[]) => number,
  offset: number,
  segments = 36,
) {
  const rows = [y0, (y0 + y1) / 2, y1]
  const pos: number[] = []
  const uv: number[] = []
  rows.forEach((y, r) => {
    const pts = body.endOutline(end, y, 0.6)
    const acc = arcLengths(pts)
    const sa = from(pts, acc)
    const sb = to(pts, acc)
    for (let k = 0; k <= segments; k++) {
      const s = sa + ((sb - sa) * k) / segments
      const [x, z] = pointAtS(pts, acc, s)
      const [nx, nz] = outwardAt(pts, acc, s, end)
      pos.push(x + nx * offset, y, z + nz * offset)
      uv.push(k / segments, r / (rows.length - 1))
    }
  })
  const idx: number[] = []
  const C = segments + 1
  for (let r = 0; r < rows.length - 1; r++) {
    for (let k = 0; k < segments; k++) {
      const a = r * C + k
      idx.push(a, a + 1, a + C, a + 1, a + C + 1, a + C)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

const zFrom = (z: number) => (pts: V2[], acc: number[]) => sWhere(pts, acc, (p) => p[1], z)
const depthTo = (end: End, depth: number) => (pts: V2[], acc: number[]) =>
  sWhere(pts, acc, (p) => Math.abs(p[0] - faceX(end)), depth)

function lamps(body: BodyModel, m: ImpalaMaterials) {
  const out: THREE.Object3D[] = []
  const H = SPEC.details.headlight
  const T = SPEC.details.taillight
  // ヘッドライト（クリア）→ 角から側面へ回り込むウインカー（アンバー）
  const bezel = endStrip(body, "front", H.y0 - 0.012, H.y1 + 0.01, zFrom(H.inner - 0.012), depthTo("front", H.sideReach + 0.012), 0.0025)
  // アンバーは回り込みの先端の amberLength だけ（実車では角に小さなくさび形で付く）
  const endS = depthTo("front", H.sideReach)
  const amberStart = (pts: V2[], acc: number[]) => endS(pts, acc) - H.amberLength
  const clear = endStrip(body, "front", H.y0, H.y1, zFrom(H.inner), (p, a) => amberStart(p, a) - 0.004, 0.005)
  const amber = endStrip(body, "front", H.y0, H.y1, amberStart, endS, 0.005)
  out.push(...meshPair(bezel, m.blackTrim, "headlightBezel"))
  out.push(...meshPair(clear, m.lensClear, "headlight"))
  out.push(...meshPair(amber, m.lensAmber, "turnSignal"))
  // テールランプ
  const tBezel = endStrip(body, "rear", T.y0 - 0.012, T.y1 + 0.01, zFrom(T.inner - 0.012), depthTo("rear", T.sideReach + 0.012), 0.0025)
  const tail = endStrip(body, "rear", T.y0, T.y1, zFrom(T.inner), depthTo("rear", T.sideReach), 0.005)
  out.push(...meshPair(tBezel, m.blackTrim, "taillightBezel"))
  out.push(...meshPair(tail, m.taillight, "taillight"))
  return out
}

// ── バンパー（断面を平面形に沿って掃引） ───────────────────────

/**
 * 断面 profile（外への張り出し d, 高さ y）を、端の平面形（高さ yRef）に沿って左右一続きに掃引する。
 * 断面は閉じた輪。両端は平らな蓋で閉じる。
 */
function sweepBumper(body: BodyModel, end: End, yRef: number, reach: number, profile: V2[]) {
  const raw = body.endOutline(end, yRef, reach + 0.02)
  const accRaw = arcLengths(raw)
  const sEnd = sWhere(raw, accRaw, (p) => Math.abs(p[0] - faceX(end)), reach)
  const n = 56
  const right: Array<{ p: V2; nrm: V2 }> = []
  for (let k = 0; k <= n; k++) {
    const s = (sEnd * k) / n
    right.push({ p: pointAtS(raw, accRaw, s), nrm: outwardAt(raw, accRaw, s, end) })
  }
  // 左端 → 中心 → 右端
  const path = [
    ...right.slice(1).reverse().map(({ p, nrm }) => ({ p: [p[0], -p[1]] as V2, nrm: [nrm[0], -nrm[1]] as V2 })),
    ...right,
  ]
  const P = profile.length
  const pos: number[] = []
  // 張り出しの効き：正面では全量、側面へ回るほど薄く、端では車体の側面に溶け込ませる
  const accPath = arcLengths(path.map(({ p }) => p))
  const total = accPath[accPath.length - 1]
  const place = (i: number, d: number, y: number): [number, number, number] => {
    const { p, nrm } = path[i]
    const toEnd = Math.min(accPath[i], total - accPath[i])
    const sideness = nrm[1] * nrm[1]
    const k = (1 - 0.7 * sideness) * Math.min(1, 0.15 + toEnd / 0.3)
    const dd = d > 0 ? d * k : d
    return [p[0] + nrm[0] * dd, y, p[1] + nrm[1] * dd]
  }
  path.forEach((_, i) => {
    for (const [d, y] of profile) pos.push(...place(i, d, y))
  })
  const idx: number[] = []
  for (let i = 0; i < path.length - 1; i++) {
    for (let j = 0; j < P; j++) {
      const a = i * P + j
      const b = i * P + ((j + 1) % P)
      const c = a + P
      const d = b + P
      idx.push(a, b, c, b, d, c)
    }
  }
  // 両端の蓋
  const tris = THREE.ShapeUtils.triangulateShape(profile.map(([d, y]) => new THREE.Vector2(d, y)), [])
  for (const i of [0, path.length - 1]) {
    const base = pos.length / 3
    for (const [d, y] of profile) pos.push(...place(i, d, y))
    for (const [a, b, c] of tris) idx.push(base + a, base + b, base + c)
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

// 前バンパー：上は丸い大きな帯、下に細い溝が2本、いちばん下は奥まったスカート。
// 形は 0.17〜0.505 で描き、実車の写真に合わせて下端を y0 まで持ち上げる
const FRONT_BUMPER: V2[] = (
  [
    [-0.04, 0.17], [0.018, 0.172], [0.036, 0.186], [0.046, 0.215], [0.048, 0.238], [0.04, 0.246],
    [0.052, 0.256], [0.06, 0.29], [0.062, 0.305], [0.052, 0.313], [0.064, 0.322], [0.07, 0.36],
    [0.075, 0.41], [0.075, 0.44], [0.07, 0.468], [0.058, 0.488], [0.036, 0.5], [0.0, 0.505],
    [-0.04, 0.498], [-0.05, 0.4], [-0.05, 0.22],
  ] as V2[]
).map(([d, y]): V2 => {
  const { y0, y1 } = SPEC.details.frontBumper
  return [d, y0 + ((y - 0.17) * (y1 - y0)) / (0.505 - 0.17)]
})
// 後ろバンパー：同じ造形を高い位置に
const REAR_BUMPER: V2[] = [
  [-0.04, 0.22], [0.02, 0.222], [0.04, 0.24], [0.05, 0.272], [0.052, 0.29], [0.043, 0.298],
  [0.056, 0.31], [0.064, 0.36], [0.066, 0.38], [0.056, 0.388], [0.068, 0.398], [0.074, 0.45],
  [0.078, 0.52], [0.078, 0.555], [0.072, 0.58], [0.058, 0.598], [0.034, 0.608], [0.0, 0.612],
  [-0.04, 0.605], [-0.05, 0.5], [-0.05, 0.26],
]

function bumpers(body: BodyModel, m: ImpalaMaterials) {
  const F = SPEC.details.frontBumper
  const R = SPEC.details.rearBumper
  const front = new THREE.Mesh(sweepBumper(body, "front", 0.45, F.reach, FRONT_BUMPER), m.paintPlain)
  const rear = new THREE.Mesh(sweepBumper(body, "rear", 0.5, R.reach, REAR_BUMPER), m.paintPlain)
  front.name = "frontBumper"
  rear.name = "rearBumper"
  return [front, rear]
}

// ── グリル・エンブレム・ナンバー ───────────────────────────────

function bowtieShape(scale = 1) {
  const pts: V2[] = [
    [-0.056, 0.01], [-0.018, 0.01], [-0.013, 0.017], [0.018, 0.017], [0.018, 0.01], [0.056, 0.01],
    [0.05, -0.01], [0.018, -0.01], [0.013, -0.017], [-0.018, -0.017], [-0.018, -0.01], [-0.05, -0.01],
  ]
  return new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x * scale, y * scale)))
}

/** 平面の部品を、端の面（x = face）に向けて置く。 */
function onFace<T extends THREE.Object3D>(o: T, end: End, x: number, y: number, z = 0): T {
  o.rotation.y = end === "front" ? Math.PI / 2 : -Math.PI / 2
  o.position.set(x, y, z)
  return o
}

function grille(m: ImpalaMaterials) {
  const G = SPEC.details.grille
  const fx = SPEC.frontFace
  const h = G.y1 - G.y0
  const yc = (G.y0 + G.y1) / 2
  const out: THREE.Object3D[] = []

  // 奥の網
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(G.halfW * 2, h), m.grilleMesh)
  out.push(onFace(mesh, "front", fx + 0.002, yc))

  // ボディ色の枠（外周を少し広げた四角から、網の四角を抜く）
  const frame = new THREE.Shape()
  const o = { w: G.halfW + 0.02, b: -h / 2 - 0.014, t: h / 2 + 0.012 }
  frame.moveTo(-o.w, o.b)
  frame.lineTo(o.w, o.b)
  frame.lineTo(o.w, o.t)
  frame.lineTo(-o.w, o.t)
  frame.closePath()
  const hole = new THREE.Path()
  hole.moveTo(-G.halfW, -h / 2)
  hole.lineTo(-G.halfW, h / 2)
  hole.lineTo(G.halfW, h / 2)
  hole.lineTo(G.halfW, -h / 2)
  hole.closePath()
  frame.holes.push(hole)
  const frameGeo = new THREE.ExtrudeGeometry(frame, {
    depth: 0.01, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 2,
  })
  out.push(onFace(new THREE.Mesh(frameGeo, m.paintPlain), "front", fx - 0.004, yc))

  // 真ん中の横桟（ボディ色）
  const bar = new THREE.Mesh(new RoundedBoxGeometry(G.halfW * 2, 0.013, 0.018, 2, 0.005), m.paintPlain)
  out.push(onFace(bar, "front", fx + 0.006, yc))

  // 蝶ネクタイ（ゴールド）
  const tie = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bowtieShape(1), { depth: 0.006, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.0015, bevelSegments: 1 }),
    m.gold,
  )
  out.push(onFace(tie, "front", fx + 0.014, yc))
  return out
}

function rearBadgeAndPlates(m: ImpalaMaterials) {
  const out: THREE.Object3D[] = []
  const tie = new THREE.Mesh(
    new THREE.ExtrudeGeometry(bowtieShape(0.9), { depth: 0.005, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.0015, bevelSegments: 1 }),
    m.gold,
  )
  out.push(onFace(tie, "rear", SPEC.rearFace - 0.004, 0.765))

  const plateGeo = new THREE.PlaneGeometry(0.33, 0.165)
  // バンパーの面（断面の張り出し）から 4mm 浮かせる
  out.push(onFace(new THREE.Mesh(plateGeo, m.plate), "front", SPEC.frontFace + 0.071, 0.34))
  out.push(onFace(new THREE.Mesh(plateGeo, m.plate), "rear", SPEC.rearFace - 0.078, 0.445))
  return out
}

// ── 側面の小物 ────────────────────────────────────────────────

function sideDetails(body: BodyModel, m: ImpalaMaterials) {
  const D = SPEC.details
  const out: THREE.Object3D[] = []
  const bothSides = (make: (side: 1 | -1) => THREE.Object3D) => out.push(make(1), make(-1))

  // ドアミラー（ボディ色の卵形＋根元＋鏡面）
  bothSides((side) => {
    const g = new THREE.Group()
    const zDoor = body.zAtY(D.mirrorX, 0.89)
    const pod = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), m.paintPlain)
    pod.scale.set(0.1, 0.064, 0.06)
    pod.position.set(D.mirrorX - 0.03, 0.96, zDoor + 0.085)
    const stalk = new THREE.Mesh(new RoundedBoxGeometry(0.08, 0.035, 0.06, 2, 0.012), m.paintPlain)
    stalk.position.set(D.mirrorX + 0.01, 0.925, zDoor + 0.03)
    const glass = new THREE.Mesh(new THREE.CircleGeometry(1, 24), m.chrome)
    glass.scale.set(0.05, 0.046, 1)
    glass.rotation.y = -Math.PI / 2
    glass.position.set(D.mirrorX - 0.125, 0.96, zDoor + 0.085)
    g.add(pod, stalk, glass)
    if (side < 0) g.scale.z = -1
    return g
  })

  // ドアハンドル
  for (const x of D.doorHandleX) {
    bothSides((side) => {
      const h = new THREE.Mesh(new RoundedBoxGeometry(0.12, 0.024, 0.012, 2, 0.004), m.chromeSatin)
      h.position.set(x, D.doorHandleY, side * (body.zAtY(x, D.doorHandleY) + 0.003))
      return h
    })
  }

  // 「Impala SS」のスクリプト（リアフェンダー）
  bothSides((side) => {
    const x = -1.64
    const y = 0.845
    const d = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.115), m.scriptDecal)
    d.position.set(x, y, side * (body.zAtY(x, y) + 0.0015))
    if (side < 0) d.rotation.y = Math.PI
    return d
  })

  // 跳ねるインパラのエンブレム（Cピラー）
  bothSides((side) => {
    const x = -1.62
    const y = 1.03
    const { z, tilt } = cabinSideAt(x, y)
    const e = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.06), m.emblem)
    e.position.set(x, y, side * (z + 0.002))
    // 面の傾き（上へ行くほど内側へ倒れる）に合わせる。左右とも X の回転は -tilt
    e.rotation.set(-tilt, side < 0 ? Math.PI : 0, 0, "YXZ")
    return e
  })

  return out
}

function wipers(m: ImpalaMaterials) {
  const out: THREE.Object3D[] = []
  const x = SPEC.cabin.start - 0.075
  for (const [z0, z1] of [[-0.64, -0.08], [0.0, 0.56]]) {
    const len = z1 - z0
    const zc = (z0 + z1) / 2
    const w = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.012, len), m.blackTrim)
    w.position.set(x, cabinTopY(x, Math.abs(zc)) + 0.012, zc)
    w.rotation.x = 0.04
    out.push(w)
  }
  return out
}

function exhausts(m: ImpalaMaterials) {
  const out: THREE.Object3D[] = []
  for (const z of [-0.52, 0.52]) {
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.14, 24, 1, true), m.chrome)
    tip.rotation.z = Math.PI / 2
    tip.position.set(SPEC.rearBumperTip - 0.01, 0.2, z)
    const inner = new THREE.Mesh(new THREE.CircleGeometry(0.033, 20), m.liner)
    inner.rotation.y = -Math.PI / 2
    inner.position.set(SPEC.rearBumperTip - 0.05, 0.2, z)
    out.push(tip, inner)
  }
  return out
}

/** タイヤハウスの内張り（黒）。アーチの内側と、車体の内側の壁。 */
function wheelWells(m: ImpalaMaterials) {
  const out: THREE.Object3D[] = []
  const { radius, centerY } = SPEC.arch
  const r = radius - 0.008
  const zIn = SPEC.wheel.z - 0.2
  const zOut = SPEC.wheel.z + 0.12 // 車体の側面（アーチの折れ込みの内側）より外へ出さない
  for (const xa of [SPEC.wheel.x, -SPEC.wheel.x]) {
    const pos: number[] = []
    const idx: number[] = []
    const n = 40
    for (let k = 0; k <= n; k++) {
      const a = -0.35 + ((Math.PI + 0.7) * k) / n
      const x = xa + r * Math.cos(a)
      const y = Math.max(0.12, centerY + r * Math.sin(a))
      pos.push(x, y, zIn, x, y, zOut)
      if (k < n) idx.push(2 * k, 2 * k + 1, 2 * k + 2, 2 * k + 1, 2 * k + 3, 2 * k + 2)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
    g.setIndex(idx)
    g.computeVertexNormals()
    out.push(...meshPair(g, m.liner, "wheelWell"))
    // 内側の壁（半円の板）
    const wall = new THREE.Mesh(new THREE.CircleGeometry(r, 32, -0.35, Math.PI + 0.7), m.liner)
    wall.position.set(xa, centerY, zIn)
    const wallL = wall.clone()
    wallL.position.z = -zIn
    out.push(wall, wallL)
  }
  return out
}

function interior(m: ImpalaMaterials) {
  const g = new THREE.Group()
  g.name = "interior"
  const box = (w: number, h: number, d: number, r = 0.04) => new RoundedBoxGeometry(w, h, d, 3, r)
  // 前席（バケット×2）
  for (const z of [-0.4, 0.4]) {
    const cushion = new THREE.Mesh(box(0.5, 0.12, 0.5), m.seat)
    cushion.position.set(-0.42, 0.52, z)
    const back = new THREE.Mesh(box(0.13, 0.62, 0.5), m.seat)
    back.position.set(-0.72, 0.84, z)
    back.rotation.z = 0.2
    const head = new THREE.Mesh(box(0.1, 0.16, 0.26, 0.035), m.seat)
    head.position.set(-0.8, 1.2, z)
    head.rotation.z = 0.2
    g.add(cushion, back, head)
  }
  const console_ = new THREE.Mesh(box(0.7, 0.14, 0.24), m.interior)
  console_.position.set(-0.25, 0.5, 0)
  // 後席（ベンチ）
  const rearCushion = new THREE.Mesh(box(0.52, 0.13, 1.45), m.seat)
  rearCushion.position.set(-1.28, 0.52, 0)
  const rearBack = new THREE.Mesh(box(0.13, 0.55, 1.45), m.seat)
  rearBack.position.set(-1.56, 0.83, 0)
  rearBack.rotation.z = 0.3
  // ダッシュボードとハンドル（左ハンドル：運転席は -Z 側）
  const dash = new THREE.Mesh(box(0.42, 0.16, 1.62, 0.05), m.interior)
  dash.position.set(0.5, 0.86, 0)
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.017, 10, 40), m.blackTrim)
  wheel.position.set(0.16, 0.92, -0.4)
  wheel.rotation.set(0, Math.PI / 2, 0)
  wheel.rotateX(0.45)
  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.34, 12), m.blackTrim)
  column.position.set(0.3, 0.86, -0.4)
  column.rotation.z = Math.PI / 2 + 0.45
  g.add(console_, rearCushion, rearBack, dash, wheel, column)
  return g
}

export function buildParts(body: BodyModel, m: ImpalaMaterials) {
  return [
    ...lamps(body, m),
    ...bumpers(body, m),
    ...grille(m),
    ...rearBadgeAndPlates(m),
    ...sideDetails(body, m),
    ...wipers(m),
    ...exhausts(m),
    ...wheelWells(m),
    interior(m),
  ]
}
