// ホイール1本：薄いタイヤ＋大径クロームの5本スポーク＋ハブ＋ブレーキ。
// 物体座標：車軸 = Z、外側の面 = +Z、中心 = 原点。回転は spin（Z 軸まわり）だけに掛ける。
import * as THREE from "three"
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js"
import type { ImpalaMaterials } from "./materials"
import { SPEC } from "./spec"

const W = SPEC.wheel

/** 回転体。profile は (半径, 軸方向) の点列で、軸方向の小 → 大の順に並べると外向きの面になる。 */
function lathe(profile: Array<[number, number]>, segments = 72) {
  const g = new THREE.LatheGeometry(profile.map(([r, h]) => new THREE.Vector2(r, h)), segments)
  g.rotateX(Math.PI / 2) // 回転軸 Y → Z
  return g
}

function tireGeometry() {
  const R = W.tireRadius
  const hw = W.tireWidth / 2
  const bead = W.rimRadius - 0.004
  // 外側（+h）の半分。トレッドには周方向の溝を3本
  const half: Array<[number, number]> = [
    [bead, hw - 0.012],
    [bead + 0.016, hw - 0.004],
    [bead + 0.04, hw],
    [R - 0.022, hw - 0.004],
    [R - 0.009, hw - 0.014],
    [R - 0.002, hw - 0.03],
    [R, hw - 0.045],
    [R, 0.062],
    [R - 0.007, 0.059],
    [R - 0.007, 0.051],
    [R, 0.048],
    [R, 0.013],
    [R - 0.007, 0.01],
    [R - 0.007, 0.001],
  ]
  // 内側の縁（-h）→ トレッド → 外側の縁（+h）の順にたどる
  const innerHalf = half.map(([r, h]): [number, number] => [r, -h])
  return lathe([...innerHalf, ...half.slice().reverse()], 96)
}

function rimLipGeometry() {
  const r = W.rimRadius
  const face = W.tireWidth / 2 + 0.004 // タイヤの側面とほぼ面一
  // 奥の胴 → 外周のリップ（磨きの平らな輪）→ スポークの面へ落ちる段
  return lathe(
    [
      [r - 0.03, -W.tireWidth / 2 + 0.01],
      [r - 0.028, face - 0.05],
      [r - 0.018, face - 0.03],
      [r - 0.004, face - 0.012],
      [r + 0.002, face - 0.004],
      [r, face],
      [r - 0.012, face + 0.002],
      [r - 0.03, face],
      [r - 0.036, face - 0.012],
    ],
    96,
  )
}

/** スポーク5本（IROC 風の幅広で平らなスポーク）。ハブ側が奥へ沈む（皿形）。 */
function spokesGeometry() {
  const r0 = 0.07
  const r1 = W.rimRadius - 0.03
  const s = new THREE.Shape()
  // ハブ側が細く、リム側でやや広がる。スポークの間の抜けを大きく取る
  // 実車（IROC 風）は幅広で面の平らなスポーク。ハブ側でやや細く、リム側で広がる
  s.moveTo(-0.032, r0)
  s.lineTo(0.032, r0)
  s.bezierCurveTo(0.036, r0 + 0.06, 0.042, r1 - 0.06, 0.046, r1 - 0.024)
  s.quadraticCurveTo(0.05, r1 - 0.004, 0.066, r1 + 0.006) // リムへ広がる付け根
  s.lineTo(-0.066, r1 + 0.006)
  s.quadraticCurveTo(-0.05, r1 - 0.004, -0.046, r1 - 0.024)
  s.bezierCurveTo(-0.042, r1 - 0.06, -0.036, r0 + 0.06, -0.032, r0)
  const depth = 0.026
  const one = new THREE.ExtrudeGeometry(s, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.007,
    bevelSize: 0.006,
    bevelSegments: 3,
    curveSegments: 10,
  })
  // 皿形：外周 = リップの面、ハブ = 奥へ。頂点を曲げると面が三角に割れて見えるので、
  // スポーク1本をリムの付け根を軸に丸ごと傾ける（面は平らなまま）
  const face = W.tireWidth / 2 - 0.022
  const dishDepth = 0.04
  one.translate(0, -r1, face - depth)
  one.rotateX(Math.atan2(dishDepth, r1 - r0))
  one.translate(0, r1, 0)
  const parts: THREE.BufferGeometry[] = []
  for (let k = 0; k < 5; k++) {
    const g = one.clone()
    g.rotateZ((k / 5) * Math.PI * 2)
    parts.push(g)
  }
  one.dispose()
  const merged = mergeGeometries(parts)!
  parts.forEach((g) => g.dispose())
  return merged
}

