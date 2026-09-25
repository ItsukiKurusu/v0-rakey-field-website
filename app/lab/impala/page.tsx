import type { Metadata } from "next"
import { ImpalaViewer } from "@/components/impala3d/ImpalaViewer"

// 制作・確認用のページ。検索エンジンには載せない
export const metadata: Metadata = {
  title: "Impala SS 3D ビューア（制作用）",
  robots: { index: false, follow: false },
}

export default function ImpalaLabPage() {
  return <ImpalaViewer />
}
