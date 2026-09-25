// トップの3Dヒーロー用に、Poly Haven の元素材（assets-src/polyhaven/）を配信用へ変換する。
// 出力は public/hero66/。元素材は重いので Git にも本番にも入れない。
//
//   空（HDRI 4K .hdr） → 地平線の少し下〜天頂の帯（JPEG）＋映り込み用の小さな .hdr ＋ 太陽の向き・地平線の色
//   地面・路面        → 色・法線・粗さを WebP に。法線は高さマップ（disp）から計算する
//   岩のモデル        → 三角形を減らし、テクスチャを縮めて 1 本の GLB に
//
// 実行: node scripts/bake-hero-assets.mjs
import fs from "node:fs"
import path from "node:path"
import { execFileSync } from "node:child_process"
import sharp from "sharp"

const SRC = "assets-src/polyhaven"
const OUT = "public/hero66"
fs.mkdirSync(path.join(OUT, "tex"), { recursive: true })

// 太陽を置きたい方位（components/hero66/constants.ts の SKY.sun.azimuth と同じ。+X から右回り、度）
const SUN_AZIMUTH = -18
// 帯として切り出す高度の範囲（度）
const BAND_LOW = -8
const BAND_HIGH = 90

// ── Radiance .hdr（RGBE）の読み書き ─────────────────────────
function readHDR(file) {
  const buf = fs.readFileSync(file)
  let pos = 0
  const line = () => {
    let s = ""
    while (buf[pos] !== 0x0a) s += String.fromCharCode(buf[pos++])
    pos++
    return s
  }
  let l
  while ((l = line()) !== "") {
    // ヘッダー（FORMAT など）は読み飛ばす
  }
  const [, h, , w] = line().split(" ")
  const W = Number(w)
  const H = Number(h)
  const data = new Float32Array(W * H * 3)
  const scan = new Uint8Array(W * 4)
  for (let y = 0; y < H; y++) {
    if (buf[pos] !== 2 || buf[pos + 1] !== 2) throw new Error("RLE 以外の .hdr には未対応")
    pos += 4
    for (let c = 0; c < 4; c++) {
      let x = 0
      while (x < W) {
        let n = buf[pos++]
        if (n > 128) {
          n -= 128
          const v = buf[pos++]
          while (n--) scan[x++ * 4 + c] = v
        } else {
          while (n--) scan[x++ * 4 + c] = buf[pos++]
        }
      }
    }
    for (let x = 0; x < W; x++) {
      const e = scan[x * 4 + 3]
      const f = e ? Math.pow(2, e - 136) : 0
      const i = (y * W + x) * 3
      data[i] = scan[x * 4] * f
      data[i + 1] = scan[x * 4 + 1] * f
      data[i + 2] = scan[x * 4 + 2] * f
    }
  }
  return { W, H, data }
}

function writeHDR(file, W, H, data) {
  const head = Buffer.from(`#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y ${H} +X ${W}\n`, "ascii")
  const body = Buffer.alloc(W * H * 4)
  for (let i = 0; i < W * H; i++) {
    const r = data[i * 3]
    const g = data[i * 3 + 1]
    const b = data[i * 3 + 2]
    const m = Math.max(r, g, b)
    if (m < 1e-32) continue
    const e = Math.ceil(Math.log2(m) + 1e-9)
    const s = 256 / Math.pow(2, e)
    body[i * 4] = Math.min(255, r * s)
    body[i * 4 + 1] = Math.min(255, g * s)
    body[i * 4 + 2] = Math.min(255, b * s)
    body[i * 4 + 3] = e + 128
  }
  fs.writeFileSync(file, Buffer.concat([head, body])) // 平坦（RLE なし）でも RGBELoader は読める
}

/** 面積平均で縮める（float のまま） */
function downsample(src, W, H, w, h) {
  const out = new Float32Array(w * h * 3)
  for (let y = 0; y < h; y++) {
    const y0 = Math.floor((y * H) / h)
    const y1 = Math.max(y0 + 1, Math.floor(((y + 1) * H) / h))
    for (let x = 0; x < w; x++) {
      const x0 = Math.floor((x * W) / w)
      const x1 = Math.max(x0 + 1, Math.floor(((x + 1) * W) / w))
      let r = 0
      let g = 0
      let b = 0
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const i = (yy * W + xx) * 3
          r += src[i]
          g += src[i + 1]
          b += src[i + 2]
        }
      }
      const n = (y1 - y0) * (x1 - x0)
      const o = (y * w + x) * 3
      out[o] = r / n
      out[o + 1] = g / n
      out[o + 2] = b / n
    }
  }
  return out
}