function hubGeometry() {
  const face = W.tireWidth / 2 - 0.022 - 0.04 // スポークの付け根と同じ奥行き
  // 外周の側面 → 外へ向いたドーム（センターキャップ）
  return lathe(
    [
      [0.088, face - 0.04],
      [0.09, face - 0.005],
      [0.084, face + 0.012],
      [0.06, face + 0.02],
      [0.042, face + 0.022],
      [0.04, face + 0.03],
      [0.03, face + 0.042],
      [0.001, face + 0.046],
    ],
    48,
  )
}

function lugsGeometry() {
  const face = W.tireWidth / 2 - 0.022 - 0.04 + 0.02
  const parts: THREE.BufferGeometry[] = []
  for (let k = 0; k < 5; k++) {
    const g = new THREE.CylinderGeometry(0.0095, 0.011, 0.022, 6)
    g.rotateX(Math.PI / 2)
    const a = ((k + 0.5) / 5) * Math.PI * 2 // スポークの間
    g.translate(Math.cos(a) * 0.058, Math.sin(a) * 0.058, face + 0.008)
    parts.push(g)
  }
  const m = mergeGeometries(parts)!
  parts.forEach((g) => g.dispose())
  return m
}

export type Wheel = { group: THREE.Group; spin: THREE.Group }

export function createWheel(mats: ImpalaMaterials, geos: WheelGeometries): Wheel {
  const group = new THREE.Group()
  const spin = new THREE.Group()
  group.add(spin)

  spin.add(new THREE.Mesh(geos.tire, mats.rubber))
  spin.add(new THREE.Mesh(geos.rimLip, mats.chrome))
  spin.add(new THREE.Mesh(geos.spokes, mats.chrome))
  spin.add(new THREE.Mesh(geos.hub, mats.chrome))
  spin.add(new THREE.Mesh(geos.lugs, mats.chromeSatin))
  spin.add(new THREE.Mesh(geos.barrel, mats.blackTrim))
  spin.add(new THREE.Mesh(geos.disc, mats.brakeDisc))

  // キャリパーは回らない（後ろ上に固定）
  const cal = new THREE.Mesh(geos.caliper, mats.caliper)
  group.add(cal)

  group.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) {
      o.castShadow = true
      o.receiveShadow = true
    }
  })
  return { group, spin }
}

export type WheelGeometries = ReturnType<typeof createWheelGeometries>

/** 4輪で共有するジオメトリ。 */
export function createWheelGeometries() {
  // リムの内側の胴（スポークの隙間から見える暗い筒）。軸側へ向けるので 外 → 奥 の順
  const barrel = lathe(
    [
      [W.rimRadius - 0.032, W.tireWidth / 2 - 0.06],
      [W.rimRadius - 0.032, -W.tireWidth / 2 + 0.01],
    ],
    64,
  )
  const disc = new THREE.CylinderGeometry(0.185, 0.185, 0.028, 48)
  disc.rotateX(Math.PI / 2)
  disc.translate(0, 0, -0.01)
  // キャリパー：ディスクの外周にかぶさる弧
  const calShape = new THREE.Shape()
  calShape.absarc(0, 0, 0.2, 0.2, 1.05, false)
  calShape.absarc(0, 0, 0.14, 1.05, 0.2, true)
  const caliper = new THREE.ExtrudeGeometry(calShape, {
    depth: 0.06,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
  })
  caliper.translate(0, 0, -0.04)
  caliper.rotateZ(Math.PI * 0.5) // 後ろ上へ（車の後ろ = -X 側。外側の面が +Z のとき）
  return {
    tire: tireGeometry(),
    rimLip: rimLipGeometry(),
    spokes: spokesGeometry(),
    hub: hubGeometry(),
    lugs: lugsGeometry(),
    barrel,
    disc,
    caliper,
    dispose() {
      for (const g of [this.tire, this.rimLip, this.spokes, this.hub, this.lugs, barrel, disc, caliper]) g.dispose()
    },
  }
}
