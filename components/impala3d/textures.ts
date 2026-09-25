// ランプ・グリル・ナンバー・デカールのテクスチャを canvas で描く（外部素材なし）。
import * as THREE from "three"

function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) {
  const c = document.createElement("canvas")
  c.width = w
  c.height = h
  const g = c.getContext("2d")!
  draw(g)
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 8
  return t
}

/** ヘッドライト：透明なレンズ越しに見える反射板（細かい縦の刻み＋明るい芯）。 */
export function headlightTexture() {
  return canvasTexture(512, 128, (g) => {
    // 反射板は金属なので地は中間の灰色（明るさは映り込みで出す）
    const bg = g.createLinearGradient(0, 0, 0, 128)
    bg.addColorStop(0, "#8f969c")
    bg.addColorStop(0.5, "#c3c8cc")
    bg.addColorStop(1, "#7d858b")
    g.fillStyle = bg
    g.fillRect(0, 0, 512, 128)
    // 反射板の刻み
    for (let x = 0; x < 512; x += 6) {
      g.fillStyle = x % 12 === 0 ? "rgba(70,78,86,0.45)" : "rgba(255,255,255,0.28)"
      g.fillRect(x, 0, 2, 128)
    }
    // 横の分割線
    g.fillStyle = "rgba(90,98,104,0.45)"
    g.fillRect(0, 60, 512, 3)
    // 芯（ハイビーム・ロービーム）
    for (const cx of [150, 360]) {
      const r = g.createRadialGradient(cx, 64, 2, cx, 64, 46)
      r.addColorStop(0, "rgba(255,255,255,1)")
      r.addColorStop(0.35, "rgba(235,240,245,0.8)")
      r.addColorStop(1, "rgba(200,206,210,0)")
      g.fillStyle = r
      g.fillRect(cx - 50, 10, 100, 108)
    }
  })
}

/** ウインカー（アンバー）。 */
export function amberTexture() {
  return canvasTexture(256, 128, (g) => {
    const bg = g.createLinearGradient(0, 0, 0, 128)
    bg.addColorStop(0, "#f7a531")
    bg.addColorStop(0.5, "#ffc46a")
    bg.addColorStop(1, "#d77d12")
    g.fillStyle = bg
    g.fillRect(0, 0, 256, 128)
    for (let y = 0; y < 128; y += 8) {
      g.fillStyle = "rgba(255,255,255,0.18)"
      g.fillRect(0, y, 256, 2)
    }
  })
}

/** テールランプ：横の刻みの入った赤いレンズ。内側の端に白いバックランプ。 */
export function taillightTexture() {
  return canvasTexture(512, 128, (g) => {
    const bg = g.createLinearGradient(0, 0, 0, 128)
    bg.addColorStop(0, "#7d0710")
    bg.addColorStop(0.45, "#c3121e")
    bg.addColorStop(1, "#6a050d")
    g.fillStyle = bg
    g.fillRect(0, 0, 512, 128)
    for (let y = 4; y < 128; y += 10) {
      g.fillStyle = "rgba(255,120,120,0.22)"
      g.fillRect(0, y, 512, 3)
    }
    // 中段の帯（実車は上下2段に分かれて見える）
    g.fillStyle = "rgba(40,0,4,0.55)"
    g.fillRect(0, 60, 512, 6)
    // バックランプ（内側の端）
    const w = g.createLinearGradient(0, 0, 0, 128)
    w.addColorStop(0, "#c9ccd0")
    w.addColorStop(0.5, "#f2f3f4")
    w.addColorStop(1, "#aeb2b6")
    g.fillStyle = w
    g.fillRect(0, 68, 110, 60)
  })
}

