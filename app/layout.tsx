import React from "react"
import type { Metadata, Viewport } from 'next'
import { Noto_Sans_JP, Bebas_Neue } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rakey-field.com'

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'RAKEY FIELD | 堺市の中古車・レンタカー・車検・買取',
    template: '%s | RAKEY FIELD',
  },
  description: '大阪府堺市中区陶器の地域密着カーショップ。中古車の買取・販売、格安レンタカー、車検、板金、メンテナンスまで。お電話一本でなんでも承ります。TEL: 072-339-4549',
  keywords: [
    '中古車 堺市', '中古車 堺市中区', '中古車 大阪',
    'レンタカー 堺市', 'レンタカー 堺市中区', '格安レンタカー 堺市', 'レンタカー 大阪',
    '車買取 堺市', '中古車買取 堺市', '中古車販売 堺市', '中古車販売 大阪',
    '車検 堺市', '板金 堺市', 'メンテナンス 堺市', '自動車 堺市中区',
    'カーライフ 堺市', 'RAKEY FIELD', '堺市 陶器 車',
    '自動車', '買取', '販売', 'レンタカー', '車検', '板金', '保険', '堺市', '中区', '陶器',
  ],
  authors: [{ name: 'RAKEY FIELD' }],
  creator: 'RAKEY FIELD',
  publisher: 'RAKEY FIELD',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: SITE_URL,
    siteName: 'RAKEY FIELD',
    title: 'RAKEY FIELD | 堺市の中古車・レンタカー・車検・買取',
    description: '大阪府堺市中区陶器の地域密着カーショップ。中古車の買取・販売、格安レンタカー、車検、板金、メンテナンスまで。お電話一本でなんでも承ります。',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RAKEY FIELD - 堺市の中古車・レンタカー',
      },
    ],
  },
  verification: {
    google: '442cf3c64d24a393',
  },
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['AutoDealer', 'LocalBusiness'],
      '@id': `${SITE_URL}/#business`,
      name: 'RAKEY FIELD',
      description: '大阪府堺市中区陶器の地域密着カーショップ。中古車の買取・販売、格安レンタカー、車検、板金、メンテナンス、保険まで。',
      url: SITE_URL,
      telephone: '+81-72-339-4549',
      priceRange: '¥¥',
      image: `${SITE_URL}/images/og-image.jpg`,
      address: {
        '@type': 'PostalAddress',
        streetAddress: '陶器北845-7',
        addressLocality: '堺市中区',
        addressRegion: '大阪府',
        postalCode: '599-8242',
        addressCountry: 'JP',
      },
      areaServed: [
        { '@type': 'City', name: '堺市' },
        { '@type': 'AdministrativeArea', name: '大阪府' },
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'カーサービス一覧',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: '中古車 買取・販売',
              description: '堺市・大阪で中古車をお探しなら。新車・中古車の買取から販売まで幅広く対応。',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'レンタカー',
              description: '堺市の格安レンタカー。1日〜短期でもOK。軽自動車からコンパクトカーまで。当日対応可能。',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: '車検・メンテナンス・板金',
              description: '定期点検から車検、板金修理まで。堺市でのカーメンテナンスはお任せください。',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: '生命保険・損害保険・自動車保険',
              description: 'お車と一緒に、保険のご相談も承ります。',
            },
          },
        ],
      },
    },
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  )
}
