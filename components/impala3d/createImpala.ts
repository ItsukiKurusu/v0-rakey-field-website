// インパラ1台を組み立てる。展示ビューアとトップの3Dヒーローの両方から使う。
//
// 返す group の原点：地面の高さ、ホイールベースの中央。+X が前。
// ホイールは setWheelAngle(走った距離 / タイヤ半径) で回す（時間で回さない）。
import * as THREE from "three"
import { buildBody } from "./body"
import { buildCabin } from "./cabin"
import { createImpalaMaterials } from "./materials"
import { buildParts } from "./parts"
import { SPEC } from "./spec"
import { createWheel, createWheelGeometries } from "./wheel"

export type Impala = ReturnType<typeof createImpala>

export function createImpala() {
  const materials = createImpalaMaterials()
  const group = new THREE.Group()
  group.name = "impala"

  const body = buildBody()
  const bodyMesh = new THREE.Mesh(body.geometry, [materials.paint, materials.interior])
  bodyMesh.name = "body"
  group.add(bodyMesh)

  // キャビンの区画：0 塗装 / 1 ガラス / 2 黒 / 3 クローム（cabin.ts の CABIN_GROUPS）
  const cabinMesh = new THREE.Mesh(buildCabin(), [materials.paint, materials.glass, materials.blackTrim, materials.chrome])
  cabinMesh.name = "cabin"
  group.add(cabinMesh)

  const parts = new THREE.Group()
  parts.name = "parts"
  parts.add(...buildParts(body, materials))
  group.add(parts)

  const wheelGeos = createWheelGeometries()
  const wheels = [
    { x: SPEC.wheel.x, side: 1 },
    { x: SPEC.wheel.x, side: -1 },
    { x: -SPEC.wheel.x, side: 1 },
    { x: -SPEC.wheel.x, side: -1 },
  ].map(({ x, side }) => {
    const w = createWheel(materials, wheelGeos)
    w.group.position.set(x, SPEC.wheel.tireRadius, side * SPEC.wheel.z)
    if (side < 0) w.group.rotation.y = Math.PI // 外側の面を -Z へ
    w.group.name = `wheel_${x > 0 ? "F" : "R"}${side > 0 ? "R" : "L"}`
    group.add(w.group)
    return { ...w, side }
  })

  group.traverse((o) => {
    const mesh = o as THREE.Mesh
    if (!mesh.isMesh) return
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    // ガラス・デカールなど透ける物は影を落とさない
    mesh.castShadow = !mats.every((m) => m.transparent)
  })

  return {
    group,
    materials,
    wheels,
    /** 走った距離 ÷ タイヤ半径。前進（+X）で正。 */
    setWheelAngle(angle: number) {
      // 右側（外面 +Z）は Z 軸まわりに負の向きで前へ転がる。左側は向きを反転しているので逆
      for (const w of wheels) w.spin.rotation.z = -angle * w.side
    },
    /** ヘッドライト・テールランプの点灯（夜の場面用）。 */
    setLights(on: boolean, strength = 1) {
      materials.lensClear.emissiveIntensity = on ? 2.2 * strength : 0
      materials.lensAmber.emissiveIntensity = on ? 0.6 * strength : 0
      materials.taillight.emissiveIntensity = on ? 1.6 * strength : 0.08
    },
    dispose() {
      group.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (mesh.isMesh && !Object.values(wheelGeos).includes(mesh.geometry as never)) mesh.geometry.dispose()
      })
      wheelGeos.dispose()
      materials.dispose()
    },
  }
}
