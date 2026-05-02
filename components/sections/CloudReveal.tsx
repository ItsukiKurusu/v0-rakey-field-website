"use client"

import { motion } from "framer-motion"

// 自然に見えるよう意図的に高さを不均一にした雲の輪郭パス
// 上パネルの下端：雲の凸凹が下方向に突き出る
const TOP_EDGE =
  "M0,18 Q60,75 130,22 Q195,82 280,16 Q345,72 440,20 Q510,85 600,14 Q670,78 760,24 Q830,80 930,18 Q995,76 1090,20 Q1160,84 1250,15 Q1315,72 1410,22 Q1430,28 1440,20 L1440,0 L0,0 Z"

// 下パネルの上端：雲の凸凹が上方向に突き出る（TOP_EDGE の y 軸反転）
const BOTTOM_EDGE =
  "M0,62 Q60,5 130,58 Q195,0 280,64 Q345,8 440,60 Q510,2 600,66 Q670,4 760,56 Q830,0 930,62 Q995,4 1090,60 Q1160,0 1250,65 Q1315,8 1410,58 Q1430,52 1440,60 L1440,80 L0,80 Z"

const CLOUD_BG = "oklch(0.955 0.022 225)"
const EASE = [0.76, 0, 0.24, 1] as const

interface CloudRevealProps {
  onComplete: () => void
}

export function CloudReveal({ onComplete }: CloudRevealProps) {
  return (
    <div className="fixed inset-0 z-[45] pointer-events-none">
      {/* 上の雲パネル — 上に向かってスライドアウト */}
      <motion.div
        className="absolute top-0 left-0 right-0"
        style={{ height: "52%" }}
        initial={{ y: 0 }}
        animate={{ y: "-100%" }}
        transition={{ duration: 1.55, ease: EASE }}
        onAnimationComplete={onComplete}
      >
        <div className="absolute inset-0" style={{ backgroundColor: CLOUD_BG }} />
        {/* 雲の輪郭SVG（パネル下端からはみ出して凸凹を表現） */}
        <svg
          className="absolute left-0 w-full"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          style={{ bottom: -79, height: 80, display: "block", overflow: "visible" }}
        >
          <path d={TOP_EDGE} fill={CLOUD_BG} />
        </svg>
      </motion.div>

      {/* 下の雲パネル — 下に向かってスライドアウト */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: "52%" }}
        initial={{ y: 0 }}
        animate={{ y: "100%" }}
        transition={{ duration: 1.55, ease: EASE }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: CLOUD_BG }} />
        {/* 雲の輪郭SVG（パネル上端からはみ出して凸凹を表現） */}
        <svg
          className="absolute left-0 w-full"
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          style={{ top: -79, height: 80, display: "block", overflow: "visible" }}
        >
          <path d={BOTTOM_EDGE} fill={CLOUD_BG} />
        </svg>
      </motion.div>

      {/* 雲の切れ間から差し込む光 — 中央から外側にフェードアウト */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.0, delay: 0.4 }}
        style={{
          background:
            "radial-gradient(ellipse 55% 25% at 50% 52%, rgba(255,252,235,0.85) 0%, rgba(230,245,255,0.4) 40%, transparent 72%)",
        }}
      />
    </div>
  )
}
