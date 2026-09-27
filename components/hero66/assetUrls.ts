// 3D ヒーローの素材の一覧（three を含まない軽いモジュール）。
// HeroSection がこれを読んで、ページの HTML の時点で素材の先読み（<link rel="preload">）を出す。
// 3D のプログラム（three 本体）が届くのを待たずに、素材のダウンロードを始めるため。
import HERO_META from "@/public/hero66/meta.json"
import GARAGE_META from "@/public/garage3d/meta.json"

export { HERO_META }
export const HERO_ASSET_BASE = "/hero66/"

const surfaces = [HERO_META.ground, HERO_META.road, HERO_META.groundRocks, HERO_META.shoulder, HERO_META.concrete]

/** 画像（TextureLoader が <img> で読むもの） */
export const HERO_IMAGE_URLS = [
  HERO_META.sky.sunset.band,
  HERO_META.sky.dusk.band,
  ...surfaces.flatMap((s) => [s.diff, s.nor, s.arm, ...("h" in s && s.h ? [s.h] : [])]),
  HERO_META.noise,
  HERO_META.foliage.grassAlpha,
]
  .map((f) => HERO_ASSET_BASE + f)
  .concat(Object.values(GARAGE_META).map((v) => "/garage3d/" + v.file))

/** fetch で読むもの（HDR・glTF） */
export const HERO_FETCH_URLS = [
  HERO_META.sky.sunset.env,
  HERO_META.sky.dusk.env,
  HERO_META.rock,
  HERO_META.foliage.grass,
  HERO_META.foliage.shrub,
].map((f) => HERO_ASSET_BASE + f)
