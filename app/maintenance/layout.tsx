import type { Metadata } from 'next'
import type { ReactNode } from 'react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rakey-field.com'

export const metadata: Metadata = {
  title: 'メンテナンス・車検・板金 | 堺市・大阪ならRAKEY FIELD',
  description: '堺市中区のメンテナンス・車検・板金はRAKEY FIELDへ。交通事故対応もお任せください。定期点検から車検、板金修理まで幅広く対応。TEL: 072-339-4549',
  keywords: [
    'メンテナンス 堺市', '車検 堺市', '板金 堺市', '交通事故 修理 堺市',
    '車検 堺市中区', '板金塗装 堺市', '自動車修理 堺市', '車検 大阪',
    '板金 大阪', '事故車修理 堺市',
  ],
  alternates: {
    canonical: '/maintenance',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: `${SITE_URL}/maintenance`,
    siteName: 'RAKEY FIELD',
    title: 'メンテナンス・車検・板金 | 堺市・大阪ならRAKEY FIELD',
    description: '交通事故対応もお任せください。定期点検から車検、板金修理まで幅広く対応。',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AutoRepair',
  name: 'RAKEY FIELD メンテナンス・車検・板金',
  description: '定期点検から車検、板金修理、交通事故対応まで幅広くお任せください。',
  url: `${SITE_URL}/maintenance`,
  telephone: '+81-72-339-4549',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '陶器北845-7',
    addressLocality: '堺市中区',
    addressRegion: '大阪府',
    postalCode: '599-8242',
    addressCountry: 'JP',
  },
}

export default function MaintenanceLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  )
}