/** グリルの網（ハニカム）。黒地に少し明るい縁。 */
export function honeycombTexture() {
  const t = canvasTexture(256, 128, (g) => {
    g.fillStyle = "#050505"
    g.fillRect(0, 0, 256, 128)
    g.strokeStyle = "#2a2a2a"
    g.lineWidth = 2
    const r = 7
    const h = Math.sqrt(3) * r
    // 平らな面が上の六角形：横は 3r 間隔、行は h/2 間隔で半分ずつずらす
    for (let row = -1; row < 128 / (h / 2) + 1; row++) {
      for (let col = -1; col < 256 / (r * 3) + 1; col++) {
        const cx = col * r * 3 + (Math.abs(row) % 2 ? r * 1.5 : 0)
        const cy = row * (h / 2)
        g.beginPath()
        for (let k = 0; k < 6; k++) {
          const a = (Math.PI / 3) * k
          const px = cx + r * Math.cos(a)
          const py = cy + r * Math.sin(a)
          if (k === 0) g.moveTo(px, py)
          else g.lineTo(px, py)
        }
        g.closePath()
        g.stroke()
      }
    }
  })
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.repeat.set(4, 1)
  return t
}

/** ナンバープレート（実車の番号は使わない）。 */
export function plateTexture() {
  return canvasTexture(512, 256, (g) => {
    g.fillStyle = "#f4f4ef"
    g.fillRect(0, 0, 512, 256)
    g.strokeStyle = "#1d5a2e"
    g.lineWidth = 8
    g.strokeRect(10, 10, 492, 236)
    g.fillStyle = "#1d5a2e"
    g.textAlign = "center"
    g.textBaseline = "middle"
    g.font = "bold 58px 'Arial Black', Arial, sans-serif"
    g.fillText("RAKEY FIELD", 256, 70)
    g.font = "bold 150px 'Arial Black', Arial, sans-serif"
    g.fillText("66", 256, 175)
    // ボルト
    g.fillStyle = "#9aa0a3"
    for (const x of [70, 442]) {
      g.beginPath()
      g.arc(x, 36, 10, 0, Math.PI * 2)
      g.fill()
    }
  })
}

/** リアフェンダーの「Impala SS」スクリプト（オレンジ〜ゴールドに青い影）。 */
export function scriptDecalTexture() {
  return canvasTexture(1024, 256, (g) => {
    g.clearRect(0, 0, 1024, 256)
    g.textBaseline = "middle"
    const draw = (dx: number, dy: number, fill: string | CanvasGradient) => {
      g.fillStyle = fill
      g.font = "italic 700 150px 'Snell Roundhand', 'Brush Script MT', 'Segoe Script', cursive"
      g.fillText("Impala", 40 + dx, 130 + dy)
      g.font = "italic 900 110px 'Arial Black', Arial, sans-serif"
      g.fillText("SS", 690 + dx, 140 + dy)
    }
    draw(6, 6, "rgba(40,50,160,0.9)") // 影
    const grad = g.createLinearGradient(0, 60, 0, 200)
    grad.addColorStop(0, "#ffd65a")
    grad.addColorStop(0.5, "#ff9a2a")
    grad.addColorStop(1, "#f05a1a")
    draw(0, 0, grad)
  })
}

/** 跳ねるインパラのエンブレム（Cピラー）。白 = 形、透明 = 背景。 */
export function leapingImpalaTexture() {
  return canvasTexture(256, 128, (g) => {
    g.clearRect(0, 0, 256, 128)
    g.fillStyle = "#fff"
    // 楕円の枠
    g.lineWidth = 9
    g.strokeStyle = "#fff"
    g.beginPath()
    g.ellipse(128, 64, 118, 52, 0, 0, Math.PI * 2)
    g.stroke()
    // 跳ねる姿（単純化したシルエット）
    g.beginPath()
    g.moveTo(40, 80)
    g.bezierCurveTo(80, 60, 120, 52, 160, 52)
    g.bezierCurveTo(185, 40, 205, 28, 222, 30)
    g.lineTo(206, 44)
    g.bezierCurveTo(196, 58, 176, 66, 150, 72)
    g.bezierCurveTo(118, 80, 80, 86, 40, 80)
    g.fill()
  })
}

/** 床の接地影（中心が濃く、外へ向かって消える）。 */
export function contactShadowTexture() {
  return canvasTexture(256, 256, (g) => {
    const r = g.createRadialGradient(128, 128, 10, 128, 128, 128)
    r.addColorStop(0, "rgba(0,0,0,0.85)")
    r.addColorStop(0.45, "rgba(0,0,0,0.45)")
    r.addColorStop(1, "rgba(0,0,0,0)")
    g.fillStyle = r
    g.fillRect(0, 0, 256, 256)
  }, false)
}
