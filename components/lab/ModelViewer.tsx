"use client"

// 3D モデルの確認用ビューア（制作用）。インパラ・ガレージなど、モデルごとに load と視点を渡して使う。
// ドラッグで回転、ホイールでズーム、右ドラッグでパン。視点の切り替えと、実写を重ねた見比べができる。
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js"

export type View = { pos: [number, number, number]; target: [number, number, number]; fov: number }
export type LabModel = {
  group: THREE.Object3D
  dispose: () => void
  /** 毎フレーム呼ばれる（ホイールを回すなど） */
  tick?: (dt: number) => void
}
export type Toggle = { label: string; initial?: boolean; apply: (on: boolean) => void }

type Props = {
  title: string
  load: () => Promise<LabModel> | LabModel
  views: Record<string, View & { label: string }>
  initialView: string
  photos?: Record<string, View & { label: string; src: string; aspect?: number }>
  /** load の結果を受け取ってトグルを作る */
  toggles?: (model: LabModel) => Toggle[]
  /** 床の接地影の大きさ（m） */
  contactSize?: [number, number]
  sun?: [number, number, number]
}

declare global {
  interface Window {
    __lab?: {
      model: LabModel
      setView: (v: View) => void
      getView: () => View
      setGround: (visible: boolean) => void
      capture: (w?: number, h?: number) => string
    }
  }
}

function contactShadowTexture() {
  const c = document.createElement("canvas")
  c.width = c.height = 256
  const g = c.getContext("2d")!
  const r = g.createRadialGradient(128, 128, 10, 128, 128, 128)
  r.addColorStop(0, "rgba(0,0,0,0.85)")
  r.addColorStop(0.45, "rgba(0,0,0,0.45)")
  r.addColorStop(1, "rgba(0,0,0,0)")
  g.fillStyle = r
  g.fillRect(0, 0, 256, 256)
  return new THREE.CanvasTexture(c)
}

