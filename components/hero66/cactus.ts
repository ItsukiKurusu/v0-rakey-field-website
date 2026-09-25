// サボテンをコードで生やす。サグアロ（柱サボテン）は1本ずつ高さ・太さ・腕の数と位置・曲がり方・傾きが違う。
// ほかに樽形のバレルサボテン、平たい葉が連なるウチワサボテン。縦の稜（リブ）は頂点を半径方向に波打たせて作る。
import * as THREE from "three"
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js"

type Rand = () => number

/** 円柱状の形の頂点を、軸まわりの角度で波打たせて稜を作る（軸 = Y） */
function ribY(g: THREE.BufferGeometry, ribs: number, depth: number) {
  const p = g.attributes.position as THREE.BufferAttribute
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i)
    const z = p.getZ(i)
    const r = Math.hypot(x, z)
    if (r < 1e-5) continue
    const a = Math.atan2(z, x)
    const k = 1 + depth * Math.cos(a * ribs)
    p.setX(i, x * k)
    p.setZ(i, z * k)
  }
  return g
}

/** 曲線に沿った管に稜を付ける（管の周方向の番号から角度を出す） */
function ribbedTube(path: THREE.Curve<THREE.Vector3>, radius: (t: number) => number, ribs: number, depth: number) {
  const radial = 14
  const tubular = 18
  const g = new THREE.TubeGeometry(path, tubular, 1, radial, false)
  const p = g.attributes.position as THREE.BufferAttribute
  const n = g.attributes.normal as THREE.BufferAttribute
  const center = new THREE.Vector3()
  for (let i = 0; i < p.count; i++) {
    const ring = Math.floor(i / (radial + 1))
    const j = i % (radial + 1)
    const t = ring / tubular
    path.getPointAt(t, center)
    const a = (j / radial) * Math.PI * 2
    const r = radius(t) * (1 + depth * Math.cos(a * ribs))
    p.setXYZ(i, center.x + n.getX(i) * r, center.y + n.getY(i) * r, center.z + n.getZ(i) * r)
  }
  g.computeVertexNormals()
  return g
}

function cap(radius: number, at: THREE.Vector3, ribs: number) {
  const g = ribY(new THREE.SphereGeometry(radius, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2), ribs, 0.06)
  g.translate(at.x, at.y, at.z)
  return g
}

const flat = (gs: THREE.BufferGeometry[]) => {
  const m = mergeGeometries(gs.map((g) => (g.index ? g.toNonIndexed() : g)))!
  gs.forEach((g) => g.dispose())
  m.computeVertexNormals()
  return m
}

/** サグアロ1種類。底は y = 0 */
export function saguaro(r: Rand) {
  const H = 2.2 + r() * 3.4
  const R = 0.2 + r() * 0.13
  const ribs = 11 + Math.floor(r() * 5)
  const parts: THREE.BufferGeometry[] = []
  const trunk = ribY(new THREE.CylinderGeometry(R * 0.86, R, H, 18, 8), ribs, 0.07)
  trunk.translate(0, H / 2, 0)
  parts.push(trunk, cap(R * 0.86, new THREE.Vector3(0, H, 0), ribs))
  // 腕の数：0〜4（2本がいちばん多い）
  const roll = r()
  const arms = roll < 0.14 ? 0 : roll < 0.38 ? 1 : roll < 0.72 ? 2 : roll < 0.93 ? 3 : 4
  let az = r() * Math.PI * 2
  for (let k = 0; k < arms; k++) {
    az += (Math.PI * 2) / Math.max(arms, 2) + (r() - 0.5) * 1.2
    const h0 = H * (0.32 + r() * 0.38)
    const out = 0.28 + r() * 0.5
    const rise = Math.min(H - h0 - 0.15, 0.5 + r() * 1.8)
    const rr = R * (0.55 + r() * 0.2)
    const dir = new THREE.Vector3(Math.cos(az), 0, Math.sin(az))
    const droop = r() < 0.2 ? -0.15 : 0.05 // たまに少し垂れてから上がる
    const pts = [
      dir.clone().multiplyScalar(R * 0.4).setY(h0),
      dir.clone().multiplyScalar(R + out * 0.55).setY(h0 + droop),
      dir.clone().multiplyScalar(R + out).setY(h0 + 0.18 + droop),
      dir.clone().multiplyScalar(R + out * 1.04).setY(h0 + rise * 0.6),
      dir.clone().multiplyScalar(R + out * 1.02).setY(h0 + rise),
    ]
    const curve = new THREE.CatmullRomCurve3(pts, false, "centripetal")
    parts.push(ribbedTube(curve, (t) => rr * (1 - 0.12 * t), ribs - 3, 0.07))
    parts.push(cap(rr * 0.88, pts[pts.length - 1], ribs - 3))
  }
  const g = flat(parts)
  // ほんの少し傾ける
  g.rotateZ((r() - 0.5) * 0.08)
  g.rotateX((r() - 0.5) * 0.08)
  return g
}

/** バレルサボテン（1〜3個の塊） */
export function barrel(r: Rand) {
  const parts: THREE.BufferGeometry[] = []
  const n = 1 + Math.floor(r() * 3)
  for (let k = 0; k < n; k++) {
    const rad = 0.16 + r() * 0.14
    const g = ribY(new THREE.SphereGeometry(rad, 20, 10), 18 + Math.floor(r() * 6), 0.09)
    g.scale(1, 1.15 + r() * 0.35, 1)
    const a = r() * Math.PI * 2
    const d = k === 0 ? 0 : 0.25 + r() * 0.2
    g.translate(Math.cos(a) * d, rad * 0.9, Math.sin(a) * d)
    parts.push(g)
  }
  return flat(parts)
}

/** ウチワサボテン（平たい楕円の葉が枝分かれしながら連なる） */
export function pricklyPear(r: Rand) {
  const parts: THREE.BufferGeometry[] = []
  const grow = (x: number, y: number, z: number, yaw: number, tilt: number, depth: number) => {
    const w = 0.13 + r() * 0.06
    const h = 0.19 + r() * 0.08
    const pad = new THREE.SphereGeometry(1, 12, 8)
    pad.scale(w, h, 0.035)
    pad.rotateZ(tilt)
    pad.rotateY(yaw)
    const up = new THREE.Vector3(-Math.sin(tilt) * h, Math.cos(tilt) * h, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw)
    pad.translate(x + up.x, y + up.y, z + up.z)
    parts.push(pad)
    if (depth <= 0) return
    const kids = 1 + (r() < 0.5 ? 1 : 0)
    for (let k = 0; k < kids; k++) {
      grow(x + up.x * 2, y + up.y * 2 - 0.03, z + up.z * 2, yaw + (r() - 0.5) * 1.6, tilt + (r() - 0.5) * 1.1, depth - 1)
    }
  }
  const stems = 2 + Math.floor(r() * 2)
  for (let k = 0; k < stems; k++) grow((r() - 0.5) * 0.3, 0, (r() - 0.5) * 0.3, r() * Math.PI, (r() - 0.5) * 0.7, 2)
  return flat(parts)
}
