// 沿道の小物：電柱と電線、サボテン、岩、低い草。すべて InstancedMesh（種類ごとに描画1回）。
import * as THREE from "three"
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js"
import type { Road } from "./road"
import { rng } from "./terrain"

export type Keepout = { x: number; z: number; r: number }

function saguaroGeometry() {
  const parts: THREE.BufferGeometry[] = []
  const trunk = new THREE.CylinderGeometry(0.26, 0.32, 4.2, 9)
  trunk.translate(0, 2.1, 0)
  parts.push(trunk)
  const top = new THREE.SphereGeometry(0.26, 9, 6, 0, Math.PI * 2, 0, Math.PI / 2)
  top.translate(0, 4.2, 0)
  parts.push(top)
  // 左右の腕（横に出て上へ曲がる）
  for (const [side, y, len, up] of [[1, 1.9, 0.7, 1.3], [-1, 2.5, 0.55, 1.0]] as const) {
    const out = new THREE.CylinderGeometry(0.17, 0.17, len, 7)
    out.rotateZ(Math.PI / 2)
    out.translate((side * len) / 2 + side * 0.2, y, 0)
    const rise = new THREE.CylinderGeometry(0.17, 0.19, up, 7)
    rise.translate(side * (len + 0.2), y + up / 2, 0)
    const cap = new THREE.SphereGeometry(0.17, 7, 5, 0, Math.PI * 2, 0, Math.PI / 2)
    cap.translate(side * (len + 0.2), y + up, 0)
    parts.push(out, rise, cap)
  }
  const g = mergeGeometries(parts.map((p) => p.toNonIndexed()))!
  parts.forEach((p) => p.dispose())
  g.computeVertexNormals()
  return g
}

function poleGeometry() {
  const pole = new THREE.CylinderGeometry(0.11, 0.15, 8.6, 7)
  pole.translate(0, 4.3, 0)
  const bar = new THREE.BoxGeometry(0.12, 0.12, 2.4)
  bar.translate(0, 8.0, 0)
  const bar2 = new THREE.BoxGeometry(0.1, 0.1, 1.6)
  bar2.translate(0, 7.4, 0)
  const g = mergeGeometries([pole.toNonIndexed(), bar.toNonIndexed(), bar2.toNonIndexed()])!
  ;[pole, bar, bar2].forEach((p) => p.dispose())
  return g
}

