"use client"

// インパラの展示ビューア（制作・確認用）。
// ドラッグで回転、ホイールでズーム、右ドラッグでパン。視点の切り替えと、実写を重ねた見比べができる。
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"
import { createImpala, type Impala } from "./createImpala"
import { contactShadowTexture } from "./textures"

type View = { pos: [number, number, number]; target: [number, number, number]; fov: number }

const VIEWS: Record<string, View & { label: string }> = {
  front34: { label: "斜め前", pos: [5.4, 1.5, -4.4], target: [0, 0.62, 0], fov: 32 },
  front: { label: "正面", pos: [8.2, 1.15, 0], target: [0, 0.62, 0], fov: 28 },
  side: { label: "側面", pos: [0, 0.85, -9.6], target: [0, 0.62, 0], fov: 34 },
  rear34: { label: "斜め後ろ", pos: [-5.4, 1.6, -4.4], target: [0, 0.62, 0], fov: 32 },
  rear: { label: "背面", pos: [-8.2, 1.2, 0], target: [0, 0.62, 0], fov: 28 },
  top: { label: "真上", pos: [0, 11, 0.001], target: [0, 0, 0], fov: 34 },
}

// 実写を撮ったカメラ。写真上の目印（エンブレム・ナンバー・車軸・ミラー・A ピラー等）と3D位置の対応から逆算した
// （impala7 は 2倍ズームで撮られていて、縦の画角 ≒ 27°）
const PHOTOS: Record<string, View & { label: string; src: string }> = {
  mae: { label: "正面（impala-mae）", src: "/images/impala-mae.jpg", pos: [4.32, 1.35, 0.08], target: [2.1, 0.41, 0.03], fov: 52.3 },
  impala6: { label: "斜め前・低い（impala6）", src: "/images/impala6.jpg", pos: [3.59, 1.0, -2.35], target: [0.85, 0.09, -0.16], fov: 51.8 },
  impala7: { label: "斜め前・引き（impala7）", src: "/images/impala7.jpg", pos: [8.0, 2.06, -3.44], target: [3.34, 1.13, -1.67], fov: 26.8 },
}

declare global {
  interface Window {
    __impala?: {
      impala: Impala
      setView: (v: View) => void
      setGround: (visible: boolean) => void
      getView: () => View
      capture: (w?: number, h?: number) => string
    }
  }
}

