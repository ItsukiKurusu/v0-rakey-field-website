// 終点：RAKEY FIELD のガレージ。実際のお店（白い壁に紺の縁取り・切妻屋根・青い看板・シャッター・
// 人工芝の敷地）を下敷きに、ルート66のモーテル風のポールサイン（ネオン）を立てる。
// 建物の正面は +Z（道の側）。
import * as THREE from "three"
import { GARAGE } from "./constants"
import type { Road } from "./road"

function fontFamily(cssVar: string, fallback: string) {
  const v = getComputedStyle(document.body).getPropertyValue(cssVar).trim()
  return v ? `${v}, ${fallback}` : fallback
}

/** 幅 maxW に収まるよう、書体の大きさを下げてから描く */
function fitText(g: CanvasRenderingContext2D, text: string, maxW: number, size: number, font: (px: number) => string) {
  let px = size
  g.font = font(px)
  while (g.measureText(text).width > maxW && px > 8) {
    px -= 4
    g.font = font(px)
  }
  return px
}

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, repeat?: [number, number]) {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  draw(c.getContext("2d")!)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(...repeat)
  }
  return t
}

/** ネオンの文字。on = 光っている管（発光用）、off = 消えている管（地の色） */
function neonTexture(on: boolean) {
  const display = fontFamily("--font-bebas-neue", "Impact, 'Arial Black', sans-serif")
  return canvasTex(1024, 512, (g) => {
    g.fillStyle = on ? "#000" : "#15110f"
    g.fillRect(0, 0, 1024, 512)
    g.textAlign = "center"
    g.textBaseline = "middle"
    const tube = (text: string, x: number, y: number, size0: number, color: string) => {
      const size = fitText(g, text, 900, size0, (px) => `${px}px ${display}`)
      g.lineWidth = size * 0.06
      g.lineJoin = "round"
      if (on) {
        g.shadowColor = color
        g.shadowBlur = 16
        g.strokeStyle = color
        g.strokeText(text, x, y)
        g.shadowBlur = 0
        g.strokeStyle = "#fff4ec"
        g.lineWidth = size * 0.022
        g.strokeText(text, x, y)
      } else {
        g.strokeStyle = "#5a3a38"
        g.strokeText(text, x, y)
      }
    }
    tube("RAKEY", 512, 150, 230, "#ff3b2f")
    tube("FIELD", 512, 345, 230, "#ff3b2f")
    tube("USED CARS · RENTAL · SERVICE", 512, 470, 52, "#ffc14d")
    // 縁取りの管
    g.lineWidth = 10
    g.strokeStyle = on ? "#41d6ff" : "#2c3c44"
    if (on) {
      g.shadowColor = "#41d6ff"
      g.shadowBlur = 24
    }
    g.strokeRect(24, 24, 976, 464)
    g.shadowBlur = 0
  })
}

/** 実際のお店の青い看板（白い文字） */
function shopSignTexture() {
  return canvasTex(1024, 400, (g) => {
    g.fillStyle = "#f4f6f8"
    g.fillRect(0, 0, 1024, 400)
    g.fillStyle = "#1f43a8"
    g.fillRect(18, 18, 988, 364)
    g.strokeStyle = "#f4f6f8"
    g.lineWidth = 6
    g.strokeRect(40, 40, 944, 320)
    g.fillStyle = "#f4f6f8"
    g.textAlign = "center"
    g.textBaseline = "middle"
    fitText(g, "RAKEY FIELD", 860, 150, (px) => `bold ${px}px Georgia, 'Times New Roman', serif`)
    g.fillText("RAKEY FIELD", 512, 210)
  })
}

function shutterTexture() {
  return canvasTex(256, 256, (g) => {
    for (let y = 0; y < 256; y += 16) {
      const grad = g.createLinearGradient(0, y, 0, y + 16)
      grad.addColorStop(0, "#3a5aa8")
      grad.addColorStop(0.6, "#243f86")
      grad.addColorStop(1, "#162a5c")
      g.fillStyle = grad
      g.fillRect(0, y, 256, 16)
    }
  })
}

function turfTexture() {
  return canvasTex(
    256,
    256,
    (g) => {
      g.fillStyle = "#3f7a38"
      g.fillRect(0, 0, 256, 256)
      for (let k = 0; k < 5000; k++) {
        const v = 90 + Math.random() * 90
        g.fillStyle = `rgba(${v * 0.55},${v},${v * 0.4},0.5)`
        g.fillRect(Math.random() * 256, Math.random() * 256, 1, 3)
      }
      // 芝目の縞
      for (let x = 0; x < 256; x += 64) {
        g.fillStyle = "rgba(255,255,255,0.04)"
        g.fillRect(x, 0, 32, 256)
      }
    },
    [6, 4],
  )
}

