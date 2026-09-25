// public/ の JPEG/PNG を配信用に縮める。
// - 長辺を MAX_EDGE px まで縮小（小さい画像は拡大しない）
// - EXIF の回転を画素に焼き込み、メタデータ（位置情報など）を落とす
// - 元より小さくなったときだけ上書きする
//
// 実行: node scripts/optimize-images.mjs [対象ディレクトリ=public]
// 元画像は上書き前に assets-src/originals/ へ退避する（.gitignore 済み）。
import fs from "node:fs"
import path from "node:path"
import sharp from "sharp"

const MAX_EDGE = 2400
const QUALITY = 80
// 小さく表示するものは上限を下げる（表示サイズの 3 倍まで）
const EDGE_OVERRIDES = { "images/logo-raw.jpg": 1200 }

const root = process.argv[2] ?? "public"
const backupRoot = "assets-src/originals"

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? walk(p) : [p]
  })

let before = 0
let after = 0

for (const file of walk(root).filter((f) => /\.(jpe?g|png)$/i.test(f))) {
  const rel = path.relative(root, file)
  const input = fs.readFileSync(file)
  const meta = await sharp(input).metadata()
  const maxEdge = EDGE_OVERRIDES[rel] ?? MAX_EDGE

  let img = sharp(input).rotate().resize({
    width: maxEdge,
    height: maxEdge,
    fit: "inside",
    withoutEnlargement: true,
  })
  img = meta.format === "png"
    ? img.png({ compressionLevel: 9, palette: true })
    : img.jpeg({ quality: QUALITY, mozjpeg: true })

  const output = await img.toBuffer()
  before += input.length

  // 回転の焼き込みが必要なもの（orientation ≠ 1）は、サイズが増えても書き出す
  const needsRotate = (meta.orientation ?? 1) !== 1
  if (output.length >= input.length && !needsRotate) {
    after += input.length
    continue
  }

  const backup = path.join(backupRoot, rel)
  if (!fs.existsSync(backup)) {
    fs.mkdirSync(path.dirname(backup), { recursive: true })
    fs.copyFileSync(file, backup)
  }
  fs.writeFileSync(file, output)
  after += output.length
  console.log(`${(input.length / 1e6).toFixed(2)}MB → ${(output.length / 1e6).toFixed(2)}MB  ${rel}`)
}

console.log(`合計 ${(before / 1e6).toFixed(1)}MB → ${(after / 1e6).toFixed(1)}MB`)