/** 横方向に回す（太陽を決めた方位へ）。shift は画素数 */
function roll(src, W, H, shift) {
  const out = new Float32Array(src.length)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const nx = (((x + shift) % W) + W) % W
      const i = (y * W + x) * 3
      const o = (y * W + nx) * 3
      out[o] = src[i]
      out[o + 1] = src[i + 1]
      out[o + 2] = src[i + 2]
    }
  }
  return out
}

// 正距円筒の画素 (u, v) ⇔ 方向。three の equirectUv と同じ向き
//   u = atan2(z, x) / 2π + 0.5、v = asin(y) / π + 0.5（v は下から）
const uToAz = (u) => (u - 0.5) * 360 // 度。+X が 0、+Z（右）が +90
const rowToEl = (row, H) => 90 - ((row + 0.5) / H) * 180

function bakeSky(name, { bandWidth, quality }) {
  const { W, H, data } = readHDR(path.join(SRC, `${name}_4k.hdr`))
  // 太陽（いちばん明るい所）を探す。地平線より少し下まで（日没直後は地平線の下の輝きになる）
  let best = -1
  let sx = 0
  let sy = 0
  for (let y = 0; y < H * 0.56; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3
      const L = data[i] * 0.2126 + data[i + 1] * 0.7152 + data[i + 2] * 0.0722
      if (L > best) {
        best = L
        sx = x
        sy = y
      }
    }
  }
  const sunAz = uToAz((sx + 0.5) / W)
  const sunEl = rowToEl(sy, H)
  // 太陽が SUN_AZIMUTH に来るよう横に回す
  const shift = Math.round(((SUN_AZIMUTH - sunAz) / 360) * W)
  const rolled = roll(data, W, H, shift)

  // 地平線の色（高度 0〜2°の平均。霧の色に使う）
  const r0 = Math.round(((90 - 2) / 180) * H)
  const r1 = Math.round((90 / 180) * H)
  let hr = 0
  let hg = 0
  let hb = 0
  for (let y = r0; y < r1; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3
      hr += rolled[i]
      hg += rolled[i + 1]
      hb += rolled[i + 2]
    }
  }
  const n = (r1 - r0) * W
  const horizon = [hr / n, hg / n, hb / n]

  // 帯：高度 BAND_HIGH（上端）〜 BAND_LOW（下端）の行を切り出す
  const top = Math.round(((90 - BAND_HIGH) / 180) * H)
  const bottom = Math.round(((90 - BAND_LOW) / 180) * H)
  const bandH0 = bottom - top
  const band = rolled.subarray(top * W * 3, bottom * W * 3)
  const bandHeight = Math.round((bandWidth * (BAND_HIGH - BAND_LOW)) / 360)
  const small = downsample(band, W, bandH0, bandWidth, bandHeight)
  // 8bit へ：y = (x/(1+x))^(1/2.2)。シェーダーで x = r/(1-r)（r = y^2.2）と戻す
  const px = Buffer.alloc(bandWidth * bandHeight * 3)
  for (let i = 0; i < small.length; i++) {
    const x = Math.max(0, small[i])
    px[i] = Math.round(Math.pow(x / (1 + x), 1 / 2.2) * 255)
  }
  const bandFile = `${name}_band.jpg`
  sharp(px, { raw: { width: bandWidth, height: bandHeight, channels: 3 } })
    .jpeg({ quality, mozjpeg: true, chromaSubsampling: "4:4:4" })
    .toFile(path.join(OUT, bandFile))

  // 映り込み用：256x128 の .hdr
  const env = downsample(rolled, W, H, 256, 128)
  const envFile = `${name}_env.hdr`
  writeHDR(path.join(OUT, envFile), 256, 128, env)

  return { band: bandFile, env: envFile, sunElevation: sunEl, sunAzimuth: SUN_AZIMUTH, horizon, bandLow: BAND_LOW, bandHigh: BAND_HIGH }
}

