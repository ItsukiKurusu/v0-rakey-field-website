// 荒野の地面。道の近くは平らに、離れるほど起伏。表面は Poly Haven の赤い砂（色・法線・粗さ）。
// 地平線の山は実写の空（HDRI）に任せる。
import * as THREE from "three"
import type { SurfaceMaps } from "./assets"
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

/** 砂の模様1枚が覆う大きさ（m） */
const TILE = 5

export function createTerrain(road: Road, sand: SurfaceMaps) {
  const group = new THREE.Group()
  group.name = "terrain"
  const noise = valueNoise(7)
  const fbm = (x: number, z: number) =>
    noise(x * 0.008, z * 0.008) * 0.6 + noise(x * 0.03, z * 0.03) * 0.3 + noise(x * 0.12, z * 0.12) * 0.1

  const size = { x: 1900, z: 1500 }
  const geo = new THREE.PlaneGeometry(size.x, size.z, 220, 150)
  geo.rotateX(-Math.PI / 2)
  geo.translate(300, 0, 0)
  const pos = geo.attributes.position as THREE.BufferAttribute
  // 色むら（砂の色に掛ける。赤み・白っぽさの広い斑）
  const colors = new Float32Array(pos.count * 3)
  const tint = new THREE.Color()
  // 実写の砂は明るいので、夕方の赤茶の荒野に見えるよう暗めに掛ける
  const warm = new THREE.Color(0.62, 0.46, 0.38)
  const pale = new THREE.Color(0.78, 0.64, 0.55)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const dist = Math.abs(z - road.roadZ(x))
    const away = THREE.MathUtils.smoothstep(dist, 14, 140)
    // 道より少し下げておく（道の面とちらつかないように）
    pos.setY(i, away * (fbm(x, z) * 26 - 6) - 0.04)
    tint.lerpColors(warm, pale, noise(x * 0.02 + 11, z * 0.02))
    colors.set([tint.r, tint.g, tint.b], i * 3)
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
  geo.computeVertexNormals()

  // 砂のテクスチャは地面専用なので、そのまま地面の大きさぶん繰り返す（解放は assets 側）
  const { map, normalMap, armMap } = sand
  for (const t of [map, normalMap, armMap]) t.repeat.set(size.x / TILE, size.z / TILE)
  const groundMat = new THREE.MeshStandardMaterial({
    map,
    normalMap,
    roughnessMap: armMap,
    aoMap: armMap,
    aoMapIntensity: 0.6,
    vertexColors: true,
    roughness: 1,
    metalness: 0,
    normalScale: new THREE.Vector2(1.2, 1.2),
  })
  const ground = new THREE.Mesh(geo, groundMat)
  ground.receiveShadow = true
  ground.name = "ground"
  group.add(ground)

  return {
    group,
    dispose() {
      geo.dispose()
      groundMat.dispose()
    },
  }
}
