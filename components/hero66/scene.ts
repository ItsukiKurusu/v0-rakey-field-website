// ヒーローの場面一式。進行度 p（と時刻）を渡すと、車・カメラ・空・光をすべて決めて描く。
import * as THREE from "three"
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js"
import { OutputPass } from "three/addons/postprocessing/OutputPass.js"
import { RenderPass } from "three/addons/postprocessing/RenderPass.js"
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js"
import { createImpala } from "@/components/impala3d/createImpala"
import { SPEC } from "@/components/impala3d/spec"
import type { DeviceProfile } from "@/lib/renderer"
import { createCameraRig, type CameraPose } from "./cameraRig"
import { BREATH, DUSK, FOG, LIGHTS_ON, NEON_ON, ROAD } from "./constants"
import { createGarage } from "./garage"
import { createRoad, createRoadMesh } from "./road"
import { createRoadside } from "./roadside"
import { createSigns } from "./signs"
import { createSky, skyStateAt } from "./sky"
import { createTerrain } from "./terrain"

const smooth = THREE.MathUtils.smoothstep
const SUN_WARM = new THREE.Color("#ffb070")
const SUN_LOW = new THREE.Color("#ff6a3a")

export type HeroScene = ReturnType<typeof createHeroScene>

export function createHeroScene(renderer: THREE.WebGLRenderer, profile: DeviceProfile) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 16 / 9, 0.1, 2600)

  const road = createRoad()
  const roadMesh = createRoadMesh(road)
  const terrain = createTerrain(road)
  const signs = createSigns(road)
  const garage = createGarage(road)

  // 看板・標識・ガレージの周りには小物を置かない
  const keep: Array<{ x: number; z: number; r: number }> = []
  signs.group.children.forEach((o) => keep.push({ x: o.position.x, z: o.position.z, r: 7 }))
  keep.push({ x: garage.group.position.x, z: garage.group.position.z, r: 17 })
  const roadside = createRoadside(road, keep)

  const sky = createSky()
  const impala = createImpala()
  // 夕陽の映り込みでヘッドライトが点いて見えないよう、レンズの映り込みを弱める（このヒーローだけ）
  impala.materials.lensClear.envMapIntensity = 0.55
  impala.materials.lensClear.metalness = 0.25 // 低い夕陽がメッキに当たって光るのも抑える
  impala.materials.lensClear.roughness = 0.3
  impala.materials.lensClear.color.setScalar(0.6) // 反射板の地を暗めに（ブルームのしきい値を超えないように）
  scene.add(sky.mesh, roadMesh.mesh, terrain.group, signs.group, garage.group, roadside.group, impala.group)

  // --- 光 ---
  const hemi = new THREE.HemisphereLight("#ffd8b0", "#5b3a26", 0.9)
  const sun = new THREE.DirectionalLight("#ffb070", 2.6)
  const moon = new THREE.DirectionalLight("#8ea8ff", 0)
  moon.position.set(-60, 120, -80)
  scene.add(hemi, sun, sun.target, moon)
  if (profile.shadowMapSize > 0) {
    sun.castShadow = true
    sun.shadow.mapSize.set(profile.shadowMapSize, profile.shadowMapSize)
    const c = sun.shadow.camera
    c.left = -11
    c.right = 11
    c.top = 11
    c.bottom = -11
    c.near = 1
    c.far = 160
    sun.shadow.bias = -0.0005
    sun.shadow.normalBias = 0.03
  }
  // ヘッドライト：2灯を1本のスポットで代用（夜の道を照らす）
  const headlight = new THREE.SpotLight("#fff3dc", 0, 90, 0.5, 0.65, 1.6)
  headlight.position.set(SPEC.frontFace + 0.1, 0.62, 0)
  headlight.target.position.set(26, 0, 0)
  impala.group.add(headlight, headlight.target)

  // --- 霧 ---
  scene.fog = new THREE.Fog("#ffbb73", FOG.near, FOG.far)
  const fog = scene.fog as THREE.Fog

  // --- 映り込み（環境マップ）：夕暮れと夜の2枚を先に焼いておく ---
  const pmrem = new THREE.PMREMGenerator(renderer)
  const bakeEnv = (tod: number) => {
    const envScene = new THREE.Scene()
    const s = createSky(100)
    s.apply(skyStateAt(tod), tod, 0)
    const groundDisk = new THREE.Mesh(
      new THREE.CircleGeometry(100, 32).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: tod < 0.5 ? "#7a5236" : "#141019" }),
    )
    groundDisk.position.y = -1
    envScene.add(s.mesh, groundDisk)
    const rt = pmrem.fromScene(envScene, 0, 0.1, 400)
    s.dispose()
    groundDisk.geometry.dispose()
    ;(groundDisk.material as THREE.Material).dispose()
    return rt
  }
  const envDusk = bakeEnv(0.15)
  const envNight = bakeEnv(0.95)
  scene.environment = envDusk.texture

  // --- ブルーム（デスクトップだけ）。発光（ランプ・ネオン・太陽）だけがにじむよう、しきい値は 1 より上 ---
  let composer: EffectComposer | null = null
  let bloom: UnrealBloomPass | null = null
  if (!profile.isMobile) {
    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.45, 1.05)
    composer.addPass(bloom)
    composer.addPass(new OutputPass())
  }

  const rig = createCameraRig()
  const frame = { pos: new THREE.Vector3(), forward: new THREE.Vector3(), right: new THREE.Vector3() }
  const pose: CameraPose = { pos: new THREE.Vector3(), look: new THREE.Vector3(), fov: 38 }
  const skyState = skyStateAt(0)
  const fogColor = new THREE.Color()

  /**
   * 進行度 p の画を決める。
   * @param orbit 完成後の回転（ラジアン）。@param pointer マウスでの覗き込み（-1..1）
   */
  const update = (p: number, time: number, orbit = 0, pointer = { x: 0, y: 0 }) => {
    // 車
    const s = road.carS(p)
    road.frameAt(s, frame)
    impala.group.position.copy(frame.pos).addScaledVector(frame.right, ROAD.lane).setY(0)
    impala.group.rotation.y = Math.atan2(-frame.forward.z, frame.forward.x)
    impala.setWheelAngle(road.travelled(p) / SPEC.wheel.tireRadius)

    // カメラ
    rig.sample(p, frame, impala.group.position, camera.aspect, pose)
    if (orbit !== 0 || pointer.x !== 0) {
      const yaw = orbit + pointer.x * 0.06
      const dx = pose.pos.x - pose.look.x
      const dz = pose.pos.z - pose.look.z
      const c = Math.cos(yaw)
      const sn = Math.sin(yaw)
      pose.pos.x = pose.look.x + dx * c - dz * sn
      pose.pos.z = pose.look.z + dx * sn + dz * c
      pose.pos.y += pointer.y * 0.25
    }
    // 常時の微動（止まって見せない）
    pose.look.y += Math.sin(time * BREATH.speed) * BREATH.amplitude
    pose.pos.sub(pose.look).multiplyScalar(1 + Math.sin(time * BREATH.cameraSpeed) * BREATH.cameraAmplitude).add(pose.look)
    if (Math.abs(camera.fov - pose.fov) > 1e-3) {
      camera.fov = pose.fov
      camera.updateProjectionMatrix()
    }
    camera.position.copy(pose.pos)
    camera.lookAt(pose.look)

    // 空と1日の移り変わり
    const tod = smooth(p, DUSK.from, DUSK.to)
    skyStateAt(tod, skyState)
    sky.apply(skyState, tod, time)
    sky.mesh.position.copy(camera.position)
    fogColor.copy(skyState.horizon).lerp(skyState.mid, 0.25)
    fog.color.copy(fogColor)
    fog.near = FOG.near * (1 - 0.4 * tod)
    fog.far = FOG.far * (1 - 0.35 * tod)

    // 太陽（沈むにつれて弱く赤く）。影の範囲は車に追従させる
    const sunUp = smooth(Math.sin(skyState.sunElevation), -0.03, 0.09)
    sun.intensity = 2.6 * sunUp
    sun.color.lerpColors(SUN_WARM, SUN_LOW, tod)
    sun.position.copy(impala.group.position).addScaledVector(skyState.sunDir, 80)
    sun.position.y = Math.max(sun.position.y, impala.group.position.y + 6) // 影が長く伸びすぎないように
    sun.target.position.copy(impala.group.position)
    moon.intensity = 0.85 * tod
    hemi.intensity = THREE.MathUtils.lerp(0.95, 0.36, tod)
    hemi.color.copy(skyState.zenith).lerp(skyState.horizon, 0.5)
    scene.environment = tod < 0.55 ? envDusk.texture : envNight.texture
    scene.environmentIntensity = THREE.MathUtils.lerp(0.9, 0.55, tod)

    // ライト・看板・ネオン
    const lights = smooth(p, LIGHTS_ON, LIGHTS_ON + 0.035)
    impala.setLights(lights > 0.02, lights)
    headlight.intensity = 260 * lights
    signs.setNight(tod, lights)
    garage.setNeon(smooth(p, NEON_ON, NEON_ON + 0.03), time)
  }

  /**
   * 最初に全部のシェーダーとテクスチャを GPU に載せておく。
   * 画面に初めて入った物（ガレージ・看板など）がその場でコンパイルされると、一瞬止まる
   */
  const warmup = () => {
    renderer.compile(scene, camera)
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
        for (const v of Object.values(m)) if ((v as THREE.Texture)?.isTexture) renderer.initTexture(v as THREE.Texture)
      }
    })
  }

  const render = () => {
    if (composer) composer.render()
    else renderer.render(scene, camera)
  }

  const resize = (w: number, h: number) => {
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    if (composer) {
      composer.setPixelRatio(renderer.getPixelRatio())
      composer.setSize(w, h)
    }
  }

  return {
    scene,
    camera,
    renderer,
    impala,
    road,
    update,
    warmup,
    render,
    resize,
    dispose() {
      composer?.dispose()
      bloom?.dispose()
      envDusk.dispose()
      envNight.dispose()
      pmrem.dispose()
      impala.dispose()
      roadMesh.dispose()
      terrain.dispose()
      signs.dispose()
      garage.dispose()
      roadside.dispose()
      sky.dispose()
    },
  }
}