// ── 地面・路面のテクスチャ ─────────────────────────────────
async function normalFromDisp(file, out, size, strength) {
  // 高さは1チャンネルだけ取り出す（そのままだと3チャンネルで並んでくる）
  const { data, info } = await sharp(file).resize(size, size).extractChannel(0).raw({ depth: "ushort" }).toBuffer({ resolveWithObject: true })
  const W = info.width
  const H = info.height
  const h16 = new Uint16Array(data.buffer, data.byteOffset, W * H)
  let lo = 65535
  let hi = 0
  for (const v of h16) {
    lo = Math.min(lo, v)
    hi = Math.max(hi, v)
  }
  const range = Math.max(1, hi - lo)
  const hAt = (x, y) => (h16[((y + H) % H) * W + ((x + W) % W)] - lo) / range // 0..1。端は反対側へ回り込む
  const px = Buffer.alloc(W * H * 3)
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // OpenGL 形式（緑 = テクスチャの上方向）
      const nx = -((hAt(x + 1, y) - hAt(x - 1, y)) / 2) * strength
      const ny = ((hAt(x, y + 1) - hAt(x, y - 1)) / 2) * strength
      const l = Math.hypot(nx, ny, 1)
      const i = (y * W + x) * 3
      px[i] = Math.round((nx / l * 0.5 + 0.5) * 255)
      px[i + 1] = Math.round((ny / l * 0.5 + 0.5) * 255)
      px[i + 2] = Math.round((1 / l * 0.5 + 0.5) * 255)
    }
  }
  await sharp(px, { raw: { width: W, height: H, channels: 3 } }).webp({ quality: 88 }).toFile(out)
}

async function bakeSurface(name, { size, normalSize, strength }) {
  const dir = path.join(SRC, `${name}_1k`, "textures")
  const out = (k) => path.join(OUT, "tex", `${name}_${k}.webp`)
  await sharp(path.join(dir, `${name}_diff_1k.jpg`)).resize(size, size).webp({ quality: 82 }).toFile(out("diff"))
  // arm = R: 環境遮蔽、G: 粗さ、B: 金属。three は roughnessMap の G、aoMap の R を読むのでそのまま使える
  await sharp(path.join(dir, `${name}_arm_1k.jpg`)).resize(normalSize, normalSize).webp({ quality: 82 }).toFile(out("arm"))
  await normalFromDisp(path.join(dir, `${name}_disp_1k.png`), out("nor"), normalSize, strength)
  return { diff: `tex/${name}_diff.webp`, arm: `tex/${name}_arm.webp`, nor: `tex/${name}_nor.webp` }
}

// ── 岩のモデル ─────────────────────────────────────────────
function bakeRock() {
  const src = path.join(SRC, "namaqualand_boulder_02_1k.gltf", "namaqualand_boulder_02_1k.gltf")
  const out = path.join(OUT, "boulder.glb")
  const bin = "node_modules/.bin/gltf-transform"
  // 三角形を 1.5% に（約 4,400）→ テクスチャを 512 の WebP → Meshopt で圧縮
  execFileSync(bin, ["simplify", src, out, "--ratio", "0.015", "--error", "0.02"], { stdio: "inherit" })
  execFileSync(bin, ["resize", out, out, "--width", "512", "--height", "512"], { stdio: "inherit" })
  execFileSync(bin, ["webp", out, out, "--quality", "80"], { stdio: "inherit" })
  execFileSync(bin, ["meshopt", out, out], { stdio: "inherit" })
  return "boulder.glb"
}

const meta = {
  sky: {
    sunset: bakeSky("klippad_sunrise_2", { bandWidth: 4096, quality: 84 }),
    // たそがれの空は夜に暗くして使う（暗い所を持ち上げるとブロックが見えるので画質を上げる）
    dusk: bakeSky("toposcope_sunset", { bandWidth: 4096, quality: 92 }),
  },
  ground: await bakeSurface("red_sand", { size: 1024, normalSize: 512, strength: 10 }),
  road: await bakeSurface("asphalt_02", { size: 1024, normalSize: 512, strength: 6 }),
  rock: bakeRock(),
}
// 帯の JPEG は非同期で書き出しているので少し待つ
await new Promise((r) => setTimeout(r, 1500))
fs.writeFileSync(path.join(OUT, "meta.json"), JSON.stringify(meta, null, 2))

let total = 0
for (const f of fs.readdirSync(OUT, { recursive: true })) {
  const p = path.join(OUT, f)
  if (fs.statSync(p).isFile()) {
    total += fs.statSync(p).size
    console.log(`${(fs.statSync(p).size / 1024).toFixed(0).padStart(6)} kB  ${f}`)
  }
}
console.log(`合計 ${(total / 1e6).toFixed(2)} MB`)
console.log(JSON.stringify(meta.sky, null, 1))
