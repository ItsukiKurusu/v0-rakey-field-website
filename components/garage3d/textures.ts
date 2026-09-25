// ガレージの質感（canvas で作る。写真を使う看板類は bake-garage-textures.mjs 側）。
import * as THREE from "three"

function tex(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, color = true) {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  draw(c.getContext("2d")!)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace
  t.anisotropy = 8
  return t
}

/** 毎回同じ模様になる乱数 */
function rnd(seed: number) {
  let a = seed
  return () => ((a = (a * 16807) % 2147483647) / 2147483647)
}

/** 白い外壁（縦 = 地面 → 軒）。下ほど砂ぼこりで黄ばみ、雨だれの筋、薄い色むら */
export function wallTexture(seedN = 1) {
  const r = rnd(seedN * 7919)
  return tex(512, 1024, (g) => {
    g.fillStyle = "#eef0f1"
    g.fillRect(0, 0, 512, 1024)
    for (let k = 0; k < 160; k++) {
      g.fillStyle = `rgba(${150 + r() * 40},${145 + r() * 40},${135 + r() * 40},${r() * 0.05})`
      g.beginPath()
      g.ellipse(r() * 512, r() * 1024, 20 + r() * 90, 20 + r() * 140, 0, 0, Math.PI * 2)
      g.fill()
    }
    // 下の砂ぼこり
    const dust = g.createLinearGradient(0, 1024, 0, 700)
    dust.addColorStop(0, "rgba(150,125,95,0.35)")
    dust.addColorStop(1, "rgba(150,125,95,0)")
    g.fillStyle = dust
    g.fillRect(0, 700, 512, 324)
    // 雨だれ（上から）
    for (let k = 0; k < 22; k++) {
      const x = r() * 512
      const len = 60 + r() * 380
      const grad = g.createLinearGradient(0, 0, 0, len)
      grad.addColorStop(0, "rgba(90,90,85,0.14)")
      grad.addColorStop(1, "rgba(90,90,85,0)")
      g.fillStyle = grad
      g.fillRect(x, 0, 2 + r() * 4, len)
    }
  })
}

/** 外壁の法線：縦の浅いリブ（パネルの折り目）。横 = 1 枚のパネル幅 */
export function wallNormal() {
  return tex(
    256,
    16,
    (g) => {
      for (let x = 0; x < 256; x++) {
        // 32px ごとに浅い溝
        const d = (x % 32) / 32
        const slope = d < 0.08 ? -0.6 : d > 0.92 ? 0.6 : 0
        const nx = slope
        g.fillStyle = `rgb(${Math.round((nx * 0.5 + 0.5) * 255)},128,${Math.round(Math.sqrt(1 - nx * nx) * 127 + 128)})`
        g.fillRect(x, 0, 1, 16)
      }
    },
    false,
  )
}

/** 土間コンクリート（入口の前は濡れて暗い、ひびとタイヤ跡） */
export function concreteTexture() {
  const r = rnd(3)
  return tex(1024, 512, (g) => {
    g.fillStyle = "#9c9a95"
    g.fillRect(0, 0, 1024, 512)
    const img = g.getImageData(0, 0, 1024, 512)
    for (let i = 0; i < img.data.length; i += 4) {
      const n = (r() - 0.5) * 22
      img.data[i] += n
      img.data[i + 1] += n
      img.data[i + 2] += n
    }
    g.putImageData(img, 0, 0)
    for (let k = 0; k < 90; k++) {
      g.fillStyle = `rgba(60,55,50,${r() * 0.08})`
      g.beginPath()
      g.ellipse(r() * 1024, r() * 512, 30 + r() * 120, 20 + r() * 70, r() * 3, 0, Math.PI * 2)
      g.fill()
    }
    // 濡れた暗い所（手前側 = 下）
    const wet = g.createLinearGradient(0, 512, 0, 250)
    wet.addColorStop(0, "rgba(40,36,32,0.55)")
    wet.addColorStop(1, "rgba(40,36,32,0)")
    g.fillStyle = wet
    g.fillRect(0, 250, 1024, 262)
    // 赤茶のしみ（写真の手前の地面）
    for (let k = 0; k < 14; k++) {
      g.fillStyle = `rgba(120,60,40,${0.05 + r() * 0.08})`
      g.beginPath()
      g.ellipse(r() * 1024, 380 + r() * 130, 40 + r() * 100, 10 + r() * 30, 0, 0, Math.PI * 2)
      g.fill()
    }
    // ひび
    g.strokeStyle = "rgba(40,38,35,0.45)"
    g.lineWidth = 1.5
    for (let k = 0; k < 9; k++) {
      let x = r() * 1024
      let y = r() * 512
      g.beginPath()
      g.moveTo(x, y)
      for (let s = 0; s < 12; s++) {
        x += (r() - 0.5) * 50
        y += (r() - 0.3) * 30
        g.lineTo(x, y)
      }
      g.stroke()
    }
  })
}

/** 暗い合板（室内の壁・天井） */
export function plywoodTexture() {
  const r = rnd(11)
  return tex(512, 512, (g) => {
    g.fillStyle = "#5a3d25"
    g.fillRect(0, 0, 512, 512)
    for (let y = 0; y < 512; y += 2) {
      g.fillStyle = `rgba(${40 + r() * 40},${24 + r() * 26},${12 + r() * 16},${0.25 + r() * 0.3})`
      g.fillRect(0, y + Math.sin(y * 0.05) * 2, 512, 1 + r() * 2)
    }
    for (let k = 0; k < 12; k++) {
      g.fillStyle = "rgba(30,18,10,0.35)"
      g.beginPath()
      g.ellipse(r() * 512, r() * 512, 6 + r() * 10, 3 + r() * 5, 0, 0, Math.PI * 2)
      g.fill()
    }
    // 板の継ぎ目
    g.fillStyle = "rgba(20,12,6,0.6)"
    g.fillRect(0, 0, 512, 3)
    g.fillRect(0, 0, 3, 512)
  })
}

/** 波板の屋根の汚れ（横 = 波の方向） */
export function roofTexture() {
  const r = rnd(5)
  return tex(512, 512, (g) => {
    g.fillStyle = "#8e959b"
    g.fillRect(0, 0, 512, 512)
    for (let k = 0; k < 200; k++) {
      g.fillStyle = `rgba(${60 + r() * 50},${55 + r() * 45},${50 + r() * 40},${r() * 0.12})`
      g.fillRect(r() * 512, r() * 512, 2 + r() * 8, 20 + r() * 160)
    }
    // 錆の点
    for (let k = 0; k < 120; k++) {
      g.fillStyle = `rgba(130,70,40,${r() * 0.25})`
      g.fillRect(r() * 512, r() * 512, 2, 2)
    }
  })
}

/** シャッターのスラットの法線（横の浅い溝） */
export function slatNormal() {
  return tex(
    16,
    64,
    (g) => {
      for (let y = 0; y < 64; y++) {
        const d = y / 64
        const ny = d < 0.12 ? 0.55 : d > 0.88 ? -0.55 : Math.sin(d * Math.PI * 2) * 0.12
        g.fillStyle = `rgb(128,${Math.round((ny * 0.5 + 0.5) * 255)},${Math.round(Math.sqrt(1 - ny * ny) * 127 + 128)})`
        g.fillRect(0, y, 16, 1)
      }
    },
    false,
  )
}
