import type { Metadata } from 'next'
import type { ReactNode } from 'react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rakey-field.com'

export const metadata: Metadata = {
  title: '自動車 買取/販売 | 堺市・大阪ならRAKEY FIELD',
  description: '堺市中区の自動車買取・販売はRAKEY FIELDへ。お車を手放される際はご相談ください。大切な愛車を責任を持ってお預かりいたします。TEL: 072-339-4549',
  keywords: [
    '車買取 堺市', '車販売 堺市', '中古車 堺市', '自動車買取 堺市中区',
    '中古車販売 堺市', '車売却 堺市', '車査定 堺市', '中古車 大阪',
    '車買取 大阪', '愛車買取 堺市',
  ],
  alternates: {
    canonical: '/car-sales',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: `${SITE_URL}/car-sales`,
    siteName: 'RAKEY FIELD',
    title: '自動車 買取/販売 | 堺市・大阪ならRAKEY FIELD',
    description: 'お車を手放される際はご相談ください。大切な愛車を責任を持ってお預かりいたします。',
    images: [
      {
        url: '/images/impala.jpg',
        width: 1200,
        height: 630,
        alt: 'RAKEY FIELD 自動車買取・販売',
      },
    ],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AutoDealer',
  name: 'RAKEY FIELD 自動車買取・販売',
  description: '新車・中古車の買取から販売まで。大切な愛車を責任を持ってお預かりいたします。',
  url: `${SITE_URL}/car-sales`,
  telephone: '+81-72-339-4549',
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
}

export default function CarSalesLayout({ children }: { children: ReactNode }) {
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
