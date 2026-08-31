import type { Metadata } from 'next'
import type { ReactNode } from 'react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rakey-field.com'

export const metadata: Metadata = {
  title: { absolute: '格安レンタカー 1日〜OK | 堺市・大阪ならRAKEY FIELD' },
  description: '堺市中区の格安レンタカーはRAKEY FIELDへ。1日〜の短期利用もOK、軽自動車からコンパクトカーまでご用意。当日のご相談も承ります。保険付きで安心。TEL: 072-339-4549',
  keywords: [
    'レンタカー 堺市', 'レンタカー 堺市中区', '格安レンタカー 堺市', 'レンタカー 大阪',
    'レンタカー 1日', 'レンタカー 当日', '軽自動車 レンタカー 堺市', 'レンタカー 安い 堺市',
    'レンタカー 保険付き', 'レンタカー 短期',
  ],
  alternates: {
    canonical: '/rental-car',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: `${SITE_URL}/rental-car`,
    siteName: 'RAKEY FIELD',
    title: '格安レンタカー 1日〜OK | 堺市・大阪ならRAKEY FIELD',
    description: '1日〜の短期利用もOK、軽自動車からコンパクトカーまでご用意。当日のご相談も承ります。保険付きで安心。',
    images: [
      {
        url: '/images/kei-car.jpg',
        width: 1200,
        height: 630,
        alt: 'RAKEY FIELD 格安レンタカー',
      },
    ],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AutoRental',
  name: 'RAKEY FIELD レンタカー',
  description: '1日〜の短期利用もOK。軽自動車からコンパクトカーまでご用意し、堺市中区・近郊エリアの当日利用にも対応。',
  url: `${SITE_URL}/rental-car`,
  telephone: '+81-72-339-4549',
  priceRange: '¥¥',
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

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'レンタカーの料金はどのくらいですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '車種や期間により異なります。格安でご提供しておりますのでお気軽にお電話ください（TEL: 072-339-4549）。',
      },
    },
    {
      '@type': 'Question',
      name: '当日でもレンタカーを借りられますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、当日のご相談も大歓迎です。空き状況によりご案内いたしますので、まずはお電話ください。',
      },
    },
    {
      '@type': 'Question',
      name: '堺市でレンタカーを借りるにはどうすればいいですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'お電話（072-339-4549）またはお問い合わせフォームからご連絡ください。ご希望の日程・車種をお伝えいただければスムーズにご案内できます。',
      },
    },
    {
      '@type': 'Question',
      name: 'レンタカーに保険はついていますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、保険付きでご提供しておりますので安心してご利用いただけます。詳細はお問い合わせください。',
      },
    },
    {
      '@type': 'Question',
      name: '1日だけのレンタカー利用はできますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、1日からご利用いただけます。短期から長期まで柔軟に対応いたします。',
      },
    },
  ],
}

export default function RentalCarLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  )
}
