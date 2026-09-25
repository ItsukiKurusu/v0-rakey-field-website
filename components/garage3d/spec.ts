// RAKEY FIELD のガレージ（鉄骨の組み立て式ガレージ）の寸法。単位はメートル。
// 座標：建物の中心の地面が原点、+Z が正面（シャッター側）、X が左右（-X が向かって左）。
//
// 出どころ：左の壁は正面から撮った写真（garage-soto）で、ACDelco の看板（既製品 24×16インチ = 0.61×0.41m）
// を物差しにして測った。看板の位置も同じ写真から。右の壁と全体の比率は garage-soto-hiki から。
// 高さは、正面の写真（garage-soto-hiki）を撮ったカメラを看板と開口の角から逆算したときに、
// 最初の見積もりの 1.28 倍で合った（その倍率を掛けた値）。
export const GARAGE_SPEC = {
  width: 4.8,
  depth: 3.6,
  eaveFront: 3.1, // 正面の軒の高さ
  eaveBack: 2.94, // 屋根は奥へゆるく下がる
  wall: 0.08, // 壁の厚み
  post: 0.1, // 紺の柱の太さ
  foundation: { height: 0.28, overhang: 0.05 }, // コンクリートの基礎（外に少し出る）
  floorY: 0.08, // 室内の床（土間コンクリート）
  opening: { left: -1.14, right: 1.46, height: 2.55 }, // シャッターの開口（x の範囲と、床からの高さ）
  shutterBox: { depth: 0.38, height: 0.56, extra: 0.16 }, // 巻き上げ部のカバー（開口より左右に extra ずつ広い）
  slat: 0.075, // シャッターのスラット1枚の高さ
  /** 最初のシャッターの開き具合（写真では下端が床から約 2.0m） */
  shutterOpen: 0.78,
  panelSeamY: 1.95, // 外壁パネルの横の継ぎ目
  roof: { overhang: 0.14, rib: 0.076, ribDepth: 0.018 },
} as const

/**
 * 壁の看板。x は壁の左端（柱の内側）からの距離、y は地面からの高さ（どちらも看板の左下）、w は幅。
 * 高さは写真の縦横比から決める。
 */
export const WALL_SIGNS = {
  // 左の壁：柱の内側 x = -2.3 から
  left: [
    { tex: "sign-acdelco", x: 0.285, y: 2.022, w: 0.6 },
    { tex: "sign-405", x: 0.294, y: 1.587, w: 0.26 },
    { tex: "sign-warning", x: 0.725, y: 1.600, w: 0.148 },
    { tex: "sticker-24h", x: 0.979, y: 1.587, w: 0.073 },
    { tex: "sticker-security", x: 1.101, y: 1.587, w: 0.054 },
    { tex: "plate-illinois", x: 0.115, y: 1.331, w: 0.198 },
    { tex: "sign-pig-xing", x: 0.467, y: 1.190, w: 0.243 },
    { tex: "sign-peoples-meat", x: 0.837, y: 1.318, w: 0.248 },
  ],
  // 右の壁：開口の枠の外 x = 1.56 から
  right: [
    { tex: "sign-security-alert", x: 0.23, y: 2.061, w: 0.3 },
    { tex: "sign-private", x: 0.14, y: 1.715, w: 0.36 },
    { tex: "sign-american-pig", x: 0.19, y: 1.133, w: 0.31 },
  ],
} as const

export const GARAGE_COLORS = {
  wall: "#eef0f1",
  blue: "#3f4fb7", // 柱・縁取り・シャッター（晴れた日の写真では少し紫がかった青）
  shutter: "#4a5cc2",
  roof: "#8e959b",
  concrete: "#9c9a95",
  wood: "#5a3d25",
} as const
