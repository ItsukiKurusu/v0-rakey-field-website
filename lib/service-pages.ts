import type { LucideIcon } from "lucide-react"
import {
  AlertTriangle,
  BadgeJapaneseYen,
  BookOpen,
  Car,
  CheckCircle,
  ClipboardCheck,
  Clock,
  FileText,
  Globe,
  Heart,
  Key,
  MapPin,
  Package,
  Phone,
  Search,
  Shield,
  ShoppingBag,
  Star,
  Truck,
  Wrench,
} from "lucide-react"
import type { InquiryType } from "./contact"
import { SERVICES } from "./site"

export type Faq = { q: string; a: string }

export type ServicePageData = {
  slug: Exclude<InquiryType, "other">
  /** h1（検索で狙う言葉を入れる） */
  title: string
  /** h1 の下の一言 */
  catch: string
  lead: string
  heroImage: string
  heroAlt: string
  /** ヒーローの写真に貼る値札（任意） */
  tag?: { top: string; big: string; bottom: string }
  intro: { title: string; text: string }
  highlights: { icon: LucideIcon; text: string }[]
  menuTitle: string
  menu: { title: string; text: string }[]
  gallery?: { title: string; photos: { src: string; alt: string; caption: string }[] }
  price?: { title: string; amount: string; unit: string; notes: string[] }
  flow: { title: string; text: string }[]
  faqs: Faq[]
  cta: { title: string; text: string }
}

