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

/** 道の帯の片側の幅（m）。アスファルト 4.2m の外に路肩の土、その外で地面へ溶け込む */
const HALF = 8.8

/**
 * 路面の材質：アスファルト（ふちは波打つ）＋路肩の締まった土＋白線・黄色の破線（計算で描く）＋タイヤの通り道。
 * 帯の外側は、世界座標に貼りついたノイズで少しずつ抜いて地面へなじませる（画面の点滅が起きない）。
 */
function roadMaterial(asphalt: SurfaceMaps, shoulder: SurfaceMaps, noise: THREE.Texture) {
  noise.wrapS = noise.wrapT = THREE.RepeatWrapping
  // 凹凸はアスファルトの法線（模様1枚 = 2.5m 四方。帯の uv に合わせて繰り返す）
  asphalt.normalMap.repeat.set((HALF * 2) / 2.5, 9 / 2.5)
  const mat = new THREE.MeshStandardMaterial({
    map: asphalt.map,
    normalMap: asphalt.normalMap,
    roughness: 1,
    metalness: 0,
    transparent: true, // 外側のふちを地面へ溶かすため（道より上の物は不透明なので重なりの問題は出ない）
  })
  const uniforms = {
    uWidth: { value: HALF * 2 },
    uNoise: { value: noise },
    uShoulder: { value: shoulder.map },
    uAsphaltTint: { value: new THREE.Color(0.5, 0.49, 0.48) }, // 日に焼けた古いアスファルト
  }
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vRoadUv;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvRoadUv = uv;")
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec2 vRoadUv;
uniform float uWidth;
uniform sampler2D uNoise;
uniform sampler2D uShoulder;
uniform vec3 uAsphaltTint;
float rAsph;
float rTracks;`,
      )
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
{
  float c = (vRoadUv.x - 0.5) * uWidth; // 中心からの横位置（m、右が +）
  float s = vRoadUv.y * 9.0;            // 道に沿った距離（m）
  float ac = abs(c);
  vec3 nz = texture2D(uNoise, vec2(c * 0.07, s * 0.013)).rgb;
  // アスファルトのふち（波打つ）
  float edge = 4.2 + (nz.r - 0.5) * 0.8;
  rAsph = 1.0 - smoothstep(edge - 0.06, edge + 0.06, ac);
  vec3 asph = texture2D(map, vec2(c / 2.5, s / 2.5)).rgb * uAsphaltTint;
  asph *= mix(0.84, 1.06, nz.g); // 補修跡のむら
  // タイヤの通り道（各車線に2本）：黒ずんで少し滑らか
  rTracks = exp(-pow((ac - 1.2) / 0.32, 2.0)) + exp(-pow((ac - 2.9) / 0.32, 2.0));
  asph *= 1.0 - 0.2 * rTracks;
  // 線（かすれ付き）：白い外側線と、黄色の破線（3m 引いて 9m 空ける）
  float wear = smoothstep(0.3, 0.72, texture2D(uNoise, vec2(c * 1.9, s * 0.37)).b);
  float fw = fwidth(c) * 1.2;
  float white = (1.0 - smoothstep(0.065, 0.065 + fw, abs(ac - 3.95))) * wear;
  float dash = step(fract(s / 12.0), 0.25);
  float yellow = (1.0 - smoothstep(0.055, 0.055 + fw, ac)) * dash * wear;
  asph = mix(asph, vec3(0.74, 0.73, 0.69), white * 0.85);
  asph = mix(asph, vec3(0.82, 0.55, 0.12), yellow * 0.9);
  // 路肩の土
  vec3 dirt = texture2D(uShoulder, vec2(c / 2.2, s / 2.2)).rgb * vec3(0.86, 0.8, 0.74); // 灰色がかった締まった土
  dirt *= mix(0.8, 1.05, nz.b);
  diffuseColor.rgb = mix(dirt, asph, rAsph);
  // 外側は透明度でなめらかに地面へ（ふちは世界座標のノイズで波打たせる）
  float fade = 1.0 - smoothstep(5.4, 8.4, ac + (nz.g - 0.5) * 2.4);
  diffuseColor.a *= fade;
}`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        "#include <roughnessmap_fragment>\nroughnessFactor = mix(1.0, mix(0.9, 0.7, clamp(rTracks, 0.0, 1.0)), rAsph);",
      )
      .replace(
        "#include <normal_fragment_maps>",
        "#include <normal_fragment_maps>\nnormal = normalize(mix(nonPerturbedNormal, normal, 0.25 + 0.75 * rAsph));",
      )
  }
  mat.customProgramCacheKey = () => "hero66-road-v3"
  return mat
}

/** 道の帯（全長を 1.5m 刻みに）。路肩の土と、地面へ溶け込む外側まで含む */
export function createRoadMesh(road: Road, asphalt: SurfaceMaps, shoulder: SurfaceMaps, noise: THREE.Texture) {
  const step = 1.5
  const n = Math.ceil(road.length / step)
  const pos: number[] = []
  const uv: number[] = []
  const idx: number[] = []
  const f = { pos: new THREE.Vector3(), forward: new THREE.Vector3(), right: new THREE.Vector3() }
  const across = 6 // 横の分割（外側ほど地面の起伏に沿わせる）
  for (let k = 0; k <= n; k++) {
    const s = Math.min(road.length, k * step)
    road.frameAt(s, f)
    for (let j = 0; j <= across; j++) {
      const t = j / across
      const c = (t - 0.5) * 2 * HALF
      // 路肩の外は地面（道の近くは平ら）より少しだけ上に
      pos.push(f.pos.x + f.right.x * c, ROAD.y - Math.max(0, Math.abs(c) - 5) * 0.004, f.pos.z + f.right.z * c)
      uv.push(t, s / 9)
    }
    if (k < n) {
      const a = k * (across + 1)
      const b = a + across + 1
      for (let j = 0; j < across; j++) idx.push(a + j, a + j + 1, b + j, a + j + 1, b + j + 1, b + j)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  const mat = roadMaterial(asphalt, shoulder, noise)
  const mesh = new THREE.Mesh(g, mat)
  mesh.receiveShadow = true
  mesh.name = "road"
  return {
    mesh,
    dispose() {
      g.dispose()
      mat.dispose()
    },
  }
}