export function createGarage(road: Road) {
  const group = new THREE.Group()
  group.name = "garage"
  const { width: W, depth: D, height: H } = GARAGE
  const textures: THREE.Texture[] = []
  const tex = <T extends THREE.Texture>(t: T) => (textures.push(t), t)

  const white = new THREE.MeshStandardMaterial({ color: "#eceef0", roughness: 0.82 })
  const navy = new THREE.MeshStandardMaterial({ color: "#1c2a55", roughness: 0.6 })
  const roofMat = new THREE.MeshStandardMaterial({ color: "#2b2f36", roughness: 0.75 })
  const glassMat = new THREE.MeshStandardMaterial({
    color: "#1a2330",
    roughness: 0.15,
    metalness: 0.4,
    emissive: new THREE.Color("#ffb865"),
    emissiveIntensity: 0,
  })

  // 壁と紺の縁取り
  const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m)
    mesh.position.set(x, y, z)
    mesh.castShadow = mesh.receiveShadow = true
    group.add(mesh)
    return mesh
  }
  box(W, H, D, white, 0, H / 2, 0)
  box(W + 0.04, 0.4, D + 0.04, navy, 0, 0.2, 0) // 腰の帯
  box(W + 0.06, 0.18, D + 0.06, navy, 0, H - 0.09, 0) // 軒の帯
  for (const x of [-W / 2, W / 2]) box(0.18, H, 0.18, navy, x, H / 2, D / 2) // 角の柱

  // 切妻屋根（正面に三角が見える）
  const roofH = 1.5
  const tri = new THREE.Shape()
  tri.moveTo(-W / 2 - 0.35, 0)
  tri.lineTo(W / 2 + 0.35, 0)
  tri.lineTo(0, roofH)
  tri.closePath()
  const roofGeo = new THREE.ExtrudeGeometry(tri, { depth: D + 0.6, bevelEnabled: false })
  roofGeo.translate(0, H, -D / 2 - 0.3)
  const roof = new THREE.Mesh(roofGeo, roofMat)
  roof.castShadow = true
  group.add(roof)
  // 妻面（白）と紺の破風
  const gable = new THREE.Shape()
  gable.moveTo(-W / 2, 0)
  gable.lineTo(W / 2, 0)
  gable.lineTo(0, roofH * (W / 2) / (W / 2 + 0.35))
  gable.closePath()
  const gableMesh = new THREE.Mesh(new THREE.ShapeGeometry(gable), white)
  gableMesh.position.set(0, H, D / 2 + 0.31)
  group.add(gableMesh)

  // シャッター（右）、窓とドア（左）
  const shutter = new THREE.Mesh(
    new THREE.PlaneGeometry(3.8, 3.3),
    new THREE.MeshStandardMaterial({ map: tex(shutterTexture()), roughness: 0.5, metalness: 0.3 }),
  )
  shutter.position.set(2.6, 1.65 + 0.02, D / 2 + 0.01)
  group.add(shutter)
  const windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.3), glassMat)
  windowMesh.position.set(-3.1, 1.75, D / 2 + 0.01)
  group.add(windowMesh)
  box(2.6, 0.1, 0.06, navy, -3.1, 1.08, D / 2 + 0.03)
  box(2.6, 0.1, 0.06, navy, -3.1, 2.42, D / 2 + 0.03)

  // 実際のお店と同じ青い看板
  const signMat = new THREE.MeshStandardMaterial({ map: tex(shopSignTexture()), roughness: 0.5 })
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.33), signMat)
  sign.position.set(-2.4, 3.25, D / 2 + 0.02)
  group.add(sign)

  // 壁の灯り（シャッターの上）
  const wallLampMat = new THREE.MeshStandardMaterial({ color: "#333", emissive: new THREE.Color("#ffd29a"), emissiveIntensity: 0 })
  box(0.6, 0.18, 0.3, wallLampMat, 2.6, 3.6, D / 2 + 0.15)

  // 人工芝の敷地（実際のお店も芝）
  const turfMat = new THREE.MeshStandardMaterial({ map: tex(turfTexture()), roughness: 1 })
  // 建物の正面（z = D/2）から道の路肩の手前まで
  const lotDepth = GARAGE.side - D / 2 - 5.8
  const turf = new THREE.Mesh(new THREE.PlaneGeometry(W + 8, lotDepth), turfMat)
  turf.rotation.x = -Math.PI / 2
  turf.position.set(0, 0.012, D / 2 + lotDepth / 2)
  turf.receiveShadow = true
  group.add(turf)

  // ポールサイン（道寄りの角）
  const neonOffTex = tex(neonTexture(false))
  const neonOnTex = tex(neonTexture(true))
  const neonMat = new THREE.MeshStandardMaterial({
    map: neonOffTex,
    emissiveMap: neonOnTex,
    emissive: new THREE.Color("#ffffff"),
    emissiveIntensity: 0,
    roughness: 0.6,
  })
  const pole = new THREE.Group()
  const poleMat = new THREE.MeshStandardMaterial({ color: "#c9ccd0", metalness: 0.8, roughness: 0.35 })
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 4.4, 12), poleMat)
  post.position.y = 2.2
  const board = new THREE.Mesh(new THREE.BoxGeometry(4.6, 2.3, 0.3), new THREE.MeshStandardMaterial({ color: "#15110f", roughness: 0.7 }))
  board.position.y = 5.5
  const face = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 2.25), neonMat)
  face.position.set(0, 5.5, 0.16)
  const faceBack = face.clone()
  faceBack.rotation.y = Math.PI
  faceBack.position.z = -0.16
  post.castShadow = board.castShadow = true
  pole.add(post, board, face, faceBack)
  // 敷地の道寄りの角（路肩の外）。停まった車の後ろに立つ側（建物の +X＝道の進む向きの逆）に置く
  pole.position.set(W / 2 + 1.5, 0, D / 2 + lotDepth - 0.8)
  // 停まった車の斜め前（最後のカメラ）から正面が見える向き。建物の座標では 前 = -X、右 = -Z
  pole.rotation.y = -0.72
  group.add(pole)

  // ネオンの照り返し
  const neonLight = new THREE.PointLight("#ff4a3a", 0, 22, 1.6)
  neonLight.position.set(pole.position.x, 5.1, pole.position.z + 1.2)
  const wallLight = new THREE.PointLight("#ffcf94", 0, 16, 1.6)
  wallLight.position.set(2.6, 3.4, D / 2 + 1.2)
  group.add(neonLight, wallLight)

  // 道の向かい側の街灯（停まった車を照らす）。建物の座標で、道の反対側
  const lampPost = new THREE.Group()
  const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 6, 10), poleMat)
  lampPole.position.y = 3
  const lampArm = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 1.6), poleMat)
  lampArm.position.set(0, 5.95, -0.8)
  const lampHeadMat = new THREE.MeshStandardMaterial({ color: "#222", emissive: new THREE.Color("#ffc27a"), emissiveIntensity: 0 })
  const lampHead = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.6), lampHeadMat)
  lampHead.position.set(0, 5.85, -1.5)
  lampPole.castShadow = true
  lampPost.add(lampPole, lampArm, lampHead)
  lampPost.position.set(-2.5, 0, GARAGE.side + 6.5)
  group.add(lampPost)
  const streetLight = new THREE.PointLight("#ffc27a", 0, 28, 1.4)
  streetLight.position.set(-2.5, 5.6, GARAGE.side + 5)
  group.add(streetLight)

  // 置く：停車位置の少し先、道の右手。正面を道へ向ける
  const f = road.frameAt(road.carS(1) + GARAGE.ahead)
  group.position.copy(f.pos).addScaledVector(f.right, GARAGE.side)
  group.position.y = 0
  const n = f.right.clone().negate()
  group.rotation.y = Math.atan2(n.x, n.z)

  /** ネオンを灯す（0..1）。灯る瞬間は数回またたく */
  const setNeon = (k: number, time: number) => {
    const flicker = k > 0 && k < 1 ? (Math.sin(time * 53) > 0.2 ? 1 : 0.25) : 1
    const v = k * flicker
    neonMat.emissiveIntensity = 1.5 * v // 強すぎると文字がにじんで読めない
    neonLight.intensity = 26 * v
    wallLampMat.emissiveIntensity = 1.1 * k
    wallLight.intensity = 5 * k
    glassMat.emissiveIntensity = 0.45 * k
    lampHeadMat.emissiveIntensity = 3 * k
    streetLight.intensity = 70 * k
  }

  return {
    group,
    setNeon,
    dispose() {
      textures.forEach((t) => t.dispose())
      group.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (!mesh.isMesh) return
        mesh.geometry.dispose()
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        mats.forEach((m) => m.dispose())
      })
    },
  }
}
