// お店のガレージの実写（assets-src/originals/images/ の元画像）から、看板・室内の奥の壁・小物を切り出して
// 3D のテクスチャにする。出力は public/garage3d/。
//
// 座標は「幅 1400px に縮めた写真」で測った値（x0, y0, x1, y1）。元画像の大きさへ換算して切り出す。
// shape：rect（そのまま）/ diamond（ひし形）/ octagon（八角形）/ poly（points で指定した多角形）。形の外は透明にする。
//
// 実行: node scripts/bake-garage-textures.mjs
import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"

const SRC = "assets-src/originals/images"
const OUT = "public/garage3d"
fs.mkdirSync(OUT, { recursive: true })

const CROPS = [
  // 左の壁（garage-soto：正面から撮った写真）
  { name: "sign-acdelco", src: "garage-soto", rect: [440, 28, 1008, 405], width: 1024 },
  { name: "sign-405", src: "garage-soto", rect: [448, 541, 695, 728], width: 512 },
  { name: "sign-warning", src: "garage-soto", rect: [857, 543, 997, 720], width: 384 },
  { name: "sticker-24h", src: "garage-soto", rect: [1097, 668, 1166, 728], width: 192 },
  { name: "sticker-security", src: "garage-soto", rect: [1213, 679, 1264, 727], width: 160 },
  { name: "plate-illinois", src: "garage-soto", rect: [279, 827, 466, 923], width: 384 },
  { name: "sign-pig-xing", src: "garage-soto", rect: [612, 781, 842, 1020], width: 512, shape: "diamond" },
  { name: "sign-peoples-meat", src: "garage-soto", rect: [963, 764, 1197, 925], width: 512 },
  // 右の壁（garage-soto-hiki）
  { name: "sign-security-alert", src: "garage-soto-hiki", rect: [1163, 320, 1263, 412], width: 384, shape: "octagon" },
  { name: "sign-private", src: "garage-soto-hiki", rect: [1133, 430, 1252, 506], width: 512 },
  { name: "sign-american-pig", src: "garage-soto-hiki", rect: [1148, 560, 1251, 656], width: 384 },
  { name: "ashtray-front", src: "garage-soto-hiki", rect: [1206, 750, 1304, 1002], width: 256 },
  // 室内
  { name: "interior-back", src: "garage", rect: [0, 0, 1400, 690], width: 2048, quality: 82 },
  { name: "sign-hotwheels", src: "garage", rect: [517, 770, 786, 842], width: 768 },
  { name: "box-tamiya", src: "garage", rect: [247, 735, 450, 908], width: 512 },
  {
    name: "sign-castrol",
    src: "garage-soto-hiki",
    rect: [448, 616, 606, 834],
    width: 512,
    shape: "poly",
    // 斜めに立て掛けた四角い看板の四隅（左上 → 右上 → 右下 → 左下、1400px 幅の写真の座標）
    points: [[452, 640], [560, 618], [604, 792], [498, 832]],
  },
]

function maskSvg(shape, w, h, points, rect) {
  let d
  if (shape === "diamond") d = `M${w / 2},0 L${w},${h / 2} L${w / 2},${h} L0,${h / 2} Z`
  else if (shape === "octagon") {
    const k = 0.2929
    d = `M${w * k},0 L${w * (1 - k)},0 L${w},${h * k} L${w},${h * (1 - k)} L${w * (1 - k)},${h} L${w * k},${h} L0,${h * (1 - k)} L0,${h * k} Z`
  } else if (shape === "poly") {
    const [x0, y0, x1, y1] = rect
    const sx = w / (x1 - x0)
    const sy = h / (y1 - y0)
    d = "M" + points.map(([x, y]) => `${(x - x0) * sx},${(y - y0) * sy}`).join(" L") + " Z"
  }
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><path d="${d}" fill="#fff"/></svg>`)
}

const meta = {}
for (const c of CROPS) {
  const file = path.join(SRC, `${c.src}.jpg`)
  const info = await sharp(file).metadata()
  const k = info.width / 1400
  const [x0, y0, x1, y1] = c.rect
  const left = Math.round(x0 * k)
  const top = Math.round(y0 * k)
  const width = Math.round((x1 - x0) * k)
  const height = Math.round((y1 - y0) * k)
  const outW = Math.min(c.width, width)
  const outH = Math.round((outW * height) / width)
  let img = sharp(file).extract({ left, top, width, height }).resize(outW, outH)
  if (c.shape) {
    // 形の白黒を透明度として足す
    const mask = await sharp(maskSvg(c.shape, outW, outH, c.points, c.rect)).extractChannel(0).raw().toBuffer()
    const rgb = await img.removeAlpha().raw().toBuffer()
    img = sharp(rgb, { raw: { width: outW, height: outH, channels: 3 } }).joinChannel(mask, {
      raw: { width: outW, height: outH, channels: 1 },
    })
  }
  const out = path.join(OUT, `${c.name}.webp`)
  await img.webp({ quality: c.quality ?? 86, alphaQuality: 90 }).toFile(out)
  meta[c.name] = { file: `${c.name}.webp`, aspect: +(width / height).toFixed(4), alpha: Boolean(c.shape) }
}
fs.writeFileSync(path.join(OUT, "meta.json"), JSON.stringify(meta, null, 2))

let total = 0
for (const f of fs.readdirSync(OUT)) {
  const s = fs.statSync(path.join(OUT, f)).size
  total += s
  console.log(`${(s / 1024).toFixed(0).padStart(5)} kB  ${f}`)
}
console.log(`合計 ${(total / 1e6).toFixed(2)} MB`)
