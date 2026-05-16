import type { Metadata } from 'next'
import type { ReactNode } from 'react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rakey-field.com'

export const metadata: Metadata = {
  title: '生命保険・損害保険・自動車保険 | 堺市・大阪ならRAKEY FIELD',
  description: '堺市中区の保険相談はRAKEY FIELDへ。生命保険・損害保険・自動車保険のご相談を承ります。お車と一緒に保険もまとめてご相談いただけます。TEL: 072-339-4549',
  keywords: [
    '保険 堺市', '自動車保険 堺市', '生命保険 堺市', '損害保険 堺市',
    '保険相談 堺市中区', '自動車保険 大阪', '保険見直し 堺市',
  ],
  alternates: {
    canonical: '/insurance',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: `${SITE_URL}/insurance`,
    siteName: 'RAKEY FIELD',
    title: '生命保険・損害保険・自動車保険 | 堺市・大阪ならRAKEY FIELD',
    description: 'お車と一緒に、保険のご相談も承ります。生命保険・損害保険・自動車保険まで幅広く対応。',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FinancialService',
  name: 'RAKEY FIELD 保険サービス',
  description: '生命保険・損害保険・自動車保険のご相談を承ります。',
  url: `${SITE_URL}/insurance`,
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

export default function InsuranceLayout({ children }: { children: ReactNode }) {
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
