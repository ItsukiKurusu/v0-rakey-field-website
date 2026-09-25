// 終点：RAKEY FIELD のガレージ。建物は実店舗を写真から起こしたモデル（components/garage3d）で、
// そこへルート66のモーテル風のポールサイン（ネオン）、道の向かいの街灯、人工芝の敷地を足す。
// 建物の正面は +Z（道の側）。
import * as THREE from "three"
import type { GarageModel } from "@/components/garage3d/createGarage"
import { GARAGE_SPEC } from "@/components/garage3d/spec"
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
    [8, 3],
  )
}

export function createGarage(road: Road, model: GarageModel) {
  const group = new THREE.Group()
  group.name = "garageSite"
  const textures: THREE.Texture[] = []
  const tex = <T extends THREE.Texture>(t: T) => (textures.push(t), t)
  const front = GARAGE_SPEC.depth / 2
  const W = GARAGE_SPEC.width
  // 建物の正面（z = front）から道の路肩の手前まで
  const lotDepth = GARAGE.side - front - 5.6

  group.add(model.group)

  // 人工芝の敷地（実際のお店も芝）。建物の前のコンクリートの左右と手前
  const turfMat = new THREE.MeshStandardMaterial({ map: tex(turfTexture()), roughness: 1, envMapIntensity: 0.4 })
  const turf = new THREE.Mesh(new THREE.PlaneGeometry(W + 12, lotDepth + 1.5), turfMat)
  turf.rotation.x = -Math.PI / 2
  turf.position.set(0, 0.003, front + (lotDepth + 1.5) / 2 - 1.5)
  turf.receiveShadow = true
  group.add(turf)

  // ポールサイン（敷地の道寄りの角。停まった車の後ろに立つ側）
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
  pole.position.set(W / 2 + 2.6, 0, front + lotDepth - 0.6)
  // 停まった車の斜め前（最後のカメラ）から正面が見える向き。建物の座標では 前 = -X、右 = -Z
  pole.rotation.y = -0.72
  group.add(pole)
  const neonLight = new THREE.PointLight("#ff4a3a", 0, 22, 1.6)
  neonLight.position.set(pole.position.x, 5.1, pole.position.z + 1.2)
  group.add(neonLight)

  // 道の向かい側の街灯（停まった車を照らす）
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

  // 昼（走っている間）は室内の灯りを弱く
  model.setInteriorLights(0.3)

  /** ネオンと室内の灯りを灯す（0..1）。ネオンは灯る瞬間に数回またたく */
  const setNeon = (k: number, time: number) => {
    const flicker = k > 0 && k < 1 ? (Math.sin(time * 53) > 0.2 ? 1 : 0.25) : 1
    const v = k * flicker
    neonMat.emissiveIntensity = 1.5 * v // 強すぎると文字がにじんで読めない
    neonLight.intensity = 26 * v
    lampHeadMat.emissiveIntensity = 3 * k
    streetLight.intensity = 45 * k
    // 夜はシャッターの開口から暖かい光が漏れるように
    model.setInteriorLights(0.3 + 0.7 * k, 1 + 3 * k)
  }

  return {
    group,
    setNeon,
    dispose() {
      textures.forEach((t) => t.dispose())
      group.remove(model.group) // モデルは assets 側で解放する
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