export const SERVICE_PAGES: Record<ServicePageData["slug"], ServicePageData> = {
  "car-sales": {
    slug: "car-sales",
    title: "自動車 買取・販売",
    catch: "お車を手放すときも、次の1台を探すときも。",
    lead: "新車・中古車の買取から販売、下取り・乗り換え、車探しまで。大切な愛車を、責任を持ってお預かりします。",
    heroImage: "/images/impala6.jpg",
    heroAlt: "人工芝の上に停まるインパラ SS",
    intro: {
      title: "買取も販売も、お電話一本で。",
      text: "新車・中古車の買取から販売まで、幅広く対応しています。国産車・輸入車を問わず、まずは車種や状態をお聞かせください。",
    },
    highlights: [
      { icon: BadgeJapaneseYen, text: "高価買取に挑戦" },
      { icon: Search, text: "ご希望の車をお探しします" },
      { icon: Heart, text: "大切な愛車を責任を持って" },
      { icon: Car, text: "国産車・輸入車を問わず対応" },
      { icon: CheckCircle, text: "明瞭な査定とご説明" },
      { icon: Phone, text: "まずはお電話ください" },
    ],
    menuTitle: "サービス内容",
    menu: [
      { title: "自動車買取", text: "お車を手放すときは、ぜひご相談ください。大切な愛車を責任を持ってお預かりします。" },
      { title: "自動車販売", text: "新車・中古車を販売しています。ご希望の車種とご予算をお聞かせいただければ、ご提案します。" },
      { title: "車のお探し", text: "「こんな車が欲しい」というご要望にお応えします。お気に入りの1台を一緒に探しましょう。" },
      { title: "下取り・乗り換え", text: "今お乗りの車の下取りも承ります。乗り換えを考えている方も、お気軽にどうぞ。" },
    ],
    gallery: {
      title: "ガレージのインパラ SS",
      photos: [
        { src: "/images/impala1.jpg", alt: "インパラ SS の斜め前", caption: "IMPALA SS" },
        { src: "/images/impala4.jpg", alt: "リアフェンダーの Impala SS の文字", caption: "SCRIPT" },
        { src: "/images/impala8.jpg", alt: "インパラ SS の正面", caption: "FRONT" },
      ],
    },
    flow: [
      { title: "ご相談", text: "お電話かフォームでご連絡ください。車種・年式・走行距離など、分かる範囲で構いません。" },
      { title: "査定・ご提案", text: "買取はお車を拝見して査定します。購入は、ご希望に合う車をお探しして提案します。" },
      { title: "ご契約", text: "金額と内容にご納得いただいてから、ご契約へ進みます。" },
      { title: "お引き渡し", text: "手続きが整い次第、お車のお引き渡しです。" },
    ],
    faqs: [
      { q: "どんな車でも買取してもらえますか？", a: "国産車・輸入車を問わず対応しています。まずは車種や状態をお電話かフォームでお知らせください。" },
      { q: "欲しい車を探してもらうことはできますか？", a: "はい、できます。ご希望の車種とご予算をお聞かせいただければ、お探ししてご提案します。" },
      { q: "今乗っている車の下取りはできますか？", a: "はい、下取り・乗り換えのご相談も承ります。お気軽にご相談ください。" },
      { q: "新車も購入できますか？", a: "はい、新車・中古車ともに販売しています。ご希望をお聞かせください。" },
    ],
    cta: { title: "買取査定も、車探しも。", text: "まずはお気軽にご相談ください。丁寧にご案内します。" },
  },

  "rental-car": {
    slug: "rental-car",
    title: "格安レンタカー",
    catch: "1日からOK。必要なときに、必要なだけ。",
    lead: "軽自動車からコンパクトカーまで。短期から長期まで柔軟に対応し、当日のご相談も承ります。",
    heroImage: "/images/kei-car.jpg",
    heroAlt: "レンタカーの軽自動車",
    tag: { top: "24時間", big: "3,300", bottom: "円〜（税込）" },
    intro: {
      title: "レンタカーもやってます。",
      text: "旅行や帰省、車検や修理の間の代車がわりに。電話一本で、スムーズに手続きできます。",
    },
    highlights: [
      { icon: Clock, text: "1日〜の短期でもOK" },
      { icon: Car, text: "軽自動車からコンパクトカーまで" },
      { icon: Key, text: "当日のご利用も相談可能" },
      { icon: MapPin, text: "堺市・近郊エリアに対応" },
      { icon: Shield, text: "保険付きで安心" },
      { icon: Phone, text: "電話一本でスムーズ手続き" },
    ],
    menuTitle: "こんなときに",
    menu: [
      { title: "旅行・レジャー", text: "家族や友人とのお出かけに。1日から借りられます。" },
      { title: "帰省・引っ越し", text: "短期から長期まで、日数に合わせて柔軟に対応します。" },
      { title: "車検・修理の間の足に", text: "愛車を預けている間の移動手段として。整備と合わせてご相談ください。" },
      { title: "急に車が必要になったら", text: "空き状況によっては当日のご利用も可能です。まずはお電話を。" },
    ],
    price: {
      title: "料金",
      amount: "3,300",
      unit: "円〜 ／ 24時間（税込）",
      notes: ["車種・期間により異なります。詳しくはお問い合わせください。", "保険付きでご提供しています。", "車両は時期により異なります。"],
    },
    flow: [
      { title: "ご予約", text: "お電話かフォームで、ご希望の日時と車種をお知らせください。" },
      { title: "ご来店", text: "ガレージへお越しください。運転免許証をお持ちください。" },
      { title: "ご出発", text: "お車の説明を受けたら、いってらっしゃい。" },
      { title: "ご返却", text: "ご予約の日時に、ガレージまでご返却ください。" },
    ],
    faqs: [
      { q: "レンタカーの料金はどのくらいですか？", a: "24時間3,300円（税込）〜です。車種や期間により異なりますので、お気軽にお電話ください。" },
      { q: "堺市でレンタカーを借りるにはどうすればいいですか？", a: "お電話（072-339-4549）またはお問い合わせフォームからご連絡ください。ご希望の日程と車種をお伝えいただければ、スムーズにご案内します。" },
      { q: "1日だけのレンタカー利用はできますか？", a: "はい、1日からご利用いただけます。短期から長期まで柔軟に対応しますので、お気軽にご相談ください。" },
      { q: "当日でもレンタカーを借りられますか？", a: "空き状況によりますが、当日のご相談も大歓迎です。まずはお電話ください。" },
      { q: "レンタカーに保険はついていますか？", a: "はい、保険付きでご提供していますので、安心してご利用いただけます。" },
      { q: "どんな車が借りられますか？", a: "軽自動車からコンパクトカーまでご用意しています。時期により車両は異なりますので、詳しくはお電話でご確認ください。" },
    ],
    cta: { title: "当日のご相談も大歓迎。", text: "お電話一本で、スムーズにご案内します。" },
  },

  maintenance: {
    slug: "maintenance",
    title: "車検・整備・板金塗装",
    catch: "交通事故の対応も、お任せください。",
    lead: "定期点検から車検、板金修理まで。お車のメンテナンスは、まるごとお任せください。お見積りは無料です。",
    heroImage: "/images/garage-1.jpg",
    heroAlt: "RAKEY FIELD のガレージの中",
    intro: {
      title: "お車のことなら、なんでも。",
      text: "オイル交換のような日々の手入れから、車検、ぶつけてしまった傷やへこみの修理、事故後の保険手続きのご相談まで対応しています。",
    },
    highlights: [
      { icon: ClipboardCheck, text: "定期点検・整備" },
      { icon: CheckCircle, text: "車検に対応" },
      { icon: Wrench, text: "板金・塗装" },
      { icon: AlertTriangle, text: "交通事故の対応" },
      { icon: Shield, text: "保険の相談も可能" },
      { icon: Phone, text: "お見積りは無料" },
    ],
    menuTitle: "対応メニュー",
    menu: [
      { title: "定期点検・メンテナンス", text: "エンジンオイルの交換から、タイヤ・ブレーキの点検まで。愛車の調子を保つお手入れを承ります。" },
      { title: "車検", text: "法定点検を含む車検を、丁寧に対応します。車検の時期が近づいたら、お気軽にご連絡ください。" },
      { title: "板金・塗装", text: "ぶつけてしまった傷やへこみも、丁寧に修復します。小さな傷からしっかり対応します。" },
      { title: "交通事故の対応", text: "事故後の修理や、保険手続きのご相談も承ります。お困りのときは、まずお電話ください。" },
    ],
    gallery: {
      title: "ガレージの様子",
      photos: [
        { src: "/images/garage-2.jpg", alt: "シャッターを開けたガレージ", caption: "THE GARAGE" },
        { src: "/images/30ebf32b-768b-4a9c-ba64.jpeg", alt: "看板や雑貨が並ぶガレージの壁", caption: "THE WALL" },
        { src: "/images/garage-soto.jpg", alt: "ガレージの外壁の看板", caption: "OUTSIDE" },
      ],
    },
    flow: [
      { title: "ご相談・ご予約", text: "お電話かフォームで、車種と気になる症状、車検の満了日などをお知らせください。" },
      { title: "点検・お見積り", text: "お車を拝見して、必要な作業と費用をご説明します。お見積りは無料です。" },
      { title: "作業", text: "内容にご納得いただいてから作業に入ります。通常の車検は1〜2日ほどです。" },
      { title: "お引き渡し", text: "行った作業をご説明して、お車をお返しします。" },
    ],
    faqs: [
      { q: "堺市で車検を受けるにはどうすればいいですか？", a: "お電話（072-339-4549）またはお問い合わせフォームからご予約ください。車検の時期が近づいたら、お気軽にご連絡ください。" },
      { q: "車検はどのくらいの期間かかりますか？", a: "車両の状態により異なりますが、通常の車検は1〜2日程度です。詳しくはお問い合わせください。" },
      { q: "車検の費用の目安を教えてください。", a: "車種や状態により異なります。まずはお電話でお気軽にご相談ください。お見積りは無料です。" },
      { q: "板金修理の相談もできますか？", a: "はい、ぶつけてしまった傷やへこみも丁寧に対応します。交通事故の対応や保険手続きのご相談も承ります。" },
      { q: "車検と同時にメンテナンスもお願いできますか？", a: "はい、車検と合わせてオイル交換などのメンテナンスも対応できます。ご希望の内容をお申し付けください。" },
    ],
    cta: { title: "お見積りは無料です。", text: "事故の対応も、お気軽にご相談ください。" },
  },

  insurance: {
    slug: "insurance",
    title: "生命保険・損害保険・自動車保険",
    catch: "お車と一緒に、保険のこともまとめて。",
    lead: "車を買うとき、乗り換えるとき、暮らしが変わったとき。保険の新規加入から見直しまで、分かりやすくご説明します。",
    heroImage: "/images/impala-mae.jpg",
    heroAlt: "インパラ SS の正面",
    intro: {
      title: "車のことも、保険のことも。",
      text: "損害保険募集人の資格を持つスタッフが、お客様の暮らしに合わせてご提案します。今の保険の見直しだけでも、お気軽にどうぞ。",
    },
    highlights: [
      { icon: Car, text: "自動車保険" },
      { icon: Heart, text: "生命保険" },
      { icon: Shield, text: "損害保険" },
      { icon: FileText, text: "保険の見直し相談" },
      { icon: CheckCircle, text: "分かりやすくご説明" },
      { icon: Phone, text: "お気軽にご相談ください" },
    ],
    menuTitle: "取り扱い保険",
    menu: [
      { title: "自動車保険", text: "車を購入・所有される方に合った自動車保険をご提案します。任意保険の新規加入や見直しも承ります。" },
      { title: "生命保険", text: "ご家族の将来に備える生命保険のご相談を承ります。ライフステージに合ったプランをご提案します。" },
      { title: "損害保険", text: "火災保険・傷害保険など、各種損害保険のご相談にも対応しています。" },
    ],
    flow: [
      { title: "ご相談", text: "お電話かフォームで、ご相談したい内容をお知らせください。" },
      { title: "ヒアリング", text: "今のご契約内容や、ご家族・お車の状況をお伺いします。" },
      { title: "ご提案", text: "暮らしに合ったプランを、分かりやすくご説明します。" },
      { title: "お手続き", text: "ご納得いただけたら、加入・切り替えのお手続きへ。" },
    ],
    faqs: [
      { q: "車を買うときに、保険もまとめて相談できますか？", a: "はい、お車の購入と合わせて、合った自動車保険をご提案できます。" },
      { q: "今の保険の見直しだけでも相談できますか？", a: "はい、見直しのご相談も承ります。今のご契約内容が分かるものがあると、スムーズにご案内できます。" },
      { q: "自動車保険以外も扱っていますか？", a: "生命保険や、火災保険・傷害保険などの損害保険のご相談も承ります。" },
    ],
    cta: { title: "保険のご相談は、お気軽に。", text: "今の保険の見直しや新規加入など、なんでもご相談ください。" },
  },

  antique: {
    slug: "antique",
    title: "アンティーク雑貨",
    catch: "アメリカから直輸入。注文販売も承ります。",
    lead: "ホットウィール、アメリカンコミック、看板、ナンバープレート。アメリカンヴィンテージを中心に、古いものたちを集めています。",
    heroImage: "/images/garage.jpg",
    heroAlt: "看板やナンバープレートが並ぶガレージの奥",
    intro: {
      title: "アメリカから、直輸入。",
      text: "ガレージの棚には、アメリカから届いた雑貨が並んでいます。お探しの品があれば、注文販売でお取り寄せもできます。",
    },
    highlights: [
      { icon: Globe, text: "アメリカから直輸入" },
      { icon: ShoppingBag, text: "注文販売を承ります" },
      { icon: Star, text: "アメリカンヴィンテージ中心" },
      { icon: Truck, text: "希少品もお取り寄せ可能" },
      { icon: BookOpen, text: "コミック・ホットウィールなど" },
      { icon: Package, text: "看板・プレートも" },
    ],
    menuTitle: "取り扱い商品",
    menu: [
      { title: "ホットウィール", text: "壁一面に並ぶミニカー。懐かしいモデルから新しいものまで。" },
      { title: "アメリカンコミック・雑誌", text: "アメコミやカー雑誌など、アメリカの紙もの。" },
      { title: "看板・ナンバープレート", text: "ガレージや部屋に飾りたくなる、ブリキの看板やプレート。" },
      { title: "注文販売", text: "お探しの品をお聞かせください。お取り寄せできるかお調べします。" },
    ],
    gallery: {
      title: "ガレージの棚から",
      photos: [
        { src: "/images/hot-wheels.jpg", alt: "壁一面のホットウィール", caption: "HOT WHEELS" },
        { src: "/images/comics.jpg", alt: "アメリカのコミックと雑誌", caption: "COMICS" },
        { src: "/images/garage2-tate.jpg", alt: "板壁に掛けたキーホルダーとナンバープレート", caption: "KEY TAGS" },
      ],
    },
    flow: [
      { title: "お問い合わせ", text: "お探しの品や、気になる商品をお知らせください。" },
      { title: "お調べ・お見積り", text: "在庫の確認や、お取り寄せができるかをお調べします。" },
      { title: "ご注文", text: "内容と金額にご納得いただけたら、ご注文です。" },
      { title: "お受け取り", text: "商品が届き次第、ご連絡します。" },
    ],
    faqs: [
      { q: "ガレージで商品を見ることはできますか？", a: "はい、ガレージに並べています。在庫は時期により異なるので、お目当ての品がある場合は事前にお問い合わせください。" },
      { q: "欲しい商品を取り寄せてもらえますか？", a: "はい、注文販売を承っています。希少品もお取り寄せできる場合がありますので、お気軽にご相談ください。" },
    ],
    cta: { title: "お探しの品があれば、お気軽に。", text: "注文販売も承っています。まずはお電話かフォームでご相談ください。" },
  },
}

/** トップの看板と同じ番号・英字・色を引く */
export function serviceMeta(slug: ServicePageData["slug"]) {
  return SERVICES.find((x) => x.href === `/${slug}`)!
}
