// ルート66のヒーロー：数値はすべてここに集める。
// 幕の区切り（進行度 p = 0..1）を、車・カメラ・空・言葉が同じ物差しで参照する。
//
//   0.00–0.12  夕暮れの荒野。ルート66の標識の寄り → 引いてインパラ
//   0.12–0.55  走り出す。沿道のヴィンテージ看板 = 5つのサービス
//   0.55–0.82  日が落ちて夜へ。ライトが点き、電柱が流れる
//   0.82–1.00  RAKEY FIELD のガレージに着いて停まる。ネオンが灯る
// 言葉の区間は lib/heroLines.ts（three に依存させないため別ファイル）。

/** ピン留めする長さ（画面の高さに対する割合） */
export const SCROLL_DISTANCE = "+=460%"

/** 生の進行度へ追いつく速さ（damp の lambda）。小さいほど重い */
export const LAMBDA = { progress: 3.4, pointer: 2.2 } as const

/** 走り方：p の区間ごとの速さ（最高速に対する割合）。台形に加減速する */
export const DRIVE = {
  start: 0.1, // 走り出し
  cruise: 0.2, // 最高速に乗る
  brake: 0.84, // ブレーキ開始
  stop: 0.935, // 停止
  /** 最高速のとき、p が 1 進む間に走る距離（m） */
  metersPerP: 720,
} as const

/** 道の平面形（x, z）。+X へ進みながらゆるく蛇行する。車の出発点は x = 0 */
export const ROAD = {
  points: [
    [-90, 0], [0, 0], [110, -9], [220, 12], [330, -6], [440, 16], [560, 4], [700, -8],
  ] as Array<[number, number]>,
  width: 8.4, // 2車線＋路肩
  y: 0.02,
  lane: 1.9, // 車は右側の車線を走る（道の中心から右へ）
} as const

/** 1日の移り変わり（0 = 夕暮れ、1 = 夜） */
export const DUSK = { from: 0.5, to: 0.8 } as const

/** ライトが点く進行度 */
export const LIGHTS_ON = 0.6

/** ガレージのネオンが灯る進行度 */
export const NEON_ON = 0.9

/** 完成後の回転（ピンの最後で止まって見えないように） */
export const COAST = { from: 0.965, speed: 4, lambda: 0.9, returnLambda: 2 } as const

/** 常時の微動（何もしていなくても止まって見せない） */
export const BREATH = { speed: 0.5, amplitude: 0.025, cameraSpeed: 0.33, cameraAmplitude: 0.012 } as const

/** マウスで少し覗き込む量 */
export const POINTER_SHIFT = { yaw: 0.06, y: 0.25 } as const

/**
 * カメラのキーフレーム。**車に対する相対位置**（x = 前、y = 上、z = 右）で持つので、
 * 道が曲がってもカメラは車の向きについていく。look は注視点（同じく車基準）。
 */
export const CAMERA_KEYS: Array<{ p: number; pos: [number, number, number]; look: [number, number, number]; fov: number }> = [
  { p: 0.0, pos: [6.9, 1.3, -4.3], look: [8.3, 1.75, -6.5], fov: 34 }, // ルート66の標識の寄り（標識は道の左、車は右車線）
  { p: 0.07, pos: [6.8, 1.75, -6.4], look: [0.6, 0.8, 0], fov: 36 }, // 引いて、止まっているインパラ
  { p: 0.14, pos: [-6.8, 1.9, -3.2], look: [2.5, 0.85, 0.4], fov: 38 }, // 走り出しを後ろから
  { p: 0.25, pos: [-4.6, 1.35, -5.4], look: [3.5, 0.95, 1], fov: 40 }, // 斜め後ろ。右手の看板が流れる
  { p: 0.37, pos: [1.0, 1.15, -8.8], look: [0.6, 0.8, 0.5], fov: 38 }, // 真横を並走
  { p: 0.49, pos: [-8.6, 3.8, 1.6], look: [7, 0.6, 0.6], fov: 40 }, // 高い位置から
  { p: 0.61, pos: [8.8, 1.0, -2.6], look: [-1.2, 0.85, 0], fov: 36 }, // 前から、夕陽を背に向かってくる
  { p: 0.675, pos: [1.2, 2.3, -8.2], look: [0.5, 0.8, 0.3], fov: 40 }, // 前から後ろへ回る途中（車の外を大きく回る）
  { p: 0.74, pos: [-6.2, 1.35, -1.5], look: [7, 0.9, 0.3], fov: 40 }, // 夜の道をライトで照らす
  { p: 0.86, pos: [-3.2, 2.7, -7.4], look: [2.5, 1.1, 3], fov: 40 }, // ガレージへ近づく
  { p: 0.95, pos: [9.6, 1.9, -9.4], look: [-1.6, 2.0, 3.6], fov: 42 }, // 停車。ガレージとネオンを背に斜め前
  { p: 1.0, pos: [9.0, 1.8, -8.9], look: [-1.6, 2.0, 3.6], fov: 42 },
]

/** 演出を止めた人に見せる1枚（ネオンの灯った完成形） */
export const STILL_POSE = { p: 1 } as const

/** ルート66の盾の標識（出発点の左側） */
export const SHIELD_SIGN = { ahead: 8.3, side: -4.6 } as const

/**
 * 沿道の看板（右側）。p はその看板の横を車が通る進行度。
 * 5つのサービス＋ガレージの予告。
 */
export const BILLBOARDS = [
  { p: 0.255, title: "USED CARS", jp: "中古車 買取・販売", sub: "BUY · SELL · TRADE-IN", color: "#b5402a" },
  { p: 0.315, title: "RENT-A-CAR", jp: "レンタカー", sub: "24時間 3,300円〜", color: "#2e7d78" },
  { p: 0.375, title: "SERVICE", jp: "車検・整備・板金", sub: "INSPECTION · REPAIR", color: "#d9a441" },
  { p: 0.435, title: "INSURANCE", jp: "保険のご相談", sub: "AUTO · LIFE · PROPERTY", color: "#1f3a63" },
  { p: 0.495, title: "ANTIQUES", jp: "アメリカン雑貨", sub: "IMPORTED GOODS", color: "#7a3b8f" },
  { p: 0.7, title: "RAKEY FIELD", jp: "この先 すぐ", sub: "NEXT EXIT · SAKAI", color: "#b5402a", lit: true },
] as const

/** 看板の置き方（道の中心からの距離・高さ） */
export const BILLBOARD_LAYOUT = { side: 11, height: 3.2, width: 7.2, aspect: 0.42 } as const

/** ガレージ（停車位置の右手）。ahead は停車位置から前へ、side は道の中心から右へ */
export const GARAGE = { ahead: 1.5, side: 14, width: 11, depth: 8, height: 4.2 } as const

/** 空の色（高さ 0 = 地平線、1 = 天頂）。夕暮れ → たそがれ → 夜 */
export const SKY = {
  sunset: { zenith: "#2c3d70", mid: "#d0735a", horizon: "#ffbb73" },
  dusk: { zenith: "#1a1f4d", mid: "#8a4d74", horizon: "#e1846a" },
  night: { zenith: "#04060e", mid: "#0c1230", horizon: "#232a52" },
  /** 太陽の方位（道の進む向き＝+X から、右回り度）と高度（度） */
  sun: { azimuth: -18, elevationStart: 5, elevationEnd: -8 },
} as const

/** 霧（地平線の色でつなぐ） */
export const FOG = { near: 90, far: 900 } as const
