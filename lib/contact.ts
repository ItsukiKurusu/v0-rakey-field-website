import { z } from "zod"

/** お問い合わせの用件（フォームの選択肢とメールの件名で共通） */
export const INQUIRY_TYPES = {
  "car-sales": "中古車の買取・販売",
  "rental-car": "レンタカーの予約",
  maintenance: "車検・整備・板金",
  insurance: "保険のご相談",
  antique: "アメリカン雑貨",
  other: "その他",
} as const

export type InquiryType = keyof typeof INQUIRY_TYPES

/** 希望日を聞く用件 */
export const NEEDS_DATE: InquiryType[] = ["rental-car", "maintenance"]

const inquiryKeys = Object.keys(INQUIRY_TYPES) as [InquiryType, ...InquiryType[]]

/** 画面とサーバーで同じ検証を使う */
export const contactSchema = z
  .object({
    name: z.string().trim().min(1, "お名前を入力してください").max(60, "お名前が長すぎます"),
    phone: z
      .string()
      .trim()
      .max(20, "電話番号が長すぎます")
      .regex(/^[0-9０-９+\-ー（）() ]*$/, "電話番号は数字とハイフンで入力してください")
      .optional()
      .default(""),
    email: z.string().trim().min(1, "メールアドレスを入力してください").email("メールアドレスの形式が正しくありません").max(120),
    type: z.enum(inquiryKeys, { errorMap: () => ({ message: "ご用件を選んでください" }) }),
    date: z.string().trim().max(40).optional().default(""),
    message: z.string().trim().min(1, "お問い合わせ内容を入力してください").max(2000, "2000文字以内でお願いします"),
    // ここから下はスパム対策（人は触らない）
    company: z.string().max(0).optional().default(""), // 見えない入力欄。埋まっていたらボット
    startedAt: z.coerce.number().optional().default(0), // フォームを開いた時刻
  })

export type ContactInput = z.input<typeof contactSchema>
export type ContactData = z.output<typeof contactSchema>
