// 沿道のヴィンテージ看板（＝サービス）と、出発点のルート66の盾の標識。
import * as THREE from "three"
import { BILLBOARDS, BILLBOARD_LAYOUT, SHIELD_SIGN } from "./constants"
import type { Road, RoadFrame } from "./road"

/** next/font が付けた書体名（CSS 変数）を canvas 用に読む。無ければ代わりの書体 */
function fontFamily(cssVar: string, fallback: string) {
  const v = getComputedStyle(document.body).getPropertyValue(cssVar).trim()
  return v ? `${v}, ${fallback}` : fallback
}

/** 幅 maxW に収まるよう、書体の大きさを下げる */
function fitFont(g: CanvasRenderingContext2D, text: string, maxW: number, size: number, font: (px: number) => string) {
  let px = size
  g.font = font(px)
  while (g.measureText(text).width > maxW && px > 8) {
    px -= 4
    g.font = font(px)
  }
}

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  draw(c.getContext("2d")!)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** 使い込まれた紙のむら・色あせ */
function weather(g: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  let a = seed
  const r = () => ((a = (a * 16807) % 2147483647) / 2147483647)
  for (let k = 0; k < 260; k++) {
    g.fillStyle = `rgba(90,60,30,${r() * 0.06})`
    g.beginPath()
    g.arc(r() * w, r() * h, 6 + r() * 40, 0, Math.PI * 2)
    g.fill()
  }
  const edge = g.createLinearGradient(0, 0, 0, h)
  edge.addColorStop(0, "rgba(60,30,10,0.18)")
  edge.addColorStop(0.2, "rgba(60,30,10,0)")
  edge.addColorStop(0.85, "rgba(60,30,10,0)")
  edge.addColorStop(1, "rgba(60,30,10,0.28)")
  g.fillStyle = edge
  g.fillRect(0, 0, w, h)
}

function billboardTexture(b: (typeof BILLBOARDS)[number], i: number) {
  const display = fontFamily("--font-bebas-neue", "Impact, 'Arial Black', sans-serif")
  const jpFont = fontFamily("--font-noto-sans-jp", "'Hiragino Sans', 'Yu Gothic', sans-serif")
  const W = 1024
  const H = Math.round(W * BILLBOARD_LAYOUT.aspect)
  return canvasTex(W, H, (g) => {
    g.fillStyle = "#f2e8d5"
    g.fillRect(0, 0, W, H)
    // 外枠と内枠
    g.fillStyle = b.color
    g.fillRect(0, 0, W, 22)
    g.fillRect(0, H - 22, W, 22)
    g.strokeStyle = b.color
    g.lineWidth = 6
    g.strokeRect(34, 40, W - 68, H - 80)
    // 左の帯（ルート66の小さな盾）
    g.fillStyle = b.color
    g.fillRect(34, 40, 150, H - 80)
    g.fillStyle = "#f2e8d5"
    g.font = `92px ${display}`
    g.textAlign = "center"
    g.textBaseline = "middle"
    g.fillText("66", 109, H / 2 + 6)
    g.font = `26px ${display}`
    g.fillText("ROUTE", 109, H / 2 - 52)
    // 本文
    g.textAlign = "left"
    g.fillStyle = b.color
    const maxW = W - 220 - 60
    fitFont(g, b.title, maxW, 128, (px) => `${px}px ${display}`)
    g.fillText(b.title, 220, H / 2 - 62)
    g.fillStyle = "#1b1916"
    fitFont(g, b.jp, maxW, 60, (px) => `700 ${px}px ${jpFont}`)
    g.fillText(b.jp, 224, H / 2 + 40)
    g.fillStyle = "rgba(27,25,22,0.7)"
    fitFont(g, b.sub, maxW, 34, (px) => `${px}px ${display}`)
    g.fillText(b.sub, 226, H / 2 + 112)
    weather(g, W, H, 11 + i * 7)
  })
}

/** 看板1枚（板＋2本の脚＋上の照明の腕）。板の正面は +Z */
function billboardGroup(tex: THREE.Texture, lit: boolean) {
  const { width: W, aspect } = BILLBOARD_LAYOUT
  const H = W * aspect
  const g = new THREE.Group()
  const faceMat = new THREE.MeshStandardMaterial({
    map: tex,
    emissiveMap: tex,
    emissive: new THREE.Color("#ffe2b0"),
    emissiveIntensity: 0,
    roughness: 0.85,
  })
  const face = new THREE.Mesh(new THREE.PlaneGeometry(W, H), faceMat)
  face.position.y = BILLBOARD_LAYOUT.height + H / 2
  const woodMat = new THREE.MeshStandardMaterial({ color: "#5a4330", roughness: 0.95 })
  const back = new THREE.Mesh(new THREE.BoxGeometry(W + 0.2, H + 0.2, 0.12), woodMat)
  back.position.set(0, face.position.y, -0.08)
  g.add(face, back)
  for (const x of [-W * 0.32, W * 0.32]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.22, BILLBOARD_LAYOUT.height + H * 0.6, 0.22), woodMat)
    leg.position.set(x, (BILLBOARD_LAYOUT.height + H * 0.6) / 2, -0.2)
    g.add(leg)
  }
  // 照明の腕（夜に点く小さな灯具）
  const lampMat = new THREE.MeshStandardMaterial({ color: "#222", emissive: new THREE.Color("#ffd89a"), emissiveIntensity: 0 })
  for (const x of [-W * 0.3, 0, W * 0.3]) {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.5), lampMat)
    lamp.position.set(x, BILLBOARD_LAYOUT.height + H + 0.25, 0.45)
    g.add(lamp)
  }
  g.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) o.castShadow = true
  })
  return { group: g, faceMat, lampMat, woodMat, lit }
}

