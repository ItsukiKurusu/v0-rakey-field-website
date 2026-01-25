import React from "react"
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP, Bebas_Neue } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const notoSansJP = Noto_Sans_JP({ 
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-sans-jp',
})

const bebasNeue = Bebas_Neue({ 
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas-neue',
})

export const metadata: Metadata = {
  title: 'RAKEY FIELD | 堺市中区陶器の地域密着カーライフサポート',
  description: 'この地域の人々のカーライフを一生涯サポートする。自動車買取・販売、レンタカー、メンテナンス、車検、板金、保険まで車のことならなんでも承ります。',
  generator: 'v0.app',
  keywords: ['自動車', '買取', '販売', 'レンタカー', '車検', '板金', '保険', '堺市', '中区', '陶器'],
  manifest: '/manifest.json',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#8B4513',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className="bg-background">
      <body className={`${notoSansJP.variable} ${bebasNeue.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
