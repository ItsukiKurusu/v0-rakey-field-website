import type { Metadata } from 'next'
import type { ReactNode } from 'react'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://rakey-field.com'

export const metadata: Metadata = {
  title: { absolute: 'メンテナンス・車検・板金 | 堺市・大阪ならRAKEY FIELD' },
  description: '堺市中区のメンテナンス・車検・板金はRAKEY FIELDへ。交通事故対応もお任せください。定期点検から車検、板金修理まで幅広く対応。TEL: 072-339-4549',
  keywords: [
    'メンテナンス 堺市', '車検 堺市', '板金 堺市', '交通事故 修理 堺市',
    '車検 堺市中区', '板金塗装 堺市', '自動車修理 堺市', '車検 大阪',
    '板金 大阪', '事故車修理 堺市', '車検 費用 堺市', '車検 時期', '車検切れ',
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

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '堺市で車検を受けるにはどうすればいいですか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'お電話（072-339-4549）またはお問い合わせフォームからご予約ください。車検の時期が近づいたらお気軽にご連絡ください。',
      },
    },
    {
      '@type': 'Question',
      name: '車検の費用の目安を教えてください。',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '車種や状態により異なります。まずはお電話にてお気軽にご相談ください（TEL: 072-339-4549）。',
      },
    },
    {
      '@type': 'Question',
      name: '車検はどのくらいの期間かかりますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '車両の状態により異なりますが、通常の車検は1〜2日程度です。詳しくはお問い合わせください。',
      },
    },
    {
      '@type': 'Question',
      name: '板金修理の相談もできますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、ぶつけてしまった傷やへこみも丁寧に対応いたします。交通事故対応・保険手続きのご相談も承ります。',
      },
    },
    {
      '@type': 'Question',
      name: '車検と同時にメンテナンスもお願いできますか？',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'はい、車検と合わせて定期点検やオイル交換などのメンテナンスも対応可能です。ご希望の内容をお申し付けください。',
      },
    },
  ],
}

export default function MaintenanceLayout({ children }: { children: ReactNode }) {
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