function shieldTexture() {
  const display = fontFamily("--font-bebas-neue", "Impact, 'Arial Black', sans-serif")
  return canvasTex(512, 640, (g) => {
    g.clearRect(0, 0, 512, 640)
    // 茶色の「HISTORIC」の帯
    g.fillStyle = "#6b3f22"
    g.fillRect(56, 0, 400, 96)
    g.fillStyle = "#f5eee0"
    g.font = `78px ${display}`
    g.textAlign = "center"
    g.textBaseline = "middle"
    g.fillText("HISTORIC", 256, 52)
    // 盾の形
    const shield = (inset: number) => {
      g.beginPath()
      g.moveTo(40 + inset, 120 + inset)
      g.lineTo(472 - inset, 120 + inset)
      g.quadraticCurveTo(470 - inset, 200, 440 - inset, 230)
      g.quadraticCurveTo(476 - inset, 420, 256, 620 - inset)
      g.quadraticCurveTo(36 + inset, 420, 72 + inset, 230)
      g.quadraticCurveTo(42 + inset, 200, 40 + inset, 120 + inset)
      g.closePath()
    }
    shield(0)
    g.fillStyle = "#101010"
    g.fill()
    shield(16)
    g.fillStyle = "#f7f4ec"
    g.fill()
    g.fillStyle = "#101010"
    g.font = `70px ${display}`
    g.fillText("ROUTE", 256, 205)
    g.fillRect(90, 250, 332, 8)
    g.font = `250px ${display}`
    g.fillText("66", 256, 420)
    g.font = `56px ${display}`
    g.fillText("U S", 256, 555)
    weather(g, 512, 640, 3)
  })
}

/** 道の弧長 s・横 side（右が +）に置き、正面を道と進行方向の手前へ向ける */
function placeAlongRoad(o: THREE.Object3D, road: Road, s: number, side: number, faceTowardRoad: number) {
  const f: RoadFrame = road.frameAt(s)
  o.position.copy(f.pos).addScaledVector(f.right, side)
  o.position.y = 0
  // 正面（+Z）を、道の側（-side 方向）と、走ってくる向き（-forward）の間へ向ける
  const n = new THREE.Vector3()
    .addScaledVector(f.right, -Math.sign(side) * faceTowardRoad)
    .addScaledVector(f.forward, -(1 - faceTowardRoad))
    .normalize()
  o.rotation.y = Math.atan2(n.x, n.z)
}

export function createSigns(road: Road) {
  const group = new THREE.Group()
  group.name = "signs"
  const textures: THREE.Texture[] = []
  const boards = BILLBOARDS.map((b, i) => {
    const tex = billboardTexture(b, i)
    textures.push(tex)
    const bb = billboardGroup(tex, "lit" in b && b.lit === true)
    // 車がその看板の横を通る進行度から、置く位置を決める（少し先に置いて正面を見せる）
    placeAlongRoad(bb.group, road, road.carS(b.p) + 6, BILLBOARD_LAYOUT.side, 0.62)
    group.add(bb.group)
    return bb
  })

  // ルート66の盾（出発点の左）
  const shieldTex = shieldTexture()
  textures.push(shieldTex)
  const shield = new THREE.Group()
  const shieldMat = new THREE.MeshStandardMaterial({ map: shieldTex, transparent: true, alphaTest: 0.5, roughness: 0.6, side: THREE.DoubleSide })
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.92, 1.15), shieldMat)
  plate.position.y = 1.75
  const postMat = new THREE.MeshStandardMaterial({ color: "#8d8f93", metalness: 0.7, roughness: 0.45 })
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.3, 10), postMat)
  post.position.set(0, 1.15, -0.04)
  plate.castShadow = post.castShadow = true
  shield.add(plate, post)
  placeAlongRoad(shield, road, road.startS + SHIELD_SIGN.ahead, SHIELD_SIGN.side, 0.35)
  group.add(shield)

  /** 夜：看板の照明。lit の看板（ガレージの予告）はライトの点灯に合わせて明るく */
  const setNight = (tod: number, lights: number) => {
    for (const b of boards) {
      const k = b.lit ? lights : tod
      b.faceMat.emissiveIntensity = (b.lit ? 0.9 : 0.28) * k
      b.lampMat.emissiveIntensity = (b.lit ? 3 : 1.6) * k
    }
  }

  return {
    group,
    setNight,
    /** 車の出発点から見た盾の位置（カメラの寄りの確認用） */
    shield,
    dispose() {
      textures.forEach((t) => t.dispose())
      group.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (mesh.isMesh) mesh.geometry.dispose()
      })
      for (const b of boards) {
        b.faceMat.dispose()
        b.lampMat.dispose()
        b.woodMat.dispose()
      }
      shieldMat.dispose()
      postMat.dispose()
    },
  }
}
