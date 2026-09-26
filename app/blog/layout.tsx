import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { SITE_URL } from '@/lib/site'


export const metadata: Metadata = {
  title: 'ブログ | レンタカー・車検のお役立ち情報',
  description: '堺市のRAKEY FIELDが発信する、レンタカーや車検に関するお役立ちブログ。カーシェアとの比較や車検の疑問など、車にまつわる情報をわかりやすくお届けします。',
  keywords: [
    'レンタカー 堺市', 'レンタカー コラム', '車検 堺市', '車検 ブログ',
    'カーシェア 比較', 'レンタカー 大阪', '車検 費用 相場', '車検切れ',
  ],
  alternates: {
    canonical: '/blog',
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: `${SITE_URL}/blog`,
    siteName: 'RAKEY FIELD',
    title: 'ブログ | レンタカー・車検のお役立ち情報 | RAKEY FIELD',
    description: '堺市のRAKEY FIELDが発信する、レンタカーや車検に関するお役立ちブログ。',
  },
}

export default function BlogLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
