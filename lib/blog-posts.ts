export type BlogContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string }
  | { type: "list"; ordered?: boolean; items: string[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "callout"; text: string }

export type BlogCategory = "rental-car" | "maintenance"

export interface BlogPost {
  slug: string
  category: BlogCategory
  categoryLabel: string
  title: string
  description: string
  keywords: string[]
  excerpt: string
  heroImage: string
  publishedAt: string
  updatedAt?: string
  content: BlogContentBlock[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: "times-carshare-vs-rental-car",
    category: "rental-car",
    categoryLabel: "レンタカー",
    title: "タイムズカーシェア VS 普通のレンタカー、結局どっちがお得？違いを徹底比較",
    description:
      "タイムズカーシェアなどのカーシェアリングと、RAKEY FIELDのような一般的なレンタカーの違いを料金・使い勝手・保険の面から徹底比較。堺市周辺で車を借りるならどちらが向いているか解説します。",
    keywords: [
      "レンタカー 堺市",
      "カーシェア 比較",
      "タイムズカーシェア",
      "レンタカー 安い",
      "レンタカー 1日",
      "カーシェアリング 違い",
      "格安レンタカー 堺市",
    ],
    excerpt:
      "「近所で車を借りたいけど、カーシェアとレンタカー、結局どっちがいいの？」そんな疑問に、料金・使い勝手・保険の3つの観点からお答えします。",
    heroImage: "/images/kei-car.jpg",
    publishedAt: "2026-07-10",
    content: [
      {
        type: "paragraph",
        text: "「ちょっと車を借りたい」と思ったとき、まず候補に挙がるのがタイムズカーシェアのようなカーシェアリングサービスと、RAKEY FIELDのような地域の一般的なレンタカーです。どちらも「車を借りる」という点は同じですが、料金体系や使い勝手には大きな違いがあります。この記事では、堺市中区で車を借りたい方に向けて、両者の違いをわかりやすく比較していきます。",
      },
      {
        type: "heading",
        level: 2,
        text: "カーシェアとレンタカーの基本的な違い",
      },
      {
        type: "paragraph",
        text: "タイムズカーシェアに代表されるカーシェアリングは、街中に点在する専用駐車場（ステーション）にある車を、15分単位など短時間から利用できるサービスです。会員登録をしておけば、スマホアプリで予約から解錠まで完結し、無人で貸し出しが行われるのが特徴です。",
      },
      {
        type: "paragraph",
        text: "一方、レンタカーは店舗のスタッフが対応し、原則として「1日単位」でまとまった時間借りることを前提としたサービスです。RAKEY FIELDのようなレンタカーでは、電話一本で当日の相談ができたり、スタッフに直接、車種や利用シーンの相談ができたりする安心感があります。",
      },
      {
        type: "heading",
        level: 2,
        text: "料金体系の違い：短時間ならカーシェア、1日〜ならレンタカーが有利",
      },
      {
        type: "paragraph",
        text: "カーシェアは15分単位の課金が基本のため、「買い物に1時間だけ」「駅までの送迎に30分だけ」といった短時間利用では割安になりやすい料金体系です。ただし、6時間・12時間といったパックはあるものの、利用時間が長くなるほど、時間貸しならではの割高感が出てくることがあります。",
      },
      {
        type: "paragraph",
        text: "対してレンタカーは、1日単位の定額制が基本です。半日〜1日、あるいは数日間にわたってしっかり車を使いたい場合は、レンタカーの方がトータルコストを抑えやすい傾向にあります。旅行や帰省、引っ越しの荷物運びなど「まとまった時間・距離を走る」用途では、レンタカーに軍配が上がるケースがほとんどです。",
      },
      {
        type: "table",
        headers: ["比較項目", "タイムズカーシェアなど", "RAKEY FIELDのレンタカー"],
        rows: [
          ["課金単位", "15分〜（時間貸し）", "1日〜（日貸し）"],
          ["短時間利用（〜2時間程度）", "◎ 割安", "△ 割高になりがち"],
          ["半日〜1日以上の利用", "△ 割高になりがち", "◎ 割安"],
          ["予約・貸し出し", "アプリで完結・無人", "電話・対面でスタッフが対応"],
          ["当日の急な相談", "△ ステーションの空車次第", "◎ 電話一本で相談しやすい"],
          ["車種の相談・提案", "△ 基本は選択のみ", "◎ 用途に合わせて相談可能"],
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "堺市中区・郊外エリアで借りるならどっちが便利？",
      },
      {
        type: "paragraph",
        text: "タイムズカーシェアなどのカーシェアリングは、都市部を中心にステーション（駐車拠点）が展開されています。堺市中区のような郊外エリアでは、都心部と比べてステーションの数が少なく、「近くに車がない」「希望の時間に空車がない」ということも起こりえます。",
      },
      {
        type: "paragraph",
        text: "その点、地域密着で営業しているRAKEY FIELDのレンタカーであれば、堺市中区・近郊エリアでの利用を前提にご案内できるため、「当日でも相談できる」「近くて借りやすい」という安心感があります。特に急な出張や来客の送迎など、その場で車が必要になったときこそ、電話一本で対応できるレンタカー店の強みが活きてきます。",
      },
      {
        type: "heading",
        level: 2,
        text: "保険・補償の考え方の違い",
      },
      {
        type: "paragraph",
        text: "カーシェア・レンタカーのどちらも任意保険（対人・対物・車両補償など）が基本料金に含まれていることが一般的ですが、免責額や補償範囲の細かい条件はサービスによって異なります。RAKEY FIELDのレンタカーでは保険付きでご利用いただけるほか、保険内容についてもスタッフに直接質問しながら確認できるので、初めて利用する方でも安心です。",
      },
      {
        type: "heading",
        level: 2,
        text: "こんな人にはレンタカーがおすすめ",
      },
      {
        type: "list",
        items: [
          "旅行や帰省など、1日〜数日まとまった距離を走りたい方",
          "引っ越しや荷物運びで荷室の広い車を使いたい方",
          "急に車が必要になり、当日中に相談したい方",
          "スタッフに直接、車種や利用条件を相談しながら決めたい方",
          "堺市中区・近郊エリアで、近くて借りやすいお店を探している方",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "まとめ：短時間ならカーシェア、しっかり使うならレンタカー",
      },
      {
        type: "paragraph",
        text: "タイムズカーシェアのようなカーシェアリングは「近所でちょっとだけ」利用したい方に向いており、RAKEY FIELDのようなレンタカーは「1日〜まとまった時間・距離」を安心して使いたい方に向いています。用途に合わせて上手に使い分けることで、ムダなく賢く車を利用できます。",
      },
      {
        type: "callout",
        text: "RAKEY FIELDのレンタカーは、軽自動車からコンパクトカーまでご用意し、1日〜の短期利用もOK。堺市中区・近郊エリアで当日のご相談も承っております。まずはお電話（072-339-4549）でお気軽にご相談ください。",
      },
    ],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export function getAllBlogSlugs(): string[] {
  return blogPosts.map((post) => post.slug)
}