export function createRoadside(
  road: Road,
  keepouts: Keepout[],
  rock: { geometry: THREE.BufferGeometry; material: THREE.Material },
) {
  const group = new THREE.Group()
  group.name = "roadside"
  const r = rng(5)
  const m = new THREE.Matrix4()
  const q = new THREE.Quaternion()
  const s = new THREE.Vector3()
  const p = new THREE.Vector3()
  const up = new THREE.Vector3(0, 1, 0)
  const f = { pos: new THREE.Vector3(), forward: new THREE.Vector3(), right: new THREE.Vector3() }
  const free = (x: number, z: number) => keepouts.every((k) => (x - k.x) ** 2 + (z - k.z) ** 2 > k.r * k.r)

  const sStart = Math.max(0, road.startS - 80)
  const sEnd = road.length - 10

  // 電柱：右手の路肩の外、32m おき。電線は隣の電柱へたわませて張る
  const poleMat = new THREE.MeshStandardMaterial({ color: "#4a3a2c", roughness: 0.9 })
  const poleGeo = poleGeometry()
  const polePts: THREE.Vector3[] = []
  const poleYaw: number[] = []
  for (let sPos = sStart; sPos < sEnd; sPos += 32) {
    road.frameAt(sPos, f)
    const x = f.pos.x + f.right.x * 7.6
    const z = f.pos.z + f.right.z * 7.6
    if (!free(x, z)) continue
    polePts.push(new THREE.Vector3(x, 0, z))
    poleYaw.push(Math.atan2(-f.forward.z, f.forward.x)) // 腕木を道と直角に
  }
  const poles = new THREE.InstancedMesh(poleGeo, poleMat, polePts.length)
  polePts.forEach((pt, i) => {
    q.setFromAxisAngle(up, poleYaw[i])
    m.compose(pt, q, s.set(1, 1, 1))
    poles.setMatrixAt(i, m)
  })
  poles.name = "poles"
  group.add(poles)

  const wirePos: number[] = []
  for (let i = 0; i < polePts.length - 1; i++) {
    const a = polePts[i]
    const b = polePts[i + 1]
    if (a.distanceTo(b) > 40) continue // 間が抜けた所は張らない
    for (const [off, h] of [[-1.1, 8.0], [1.1, 8.0], [0, 7.4]] as const) {
      const dir = new THREE.Vector3().subVectors(b, a).normalize()
      const side = new THREE.Vector3().crossVectors(dir, up).multiplyScalar(off)
      const segs = 10
      for (let k = 0; k < segs; k++) {
        for (const t of [k / segs, (k + 1) / segs]) {
          const sag = Math.sin(t * Math.PI) * 0.7
          wirePos.push(a.x + (b.x - a.x) * t + side.x, h - sag, a.z + (b.z - a.z) * t + side.z)
        }
      }
    }
  }
  const wireGeo = new THREE.BufferGeometry()
  wireGeo.setAttribute("position", new THREE.Float32BufferAttribute(wirePos, 3))
  const wireMat = new THREE.LineBasicMaterial({ color: "#1d1712", transparent: true, opacity: 0.8 })
  const wires = new THREE.LineSegments(wireGeo, wireMat)
  wires.name = "wires"
  group.add(wires)

  // 散らす物（道からの距離の幅、数、大きさ）
  const scatter = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    count: number,
    near: number,
    far: number,
    scale: [number, number],
    squash = 1,
  ) => {
    const inst = new THREE.InstancedMesh(geo, mat, count)
    let n = 0
    for (let tries = 0; n < count && tries < count * 8; tries++) {
      road.frameAt(sStart + r() * (sEnd - sStart), f)
      const side = r() < 0.5 ? -1 : 1
      const d = near + Math.pow(r(), 1.6) * (far - near)
      p.copy(f.pos).addScaledVector(f.right, side * d)
      if (!free(p.x, p.z)) continue
      const k = scale[0] + r() * (scale[1] - scale[0])
      q.setFromAxisAngle(up, r() * Math.PI * 2)
      p.y = 0
      m.compose(p, q, s.set(k, k * squash * (0.8 + r() * 0.4), k))
      inst.setMatrixAt(n++, m)
    }
    inst.count = n
    return inst
  }

  const cactusMat = new THREE.MeshStandardMaterial({ color: "#4f6b3a", roughness: 0.85 })
  const cactusGeo = saguaroGeometry()
  const cacti = scatter(cactusGeo, cactusMat, 70, 10, 90, [0.7, 1.35])
  cacti.name = "cacti"

  // 岩は Poly Haven の実写モデル（元の大きさ 約 2.5m）。解放は assets 側
  const rocks = scatter(rock.geometry, rock.material, 150, 7, 110, [0.12, 0.75], 0.8)
  rocks.name = "rocks"

  const shrubMat = new THREE.MeshStandardMaterial({ color: "#6d6a45", roughness: 1, flatShading: true })
  const shrubGeo = new THREE.IcosahedronGeometry(0.6, 1)
  const shrubs = scatter(shrubGeo, shrubMat, 320, 6, 70, [0.5, 1.2], 0.55)
  shrubs.name = "shrubs"

  group.add(cacti, rocks, shrubs)
  for (const o of [poles, cacti, rocks]) {
    o.castShadow = true
    o.computeBoundingSphere()
  }

  return {
    group,
    dispose() {
      for (const g of [poleGeo, wireGeo, cactusGeo, shrubGeo]) g.dispose()
      for (const mt of [poleMat, wireMat, cactusMat, shrubMat]) mt.dispose()
    },
  }
}
