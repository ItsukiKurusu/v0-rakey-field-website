// インパラの材質一式。塗装にはパネルの隙間・ピンストライプ・モールをシェーダーで描き足す。
import * as THREE from "three"
import { pchip } from "./math"
import { SPEC } from "./spec"
import {
  amberTexture, headlightTexture, honeycombTexture, leapingImpalaTexture,
  plateTexture, scriptDecalTexture, taillightTexture,
} from "./textures"

// 写真のダークチェリー（日なたで明るい赤、陰で深いワイン色）
export const PAINT_COLOR = new THREE.Color("#8a0c1c")

const WS_SAMPLES = 32
const WS_X0 = -2.95
const WS_X1 = 2.55

/**
 * 塗装にパネルの隙間などの線を描く。座標は車体の物体座標（車の原点基準）。
 * 線の太さは fwidth で画面の解像度に合わせて滑らかにする（拡大してもにじまない）。
 */
function addPaintDetails(mat: THREE.MeshPhysicalMaterial) {
  const L = SPEC.lines
  const wS = pchip(SPEC.body.shoulderW)
  const wsSamples = Array.from({ length: WS_SAMPLES }, (_, i) =>
    wS(WS_X0 + ((WS_X1 - WS_X0) * i) / (WS_SAMPLES - 1)),
  )
  const uniforms = {
    uDoorCuts: { value: [...L.doorCuts] },
    uDoorBottom: { value: L.doorBottom },
    uBeltY: { value: 0.862 }, // ドアの切れ目はベルトの少し下で止める
    uHoodRearX: { value: L.hoodRearX },
    uHoodInset: { value: L.hoodEdgeInset },
    uTrunkFrontX: { value: L.trunkFrontX },
    uTrunkRearX: { value: L.trunkRearX },
    uHeaderY: { value: SPEC.details.headlight.y1 + 0.013 },
    uStripeY: { value: L.pinstripeY },
    uStripeX: { value: new THREE.Vector2(L.pinstripe.rear, L.pinstripe.front) },
    uStripeColor: { value: new THREE.Color("#ff6a1a") },
    uMoldY: { value: L.moldingY },
    uMoldX: { value: new THREE.Vector2(L.molding.rear, L.molding.front) },
    uWS: { value: wsSamples },
    uWSRange: { value: new THREE.Vector2(WS_X0, WS_X1) },
  }
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vObjPos;\nvarying vec3 vObjNormal;")
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvObjPos = position;\nvObjNormal = objectNormal;",
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        /* glsl */ `#include <common>
varying vec3 vObjPos;
varying vec3 vObjNormal;
uniform float uDoorCuts[3];
uniform float uDoorBottom, uBeltY, uHoodRearX, uHoodInset, uTrunkFrontX, uTrunkRearX, uHeaderY;
uniform float uStripeY, uMoldY;
uniform vec2 uStripeX, uMoldX, uWSRange;
uniform vec3 uStripeColor;
uniform float uWS[${WS_SAMPLES}];
float lineMask(float d, float w) {
  float fw = fwidth(d) * 1.2;
  return 1.0 - smoothstep(w, w + fw, abs(d));
}
float between(float v, float a, float b) { return step(a, v) * step(v, b); }
float wsAt(float x) {
  float t = clamp((x - uWSRange.x) / (uWSRange.y - uWSRange.x), 0.0, 1.0) * float(${WS_SAMPLES - 1});
  int i = int(floor(t));
  int j = min(i + 1, ${WS_SAMPLES - 1});
  return mix(uWS[i], uWS[j], fract(t));
}`,
      )
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
vec3 P = vObjPos;
vec3 NO = normalize(vObjNormal);
float side = step(0.55, abs(NO.z));
float topf = step(0.45, NO.y);
float frontf = step(0.5, NO.x);
float gap = 0.0;
for (int i = 0; i < 3; i++) {
  gap = max(gap, lineMask(P.x - uDoorCuts[i], 0.0022) * side * between(P.y, uDoorBottom, uBeltY));
}
float hoodW = wsAt(P.x) - uHoodInset;
// ボンネット：後端の横線と左右の縁
gap = max(gap, lineMask(P.x - uHoodRearX, 0.0022) * topf * step(abs(P.z), hoodW));
gap = max(gap, lineMask(abs(P.z) - hoodW, 0.0022) * topf * step(uHoodRearX, P.x));
// トランク：前端の横線と左右の縁
gap = max(gap, lineMask(P.x - uTrunkFrontX, 0.0022) * topf * step(abs(P.z), hoodW));
gap = max(gap, lineMask(abs(P.z) - hoodW, 0.0022) * topf * between(P.x, uTrunkRearX, uTrunkFrontX));
// ヘッドライトの上（ボンネットの先端の合わせ目）
gap = max(gap, lineMask(P.y - uHeaderY, 0.002) * frontf * step(abs(P.z), 0.78));
float stripe = lineMask(P.y - uStripeY, 0.0032) * side * between(P.x, uStripeX.x, uStripeX.y);
float mold = lineMask(P.y - uMoldY, 0.0055) * side * between(P.x, uMoldX.x, uMoldX.y);
diffuseColor.rgb = mix(diffuseColor.rgb, uStripeColor, stripe);
diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.8), mold);
diffuseColor.rgb *= 1.0 - 0.85 * gap;`,
      )
      .replace(
        "#include <roughnessmap_fragment>",
        "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.12, mold);\nroughnessFactor = mix(roughnessFactor, 0.9, gap);",
      )
      .replace(
        "#include <metalnessmap_fragment>",
        "#include <metalnessmap_fragment>\nmetalnessFactor = mix(metalnessFactor, 1.0, mold);",
      )
      .replace(
        "#include <lights_physical_fragment>",
        "#include <lights_physical_fragment>\nmaterial.clearcoat *= 1.0 - gap;",
      )
  }
  mat.customProgramCacheKey = () => "impala-paint-v1"
}

export type ImpalaMaterials = ReturnType<typeof createImpalaMaterials>

export function createImpalaMaterials() {
  // 下地の反射はメタリックで赤く色づけ、白い映り込みはクリアコートだけに任せる
  // （下地を誘電体寄りにすると、広い白い反射で全体がピンクに白ける）
  const paintParams = {
    color: PAINT_COLOR,
    metalness: 0.55,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    envMapIntensity: 1.0,
  }
  const paint = new THREE.MeshPhysicalMaterial(paintParams)
  addPaintDetails(paint)

  // グリルの枠など、線を描かない塗装部品
  const paintPlain = new THREE.MeshPhysicalMaterial(paintParams)

  const chrome = new THREE.MeshStandardMaterial({ color: "#f2f3f5", metalness: 1, roughness: 0.07 })
  const chromeSatin = new THREE.MeshStandardMaterial({ color: "#d9dadd", metalness: 1, roughness: 0.22 })
  const gold = new THREE.MeshStandardMaterial({ color: "#c9a14a", metalness: 1, roughness: 0.28 })

  const glass = new THREE.MeshPhysicalMaterial({
    color: "#12171b",
    metalness: 0,
    roughness: 0.02,
    transparent: true,
    opacity: 0.72, // スモーク。車内がうっすら見える
    envMapIntensity: 1.6,
    depthWrite: false,
    clearcoat: 1,
    clearcoatRoughness: 0.01,
  })

  const blackTrim = new THREE.MeshStandardMaterial({ color: "#0b0b0c", metalness: 0.2, roughness: 0.38 })
  const rubber = new THREE.MeshStandardMaterial({ color: "#141414", roughness: 0.88, metalness: 0 })
  const tireSide = new THREE.MeshStandardMaterial({ color: "#1a1a1b", roughness: 0.8, metalness: 0 })
  const liner = new THREE.MeshStandardMaterial({ color: "#060606", roughness: 1, side: THREE.DoubleSide })
  const interior = new THREE.MeshStandardMaterial({ color: "#2b2a2b", roughness: 0.75, side: THREE.DoubleSide })
  const seat = new THREE.MeshStandardMaterial({ color: "#3a3739", roughness: 0.55 })
  const brakeDisc = new THREE.MeshStandardMaterial({ color: "#7c7f82", metalness: 0.8, roughness: 0.45 })
  const caliper = new THREE.MeshStandardMaterial({ color: "#2a2b2d", metalness: 0.4, roughness: 0.5 })

  const lensClear = new THREE.MeshPhysicalMaterial({
    map: headlightTexture(),
    roughness: 0.12,
    metalness: 0.65, // 透明なレンズ越しのメッキの反射板
    envMapIntensity: 1.3,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    emissive: new THREE.Color("#fff6e0"),
    emissiveIntensity: 0,
    side: THREE.DoubleSide,
  })
  const lensAmber = new THREE.MeshPhysicalMaterial({
    map: amberTexture(),
    roughness: 0.2,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    emissive: new THREE.Color("#ff8a1a"),
    emissiveIntensity: 0,
    side: THREE.DoubleSide,
  })
  const tailMap = taillightTexture()
  const taillight = new THREE.MeshPhysicalMaterial({
    map: tailMap,
    emissiveMap: tailMap,
    emissive: new THREE.Color("#ffffff"),
    emissiveIntensity: 0.08,
    roughness: 0.18,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    side: THREE.DoubleSide,
  })
  const grilleMesh = new THREE.MeshStandardMaterial({ map: honeycombTexture(), roughness: 0.6, metalness: 0.3 })
  const plate = new THREE.MeshStandardMaterial({ map: plateTexture(), roughness: 0.5, metalness: 0.1 })
  const scriptDecal = new THREE.MeshPhysicalMaterial({
    map: scriptDecalTexture(),
    transparent: true,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  })
  const emblem = new THREE.MeshStandardMaterial({
    alphaMap: leapingImpalaTexture(),
    transparent: true,
    color: "#e8e9eb",
    metalness: 1,
    roughness: 0.12,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
  })

  const all = {
    paint, paintPlain, chrome, chromeSatin, gold, glass, blackTrim, rubber, tireSide, liner, interior, seat,
    brakeDisc, caliper, lensClear, lensAmber, taillight, grilleMesh, plate, scriptDecal, emblem,
  }
  return {
    ...all,
    dispose() {
      for (const m of Object.values(all)) {
        for (const key of ["map", "emissiveMap", "alphaMap"] as const) {
          const t = (m as THREE.MeshStandardMaterial)[key]
          if (t) t.dispose()
        }
        m.dispose()
      }
    },
  }
}
