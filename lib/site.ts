/**
 * お店の情報（ここが唯一の置き場所）。ヘッダー・フッター・問い合わせ・構造化データはすべてここを読む。
 */
export const SITE = {
  name: "RAKEY FIELD",
  tagline: "地域の人々のカーライフを、一生涯サポートします。",
  tel: { display: "072-339-4549", href: "tel:0723394549" },
  mobile: { display: "090-1893-0467", href: "tel:09018930467" },
  fax: "072-339-4551",
  email: "haegiwa.com@icloud.com",
  hours: "10:00 〜 18:00",
  closed: "不定休",
  address: {
    postal: "〒599-8242",
    full: "大阪府堺市中区陶器北845-7",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=%E5%A4%A7%E9%98%AA%E5%BA%9C%E5%A0%BA%E5%B8%82%E4%B8%AD%E5%8C%BA%E9%99%B6%E5%99%A8%E5%8C%97845-7",
  },
  representative: "清水 健",
  licenses: ["古物商許可", "レンタカー事業者証明書", "損害保険募集人資格"],
} as const

/** 5つのサービス（トップの看板・ヘッダーのメニュー・フッターで共通） */
export const SERVICES = [
  {
    no: "01",
    title: "中古車 買取・販売",
    en: "USED CARS",
    href: "/car-sales",
    image: "/images/impala6.jpg",
    text: "新車・中古車の買取から販売、下取り、車探しまで。1台1台、長く乗れる車を。",
    color: "rust",
  },
  {
    no: "02",
    title: "レンタカー",
    en: "RENT-A-CAR",
    href: "/rental-car",
    image: "/images/kei-car.jpg",
    text: "24時間 3,300円（税込）〜。必要なときに、必要な日数だけ。",
    color: "teal",
  },
  {
    no: "03",
    title: "車検・整備・板金",
    en: "SERVICE",
    href: "/maintenance",
    image: "/images/garage-1.jpg",
    text: "定期点検から車検、板金塗装、事故の対応まで。お見積りは無料です。",
    color: "mustard",
  },
  {
    no: "04",
    title: "保険のご相談",
    en: "INSURANCE",
    href: "/insurance",
    image: "/images/impala-mae.jpg",
    text: "自動車保険・生命保険・損害保険。車と一緒に、暮らしの備えもまとめて。",
    color: "blue",
  },
  {
    no: "05",
    title: "アメリカン雑貨",
    en: "ANTIQUES",
    href: "/antique",
    image: "/images/hot-wheels.jpg",
    text: "ホットウィール、看板、ナンバープレート。アメリカから届いた古いものたち。",
    color: "ink",
  },
] as const