export function ModelViewer({ title, load, views, initialView, photos = {}, toggles, contactSize = [6.3, 2.5], sun = [4, 8, -3] }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const applyRef = useRef<((v: View) => void) | null>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [opacity, setOpacity] = useState(0.5)
  const [autoRotate, setAutoRotate] = useState(false)
  const [readout, setReadout] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [items, setItems] = useState<Array<Toggle & { on: boolean }>>([])
  const autoRef = useRef(false)
  autoRef.current = autoRotate

  useEffect(() => {
    const host = hostRef.current!
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    } catch {
      setError("この環境では WebGL が使えないため、3D を表示できません。")
      return
    }
    let disposed = false
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFShadowMap
    host.appendChild(renderer.domElement)
    renderer.domElement.style.display = "block"

    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#d6d7da")
    const pmrem = new THREE.PMREMGenerator(renderer)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.9

    const light = new THREE.DirectionalLight("#ffffff", 2.2)
    light.position.set(...sun)
    light.castShadow = true
    light.shadow.mapSize.set(2048, 2048)
    Object.assign(light.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 30 })
    light.shadow.bias = -0.0004
    light.shadow.normalBias = 0.02
    light.shadow.radius = 4
    scene.add(light)

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.28 }))
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    const contactTex = contactShadowTexture()
    const contact = new THREE.Mesh(
      new THREE.PlaneGeometry(...contactSize),
      new THREE.MeshBasicMaterial({ map: contactTex, transparent: true, depthWrite: false, color: "#000", opacity: 0.75 }),
    )
    contact.rotation.x = -Math.PI / 2
    contact.position.y = 0.002
    scene.add(ground, contact)

    const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 200)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 0.5
    controls.maxDistance = 25
    controls.maxPolarAngle = Math.PI * 0.495

    const applyView = (v: View) => {
      camera.position.set(...v.pos)
      controls.target.set(...v.target)
      camera.fov = v.fov
      camera.updateProjectionMatrix()
      controls.update()
    }
    applyRef.current = applyView
    applyView(views[initialView])

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

    let model: LabModel | null = null
    let raf = 0
    let last = performance.now()
    let lastReadout = 0
    const fmt = (v: THREE.Vector3) => `[${v.x.toFixed(2)}, ${v.y.toFixed(2)}, ${v.z.toFixed(2)}]`
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      controls.autoRotate = autoRef.current
      controls.autoRotateSpeed = 1.2
      controls.update(dt)
      model?.tick?.(dt)
      renderer.render(scene, camera)
      if (now - lastReadout > 250) {
        lastReadout = now
        setReadout(`pos ${fmt(camera.position)}  target ${fmt(controls.target)}  fov ${camera.fov.toFixed(0)}`)
      }
    }

    Promise.resolve(load()).then((m) => {
      if (disposed) {
        m.dispose()
        return
      }
      model = m
      scene.add(m.group)
      const list = toggles?.(m) ?? []
      list.forEach((tg) => tg.apply(Boolean(tg.initial)))
      setItems(list.map((tg) => ({ ...tg, on: Boolean(tg.initial) })))
      window.__lab = {
        model: m,
        setView: applyView,
        getView: () => ({ pos: camera.position.toArray() as View["pos"], target: controls.target.toArray() as View["target"], fov: camera.fov }),
        setGround: (visible) => {
          ground.visible = visible
          contact.visible = visible
        },
        capture: (w, h) => {
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
    }, (e) => setError(`モデルを読み込めませんでした：${e}`))
    raf = requestAnimationFrame(tick)

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf)
      else {
        last = performance.now()
        raf = requestAnimationFrame(tick)
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      document.removeEventListener("visibilitychange", onVisibility)
      ro.disconnect()
      controls.dispose()
      model?.dispose()
      contactTex.dispose()
      env.dispose()
      pmrem.dispose()
      renderer.dispose()
      renderer.domElement.remove()
      delete window.__lab
      applyRef.current = null
    }
    // 視点やトグルの定義はページごとに固定なので、最初の1回だけ作る
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const choosePhoto = (key: string | null) => {
    setPhoto(key)
    if (key) applyRef.current?.(photos[key])
  }
  const flip = (i: number) =>
    setItems((list) =>
      list.map((tg, j) => {
        if (j !== i) return tg
        tg.apply(!tg.on)
        return { ...tg, on: !tg.on }
      }),
    )

  const btn = "rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm hover:bg-neutral-100"
  const on = "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-800"
  const aspect = photo ? (photos[photo].aspect ?? 4 / 3) : 0

  return (
    <div className="flex min-h-screen flex-col bg-neutral-200 text-neutral-900">
      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-300 bg-neutral-50 px-4 py-3">
        <span className="mr-2 font-bold">{title}</span>
        {Object.entries(views).map(([k, v]) => (
          <button key={k} className={btn} onClick={() => { choosePhoto(null); applyRef.current?.(v) }}>
            {v.label}
          </button>
        ))}
        <button className={btn} onClick={() => { choosePhoto(null); applyRef.current?.(views[initialView]) }}>
          リセット
        </button>
        <span className="mx-2 h-5 w-px bg-neutral-300" />
        {items.map((tg, i) => (
          <button key={tg.label} className={`${btn} ${tg.on ? on : ""}`} onClick={() => flip(i)}>
            {tg.label}
          </button>
        ))}
        <button className={`${btn} ${autoRotate ? on : ""}`} onClick={() => setAutoRotate((v) => !v)}>自動回転</button>
      </div>
      {Object.keys(photos).length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-neutral-300 bg-neutral-100 px-4 py-2 text-sm">
          <span className="font-semibold">実写と見比べる：</span>
          {Object.entries(photos).map(([k, v]) => (
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
      )}
      <div className="relative flex flex-1 items-center justify-center p-4">
        {error ? (
          <p className="text-neutral-600">{error}</p>
        ) : (
          <div
            className="relative w-full overflow-hidden rounded-lg shadow-lg"
            style={photo ? { aspectRatio: String(aspect), height: "78vh", width: "auto" } : { height: "78vh" }}
          >
            <div ref={hostRef} className="absolute inset-0" />
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos[photo].src} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover" style={{ opacity }} />
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
