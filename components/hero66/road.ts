// 道：平面形の曲線、進行度 → 走った距離、道の面（アスファルト・センターライン）。
import * as THREE from "three"
import { smoothstep } from "@/components/impala3d/math"
import type { SurfaceMaps } from "./assets"
import { DRIVE, ROAD } from "./constants"

export type RoadFrame = { pos: THREE.Vector3; forward: THREE.Vector3; right: THREE.Vector3 }

export function createRoad() {
  const curve = new THREE.CatmullRomCurve3(
    ROAD.points.map(([x, z]) => new THREE.Vector3(x, ROAD.y, z)),
    false,
    "centripetal",
  )
  curve.arcLengthDivisions = 4000
  const length = curve.getLength()

  // 車の出発点（x = 0）までの弧長
  const lengths = curve.getLengths(4000)
  let startS = 0
  for (let i = 0; i < lengths.length; i++) {
    const pt = curve.getPoint(i / 4000)
    if (pt.x >= 0) {
      startS = lengths[i]
      break
    }
  }

  // 進行度 → 走った距離。速さの台形（加速・巡航・減速）を数値積分しておく
  const N = 2000
  const table = new Float32Array(N + 1)
  const speed = (p: number) =>
    smoothstep(DRIVE.start, DRIVE.cruise, p) * (1 - smoothstep(DRIVE.brake, DRIVE.stop, p))
  for (let i = 1; i <= N; i++) {
    const p = i / N
    table[i] = table[i - 1] + (speed(p - 0.5 / N) * DRIVE.metersPerP) / N
  }
  const travelled = (p: number) => {
    const t = Math.min(1, Math.max(0, p)) * N
    const i = Math.floor(t)
    const j = Math.min(N, i + 1)
    return table[i] + (table[j] - table[i]) * (t - i)
  }
  const totalDrive = table[N]

  const up = new THREE.Vector3(0, 1, 0)
  /** 道の弧長 s での位置と向き */
  const frameAt = (s: number, out?: RoadFrame): RoadFrame => {
    const u = Math.min(1, Math.max(0, s / length))
    const f = out ?? { pos: new THREE.Vector3(), forward: new THREE.Vector3(), right: new THREE.Vector3() }
    curve.getPointAt(u, f.pos)
    curve.getTangentAt(u, f.forward)
    f.forward.y = 0
    f.forward.normalize()
    f.right.crossVectors(f.forward, up).normalize()
    return f
  }

  // 地形を道の近くで平らにするための、x → 道の中心の z
  const xs: number[] = []
  const zs: number[] = []
  for (let k = 0; k <= 600; k++) {
    const p = curve.getPointAt(k / 600)
    xs.push(p.x)
    zs.push(p.z)
  }
  const roadZ = (x: number) => {
    if (x <= xs[0]) return zs[0]
    if (x >= xs[xs.length - 1]) return zs[zs.length - 1]
    let lo = 0
    let hi = xs.length - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (xs[mid] > x) hi = mid
      else lo = mid
    }
    const w = (x - xs[lo]) / (xs[hi] - xs[lo] || 1)
    return zs[lo] + (zs[hi] - zs[lo]) * w
  }

  return {
    curve,
    length,
    startS,
    totalDrive,
    /** 進行度 p で車がいる弧長 */
    carS: (p: number) => startS + travelled(p),
    travelled,
    frameAt,
    roadZ,
  }
}

export type Road = ReturnType<typeof createRoad>

/**
 * 路面の上に重ねる線（横 = 道幅、縦 = 9m ぶん）。地は透明で、路肩の砂利・白い外側線・黄色の破線だけを描く。
 * アスファルトの質感は下の面（Poly Haven の asphalt_02）が受け持つ。
 */
