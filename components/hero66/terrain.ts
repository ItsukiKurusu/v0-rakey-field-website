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

/**
 * 地面の材質：赤い砂（大きさの違う2種類を重ねて繰り返しを消す）＋小石まじりの乾いた土（数十 m の斑で混ぜる）
 * ＋広い範囲の明るさ・色のむら。座標は世界座標の xz（m）で取るので、地面の大きさに依存しない。
 */
function layeredGround(mat: THREE.MeshStandardMaterial, rocks: SurfaceMaps, noise: THREE.Texture) {
  noise.wrapS = noise.wrapT = THREE.RepeatWrapping
  const uniforms = {
    uRockMap: { value: rocks.map },
    uNoise: { value: noise },
  }
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vWorldXZ;")
      .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWorldXZ = (modelMatrix * vec4(transformed, 1.0)).xz;")
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec2 vWorldXZ;\nuniform sampler2D uRockMap;\nuniform sampler2D uNoise;\nfloat gRock;",
      )
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
{
  vec2 wp = vWorldXZ;
  vec3 nA = texture2D(uNoise, wp / 160.0).rgb; // 大きな斑
  vec3 nB = texture2D(uNoise, wp / 37.0 + 0.31).rgb; // 中くらい
  vec3 nC = texture2D(uNoise, wp / 9.0 + 0.57).rgb;  // 小さい
  gRock = smoothstep(0.46, 0.58, nA.r * 0.6 + nB.g * 0.4);
  vec3 sandA = texture2D(map, vMapUv).rgb;
  vec3 sandB = texture2D(map, wp / 19.0).rgb; // 別の大きさで重ねて繰り返しを崩す
  vec3 sand = mix(sandA, sandB, 0.45);
  vec3 rock = texture2D(uRockMap, wp / 3.2).rgb * vec3(0.95, 0.86, 0.74); // 黄みがかった明るい灰土
  // 砂地にも小石を薄く混ぜる（まったくの無地に見えないように）
  sand = mix(sand, rock * vec3(1.0, 0.82, 0.7), 0.22);
  vec3 col = mix(sand, rock, gRock);
  col *= mix(0.62, 1.22, smoothstep(0.3, 0.7, nB.b)); // 明るさのむら（中くらいの斑）
  col *= mix(0.82, 1.08, nC.r);                        // 細かいむら
  col = mix(col, col * vec3(1.12, 0.88, 0.74), smoothstep(0.35, 0.65, nA.g) * 0.7); // 赤みの斑
  col *= 1.0 - 0.28 * smoothstep(0.6, 0.72, nC.g) * (1.0 - gRock); // 暗いしみ（植物の跡・湿り）
  diffuseColor.rgb = col * diffuse * vColor.rgb;
}`,
      )
      // 小石の所だけ凹凸を強く（砂地は穏やかに）
      .replace(
        "#include <normal_fragment_maps>",
        "#include <normal_fragment_maps>\nnormal = normalize(mix(nonPerturbedNormal, normal, 0.35 + 0.65 * gRock));",
      )
  }
  mat.customProgramCacheKey = () => "hero66-ground-v2"
}

export function createTerrain(road: Road, sand: SurfaceMaps, rocks: SurfaceMaps, noiseTex: THREE.Texture) {
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
  const warm = new THREE.Color(0.7, 0.5, 0.34)
  const pale = new THREE.Color(0.82, 0.66, 0.48)
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

  // 地面の高さ（格子の頂点から双線形で補間。メッシュの面とほぼ一致する）。沿道の物をこの上に置く
  const cols = 220
  const rows = 150
  const x0 = 300 - size.x / 2
  const z0 = -size.z / 2
  const heightAt = (x: number, z: number) => {
    const gx = THREE.MathUtils.clamp(((x - x0) / size.x) * cols, 0, cols - 1e-6)
    const gz = THREE.MathUtils.clamp(((z - z0) / size.z) * rows, 0, rows - 1e-6)
    const ix = Math.floor(gx)
    const iz = Math.floor(gz)
    const fx = gx - ix
    const fz = gz - iz
    const y = (cx: number, cz: number) => pos.getY(cz * (cols + 1) + cx)
    const a = y(ix, iz) + (y(ix + 1, iz) - y(ix, iz)) * fx
    const b = y(ix, iz + 1) + (y(ix + 1, iz + 1) - y(ix, iz + 1)) * fx
    return a + (b - a) * fz
  }

  // 色は砂（5m の模様）、凹凸は小石まじりの土（3.2m の模様）。解放は assets 側
  sand.map.repeat.set(size.x / TILE, size.z / TILE)
  rocks.normalMap.repeat.set(size.x / 3.2, size.z / 3.2)
  sand.armMap.repeat.set(size.x / TILE, size.z / TILE)
  const groundMat = new THREE.MeshStandardMaterial({
    map: sand.map,
    normalMap: rocks.normalMap,
    roughnessMap: sand.armMap,
    vertexColors: true,
    roughness: 1,
    metalness: 0,
    normalScale: new THREE.Vector2(1.1, 1.1),
  })
  layeredGround(groundMat, rocks, noiseTex)
  const ground = new THREE.Mesh(geo, groundMat)
  ground.receiveShadow = true
  ground.name = "ground"
  group.add(ground)

  return {
    group,
    heightAt,
    dispose() {
      geo.dispose()
      groundMat.dispose()
    },
  }
}
