"use client"

// ガレージの確認用ビューア（/lab/garage）
import { ModelViewer } from "@/components/lab/ModelViewer"
import { createGarageModel, type GarageModel } from "./createGarage"
import { GARAGE_SPEC } from "./spec"

const VIEWS = {
  front: { label: "正面", pos: [0.3, 1.8, 9.5] as [number, number, number], target: [0.2, 1.3, 0] as [number, number, number], fov: 38 },
  front34: { label: "斜め前", pos: [5.2, 2.0, 6.6] as [number, number, number], target: [0.1, 1.2, 0.2] as [number, number, number], fov: 40 },
  inside: { label: "内部をのぞく", pos: [0.3, 1.45, 3.4] as [number, number, number], target: [0.2, 1.1, -1.8] as [number, number, number], fov: 55 },
  whole: { label: "全体", pos: [-7.5, 5.5, 8.5] as [number, number, number], target: [0, 1.0, 0] as [number, number, number], fov: 36 },
}

export function GarageViewer() {
  return (
    <ModelViewer
      title="RAKEY FIELD ガレージ"
      initialView="front34"
      views={VIEWS}
      contactSize={[7, 6]}
      sun={[5, 9, 7]}
      load={async () => {
        const g = await createGarageModel()
        return g
      }}
      toggles={(m) => {
        const g = m as unknown as GarageModel
        return [
          { label: "室内の灯り", initial: true, apply: (on) => g.setInteriorLights(on ? 1 : 0) },
          { label: "シャッターを閉める", initial: false, apply: (on) => g.setShutter(on ? 0 : GARAGE_SPEC.shutterOpen) },
        ]
      }}
      photos={{
        front: { label: "正面（garage-soto-hiki）", src: "/images/garage-soto-hiki.jpg", pos: [0.33, 1.82, 5.81], target: [0.04, 1.43, 0.99], fov: 53 },
        leftWall: { label: "左の壁（garage-soto）", src: "/images/garage-soto.jpg", pos: [-1.7, 1.55, 3.3], target: [-1.7, 1.5, 0], fov: 55 },
      }}
    />
  )
}
