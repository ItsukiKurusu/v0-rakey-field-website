// ヒーローの実写素材（Poly Haven・CC0）を読み込む。変換は scripts/bake-hero-assets.mjs。
//   空の帯（JPEG）… x/(1+x) を 2.2 乗根で 8bit にしたもの。シェーダーで元の明るさへ戻す
//   映り込み（.hdr 256x128）… PMREM にしてから使う
import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"
import { HDRLoader } from "three/addons/loaders/HDRLoader.js"
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js"

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
type Meta = { sky: { sunset: SkyMeta; dusk: SkyMeta }; ground: SurfaceMeta; road: SurfaceMeta; rock: string }

export type SurfaceMaps = { map: THREE.Texture; normalMap: THREE.Texture; armMap: THREE.Texture }
export type SkyAsset = SkyMeta & { bandTex: THREE.Texture; envTex: THREE.Texture }

export type HeroAssets = {
  sky: { sunset: SkyAsset; dusk: SkyAsset }
  ground: SurfaceMaps
  road: SurfaceMaps
  rock: { geometry: THREE.BufferGeometry; material: THREE.Material }
  dispose: () => void
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

  const [sunset, dusk, ground, road, rockGltf] = await Promise.all([
    loadSky(meta.sky.sunset),
    loadSky(meta.sky.dusk),
    loadSurface(meta.ground),
    loadSurface(meta.road),
    gltfLoader.loadAsync(BASE + meta.rock),
  ])

  let rockMesh: THREE.Mesh | null = null
  rockGltf.scene.traverse((o) => {
    if (!rockMesh && (o as THREE.Mesh).isMesh) rockMesh = o as THREE.Mesh
  })
  if (!rockMesh) throw new Error("boulder.glb にメッシュがありません")
  const rm = rockMesh as THREE.Mesh
  rm.updateWorldMatrix(true, false)
  const geometry = rm.geometry.clone().applyMatrix4(rm.matrixWorld)
  // 置くときに地面へ少し埋めたいので、底を y=0 に合わせる
  geometry.computeBoundingBox()
  geometry.translate(0, -geometry.boundingBox!.min.y, 0)
  const material = rm.material as THREE.Material

  const textures = [sunset.bandTex, sunset.envTex, dusk.bandTex, dusk.envTex, ...Object.values(ground), ...Object.values(road)]
  return {
    sky: { sunset, dusk },
    ground,
    road,
    rock: { geometry, material },
    dispose() {
      textures.forEach((t) => t.dispose())
      geometry.dispose()
      rm.geometry.dispose()
      const mat = material as THREE.MeshStandardMaterial
      ;[mat.map, mat.normalMap, mat.roughnessMap, mat.aoMap, mat.metalnessMap].forEach((t) => t?.dispose())
      material.dispose()
    },
  }
}
