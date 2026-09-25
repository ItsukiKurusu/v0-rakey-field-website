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
 * ＋広い範囲の明るさ・色のむら。
 *
 * ざらつきと立体感：
 *   - 小石の土の高さマップで視差マッピング（覗き込む角度で凹凸がずれて見える）し、くぼみを暗くする
 *   - 法線は「小石の土（3.2m）」と「砂の細かい粒（1.1m）」の2枚を重ねる
 *   - 粗さは常に最大、空の映り込みは弱く（低い夕陽で地面がテカるとおもちゃっぽく見える）
 * テクスチャの座標は、地面の uv と同じ向き（x → u、z → -v）で世界座標から作る（色と凹凸の位置をそろえる）。
 */
function layeredGround(
  mat: THREE.MeshStandardMaterial,
  sand: SurfaceMaps,
  rocks: SurfaceMaps,
  noise: THREE.Texture,
  uvOrigin: THREE.Vector2,
) {
  noise.wrapS = noise.wrapT = THREE.RepeatWrapping
  const uniforms = {
    uRockMap: { value: rocks.map },
    uRockH: { value: rocks.heightMap ?? rocks.map },
    uSandNor: { value: sand.normalMap },
    uNoise: { value: noise },
    uOrigin: { value: uvOrigin },
    uDepth: { value: 0.055 }, // 視差の深さ（m）
  }
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWorldPos3;")
      .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWorldPos3 = (modelMatrix * vec4(transformed, 1.0)).xyz;")
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
varying vec3 vWorldPos3;
uniform sampler2D uRockMap;
uniform sampler2D uRockH;
uniform sampler2D uSandNor;
uniform sampler2D uNoise;
uniform vec2 uOrigin;
uniform float uDepth;
float gRock;
vec2 gWr;
// 世界座標 → 地面の uv と同じ向きのテクスチャ座標（tile m ごとに1枚）
vec2 groundUv(vec2 w, float tile) { return vec2(w.x - uOrigin.x, uOrigin.y - w.y) / tile; }`,
      )
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
{
  vec2 wp = vWorldPos3.xz;
  vec3 nA = texture2D(uNoise, wp / 160.0).rgb; // 大きな斑
  vec3 nB = texture2D(uNoise, wp / 37.0 + 0.31).rgb; // 中くらい
  vec3 nC = texture2D(uNoise, wp / 9.0 + 0.57).rgb;  // 小さい
  gRock = smoothstep(0.46, 0.58, nA.r * 0.6 + nB.g * 0.4);

  // 視差マッピング：視線に沿って高さマップの中へ潜り、見えている点をずらす（近くだけ）
  vec3 V = normalize(cameraPosition - vWorldPos3);
  float dist = length(cameraPosition - vWorldPos3);
  float depth = uDepth * (1.0 - smoothstep(25.0, 60.0, dist));
  vec2 stepW = V.xz / max(V.y, 0.25) * (depth / 8.0);
  gWr = wp;
  float layer = 0.0;
  float h = texture2D(uRockH, groundUv(gWr, 3.2)).r;
  for (int i = 0; i < 8; i++) {
    if (1.0 - h <= layer) break;
    gWr -= stepW;
    layer += 0.125;
    h = texture2D(uRockH, groundUv(gWr, 3.2)).r;
  }

  vec3 sandA = texture2D(map, vMapUv).rgb;
  vec3 sandB = texture2D(map, wp / 19.0).rgb; // 別の大きさで重ねて繰り返しを崩す
  vec3 sand = mix(sandA, sandB, 0.45);
  vec3 rock = texture2D(uRockMap, groundUv(gWr, 3.2)).rgb * vec3(0.95, 0.86, 0.74); // 黄みがかった明るい灰土
  // 砂地にも小石を混ぜる（まったくの無地に見えないように）
  sand = mix(sand, rock * vec3(1.0, 0.82, 0.7), 0.3);
  vec3 col = mix(sand, rock, gRock);
  // くぼみを暗く（粒の間の影）。小石の所ほど強く
  col *= mix(1.0, mix(0.55, 1.08, h), 0.45 + 0.55 * gRock);
  col *= mix(0.62, 1.22, smoothstep(0.3, 0.7, nB.b)); // 明るさのむら（中くらいの斑）
  col *= mix(0.82, 1.08, nC.r);                        // 細かいむら
  col = mix(col, col * vec3(1.12, 0.88, 0.74), smoothstep(0.35, 0.65, nA.g) * 0.7); // 赤みの斑
  col *= 1.0 - 0.28 * smoothstep(0.6, 0.72, nC.g) * (1.0 - gRock); // 暗いしみ（植物の跡・湿り）
  diffuseColor.rgb = col * diffuse * vColor.rgb;
}`,
      )
      // 法線：小石の土（視差でずらした位置）＋砂の細かい粒を重ねる
      .replace(
        "vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;",
        /* glsl */ `vec3 n1 = texture2D( normalMap, groundUv(gWr, 3.2) ).xyz * 2.0 - 1.0;
  vec3 n2 = texture2D( uSandNor, groundUv(vWorldPos3.xz, 1.1) ).xyz * 2.0 - 1.0;
  vec3 mapN = vec3( n1.xy * (0.8 + 0.9 * gRock) + n2.xy * 1.1, n1.z );`,
      )
      // 粗さは常に最大（地面は光らない）
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = 1.0;")
  }
  mat.customProgramCacheKey = () => "hero66-ground-v3"
}

