// 空：夕暮れ → たそがれ → 夜のグラデーション、沈む太陽とにじみ、夜の星。
// 大きな球の内側に描き、カメラ位置へ毎フレーム寄せる（どこまで走っても地平線が遠いまま）。
import * as THREE from "three"
import { SKY } from "./constants"

const vert = /* glsl */ `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewMatrix * wp;
  gl_Position.z = gl_Position.w; // 常に一番奥
}`

const frag = /* glsl */ `
uniform vec3 uZenith;
uniform vec3 uMid;
uniform vec3 uHorizon;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunStrength;
uniform float uStars;
uniform float uTime;
varying vec3 vDir;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

void main() {
  vec3 dir = normalize(vDir);
  float h = dir.y;
  vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.2, h));
  col = mix(col, uZenith, smoothstep(0.14, 0.75, h));
  // 地平線の下は少し暗く（地面の外周が見えたときの受け）
  col = mix(col, uHorizon * 0.55, smoothstep(0.0, -0.08, h));

  // 太陽の方向ほど明るく色づく
  float d = max(dot(dir, uSunDir), 0.0);
  col += uSunColor * (pow(d, 6.0) * 0.35 + pow(d, 48.0) * 0.8) * uSunStrength;
  float disk = smoothstep(0.99955, 0.99975, d);
  col += uSunColor * disk * 12.0 * uSunStrength;

  // 星：方向を細かい格子に割り、まれな格子だけ光らせる
  if (uStars > 0.001 && h > 0.0) {
    vec3 p = dir * 320.0;
    vec3 cell = floor(p);
    float r = hash(cell);
    float star = step(0.9965, r);
    float tw = 0.6 + 0.4 * sin(uTime * (1.5 + r * 3.0) + r * 40.0);
    vec3 f = fract(p) - 0.5;
    float core = smoothstep(0.35, 0.0, length(f));
    col += vec3(0.9, 0.95, 1.0) * star * core * tw * uStars * smoothstep(0.02, 0.25, h) * 2.2;
  }
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`

const c = (hex: string) => new THREE.Color(hex)
const PAL = {
  sunset: { zenith: c(SKY.sunset.zenith), mid: c(SKY.sunset.mid), horizon: c(SKY.sunset.horizon) },
  dusk: { zenith: c(SKY.dusk.zenith), mid: c(SKY.dusk.mid), horizon: c(SKY.dusk.horizon) },
  night: { zenith: c(SKY.night.zenith), mid: c(SKY.night.mid), horizon: c(SKY.night.horizon) },
}

export type SkyState = {
  zenith: THREE.Color
  mid: THREE.Color
  horizon: THREE.Color
  sunDir: THREE.Vector3
  /** 太陽の高度（ラジアン）。地平線の下では負 */
  sunElevation: number
}

/** 1日の進み tod（0 = 夕暮れ、1 = 夜）での空の色と太陽の向き */
export function skyStateAt(tod: number, out?: SkyState): SkyState {
  const s = out ?? {
    zenith: new THREE.Color(),
    mid: new THREE.Color(),
    horizon: new THREE.Color(),
    sunDir: new THREE.Vector3(),
    sunElevation: 0,
  }
  const [a, b, t] = tod < 0.5 ? [PAL.sunset, PAL.dusk, tod / 0.5] : [PAL.dusk, PAL.night, (tod - 0.5) / 0.5]
  s.zenith.lerpColors(a.zenith, b.zenith, t)
  s.mid.lerpColors(a.mid, b.mid, t)
  s.horizon.lerpColors(a.horizon, b.horizon, t)
  const el = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(SKY.sun.elevationStart, SKY.sun.elevationEnd, tod))
  const az = THREE.MathUtils.degToRad(SKY.sun.azimuth)
  // 方位 0 = +X（道の進む向き）、正の角度で右（+Z）へ
  s.sunDir.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)).normalize()
  s.sunElevation = el
  return s
}

export function createSky(radius = 1800) {
  const uniforms = {
    uZenith: { value: new THREE.Color() },
    uMid: { value: new THREE.Color() },
    uHorizon: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3(1, 0.1, 0) },
    uSunColor: { value: new THREE.Color("#ffb46a") },
    uSunStrength: { value: 1 },
    uStars: { value: 0 },
    uTime: { value: 0 },
  }
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: vert,
    fragmentShader: frag,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  })
  const geometry = new THREE.SphereGeometry(radius, 48, 24)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.frustumCulled = false
  mesh.renderOrder = -10
  mesh.name = "sky"

  const apply = (s: SkyState, tod: number, time: number) => {
    uniforms.uZenith.value.copy(s.zenith)
    uniforms.uMid.value.copy(s.mid)
    uniforms.uHorizon.value.copy(s.horizon)
    uniforms.uSunDir.value.copy(s.sunDir)
    // 沈むにつれて光を失う
    uniforms.uSunStrength.value = THREE.MathUtils.smoothstep(s.sunElevation, -0.12, 0.03)
    uniforms.uStars.value = THREE.MathUtils.smoothstep(tod, 0.55, 1)
    uniforms.uTime.value = time
  }

  return {
    mesh,
    apply,
    dispose() {
      geometry.dispose()
      material.dispose()
    },
  }
}
