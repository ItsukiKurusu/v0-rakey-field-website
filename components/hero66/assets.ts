// ヒーローの実写素材（Poly Haven・CC0）を読み込む。変換は scripts/bake-hero-assets.mjs。
//   空の帯（JPEG）… x/(1+x) を 2.2 乗根で 8bit にしたもの。シェーダーで元の明るさへ戻す
//   映り込み（.hdr 256x128）… PMREM にしてから使う
import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { HDRLoader } from "three/addons/loaders/HDRLoader.js"
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js"
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js"
import { createGarageModel, type GarageModel } from "@/components/garage3d/createGarage"

const BASE = "/hero66/"

type SkyMeta = {
  band: string
  env: string
  sunElevation: number
  sunAzimuth: number
  horizon: [number, number, number]
  bandLow: number
  bandHigh: number
}
type SurfaceMeta = { diff: string; arm: string; nor: string }
type Meta = {
  sky: { sunset: SkyMeta; dusk: SkyMeta }
  ground: SurfaceMeta
  road: SurfaceMeta
  groundRocks: SurfaceMeta
  shoulder: SurfaceMeta
  concrete: SurfaceMeta
  noise: string
  foliage: { grass: string; grassAlpha: string; shrub: string }
  rock: string
}
export type Prop = { geometry: THREE.BufferGeometry; material: THREE.Material }

export type SurfaceMaps = { map: THREE.Texture; normalMap: THREE.Texture; armMap: THREE.Texture }
export type SkyAsset = SkyMeta & { bandTex: THREE.Texture; envTex: THREE.Texture }

export type HeroAssets = {
  sky: { sunset: SkyAsset; dusk: SkyAsset }
  ground: SurfaceMaps
  road: SurfaceMaps
  /** 地面の2層目（小石まじりの乾いた土） */
  groundRocks: SurfaceMaps
  /** 路肩の締まった土 */
  shoulder: SurfaceMaps
  /** ガレージ前のひび割れたコンクリート */
  concrete: SurfaceMaps
  /** むら用のノイズ（R/G/B に周波数の違う繰り返しノイズ） */
  noise: THREE.Texture
  rock: Prop
  /** 草むら（形の違う数種類） */
  grass: Prop[]
  shrub: Prop
  /** 終点の実店舗のガレージ（写真から起こしたモデル） */
  garage: GarageModel
  dispose: () => void
}

/**
 * 圧縮（meshopt の量子化）された頂点を、ふつうの小数に戻した複製を返す。
 * 量子化された属性は -1..1 の整数で持っているので、そのまま拡大の行列を掛けると -1..1 に切り詰められる
 * （低木が 1m 四方の箱に押し込まれて葉が消え、岩の形も崩れていた）。
 */
function dequantized(src: THREE.BufferGeometry, matrix: THREE.Matrix4) {
  const g = new THREE.BufferGeometry()
  for (const [name, a] of Object.entries(src.attributes)) {
    const attr = a as THREE.BufferAttribute
    const out = new Float32Array(attr.count * attr.itemSize)
    for (let i = 0; i < attr.count; i++) {
      for (let c = 0; c < attr.itemSize; c++) out[i * attr.itemSize + c] = attr.getComponent(i, c)
    }
    g.setAttribute(name, new THREE.BufferAttribute(out, attr.itemSize))
  }
  if (src.index) g.setIndex(src.index.clone())
  g.applyMatrix4(matrix)
  return g
}

