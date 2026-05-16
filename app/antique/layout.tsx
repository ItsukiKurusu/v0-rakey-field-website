import type { Metadata } from 'next'
import type { ReactNode } from 'react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rakey-field.com'

export const metadata: Metadata = {
  title: 'アンティーク雑貨 輸入販売 | 堺市・大阪ならRAKEY FIELD',
  description: '堺市中区のアンティーク雑貨輸入販売はRAKEY FIELDへ。アメリカから直輸入！アメリカンヴィンテージを中心とした雑貨を取り揃え。注文販売も承ります。TEL: 072-339-4549',
  keywords: [
    'アンティーク雑貨 堺市', 'アメリカン雑貨 堺市', 'ヴィンテージ雑貨 堺市',
    'アンティーク 輸入 堺市', 'アメリカン雑貨 大阪', 'ヴィンテージ 大阪',
    'アンティーク雑貨 通販', 'アメリカ直輸入 雑貨',
  ],
  alternates: {
    canonical: '/antique',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: `${SITE_URL}/antique`,
    siteName: 'RAKEY FIELD',
    title: 'アンティーク雑貨 輸入販売 | 堺市・大阪ならRAKEY FIELD',
    description: 'アメリカから直輸入！アメリカンヴィンテージを中心とした雑貨を取り揃え。注文販売も承ります。',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: 'RAKEY FIELD アンティーク雑貨',
  description: 'アメリカから直輸入のアンティーク・ヴィンテージ雑貨の販売。注文販売も承ります。',
  url: `${SITE_URL}/antique`,
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

export default function AntiqueLayout({ children }: { children: ReactNode }) {
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
