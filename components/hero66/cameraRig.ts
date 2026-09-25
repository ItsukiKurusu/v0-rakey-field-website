// カメラ：進行度 p からキーフレームを滑らかにつなぎ（3次エルミート）、車の向きで世界座標へ直す。
import * as THREE from "three"
import { CAMERA_KEYS } from "./constants"
import type { RoadFrame } from "./road"

/** キーの間を、前後のキーから決めた傾きでつなぐ（C1 連続。キーの所で急に向きが変わらない） */
function sampleKeys(p: number, pick: (k: (typeof CAMERA_KEYS)[number]) => number[], out: number[]) {
  const K = CAMERA_KEYS
  let i = 0
  while (i < K.length - 2 && p > K[i + 1].p) i++
  const k0 = K[Math.max(0, i - 1)]
  const k1 = K[i]
  const k2 = K[i + 1]
  const k3 = K[Math.min(K.length - 1, i + 2)]
  const h = k2.p - k1.p || 1
  const t = Math.min(1, Math.max(0, (p - k1.p) / h))
  const t2 = t * t
  const t3 = t2 * t
  const a = pick(k0)
  const b = pick(k1)
  const c = pick(k2)
  const d = pick(k3)
  for (let j = 0; j < b.length; j++) {
    const m1 = ((c[j] - a[j]) / (k2.p - k0.p || 1)) * h
    const m2 = ((d[j] - b[j]) / (k3.p - k1.p || 1)) * h
    out[j] = (2 * t3 - 3 * t2 + 1) * b[j] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * c[j] + (t3 - t2) * m2
  }
  return out
}

export type CameraPose = { pos: THREE.Vector3; look: THREE.Vector3; fov: number }

export function createCameraRig() {
  const tmpPos: number[] = [0, 0, 0]
  const tmpLook: number[] = [0, 0, 0]
  const tmpFov: number[] = [0]
  const toWorld = (local: number[], f: RoadFrame, carPos: THREE.Vector3, out: THREE.Vector3) =>
    out
      .copy(carPos)
      .addScaledVector(f.forward, local[0])
      .addScaledVector(f.right, local[2])
      .setY(carPos.y + local[1])

  /**
   * @param aspect 画面の縦横比。縦長では距離を少し伸ばし、足りない分を画角で補う
   */
  const sample = (p: number, frame: RoadFrame, carPos: THREE.Vector3, aspect: number, out: CameraPose) => {
    sampleKeys(p, (k) => k.pos, tmpPos)
    sampleKeys(p, (k) => k.look, tmpLook)
    sampleKeys(p, (k) => [k.fov], tmpFov)
    let fov = tmpFov[0]
    if (aspect < 1.2) {
      const need = 1.2 / aspect
      const dolly = Math.min(need, 1.35) // 距離は伸ばしすぎない（地面や看板にめり込む）
      // 注視点からの距離を伸ばす
      for (let j = 0; j < 3; j++) tmpPos[j] = tmpLook[j] + (tmpPos[j] - tmpLook[j]) * dolly
      fov = Math.min(68, fov * Math.pow(need / dolly, 0.85) * 1.12)
    }
    toWorld(tmpPos, frame, carPos, out.pos)
    toWorld(tmpLook, frame, carPos, out.look)
    out.fov = fov
    return out
  }

  return { sample }
}
