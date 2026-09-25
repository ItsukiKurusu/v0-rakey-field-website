// 沿道：電柱と電線、サボテン（形の違うサグアロ＋バレル＋ウチワ）、草むらと低木（Poly Haven）、小石と岩。
// どれも InstancedMesh。数の多い草と小石は道に沿って区画に分け、画面外の区画を描かない（視錐台で間引く）。
import * as THREE from "three"
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js"
import type { Prop } from "./assets"
import { barrel, pricklyPear, saguaro } from "./cactus"
import type { Road } from "./road"
import { rng } from "./terrain"

export type Keepout = { x: number; z: number; r: number }

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

type Place = { near: number; far: number; scale: [number, number]; squash?: [number, number]; tint?: [THREE.Color, THREE.Color] }

export function createRoadside(
  road: Road,
  keepouts: Keepout[],
  props: { rock: Prop; grass: Prop[]; shrub: Prop },
  isMobile: boolean,
  /** 地面の高さ（起伏の上に置くため）。c は道の中心からの距離 */
  groundAt: (x: number, z: number, c: number) => number,
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
  const owned: Array<{ dispose: () => void }> = []

  const sStart = Math.max(0, road.startS - 80)
  const sEnd = road.length - 10

  // ── 電柱：右手の路肩の外、32m おき。電線は隣の電柱へたわませて張る ──
  const poleMat = new THREE.MeshStandardMaterial({ color: "#4a3a2c", roughness: 0.9 })
  const poleGeo = poleGeometry()
  owned.push(poleMat, poleGeo)
  const polePts: THREE.Vector3[] = []
  const poleYaw: number[] = []
  for (let sPos = sStart; sPos < sEnd; sPos += 32) {
    road.frameAt(sPos, f)
    const x = f.pos.x + f.right.x * 9.6
    const z = f.pos.z + f.right.z * 9.6
    if (!free(x, z)) continue
    polePts.push(new THREE.Vector3(x, 0, z))
    poleYaw.push(Math.atan2(-f.forward.z, f.forward.x)) // 腕木を道と直角に
  }
  const poles = new THREE.InstancedMesh(poleGeo, poleMat, polePts.length)
  polePts.forEach((pt, i) => {
    // 電柱も少しずつ傾いている
    q.setFromEuler(new THREE.Euler((r() - 0.5) * 0.04, poleYaw[i], (r() - 0.5) * 0.04))
    m.compose(pt, q, s.set(1, 0.92 + r() * 0.16, 1))
    poles.setMatrixAt(i, m)
  })
  poles.name = "poles"
  poles.castShadow = true
  group.add(poles)
  const wirePos: number[] = []
  for (let i = 0; i < polePts.length - 1; i++) {
    const a = polePts[i]
    const b = polePts[i + 1]
    if (a.distanceTo(b) > 40) continue
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
  owned.push(wireGeo, wireMat)
  const wires = new THREE.LineSegments(wireGeo, wireMat)
  wires.name = "wires"
  group.add(wires)

  // ── 散らす：道の区画ごとに InstancedMesh を作る（chunk m ごと） ──
  const tmpColor = new THREE.Color()
  const scatter = (name: string, geo: THREE.BufferGeometry, mat: THREE.Material, count: number, o: Place, chunk = 0) => {
    const spans = chunk > 0 ? Math.ceil((sEnd - sStart) / chunk) : 1
    const per = Math.ceil(count / spans)
    for (let c = 0; c < spans; c++) {
      const s0 = chunk > 0 ? sStart + c * chunk : sStart
      const s1 = chunk > 0 ? Math.min(sEnd, s0 + chunk) : sEnd
      const inst = new THREE.InstancedMesh(geo, mat, per)
      let n = 0
      for (let tries = 0; n < per && tries < per * 10; tries++) {
        road.frameAt(s0 + r() * (s1 - s0), f)
        const side = r() < 0.5 ? -1 : 1
        const d = o.near + Math.pow(r(), 1.5) * (o.far - o.near)
        p.copy(f.pos).addScaledVector(f.right, side * d)
        if (!free(p.x, p.z)) continue
        const k = o.scale[0] + r() * (o.scale[1] - o.scale[0])
        const sq = o.squash ? o.squash[0] + r() * (o.squash[1] - o.squash[0]) : 1
        q.setFromAxisAngle(up, r() * Math.PI * 2)
        p.y = groundAt(p.x, p.z, d) - 0.03 * k // 少し埋める（浮いて見えないように）
        m.compose(p, q, s.set(k, k * sq, k))
        inst.setMatrixAt(n, m)
        if (o.tint) inst.setColorAt(n, tmpColor.lerpColors(o.tint[0], o.tint[1], r()))
        n++
      }
      inst.count = n
      inst.name = name
      inst.computeBoundingSphere()
      inst.frustumCulled = true
      group.add(inst)
    }
  }
  const C = (hex: string) => new THREE.Color(hex)

  // サボテン：6種類のサグアロ（1本ずつ形が違う）＋バレル＋ウチワ。色も少しずつ変える
  const cactusMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.8 })
  owned.push(cactusMat)
  const green: [THREE.Color, THREE.Color] = [C("#4d6340"), C("#7e8a5c")]
  for (let v = 0; v < 6; v++) {
    const g = saguaro(r)
    owned.push(g)
    scatter("saguaro", g, cactusMat, 6, { near: 12, far: 95, scale: [0.8, 1.15], tint: green })
  }
  for (let v = 0; v < 3; v++) {
    const g = barrel(r)
    owned.push(g)
    scatter("barrelCactus", g, cactusMat, 16, { near: 6.5, far: 40, scale: [0.8, 1.3], tint: [C("#5c6b3b"), C("#8a8a55")] })
  }
  for (let v = 0; v < 3; v++) {
    const g = pricklyPear(r)
    owned.push(g)
    scatter("pricklyPear", g, cactusMat, 10, { near: 7, far: 45, scale: [0.9, 1.6], tint: [C("#5e7a44"), C("#8c9a58")] })
  }

  // 低木（Poly Haven の shrub_02、元の高さ 約 1.7m）
  scatter("shrubs", props.shrub.geometry, props.shrub.material, isMobile ? 60 : 140, { near: 6.5, far: 70, scale: [0.3, 0.75], squash: [0.65, 1.05], tint: [C("#ffffff"), C("#c8b89a")] }, 120)

  // 草むら（板を組んだ軽い株）：路肩のすぐ外に濃く、遠くは薄く
  const grassCount = isMobile ? 1800 : 4500
  props.grass.forEach((gr, i) => {
    scatter(`grass${i}`, gr.geometry, gr.material, Math.round(grassCount / props.grass.length), {
      near: 5.0, far: 32, scale: [1.0, 2.2], squash: [0.7, 1.3],
      tint: [C("#ffffff"), C("#b5ae78")],
    }, 90)
  })

  // 小石（小さいので岩のモデルは使わず、角ばった多面体に岩の質感を貼る）と岩
  const pebbleGeo = new THREE.IcosahedronGeometry(1, 0)
  owned.push(pebbleGeo)
  scatter("pebbles", pebbleGeo, props.rock.material, isMobile ? 400 : 900, { near: 4.6, far: 14, scale: [0.03, 0.1], squash: [0.45, 0.8] }, 90)
  scatter("rocks", props.rock.geometry, props.rock.material, 120, { near: 9, far: 110, scale: [0.12, 0.75], squash: [0.6, 1] })

  group.traverse((o) => {
    const mesh = o as THREE.InstancedMesh
    if (!mesh.isInstancedMesh) return
    // 草と小石は影を落とさない（数が多く、影はほとんど見えない）
    mesh.castShadow = !/^(grass|pebbles)/.test(mesh.name)
    mesh.receiveShadow = true
  })

  return {
    group,
    dispose() {
      owned.forEach((o) => o.dispose())
      group.traverse((o) => {
        const mesh = o as THREE.InstancedMesh
        if (mesh.isInstancedMesh) mesh.dispose()
      })
    },
  }
}
