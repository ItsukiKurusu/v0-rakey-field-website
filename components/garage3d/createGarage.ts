// RAKEY FIELD のガレージ（実店舗）を組み立てる。確認用ビューア（/lab/garage）とトップのヒーローの両方で使う。
//
// Garage
// ├── Building   … Walls / Roof / Foundation / BlueFrames
// ├── Front      … RollingShutter / Awning / Signs / SecurityDevices / Props
// ├── Interior   … BackWall / Ceiling / Floor / Workbench・Chairs・Tires・Decorations
// ├── Lighting   … 室内の電球（setInteriorLights）
// └── Ground     … 入口前の土間コンクリート
//
// 看板と室内の奥の壁は、お店の写真から切り出したテクスチャ（public/garage3d/、scripts/bake-garage-textures.mjs）。
import * as THREE from "three"
import { GARAGE_COLORS as C, GARAGE_SPEC as S, WALL_SIGNS } from "./spec"
import { concreteTexture, plywoodTexture, roofTexture, slatNormal, wallNormal, wallTexture } from "./textures"

type TexMeta = Record<string, { file: string; aspect: number; alpha: boolean }>

export type GarageModel = Awaited<ReturnType<typeof createGarageModel>>

export async function createGarageModel({ base = "/garage3d/" } = {}) {
  const meta: TexMeta = await fetch(base + "meta.json").then((r) => r.json())
  const loader = new THREE.TextureLoader()
  const photos: Record<string, THREE.Texture> = {}
  await Promise.all(
    Object.entries(meta).map(async ([k, v]) => {
      const t = await loader.loadAsync(base + v.file)
      t.colorSpace = THREE.SRGBColorSpace
      t.anisotropy = 8
      photos[k] = t
    }),
  )

  const disposables: Array<{ dispose: () => void }> = []
  const keep = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x)

  const W = S.width
  const D = S.depth
  const t = S.wall
  const front = D / 2
  const back = -D / 2
  const yWall = S.foundation.height // 壁の下端（基礎の上）
  const eaveAt = (z: number) => THREE.MathUtils.lerp(S.eaveBack, S.eaveFront, (z - back) / D)

  // ── 材質 ────────────────────────────────────────────
  const wallMap = keep(wallTexture(1))
  const wallNor = keep(wallNormal())
  wallNor.wrapS = THREE.RepeatWrapping
  const wallMat = (widthM: number) => {
    const n = wallNor.clone()
    n.repeat.set(widthM / 0.2, 1)
    n.needsUpdate = true
    keep(n)
    return keep(
      new THREE.MeshStandardMaterial({ map: wallMap, normalMap: n, normalScale: new THREE.Vector2(0.6, 0.6), roughness: 0.72, metalness: 0.05 }),
    )
  }
  const plyMap = keep(plywoodTexture())
  plyMap.wrapS = plyMap.wrapT = THREE.RepeatWrapping
  // 室内の材質は空の映り込み（環境光）を弱める。開口から差す光だけが入る暗い室内にするため
  const INSIDE_ENV = 0.22
  const plyMat = keep(new THREE.MeshStandardMaterial({ map: plyMap, roughness: 0.85, envMapIntensity: INSIDE_ENV }))
  const blueMat = keep(new THREE.MeshStandardMaterial({ color: C.blue, roughness: 0.42, metalness: 0.35 }))
  const concMap = keep(concreteTexture())
  const concMat = keep(new THREE.MeshStandardMaterial({ map: concMap, roughness: 0.92 }))
  const edgeMat = keep(new THREE.MeshStandardMaterial({ color: "#d9dcdd", roughness: 0.7 }))

  const group = new THREE.Group()
  group.name = "Garage"
  const named = (name: string, ...children: THREE.Object3D[]) => {
    const g = new THREE.Group()
    g.name = name
    if (children.length) g.add(...children)
    return g
  }
  const box = (w: number, h: number, d: number, mat: THREE.Material | THREE.Material[], name?: string) => {
    const m = new THREE.Mesh(keep(new THREE.BoxGeometry(w, h, d)), mat)
    if (name) m.name = name
    m.castShadow = true
    m.receiveShadow = true
    return m
  }
  /** 4隅（見る側から反時計回り：左下 → 右下 → 右上 → 左上）で張る面。uv の v は高さの割合 */
  const quad = (pts: THREE.Vector3[], mat: THREE.Material, vTop: [number, number] = [1, 1], name?: string) => {
    const g = keep(new THREE.BufferGeometry())
    g.setAttribute("position", new THREE.Float32BufferAttribute(pts.flatMap((v) => [v.x, v.y, v.z]), 3))
    g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, vTop[1], 0, vTop[0]], 2))
    g.setIndex([0, 1, 2, 0, 2, 3])
    g.computeVertexNormals()
    const m = new THREE.Mesh(g, mat)
    if (name) m.name = name
    m.castShadow = m.receiveShadow = true
    return m
  }
  const plane = (w: number, h: number, mat: THREE.Material, name?: string) => {
    const m = new THREE.Mesh(keep(new THREE.PlaneGeometry(w, h)), mat)
    if (name) m.name = name
    m.receiveShadow = true
    return m
  }

  // ── Building / Walls ────────────────────────────────
  // BoxGeometry の面の順：+X, -X, +Y, -Y, +Z, -Z。外側だけ白い外壁、内側は合板
  const walls = named("Walls")
  const wallH = (z: number) => eaveAt(z) - yWall
  const faces = (outside: number, mats: { out: THREE.Material; in: THREE.Material }) =>
    [0, 1, 2, 3, 4, 5].map((i) => (i === outside ? mats.out : i === (outside ^ 1) ? mats.in : edgeMat))
  // 正面：開口の左右のパネルと、開口の上の垂れ壁
  const leftW = S.opening.left + W / 2
  const rightW = W / 2 - S.opening.right
  const hf = wallH(front)
  const frontLeft = box(leftW, hf, t, faces(4, { out: wallMat(leftW), in: plyMat }), "FrontWallLeft")
  frontLeft.position.set(-W / 2 + leftW / 2, yWall + hf / 2, front - t / 2)
  const frontRight = box(rightW, hf, t, faces(4, { out: wallMat(rightW), in: plyMat }), "FrontWallRight")
  frontRight.position.set(W / 2 - rightW / 2, yWall + hf / 2, front - t / 2)
  const headerH = eaveAt(front) - (S.floorY + S.opening.height)
  const openW = S.opening.right - S.opening.left
  const header = box(openW, headerH, t, faces(4, { out: wallMat(openW), in: plyMat }), "FrontHeader")
  header.position.set((S.opening.left + S.opening.right) / 2, S.floorY + S.opening.height + headerH / 2, front - t / 2)
  // 側面：屋根の勾配なりの台形。外（白い外壁）と内（合板）を別の面で張る
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
  const topF = eaveAt(front)
  const topB = eaveAt(back)
  const vT: [number, number] = [wallH(back) / wallH(front), 1] // 奥の上端の v（外壁の模様を縦に伸ばさない）
  const sideMat = wallMat(D)
  const xl = -W / 2
  const xr = W / 2
  const sideL = named(
    "SideWallLeft",
    quad([V(xl, yWall, back), V(xl, yWall, front), V(xl, topF, front), V(xl, topB, back)], sideMat, [vT[0], 1]),
    quad([V(xl + t, yWall, front), V(xl + t, yWall, back), V(xl + t, topB, back), V(xl + t, topF, front)], plyMat),
  )
  const sideR = named(
    "SideWallRight",
    quad([V(xr, yWall, front), V(xr, yWall, back), V(xr, topB, back), V(xr, topF, front)], sideMat, [1, vT[0]]),
    quad([V(xr - t, yWall, back), V(xr - t, yWall, front), V(xr - t, topF, front), V(xr - t, topB, back)], plyMat),
  )
  const hb = wallH(back)
  const backWall = box(W, hb, t, faces(5, { out: wallMat(W), in: plyMat }), "BackWall")
  backWall.position.set(0, yWall + hb / 2, back + t / 2)
  // 側面の窓（写真の立面図にある引き違い窓）
  const winGlass = keep(new THREE.MeshStandardMaterial({ color: "#1d242b", roughness: 0.05, metalness: 0.9 }))
  const winFrame = keep(new THREE.MeshStandardMaterial({ color: "#c8ccd0", roughness: 0.35, metalness: 0.7 }))
  for (const side of [-1, 1]) {
    const win = named("SideWindow")
    const glass = box(0.015, 0.62, 1.1, winGlass)
    const frameTop = box(0.04, 0.04, 1.18, winFrame)
    frameTop.position.y = 0.33
    const frameBottom = frameTop.clone()
    frameBottom.position.y = -0.33
    const mullion = box(0.04, 0.66, 0.035, winFrame)
    const sideA = box(0.04, 0.7, 0.04, winFrame)
    sideA.position.z = -0.57
    const sideB = sideA.clone()
    sideB.position.z = 0.57
    win.add(glass, frameTop, frameBottom, mullion, sideA, sideB)
    win.position.set(side * (W / 2 + 0.01), 2.0, -0.3)
    walls.add(win)
  }
  walls.add(frontLeft, frontRight, header, sideL, sideR, backWall)

  // ── Building / Roof：波板（波は前後方向に走る） ───────
  const roofW = W + S.roof.overhang * 2
  const roofD = D + S.roof.overhang * 2
  const ribs = Math.round(roofW / S.roof.rib)
  const roofGeo = keep(new THREE.PlaneGeometry(roofW, roofD, ribs * 4, 1))
  roofGeo.rotateX(-Math.PI / 2)
  {
    const p = roofGeo.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i)
      const z = p.getZ(i)
      const wave = Math.sin((x / S.roof.rib) * Math.PI * 2) * S.roof.ribDepth
      p.setY(i, eaveAt(z) + 0.03 + wave)
    }
    roofGeo.computeVertexNormals()
  }
  const roofMap = keep(roofTexture())
  const roofMat = keep(new THREE.MeshStandardMaterial({ map: roofMap, color: C.roof, roughness: 0.55, metalness: 0.55, side: THREE.DoubleSide }))
  const roof = new THREE.Mesh(roofGeo, roofMat)
  roof.name = "Roof"
  roof.castShadow = roof.receiveShadow = true
  // 軒先の水切り（正面と側面の縁の細い板）
  const fascia = box(roofW, 0.06, 0.03, blueMat, "RoofFascia")
  fascia.position.set(0, eaveAt(front) + 0.01, front + S.roof.overhang)
  fascia.material = keep(new THREE.MeshStandardMaterial({ color: "#6f767c", roughness: 0.5, metalness: 0.6 }))

  // ── Building / Foundation ───────────────────────────
  const fh = S.foundation.height
  const fo = S.foundation.overhang
  const foundation = named("Foundation")
  const fl = box(leftW + fo, fh, t + fo * 2, concMat)
  fl.position.set(-W / 2 + (leftW - fo) / 2, fh / 2, front - t / 2)
  const fr = box(rightW + fo, fh, t + fo * 2, concMat)
  fr.position.set(W / 2 - (rightW - fo) / 2, fh / 2, front - t / 2)
  const fsL = box(t + fo * 2, fh, D + fo * 2, concMat)
  fsL.position.set(-W / 2 + t / 2, fh / 2, 0)
  const fsR = fsL.clone()
  fsR.position.x = W / 2 - t / 2
  const fb = box(W + fo * 2, fh, t + fo * 2, concMat)
  fb.position.set(0, fh / 2, back + t / 2)
  foundation.add(fl, fr, fsL, fsR, fb)

  // ── Building / BlueFrames：四隅の柱・開口の枠・腰の帯 ──
  const frames = named("BlueFrames")
  const p = S.post
  for (const [x, z] of [[-W / 2, front], [W / 2, front], [-W / 2, back], [W / 2, back]]) {
    const h = eaveAt(z) - yWall + 0.02
    const post = box(p, h, p, blueMat, "CornerPost")
    post.position.set(x + (x < 0 ? p / 2 - 0.01 : -p / 2 + 0.01), yWall + h / 2, z + (z > 0 ? -p / 2 + 0.01 : p / 2 - 0.01))
    frames.add(post)
  }
  for (const x of [S.opening.left, S.opening.right]) {
    const h = S.opening.height + S.floorY - 0.02
    const jamb = box(p, h, t + 0.04, blueMat, "OpeningJamb")
    jamb.position.set(x + (x < 0 ? -p / 2 : p / 2), h / 2, front - t / 2 + 0.01)
    frames.add(jamb)
  }
  const band = (len: number, x: number, z: number, alongX: boolean) => {
    const b = box(alongX ? len : 0.03, 0.08, alongX ? 0.03 : len, blueMat, "BaseTrim")
    b.position.set(x, yWall + 0.04, z)
    frames.add(b)
  }
  band(leftW, -W / 2 + leftW / 2, front + 0.005, true)
  band(rightW, W / 2 - rightW / 2, front + 0.005, true)
  band(D, -W / 2 - 0.005, 0, false)
  band(D, W / 2 + 0.005, 0, false)
  band(W, 0, back - 0.005, true)
  // 外壁パネルの横の継ぎ目（細い影の線）
  const seamMat = keep(new THREE.MeshStandardMaterial({ color: "#c9cdd0", roughness: 0.6 }))
  for (const [w, x] of [[leftW, -W / 2 + leftW / 2], [rightW, W / 2 - rightW / 2]]) {
    const seam = box(w - p * 2, 0.012, 0.006, seamMat, "PanelSeam")
    seam.position.set(x, S.panelSeamY, front + 0.004)
    frames.add(seam)
  }

  const building = named("Building", walls, roof, fascia, foundation, frames)

  // ── Front / RollingShutter：スラット1枚ずつ（開き具合で枚数が変わる） ──
  const slatH = S.slat
  const slatW = openW + 0.06
  const slatShape = new THREE.Shape()
  // 断面（奥行き z, 高さ y）：浅い弓なりの板
  slatShape.moveTo(0, 0)
  slatShape.lineTo(0.012, 0.004)
  slatShape.quadraticCurveTo(0.02, slatH / 2, 0.012, slatH - 0.004)
  slatShape.lineTo(0, slatH)
  slatShape.lineTo(-0.004, slatH)
  slatShape.lineTo(-0.004, 0)
  slatShape.closePath()
  const slatGeo = keep(new THREE.ExtrudeGeometry(slatShape, { depth: slatW, bevelEnabled: false, curveSegments: 6 }))
  slatGeo.rotateY(Math.PI / 2) // 押し出しを X 方向へ（断面の x → -z）
  slatGeo.translate(-slatW / 2, 0, 0)
  slatGeo.scale(1, 1, -1) // 膨らみを外（+Z）へ
  const slatMat = keep(
    new THREE.MeshStandardMaterial({ color: C.shutter, roughness: 0.38, metalness: 0.45, normalMap: keep(slatNormal()), side: THREE.DoubleSide }),
  )
  const maxSlats = Math.ceil(S.opening.height / slatH) + 2
  const slats = new THREE.InstancedMesh(slatGeo, slatMat, maxSlats)
  slats.name = "Slats"
  slats.castShadow = true
  const bottomBar = box(slatW, 0.05, 0.05, keep(new THREE.MeshStandardMaterial({ color: "#aeb3b8", roughness: 0.35, metalness: 0.8 })), "BottomBar")
  const shutter = named("RollingShutter", slats, bottomBar)
  const shutterX = (S.opening.left + S.opening.right) / 2
  shutter.position.set(shutterX, 0, front + 0.03)
  const topY = S.floorY + S.opening.height + 0.02
  const mtx = new THREE.Matrix4()
  let openness: number = S.shutterOpen
  /** 0 = 閉、1 = 全開。下端の高さから見えるスラットの枚数を決める */
  const setShutter = (open: number) => {
    openness = THREE.MathUtils.clamp(open, 0, 1)
    const bottom = S.floorY + S.opening.height * openness
    const n = Math.min(maxSlats, Math.ceil((topY - bottom) / slatH))
    for (let i = 0; i < n; i++) {
      mtx.makeTranslation(0, bottom + i * slatH, 0)
      slats.setMatrixAt(i, mtx)
    }
    slats.count = n
    slats.instanceMatrix.needsUpdate = true
    slats.computeBoundingSphere()
    bottomBar.position.set(0, bottom + 0.02, 0.01)
    bottomBar.visible = openness < 0.995
  }
  setShutter(openness)

  // ── Front / Awning：巻き上げ部の丸いカバー ─────────────
  const bx = S.shutterBox
  const aw = openW + bx.extra * 2
  const awShape = new THREE.Shape()
  const r = bx.height * 0.5
  awShape.moveTo(0, 0)
  awShape.lineTo(bx.depth - r, 0)
  awShape.absarc(bx.depth - r, r, r, -Math.PI / 2, Math.PI / 2, false)
  awShape.lineTo(0, bx.height)
  awShape.closePath()
  const awGeo = keep(new THREE.ExtrudeGeometry(awShape, { depth: aw, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2, curveSegments: 20 }))
  // 断面 (x: 前への出, y: 高さ) を (z, y) に、押し出しを X に
  awGeo.rotateY(-Math.PI / 2)
  awGeo.translate(aw / 2, 0, 0)
  const awMat = keep(new THREE.MeshStandardMaterial({ color: C.blue, roughness: 0.3, metalness: 0.4 }))
  const awning = new THREE.Mesh(awGeo, awMat)
  awning.name = "Awning"
  awning.castShadow = true
  awning.position.set(shutterX, eaveAt(front) - bx.height - 0.01, front)

  // ── Front / Signs：写真から切り出した看板を壁に貼る ──────
  const signs = named("Signs")
  const signMat = (key: string) =>
    keep(
      new THREE.MeshStandardMaterial({
        map: photos[key],
        transparent: meta[key].alpha,
        alphaTest: meta[key].alpha ? 0.5 : 0,
        roughness: 0.5,
        metalness: 0.15,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
    )
  const placeSign = (key: string, wallX: number, sx: number, sy: number, w: number) => {
    const h = w / meta[key].aspect
    const m = plane(w, h, signMat(key), key)
    m.position.set(wallX + sx + w / 2, sy + h / 2, front + 0.006)
    m.castShadow = true
    signs.add(m)
  }
  for (const s of WALL_SIGNS.left) placeSign(s.tex, -W / 2 + p, s.x, s.y, s.w)
  for (const s of WALL_SIGNS.right) placeSign(s.tex, S.opening.right + p, s.x, s.y, s.w)

  // ── Front / SecurityDevices：人感ライト（丸い金属）、配線、照明、分電盤 ──
  const devices = named("SecurityDevices")
  const chrome = keep(new THREE.MeshStandardMaterial({ color: "#e4e6e8", roughness: 0.12, metalness: 1 }))
  const sensor = new THREE.Mesh(keep(new THREE.SphereGeometry(0.055, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2)), chrome)
  sensor.rotation.x = Math.PI / 2
  sensor.position.set(-W / 2 + p + 1.05, 1.42, front + 0.005)
  const jbox = box(0.12, 0.1, 0.06, keep(new THREE.MeshStandardMaterial({ color: "#e8e8e2", roughness: 0.6 })), "JunctionBox")
  jbox.position.set(S.opening.right + p + 0.2, 2.25, front + 0.03)
  // 右の壁の黒い配線：分電盤から下へ垂れ、右の柱へ回って上へ
  const cable = new THREE.CatmullRomCurve3(
    [[0.2, 2.2], [0.22, 2.02], [0.34, 1.93], [0.56, 1.96], [0.7, 2.12], [0.74, 2.42]].map(
      ([x, y]) => new THREE.Vector3(S.opening.right + p + x, y, front + 0.03),
    ),
  )
  const cableMesh = new THREE.Mesh(keep(new THREE.TubeGeometry(cable, 40, 0.014, 8)), keep(new THREE.MeshStandardMaterial({ color: "#161616", roughness: 0.5 })))
  cableMesh.name = "Conduit"
  // 左の角の投光器（腕木の先に黒い箱）
  const floodMat = keep(new THREE.MeshStandardMaterial({ color: "#1b1d20", roughness: 0.5, metalness: 0.4 }))
  const arm = box(0.4, 0.04, 0.04, floodMat, "FloodlightArm")
  arm.position.set(-W / 2 - 0.2, 2.3, front - 0.05)
  const flood = box(0.18, 0.12, 0.08, floodMat, "Floodlight")
  flood.position.set(-W / 2 - 0.42, 2.25, front - 0.05)
  flood.rotation.z = -0.4
  devices.add(sensor, jbox, cableMesh, arm, flood)

  // ── Front / Props：灰皿スタンド、ピンクのベンチ ─────────
  const props = named("Props")
  const steel = keep(new THREE.MeshStandardMaterial({ color: "#b9bdc1", roughness: 0.3, metalness: 0.9 }))
  const ashFront = keep(new THREE.MeshStandardMaterial({ map: photos["ashtray-front"], roughness: 0.3, metalness: 0.6 }))
  const ashtray = box(0.3, 0.8, 0.26, [steel, steel, steel, steel, ashFront, steel], "AshtrayStand")
  ashtray.position.set(W / 2 - 0.35, 0.4, front + 0.45)
  const pinkMat = keep(new THREE.MeshStandardMaterial({ color: "#e7a9b8", roughness: 0.7 }))
  const bench = named("PinkBench", box(0.62, 0.035, 0.3, pinkMat))
  bench.children[0].position.y = 0.36
  for (const [x, z] of [[-0.27, -0.12], [0.27, -0.12], [-0.27, 0.12], [0.27, 0.12]]) {
    const leg = box(0.035, 0.36, 0.035, pinkMat)
    leg.position.set(x, 0.18, z)
    bench.add(leg)
  }
  bench.position.set(W / 2 + 0.45, 0, front + 0.3)
  bench.rotation.y = -0.4
  props.add(ashtray, bench)

  const frontGroup = named("Front", shutter, awning, signs, devices, props)

  // ── Interior ───────────────────────────────────────
  const interior = named("Interior")
  const inW = W - t * 2
  const inD = D - t * 2
  // 土間
  const floorMat = keep(new THREE.MeshStandardMaterial({ map: concMap, color: "#b9b6b0", roughness: 0.85, envMapIntensity: 0.5 }))
  const floor = plane(inW, inD + t, floorMat, "Floor")
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0, S.floorY, t / 2)
  // 天井（勾配なりの合板）と垂木
  const ceilY = (z: number) => eaveAt(z) - 0.12
  const ceiling = plane(inW, inD, plyMat, "Ceiling")
  ceiling.rotation.x = Math.PI / 2 + Math.atan2(S.eaveFront - S.eaveBack, D)
  ceiling.position.set(0, (ceilY(front) + ceilY(back)) / 2, 0)
  const rafterMat = keep(new THREE.MeshStandardMaterial({ color: "#3c2918", roughness: 0.8, envMapIntensity: INSIDE_ENV }))
  for (let x = -inW / 2 + 0.3; x < inW / 2; x += 0.6) {
    const rf = box(0.06, 0.1, inD, rafterMat, "Rafter")
    rf.position.set(x, (ceilY(front) + ceilY(back)) / 2 - 0.06, 0)
    rf.rotation.x = Math.atan2(S.eaveFront - S.eaveBack, D)
    interior.add(rf)
  }
  // 奥の壁一面（写真）。写真は幅いっぱい・床の少し上〜天井
  // 写真に光の当たり方が写っているので、照明の影響を受けない材質にして明るさだけ室内灯で決める
  const backPhoto = keep(new THREE.MeshBasicMaterial({ map: photos["interior-back"], color: new THREE.Color().setScalar(0.62) }))
  const bpW = inW - 0.02
  const bpH = bpW / meta["interior-back"].aspect
  const backWallPhoto = plane(bpW, bpH, backPhoto, "BackWallPhoto")
  backWallPhoto.position.set(0, ceilY(back) - bpH / 2 + 0.05, back + t + 0.012)
  // 写真の下（床から写真まで）は暗い箱と棚でつなぐ
  const lowBack = plane(bpW, Math.max(0.05, backWallPhoto.position.y - bpH / 2 - S.floorY), keep(new THREE.MeshStandardMaterial({ color: "#2a2018", roughness: 0.9 })), "BackWallLower")
  lowBack.position.set(0, S.floorY + (backWallPhoto.position.y - bpH / 2 - S.floorY) / 2, back + t + 0.01)
  interior.add(floor, ceiling, backWallPhoto, lowBack)

  // 手前の小物：Castrol の看板（立て掛け）、黒いコンテナ、タミヤの箱、ホットウィールの台、事務椅子、タイヤ
  const z0 = front - 0.55
  const castrol = plane(0.72, 0.72 / meta["sign-castrol"].aspect, keep(new THREE.MeshStandardMaterial({ map: photos["sign-castrol"], transparent: true, alphaTest: 0.5, roughness: 0.4, side: THREE.DoubleSide })), "CastrolSign")
  castrol.position.set(S.opening.left + 0.3, S.floorY + 0.5, z0 + 0.28)
  castrol.rotation.set(-0.18, 0.35, 0)
  castrol.castShadow = true
  const crateMat = keep(new THREE.MeshStandardMaterial({ color: "#1c1c1e", roughness: 0.7 }))
  for (let i = 0; i < 3; i++) {
    const crate = box(0.5, 0.26, 0.36, crateMat, "Crate")
    crate.position.set(S.opening.left + 0.2, S.floorY + 0.13 + i * 0.27, z0 - 0.5)
    interior.add(crate)
  }
  const card = keep(new THREE.MeshStandardMaterial({ color: "#b8905e", roughness: 0.9 }))
  const tamiyaFront = keep(new THREE.MeshStandardMaterial({ map: photos["box-tamiya"], roughness: 0.9 }))
  const tamiya = box(0.62, 0.52, 0.45, [card, card, card, card, tamiyaFront, card], "TamiyaBox")
  tamiya.position.set(shutterX - 0.55, S.floorY + 0.26, z0 - 0.7)
  tamiya.rotation.y = 0.12

  // ホットウィールの台（折りたたみの X 脚＋トレイ＋青い箱＋看板）
  const hw = named("HotWheelsStand")
  const woodMat = keep(new THREE.MeshStandardMaterial({ color: "#c79a62", roughness: 0.7 }))
  for (const s of [-1, 1]) {
    for (const zz of [-0.18, 0.18]) {
      const leg = box(0.03, 0.7, 0.03, woodMat)
      leg.position.set(s * 0.18, 0.33, zz)
      leg.rotation.z = s * 0.55
      hw.add(leg)
    }
  }
  const tray = box(0.85, 0.05, 0.5, woodMat, "Tray")
  tray.position.y = 0.62
  hw.add(tray)
  const blueBox = keep(new THREE.MeshStandardMaterial({ color: "#2f58b8", roughness: 0.6 }))
  const packs = new THREE.InstancedMesh(keep(new THREE.BoxGeometry(0.07, 0.11, 0.03)), blueBox, 40)
  for (let i = 0; i < 40; i++) {
    mtx.makeRotationX(-0.25).setPosition(-0.36 + (i % 10) * 0.08, 0.7, -0.18 + Math.floor(i / 10) * 0.11)
    packs.setMatrixAt(i, mtx)
  }
  packs.name = "HotWheelsPacks"
  hw.add(packs)
  const hwSign = plane(0.82, 0.82 / meta["sign-hotwheels"].aspect, keep(new THREE.MeshStandardMaterial({ map: photos["sign-hotwheels"], roughness: 0.5 })), "HotWheelsSign")
  hwSign.position.set(0, 0.76, 0.27)
  hwSign.rotation.x = -0.15
  hw.add(hwSign)
  hw.position.set(shutterX + 0.1, S.floorY, z0 - 0.3)
  hw.rotation.y = -0.08

  // 事務椅子（5本脚・座面・背もたれ）
  const chairMat = keep(new THREE.MeshStandardMaterial({ color: "#7fa3b8", roughness: 0.65 }))
  const blackPlastic = keep(new THREE.MeshStandardMaterial({ color: "#151515", roughness: 0.5 }))
  const chair = () => {
    const g = named("OfficeChair")
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2
      const legB = box(0.3, 0.025, 0.035, blackPlastic)
      legB.position.set(Math.cos(a) * 0.15, 0.06, Math.sin(a) * 0.15)
      legB.rotation.y = -a
      const wheel = new THREE.Mesh(keep(new THREE.SphereGeometry(0.025, 8, 6)), blackPlastic)
      wheel.position.set(Math.cos(a) * 0.3, 0.025, Math.sin(a) * 0.3)
      g.add(legB, wheel)
    }
    const stem = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.025, 0.025, 0.36, 10)), chrome)
    stem.position.y = 0.26
    const seat = box(0.46, 0.08, 0.44, chairMat)
    seat.position.y = 0.48
    const backRest = box(0.42, 0.4, 0.06, chairMat)
    backRest.position.set(0, 0.78, -0.22)
    backRest.rotation.x = -0.12
    g.add(stem, seat, backRest)
    return g
  }
  const chair1 = chair()
  chair1.position.set(S.opening.right - 0.55, S.floorY, z0 - 0.9)
  chair1.rotation.y = -0.6
  const chair2 = chair()
  chair2.position.set(S.opening.right - 0.25, S.floorY, z0 - 1.45)
  chair2.rotation.y = 0.4
  // タイヤ（左奥に2本重ね）
  const tireMat = keep(new THREE.MeshStandardMaterial({ color: "#121212", roughness: 0.85 }))
  const tireGeo = keep(new THREE.TorusGeometry(0.28, 0.1, 12, 28))
  for (let i = 0; i < 2; i++) {
    const tire = new THREE.Mesh(tireGeo, tireMat)
    tire.name = "Tire"
    tire.rotation.x = Math.PI / 2
    tire.position.set(-W / 2 + 0.55, S.floorY + 0.1 + i * 0.2, back + 0.7)
    tire.castShadow = true
    interior.add(tire)
  }
  interior.add(castrol, tamiya, hw, chair1, chair2)

  // ── Lighting：室内の電球（かご付きの吊り下げ灯） ─────────
  const lighting = named("Lighting")
  const bulbMat = keep(new THREE.MeshStandardMaterial({ color: "#fff2d6", emissive: new THREE.Color("#ffc46b"), emissiveIntensity: 1.5 }))
  const bulbs: THREE.PointLight[] = []
  for (const [x, y, z] of [[S.opening.left + 0.35, ceilY(front) - 0.35, front - 0.55], [0.4, ceilY(0) - 0.3, -0.6]]) {
    const bulb = new THREE.Mesh(keep(new THREE.SphereGeometry(0.05, 12, 8)), bulbMat)
    bulb.position.set(x, y, z)
    const cage = new THREE.Mesh(keep(new THREE.SphereGeometry(0.075, 8, 6)), keep(new THREE.MeshStandardMaterial({ color: "#6b5a3a", wireframe: true })))
    cage.position.copy(bulb.position)
    const light = new THREE.PointLight("#ffb45a", 3, 6, 1.6)
    light.position.copy(bulb.position)
    bulbs.push(light)
    lighting.add(bulb, cage, light)
  }
  /** 室内の灯り（0..1。夜の場面では強く） */
  const setInteriorLights = (k: number, strength = 1) => {
    bulbMat.emissiveIntensity = 1.5 * k * strength
    for (const b of bulbs) b.intensity = 3 * k * strength
    backPhoto.color.setScalar(0.42 + 0.2 * k * Math.min(strength, 2))
  }

  // ── Ground：入口前の土間コンクリート（濡れた暗いしみ） ─────
  const apronD = 2.2
  const apron = plane(W + 1.2, apronD, concMat, "Apron")
  apron.rotation.x = -Math.PI / 2
  apron.position.set(0, 0.005, front + apronD / 2)
  const ground = named("Ground", apron)

  group.add(building, frontGroup, interior, lighting, ground)

  return {
    group,
    setShutter,
    setInteriorLights,
    get shutterOpen() {
      return openness
    },
    dispose() {
      disposables.forEach((d) => d.dispose())
      Object.values(photos).forEach((t) => t.dispose())
    },
  }
}
