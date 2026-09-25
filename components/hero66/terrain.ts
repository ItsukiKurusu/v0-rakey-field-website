// 荒野の地面と、地平線のメサ（テーブル状の岩山）。
import * as THREE from "three"
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js"
import type { Road } from "./road"

/** 毎回同じ並びになる乱数（配置を固定するため） */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// 滑らかな値ノイズ（地面の起伏と色むら）
function valueNoise(seed: number) {
  const r = rng(seed)
  const perm = new Float32Array(512)
  for (let i = 0; i < 512; i++) perm[i] = r()
  const at = (ix: number, iz: number) => perm[((ix * 73856093) ^ (iz * 19349663)) & 511]
  return (x: number, z: number) => {
    const ix = Math.floor(x)
    const iz = Math.floor(z)
    const fx = x - ix
    const fz = z - iz
    const sx = fx * fx * (3 - 2 * fx)
    const sz = fz * fz * (3 - 2 * fz)
    const a = at(ix, iz)
    const b = at(ix + 1, iz)
    const c = at(ix, iz + 1)
    const d = at(ix + 1, iz + 1)
    return a + (b - a) * sx + (c - a) * sz + (a - b - c + d) * sx * sz
  }
}

export function createTerrain(road: Road) {
  const group = new THREE.Group()
  group.name = "terrain"
  const noise = valueNoise(7)
  const fbm = (x: number, z: number) =>
    noise(x * 0.008, z * 0.008) * 0.6 + noise(x * 0.03, z * 0.03) * 0.3 + noise(x * 0.12, z * 0.12) * 0.1

  // 地面：道に沿って長い板。道の近くは平ら、離れるほど起伏
  const size = { x: 1900, z: 1500 }
  const geo = new THREE.PlaneGeometry(size.x, size.z, 220, 150)
  geo.rotateX(-Math.PI / 2)
  geo.translate(300, 0, 0)
  const pos = geo.attributes.position as THREE.BufferAttribute
  const colors = new Float32Array(pos.count * 3)
  const sandA = new THREE.Color("#c4935f")
  const sandB = new THREE.Color("#9c6a44")
  const tmp = new THREE.Color()
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const dist = Math.abs(z - road.roadZ(x))
    const away = THREE.MathUtils.smoothstep(dist, 14, 140)
    // 道より少し下げておく（道の面とちらつかないように）
    pos.setY(i, away * (fbm(x, z) * 26 - 6) - 0.04)
    const n = noise(x * 0.05 + 11, z * 0.05)
    tmp.lerpColors(sandA, sandB, n * 0.8 + away * 0.2)
    colors.set([tmp.r, tmp.g, tmp.b], i * 3)
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
  geo.computeVertexNormals()
  const groundMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 })
  const ground = new THREE.Mesh(geo, groundMat)
  ground.receiveShadow = true
  ground.name = "ground"
  group.add(ground)

  // 地平線のメサ。霧で色が抜け、シルエットとして残る
  const r = rng(21)
  const mesaMat = new THREE.MeshStandardMaterial({ color: "#8b4a30", roughness: 1, flatShading: true })
  const mesaGeos: THREE.BufferGeometry[] = []
  for (let k = 0; k < 16; k++) {
    const top = 20 + r() * 50
    const g = new THREE.CylinderGeometry(top, top * (1.25 + r() * 0.35), 30 + r() * 70, 7 + Math.floor(r() * 3), 1)
    // 全周に並べる（後ろを振り返る場面でも地平線が寂しくならない）
    const angle = (k / 16) * Math.PI * 2 + (r() - 0.5) * 0.25
    const dist = 520 + r() * 200
    const x = 300 + Math.cos(angle) * dist * 1.3
    const z = Math.sin(angle) * dist
    const hgt = (g.parameters as { height: number }).height
    g.scale(1 + r() * 1.6, 1, 1)
    g.rotateY(r() * Math.PI)
    g.translate(x, hgt / 2 - 6, z)
    mesaGeos.push(g)
  }
  const mesaGeo = mergeGeometries(mesaGeos)!
  mesaGeos.forEach((g) => g.dispose())
  const mesas = new THREE.Mesh(mesaGeo, mesaMat)
  mesas.name = "mesas"
  group.add(mesas)

  return {
    group,
    dispose() {
      geo.dispose()
      groundMat.dispose()
      mesaGeo.dispose()
      mesaMat.dispose()
    },
  }
}