function markingsTexture() {
  const c = document.createElement("canvas")
  c.width = 512
  c.height = 512
  const g = c.getContext("2d")!
  g.clearRect(0, 0, 512, 512)
  // 路肩の砂利（両端 12%）。内側の縁は少しぼかしてアスファルトへなじませる
  for (const [x0, dir] of [[0, 1], [512 - 61, -1]] as const) {
    const grad = g.createLinearGradient(dir > 0 ? x0 + 61 : x0, 0, dir > 0 ? x0 + 50 : x0 + 11, 0)
    grad.addColorStop(0, "rgba(120,96,72,0)")
    grad.addColorStop(1, "rgba(120,96,72,1)")
    g.fillStyle = "rgb(120,96,72)"
    g.fillRect(x0, 0, 61, 512)
    g.fillStyle = grad
    g.fillRect(dir > 0 ? x0 + 50 : x0, 0, 11, 512)
    for (let k = 0; k < 1100; k++) {
      g.fillStyle = `rgba(${150 + Math.random() * 60},${120 + Math.random() * 50},${90 + Math.random() * 40},0.7)`
      g.fillRect(x0 + Math.random() * 58 + (dir > 0 ? 0 : 3), Math.random() * 512, 2, 2)
    }
  }
  // 白い外側線（かすれ）
  g.fillStyle = "rgba(235,232,220,0.8)"
  g.fillRect(64, 0, 7, 512)
  g.fillRect(512 - 71, 0, 7, 512)
  // 黄色のセンターライン（破線：3m 引いて 6m 空ける）
  g.fillStyle = "rgba(236,176,38,0.92)"
  g.fillRect(252, 0, 8, 512 / 3)
  // 線のかすれ
  g.globalCompositeOperation = "destination-out"
  for (let k = 0; k < 500; k++) {
    g.fillStyle = `rgba(0,0,0,${Math.random() * 0.5})`
    g.fillRect(Math.random() * 512, Math.random() * 512, 3 + Math.random() * 6, 2)
  }
  g.globalCompositeOperation = "source-over"
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.wrapS = THREE.ClampToEdgeWrapping
  t.wrapT = THREE.RepeatWrapping
  t.anisotropy = 8
  return t
}

/** 道の面（全長を 1.5m 刻みの帯に）。下：アスファルト、上：線と路肩 */
export function createRoadMesh(road: Road, asphalt: SurfaceMaps) {
  const halfW = ROAD.width / 2 + 1.3 // 路肩の砂利まで
  const step = 1.5
  const n = Math.ceil(road.length / step)
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  const f = { pos: new THREE.Vector3(), forward: new THREE.Vector3(), right: new THREE.Vector3() }
  for (let k = 0; k <= n; k++) {
    const s = Math.min(road.length, k * step)
    road.frameAt(s, f)
    for (const side of [-1, 1]) {
      pos.push(f.pos.x + f.right.x * halfW * side, ROAD.y, f.pos.z + f.right.z * halfW * side)
      uv.push(side < 0 ? 0 : 1, s / 9)
    }
    if (k < n) {
      const a = k * 2
      // 左(-右ベクトル) → 右 の順に並ぶので、上向きの面は (a, a+1, a+2)
      idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()

  // アスファルトの模様1枚 = 2.5m 四方（横 11m・縦 9m の uv に合わせて繰り返す）
  for (const t of [asphalt.map, asphalt.normalMap, asphalt.armMap]) t.repeat.set((halfW * 2) / 2.5, 9 / 2.5)
  const baseMat = new THREE.MeshStandardMaterial({
    map: asphalt.map,
    normalMap: asphalt.normalMap,
    roughnessMap: asphalt.armMap,
    color: new THREE.Color(0.5, 0.49, 0.48), // 日に焼けた古いアスファルト
    roughness: 1,
    metalness: 0,
  })
  const base = new THREE.Mesh(g, baseMat)
  base.receiveShadow = true
  base.name = "road"

  const lines = markingsTexture()
  const lineMat = new THREE.MeshStandardMaterial({
    map: lines,
    transparent: true,
    roughness: 0.85,
    metalness: 0,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  })
  const overlay = new THREE.Mesh(g, lineMat)
  overlay.receiveShadow = true
  overlay.renderOrder = 1
  overlay.name = "roadMarkings"

  const mesh = new THREE.Group()
  mesh.add(base, overlay)
  return {
    mesh,
    dispose() {
      g.dispose()
      lines.dispose()
      baseMat.dispose()
      lineMat.dispose()
    },
  }
}
