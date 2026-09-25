import type { Metadata } from "next"
import { GarageViewer } from "@/components/garage3d/GarageViewer"

// 制作・確認用のページ。検索エンジンには載せない
export const metadata: Metadata = {
  title: "ガレージ 3D ビューア（制作用）",
  robots: { index: false, follow: false },
}

export default function GarageLabPage() {
  return <GarageViewer />
}