/** 道の近く（カメラが寄る範囲）に重ねる、細かい網目の起伏の帯の設定 */
const BAND = { inner: 5.2, outer: 30, step: 0.8, stepMobile: 1.6 }

export function createTerrain(road: Road, sand: SurfaceMaps, rocks: SurfaceMaps, noiseTex: THREE.Texture, isMobile = false) {
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
  for (const t of [sand.normalMap, rocks.map, rocks.heightMap]) if (t) t.wrapS = t.wrapT = THREE.RepeatWrapping
  const groundMat = new THREE.MeshStandardMaterial({
    map: sand.map,
    normalMap: rocks.normalMap,
    vertexColors: true,
    roughness: 1,
    metalness: 0,
    normalScale: new THREE.Vector2(1.35, 1.35),
    envMapIntensity: 0.35, // 地面はほとんど映り込まない
  })
  // 地面の uv の原点（x0 → u = 0、z = z0 + size.z → v = 0）
  layeredGround(groundMat, sand, rocks, noiseTex, new THREE.Vector2(x0, z0 + size.z))
  const ground = new THREE.Mesh(geo, groundMat)
  ground.receiveShadow = true
  ground.name = "ground"
  group.add(ground)

  // ── 道の近くの起伏の帯：網目を細かくして、小さな盛り上がりとくぼみを本当の形で作る ──
  const bump = valueNoise(31)
  /** 道の中心からの距離 c での起伏（m）。路肩の近くは平らに、帯の外側で元の地面へ戻す */
  const bumpAt = (x: number, z: number, c: number) => {
    const ramp = THREE.MathUtils.smoothstep(c, 6, 9) * (1 - THREE.MathUtils.smoothstep(c, BAND.outer - 7, BAND.outer))
    const mounds = Math.max(0, bump(x / 2.4, z / 2.4) - 0.38) * 0.3 // なだらかな盛り上がり
    const grit = bump(x / 0.75 + 17, z / 0.75) * 0.05 // 細かいでこぼこ
    return ramp * (mounds + grit)
  }
  const step = isMobile ? BAND.stepMobile : BAND.step
  const across = Math.ceil((BAND.outer - BAND.inner) / step)
  const along = Math.ceil(road.length / step)
  const bPos: number[] = []
  const bUv: number[] = []
  const bCol: number[] = []
  const bIdx: number[] = []
  const f = { pos: new THREE.Vector3(), forward: new THREE.Vector3(), right: new THREE.Vector3() }
  for (const side of [-1, 1]) {
    const base = bPos.length / 3
    for (let k = 0; k <= along; k++) {
      road.frameAt(Math.min(road.length, k * step), f)
      for (let j = 0; j <= across; j++) {
        const c = BAND.inner + ((BAND.outer - BAND.inner) * j) / across
        const x = f.pos.x + f.right.x * c * side
        const z = f.pos.z + f.right.z * c * side
        // 元の地面より少し上（重なってちらつかないように）
        bPos.push(x, heightAt(x, z) + 0.014 + bumpAt(x, z, c), z)
        bUv.push((x - x0) / size.x, 1 - (z - z0) / size.z)
        tint.lerpColors(warm, pale, noise(x * 0.02 + 11, z * 0.02))
        bCol.push(tint.r, tint.g, tint.b)
      }
      if (k < along) {
        for (let j = 0; j < across; j++) {
          const a = base + k * (across + 1) + j
          const b = a + across + 1
          // 右側と左側で並びの向きが逆になるので、上向きになるよう入れ替える
          if (side > 0) bIdx.push(a, a + 1, b, a + 1, b + 1, b)
          else bIdx.push(a, b, a + 1, a + 1, b, b + 1)
        }
      }
    }
  }
  const bandGeo = new THREE.BufferGeometry()
  bandGeo.setAttribute("position", new THREE.Float32BufferAttribute(bPos, 3))
  bandGeo.setAttribute("uv", new THREE.Float32BufferAttribute(bUv, 2))
  bandGeo.setAttribute("color", new THREE.Float32BufferAttribute(bCol, 3))
  bandGeo.setIndex(bIdx)
  bandGeo.computeVertexNormals()
  const band = new THREE.Mesh(bandGeo, groundMat)
  band.receiveShadow = true
  band.name = "groundDetail"
  group.add(band)

  return {
    group,
    heightAt,
    /** 起伏の帯を含めた地面の高さ（沿道の物を置く用）。c は道の中心からの距離 */
    groundAt: (x: number, z: number, c: number) => heightAt(x, z) + (c > BAND.inner && c < BAND.outer ? 0.014 + bumpAt(x, z, c) : 0),
    dispose() {
      geo.dispose()
      bandGeo.dispose()
      groundMat.dispose()
    },
  }
}
