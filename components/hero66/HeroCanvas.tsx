"use client"

// React と three をつなぐ層。最重要は後始末：下層ページから戻るたびに effect がもう一度走るので、
// 解放が漏れると WebGL コンテキストとループが二重になり、数往復でタブが落ちる。
// 描画ループは gsap.ticker に載せる（Lenis・ScrollTrigger と同じ1本の RAF）。
import { useEffect, useRef } from "react"
import gsap from "gsap"
import { useMotionState } from "@/components/motion-state"
import { damp, dampAlpha } from "@/lib/damp"
import { attachResize, createRenderer, readDeviceProfile } from "@/lib/renderer"
import { COAST, LAMBDA, STILL_POSE } from "./constants"
import { createHeroScene } from "./scene"
import { createChoreography } from "./scrollChoreography"

type Props = { onReady?: () => void }

export default function HeroCanvas({ onReady }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const { motionStopped } = useMotionState()
  const onReadyRef = useRef(onReady)
  useEffect(() => {
    onReadyRef.current = onReady
  }, [onReady])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    // canvas は effect ごとに作る（使い回すと、二重に走ったときに同じコンテキストを2つが掴む）
    const canvas = document.createElement("canvas")
    wrapper.appendChild(canvas)
    let cleanup: (() => void) | null = null
    let cancelled = false

    const setup = async () => {
      const trigger = wrapper.closest<HTMLElement>("[data-hero]")
      const profile = readDeviceProfile()
      const gl = createRenderer(canvas, profile)
      if (!gl) {
        // WebGL が使えない：写真の静止画に落とす（CSS の .no-webgl）
        document.documentElement.classList.add("no-webgl")
        onReadyRef.current?.()
        return
      }
      // 看板の文字にサイトの書体を使うので、読み込みを待ってから作る
      await document.fonts.ready
      if (cancelled) {
        gl.dispose()
        return
      }
      const hero = createHeroScene(gl.renderer, profile)
      const size = gl.applyResolution()
      hero.resize(size.width, size.height)
      hero.warmup()

      const exposeDev = (setProgress: (p: number) => number) => {
        if (process.env.NODE_ENV !== "development") return
        ;(window as unknown as Record<string, unknown>).__hero66 = {
          hero,
          setProgress,
          // 大きさを指定して1枚描き、画像にする（タブが隠れていても撮れる）
          capture: (p: number, w: number, h: number) => {
            gl.renderer.setPixelRatio(1)
            gl.renderer.setSize(w, h, false)
            hero.resize(w, h)
            setProgress(p)
            const url = gl.renderer.domElement.toDataURL("image/jpeg", 0.88)
            const r = gl.applyResolution()
            hero.resize(r.width, r.height)
            return url
          },
        }
      }

      // --- 演出を止めている人：ネオンの灯った完成形を1枚だけ描く ---
      if (motionStopped) {
        const drawStill = (p: number) => {
          hero.update(p, 0)
          hero.render()
          return p
        }
        drawStill(STILL_POSE.p)
        exposeDev(drawStill)
        const detach = attachResize(() => {
          const r = gl.applyResolution()
          hero.resize(r.width, r.height)
          drawStill(STILL_POSE.p)
        })
        onReadyRef.current?.()
        cleanup = () => {
          detach()
          hero.dispose()
          gl.dispose()
        }
        return
      }

      // --- 通常の演出 ---
      const choreo = createChoreography(trigger ?? canvas)
      let progress = choreo.targets.progress
      let documentVisible = document.visibilityState !== "hidden"
      // 描くかどうかは「画面に見えているか」で決める（最初は画面の一番上にいるので true）
      let onScreen = true
      const watch = new IntersectionObserver(([e]) => {
        onScreen = e.isIntersecting
      })
      watch.observe(trigger ?? canvas)
      const onVisibility = () => {
        documentVisible = document.visibilityState !== "hidden"
      }
      document.addEventListener("visibilitychange", onVisibility)

      const usePointer = window.matchMedia("(pointer: fine)").matches
      const pointer = { x: 0, y: 0 }
      const pointerSmooth = { x: 0, y: 0 }
      const onPointerMove = (e: PointerEvent) => {
        pointer.x = (e.clientX / window.innerWidth) * 2 - 1
        pointer.y = -((e.clientY / window.innerHeight) * 2 - 1)
      }
      if (usePointer) window.addEventListener("pointermove", onPointerMove, { passive: true })

      const detachResize = attachResize(() => {
        const r = gl.applyResolution()
        hero.resize(r.width, r.height)
      })

      let coastAngle = 0
      let coastSpeed = 0

      exposeDev((p) => {
        progress = Math.min(1, Math.max(0, p))
        choreo.applyProgress(progress)
        hero.update(progress, performance.now() / 1000)
        hero.render()
        return progress
      })

      // ループの前に1枚確実に描く（バックグラウンドで開かれても準備完了を伝えられる）
      hero.update(progress, 0)
      hero.render()
      onReadyRef.current?.()

      const tick = (time: number, deltaMs: number) => {
        if (!documentVisible || !onScreen) return
        const dt = Math.min(deltaMs / 1000, 0.1) // タブ復帰直後の巨大な値を捨てる
        progress = damp(progress, choreo.targets.progress, LAMBDA.progress, dt)

        // 停車後はゆっくり回り続ける。戻ったら近い方へ 0 に寄せる
        const coasting = progress >= COAST.from
        coastSpeed += ((coasting ? COAST.speed : 0) - coastSpeed) * dampAlpha(COAST.lambda, dt)
        if (coasting) coastAngle = (coastAngle + coastSpeed * dt) % 360
        else if (coastAngle !== 0) {
          if (coastAngle > 180) coastAngle -= 360
          coastAngle = damp(coastAngle, 0, COAST.returnLambda, dt)
          if (Math.abs(coastAngle) < 0.01) coastAngle = 0
        }
        if (usePointer) {
          const a = dampAlpha(LAMBDA.pointer, dt)
          pointerSmooth.x += (pointer.x - pointerSmooth.x) * a
          pointerSmooth.y += (pointer.y - pointerSmooth.y) * a
        }
        hero.update(progress, time, -(coastAngle * Math.PI) / 180, pointerSmooth)
        hero.render()
      }
      gsap.ticker.add(tick)

      cleanup = () => {
        gsap.ticker.remove(tick)
        watch.disconnect()
        choreo.kill() // pin と pin-spacer を外す
        detachResize()
        document.removeEventListener("visibilitychange", onVisibility)
        if (usePointer) window.removeEventListener("pointermove", onPointerMove)
        hero.dispose()
        gl.dispose()
        if (process.env.NODE_ENV === "development") delete (window as unknown as Record<string, unknown>).__hero66
      }
    }

    setup()
    return () => {
      cancelled = true
      cleanup?.()
      canvas.remove()
    }
  }, [motionStopped])

  return <div ref={wrapperRef} className="hero-canvas-wrapper" aria-hidden="true" />
}