export async function loadHeroAssets(
  renderer: THREE.WebGLRenderer,
  onProgress?: (fraction: number) => void,
): Promise<HeroAssets> {
  const meta: Meta = await fetch(BASE + "meta.json").then((r) => r.json())
  const manager = new THREE.LoadingManager()
  manager.onProgress = (_url, loaded, total) => onProgress?.(loaded / total)
  const texLoader = new THREE.TextureLoader(manager)
  const hdrLoader = new HDRLoader(manager)
  const gltfLoader = new GLTFLoader(manager).setMeshoptDecoder(MeshoptDecoder)
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy())

  const loadTex = (file: string, color: boolean) =>
    texLoader.loadAsync(BASE + file).then((t) => {
      t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.anisotropy = aniso
      return t
    })

  const loadBand = (file: string) =>
    texLoader.loadAsync(BASE + file).then((t) => {
      // 明るさを符号化した値なので色空間の変換はしない。帯は拡大して使うのでミップマップ不要
      // （ミップマップがあると、横の継ぎ目で縦に筋が出る）
      t.colorSpace = THREE.NoColorSpace
      t.wrapS = THREE.RepeatWrapping
      t.wrapT = THREE.ClampToEdgeWrapping
      t.generateMipmaps = false
      t.minFilter = THREE.LinearFilter
      return t
    })

  const loadSky = async (m: SkyMeta): Promise<SkyAsset> => {
    const [bandTex, envTex] = await Promise.all([loadBand(m.band), hdrLoader.loadAsync(BASE + m.env)])
    envTex.mapping = THREE.EquirectangularReflectionMapping
    return { ...m, bandTex, envTex }
  }

  const loadSurface = async (s: SurfaceMeta): Promise<SurfaceMaps> => {
    const [map, normalMap, armMap] = await Promise.all([loadTex(s.diff, true), loadTex(s.nor, false), loadTex(s.arm, false)])
    return { map, normalMap, armMap }
  }

  const [sunset, dusk, ground, road, groundRocks, shoulder, concrete, noise, rockGltf, grassGltf, grassAlpha, shrubGltf] =
    await Promise.all([
      loadSky(meta.sky.sunset),
      loadSky(meta.sky.dusk),
      loadSurface(meta.ground),
      loadSurface(meta.road),
      loadSurface(meta.groundRocks),
      loadSurface(meta.shoulder),
      loadSurface(meta.concrete),
      loadTex(meta.noise, false),
      gltfLoader.loadAsync(BASE + meta.rock),
      gltfLoader.loadAsync(BASE + meta.foliage.grass),
      loadTex(meta.foliage.grassAlpha, false),
      gltfLoader.loadAsync(BASE + meta.foliage.shrub),
    ])
  // ガレージの前の土間は、ひび割れたコンクリートの実写で
  const garage = await createGarageModel({ concrete })

  /** glTF の中のメッシュを、それぞれ「地面に底をそろえた形」にして取り出す */
  const meshesOf = (root: THREE.Object3D) => {
    const out: THREE.Mesh[] = []
    root.updateWorldMatrix(true, true)
    root.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) out.push(o as THREE.Mesh)
    })
    return out
  }
  const grassMat = (meshesOf(grassGltf.scene)[0].material as THREE.MeshStandardMaterial).clone()
  // 透明は別の画像（明るさから作った）で。半透明の重ね描きは重いので切り抜きにする。
  // glTF の中の画像は上下を反転しない決まりなので、別に読んだ透明の画像も同じ向きにそろえる
  grassAlpha.flipY = false
  grassAlpha.needsUpdate = true
  grassMat.alphaMap = grassAlpha
  grassMat.alphaTest = 0.45
  grassMat.transparent = false
  grassMat.side = THREE.DoubleSide
  grassMat.color.set("#f3dfa6") // 乾いた麦わら色へ寄せる
  // 葉の画像は細い葉がまばらに並ぶので、板1枚に横へ 2.5 回繰り返して株を濃くする
  for (const t of [grassMat.map, grassAlpha]) if (t) t.wrapS = THREE.RepeatWrapping
  // 草むらは「十字に組んだ板3枚」に葉の画像を貼る（1株 6 三角形）。
  // 元のモデル（1株 約 470 三角形）のままでは、沿道に数千株も置けないため。uv の範囲を変えて2種類
  const tuft = (u0: number, u1: number, w: number, h: number) => {
    const pos: number[] = []
    const nor: number[] = []
    const uv: number[] = []
    const idx: number[] = []
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI
      const cx = Math.cos(a) * (w / 2)
      const cz = Math.sin(a) * (w / 2)
      const base = pos.length / 3
      pos.push(-cx, 0, -cz, cx, 0, cz, cx, h, cz, -cx, h, -cz)
      // 法線は上向き寄り（板の向きで明暗が出すぎないように）
      for (let v = 0; v < 4; v++) nor.push(0, 1, 0)
      uv.push(u0, 0, u1, 0, u1, 1, u0, 1)
      idx.push(base, base + 1, base + 2, base, base + 2, base + 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3))
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2))
    g.setIndex(idx)
    return g
  }
  const grass: Prop[] = [
    { geometry: tuft(0, 2.5, 0.8, 0.55), material: grassMat },
    { geometry: tuft(0.3, 2.0, 0.55, 0.42), material: grassMat },
  ]
  const shrubMeshes = meshesOf(shrubGltf.scene)
  const shrubGeo = mergeGeometries(shrubMeshes.map((m) => {
    const g = dequantized(m.geometry, m.matrixWorld)
    for (const k of Object.keys(g.attributes)) if (!["position", "normal", "uv"].includes(k)) g.deleteAttribute(k)
    return g
  }))!
  shrubGeo.computeBoundingBox()
  shrubGeo.translate(0, -shrubGeo.boundingBox!.min.y, 0)
  const shrubMat = shrubMeshes[0].material as THREE.MeshStandardMaterial
  shrubMat.color.set("#b7aa8c") // 砂ぼこりをかぶった灰緑
  const shrub: Prop = { geometry: shrubGeo, material: shrubMat }

  let rockMesh: THREE.Mesh | null = null
  rockGltf.scene.updateWorldMatrix(true, true)
  rockGltf.scene.traverse((o) => {
    if (!rockMesh && (o as THREE.Mesh).isMesh) rockMesh = o as THREE.Mesh
  })
  if (!rockMesh) throw new Error("boulder.glb にメッシュがありません")
  const rm = rockMesh as THREE.Mesh
  rm.updateWorldMatrix(true, false)
  const geometry = dequantized(rm.geometry, rm.matrixWorld)
  // 置くときに地面へ少し埋めたいので、底を y=0 に合わせる
  geometry.computeBoundingBox()
  geometry.translate(0, -geometry.boundingBox!.min.y, 0)
  const material = rm.material as THREE.Material

  const textures = [
    sunset.bandTex, sunset.envTex, dusk.bandTex, dusk.envTex, noise, grassAlpha,
    ...[ground, road, groundRocks, shoulder, concrete].flatMap((s) => Object.values(s)),
  ]
  return {
    sky: { sunset, dusk },
    ground,
    road,
    groundRocks,
    shoulder,
    concrete,
    noise,
    rock: { geometry, material },
    grass,
    shrub,
    garage,
    dispose() {
      garage.dispose()
      grass.forEach((g) => g.geometry.dispose())
      grassMat.dispose()
      shrubGeo.dispose()
      for (const m of [...meshesOf(grassGltf.scene), ...shrubMeshes]) m.geometry.dispose()
      ;[shrubMat.map, shrubMat.normalMap, shrubMat.roughnessMap].forEach((t) => t?.dispose())
      shrubMat.dispose()
      textures.forEach((t) => t.dispose())
      geometry.dispose()
      rm.geometry.dispose()
      const mat = material as THREE.MeshStandardMaterial
      ;[mat.map, mat.normalMap, mat.roughnessMap, mat.aoMap, mat.metalnessMap].forEach((t) => t?.dispose())
      material.dispose()
    },
  }
}
