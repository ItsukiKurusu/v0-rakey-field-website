// 空：実写の空（HDRI の帯）を時間でつなぐ。夕暮れ（klippad）→ たそがれ（toposcope）→ 夜（たそがれを暗くして
// 山の影だけ残し、上空は自前のグラデーションと星）。大きな球の内側に描き、カメラ位置へ毎フレーム寄せる。
import * as THREE from "three"
import type { SkyAsset } from "./assets"
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
uniform sampler2D uBandA;
uniform sampler2D uBandB;
uniform float uWeightA;
uniform float uWeightB;
uniform float uExposureA;
uniform float uExposureB;
uniform vec3 uTintA;
uniform vec2 uRange; // 帯の高度の範囲（ラジアン）
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform float uNight;
uniform float uStars;
uniform float uTime;
varying vec3 vDir;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

// 帯の 8bit 値 → 元の明るさ（y = (x/(1+x))^(1/2.2) の逆）
vec3 band(sampler2D t, vec3 dir) {
  float u = atan(dir.z, dir.x) / 6.28318530718 + 0.5;
  float el = asin(clamp(dir.y, -1.0, 1.0));
  float v = clamp((el - uRange.x) / (uRange.y - uRange.x), 0.0, 1.0);
  vec3 r = pow(texture2D(t, vec2(u, v)).rgb, vec3(2.2));
  r = min(r, vec3(0.985));
  return r / (1.0 - r);
}

void main() {
  vec3 dir = normalize(vDir);
  float h = dir.y;
  // 夜の上空（深い青）
  vec3 grad = mix(uHorizon, uZenith, smoothstep(0.0, 0.6, h));
  vec3 col = grad;
  if (uWeightB > 0.001) col = mix(col, band(uBandB, dir) * uExposureB, uWeightB);
  if (uWeightA > 0.001) col = mix(col, band(uBandA, dir) * uExposureA * uTintA, uWeightA);
  // 夜：山の影は残しつつ、上空だけ深い青へ寄せる
  col = mix(col, grad + col * 0.35, uNight * smoothstep(0.03, 0.35, h));

  if (uStars > 0.001 && h > 0.0) {
    vec3 p = dir * 320.0;
    vec3 cell = floor(p);
    float r = hash(cell);
    float star = step(0.9965, r);
    float tw = 0.6 + 0.4 * sin(uTime * (1.5 + r * 3.0) + r * 40.0);
    vec3 f = fract(p) - 0.5;
    float core = smoothstep(0.35, 0.0, length(f));
    col += vec3(0.9, 0.95, 1.0) * star * core * tw * uStars * smoothstep(0.04, 0.25, h) * 2.2;
  }
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`

const NIGHT = { zenith: new THREE.Color(SKY.night.zenith), horizon: new THREE.Color(SKY.night.horizon) }

/** 夕暮れ → たそがれ → 夜の重みと明るさ（tod: 0 = 夕暮れ、1 = 夜） */
export function skyWeights(tod: number) {
  const s = THREE.MathUtils.smoothstep
  const a = 1 - s(tod, 0.22, 0.55) // 夕暮れの空
  const night = s(tod, 0.55, 1)
  return {
    a,
    b: 1 - a, // たそがれの空（夜も山の影として残す）
    night,
    exposureA: SKY.exposure.sunset,
    // たそがれは暗くなりながら夜へ
    exposureB: THREE.MathUtils.lerp(SKY.exposure.dusk, SKY.exposure.night, night),
  }
}

export type SkyState = { sunDir: THREE.Vector3; sunElevation: number }

/** 太陽の向き。高度は夕暮れの空の太陽から、夜へ向けて沈める */
export function sunAt(tod: number, sunsetElevation: number, out: SkyState) {
  const el = THREE.MathUtils.degToRad(THREE.MathUtils.lerp(sunsetElevation, SKY.sun.elevationEnd, tod))
  const az = THREE.MathUtils.degToRad(SKY.sun.azimuth)
  out.sunDir.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)).normalize()
  out.sunElevation = el
  return out
}

export function createSky(sky: { sunset: SkyAsset; dusk: SkyAsset }, radius = 1800) {
  const deg = THREE.MathUtils.degToRad
  const uniforms = {
    uBandA: { value: sky.sunset.bandTex },
    uBandB: { value: sky.dusk.bandTex },
    uWeightA: { value: 1 },
    uWeightB: { value: 0 },
    uExposureA: { value: 1 },
    uExposureB: { value: 1 },
    uTintA: { value: new THREE.Color(SKY.sunsetTint) },
    uRange: { value: new THREE.Vector2(deg(sky.sunset.bandLow), deg(sky.sunset.bandHigh)) },
    uZenith: { value: NIGHT.zenith.clone() },
    uHorizon: { value: NIGHT.horizon.clone() },
    uNight: { value: 0 },
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

  const apply = (tod: number, time: number) => {
    const w = skyWeights(tod)
    uniforms.uWeightA.value = w.a
    uniforms.uWeightB.value = w.b
    uniforms.uExposureA.value = w.exposureA
    uniforms.uExposureB.value = w.exposureB
    uniforms.uNight.value = w.night
    uniforms.uStars.value = w.night
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