export function ImpalaViewer() {
  const hostRef = useRef<HTMLDivElement>(null)
  const apiRef = useRef<{ applyView: (v: View) => void; impala: Impala; setWire: (on: boolean) => void } | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [opacity, setOpacity] = useState(0.5)
  const [lights, setLights] = useState(false)
  const [spin, setSpin] = useState(false)
  const [autoRotate, setAutoRotate] = useState(false)
  const [wire, setWire] = useState(false)
  const [readout, setReadout] = useState("")
  const [error, setError] = useState<string | null>(null)
  const flags = useRef({ spin: false, autoRotate: false })
  flags.current = { spin, autoRotate }

  useEffect(() => {
    const host = hostRef.current!
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    } catch {
      setError("この環境では WebGL が使えないため、3D を表示できません。")
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap // r186 で PCFSoft は廃止。ぼかしは shadow.radius で
    host.appendChild(renderer.domElement)
    renderer.domElement.style.display = "block"

    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#d6d7da")
    const pmrem = new THREE.PMREMGenerator(renderer)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.9

    const sun = new THREE.DirectionalLight("#ffffff", 2.2)
    sun.position.set(4, 8, -3)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -4
    sun.shadow.camera.right = 4
    sun.shadow.camera.top = 4
    sun.shadow.camera.bottom = -4
    sun.shadow.camera.near = 1
    sun.shadow.camera.far = 20
    sun.shadow.bias = -0.0004
    sun.shadow.normalBias = 0.02
    sun.shadow.radius = 4
    scene.add(sun)

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.28 }))
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)
    const contactTex = contactShadowTexture()
    const contact = new THREE.Mesh(
      new THREE.PlaneGeometry(6.3, 2.5),
      new THREE.MeshBasicMaterial({ map: contactTex, transparent: true, depthWrite: false, color: "#000000", opacity: 0.75 }),
    )
    contact.rotation.x = -Math.PI / 2
    contact.position.y = 0.002
    scene.add(contact)

    const impala = createImpala()
    scene.add(impala.group)

    const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 200)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 1.2
    controls.maxDistance = 25
    controls.maxPolarAngle = Math.PI * 0.495

    const applyView = (v: View) => {
      camera.position.set(...v.pos)
      controls.target.set(...v.target)
      camera.fov = v.fov
      camera.updateProjectionMatrix()
      controls.update()
    }
    applyView(VIEWS.front34)

    const resize = () => {
      const w = host.clientWidth
      const h = host.clientHeight
      renderer.setSize(w, h, false)
      renderer.domElement.style.width = `${w}px`
      renderer.domElement.style.height = `${h}px`
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()

    const setWireframe = (on: boolean) => {
      impala.group.traverse((o) => {
        const mesh = o as THREE.Mesh
        if (!mesh.isMesh) return
        for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
          ;(m as THREE.MeshStandardMaterial).wireframe = on
        }
      })
    }

    const fmt = (v: THREE.Vector3) => `[${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)}]`
    let distance = 0
    let raf = 0
    let last = performance.now()
    let lastReadout = 0
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      controls.autoRotate = flags.current.autoRotate
      controls.autoRotateSpeed = 1.2
      controls.update(dt)
      if (flags.current.spin) {
        distance += dt * 3 // 3 m/s で走っているときの回り方
        impala.setWheelAngle(distance / 0.35)
      }
      renderer.render(scene, camera)
      if (now - lastReadout > 250) {
        lastReadout = now
        setReadout(`pos ${fmt(camera.position)}  target ${fmt(controls.target)}  fov ${camera.fov.toFixed(0)}`)
      }
    }
    raf = requestAnimationFrame(tick)

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf)
      else {
        last = performance.now()
        raf = requestAnimationFrame(tick)
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    apiRef.current = { applyView, impala, setWire: setWireframe }
    window.__impala = {
      impala,
      setView: applyView,
      // 床と影を隠す（写真に輪郭を重ねて比べるとき用）
      setGround: (visible: boolean) => {
        ground.visible = visible
        contact.visible = visible
      },
      getView: () => ({
        pos: camera.position.toArray() as View["pos"],
        target: controls.target.toArray() as View["target"],
        fov: camera.fov,
      }),
      // 大きさを指定すると、その縦横比で1枚描いて元に戻す（写真との見比べ用）
      capture: (w?: number, h?: number) => {
        if (w && h) {
          renderer.setPixelRatio(1)
          renderer.setSize(w, h, false)
          camera.aspect = w / h
          camera.updateProjectionMatrix()
        }
        renderer.render(scene, camera)
        const url = renderer.domElement.toDataURL("image/jpeg", 0.9)
        if (w && h) {
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
          resize()
        }
        return url
      },
    }

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener("visibilitychange", onVisibility)
      ro.disconnect()
      controls.dispose()
      impala.dispose()
      contactTex.dispose()
      env.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      delete window.__impala
      apiRef.current = null
    }
  }, [])

  useEffect(() => apiRef.current?.impala.setLights(lights), [lights])
  useEffect(() => apiRef.current?.setWire(wire), [wire])

  const choosePhoto = (key: string | null) => {
    setPhoto(key)
    if (key) apiRef.current?.applyView(PHOTOS[key])
  }

  const btn = "rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-100"
  const on = "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800"

  return (
    <div className="flex min-h-screen flex-col bg-neutral-200 text-neutral-900">
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-300 bg-neutral-50 px-4 py-3">
        <span className="mr-2 font-bold">Impala SS ビューア</span>
        {Object.entries(VIEWS).map(([k, v]) => (
          <button key={k} className={btn} onClick={() => { choosePhoto(null); apiRef.current?.applyView(v) }}>
            {v.label}
          </button>
        ))}
        <button className={btn} onClick={() => { choosePhoto(null); apiRef.current?.applyView(VIEWS.front34) }}>
          リセット
        </button>
        <span className="mx-2 h-5 w-px bg-neutral-300" />
        <button className={`${btn} ${lights ? on : ""}`} onClick={() => setLights((v) => !v)}>ライト点灯</button>
        <button className={`${btn} ${spin ? on : ""}`} onClick={() => setSpin((v) => !v)}>ホイール回転</button>
        <button className={`${btn} ${autoRotate ? on : ""}`} onClick={() => setAutoRotate((v) => !v)}>自動回転</button>
        <button className={`${btn} ${wire ? on : ""}`} onClick={() => setWire((v) => !v)}>ワイヤー</button>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-300 bg-neutral-100 px-4 py-2 text-sm">
        <span className="font-semibold">実写と見比べる：</span>
        {Object.entries(PHOTOS).map(([k, v]) => (
          <button key={k} className={`${btn} ${photo === k ? on : ""}`} onClick={() => choosePhoto(photo === k ? null : k)}>
            {v.label}
          </button>
        ))}
        {photo && (
          <label className="ml-2 flex items-center gap-2">
            写真の濃さ
            <input type="range" min={0} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
          </label>
        )}
        <code className="ml-auto text-xs text-neutral-500">{readout}</code>
      </div>
      <div className="relative flex flex-1 items-center justify-center p-4">
        {error ? (
          <p className="text-neutral-600">{error}</p>
        ) : (
          <div
            className="relative w-full overflow-hidden rounded-lg shadow-lg"
            style={photo ? { aspectRatio: "4 / 3", maxHeight: "78vh", width: "auto", height: "78vh" } : { height: "78vh" }}
          >
            <div ref={hostRef} className="absolute inset-0" />
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={PHOTOS[photo].src}
                alt=""
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                style={{ opacity }}
              />
            )}
          </div>
        )}
      </div>
      <p className="px-4 pb-4 text-xs text-neutral-500">
        ドラッグ：回転 ／ ホイール：ズーム ／ 右ドラッグ：パン。制作確認用のページです（検索エンジンには載りません）。
      </p>
    </div>
  )
}
