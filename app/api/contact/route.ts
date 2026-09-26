import { NextResponse } from "next/server"
import { Resend } from "resend"
import { contactSchema, INQUIRY_TYPES, type ContactData } from "@/lib/contact"
import { SITE } from "@/lib/site"

/*
 * お問い合わせの送信。環境変数（.env.local と Vercel に設定）：
 *   RESEND_API_KEY  … Resend の API キー（必須）
 *   CONTACT_TO      … 通知の宛先。カンマ区切りで複数可（省略時は SITE.email）
 *   CONTACT_FROM    … 差出人。Resend でドメイン認証したアドレス（例: "RAKEY FIELD <info@rakey-field.com>"）
 *                     未設定なら onboarding@resend.dev から送る（その場合は Resend に登録したメール宛にしか届かず、
 *                     お客様への自動返信も送らない）
 */

// 同じ IP からの連投を止める（サーバーのインスタンスごとの簡易版）
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()

function rateLimited(ip: string) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear()
  return recent.length > MAX_PER_WINDOW
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!)

function rows(d: ContactData) {
  return [
    ["ご用件", INQUIRY_TYPES[d.type]],
    ["お名前", d.name],
    ["電話番号", d.phone || "（未記入）"],
    ["メール", d.email],
    ...(d.date ? [["ご希望日", d.date]] : []),
    ["内容", d.message],
  ] as [string, string][]
}

const toText = (d: ContactData) => rows(d).map(([k, v]) => `■${k}\n${v}`).join("\n\n")

const toHtml = (d: ContactData) =>
  `<table style="border-collapse:collapse;font-size:14px;line-height:1.7">${rows(d)
    .map(
      ([k, v]) =>
        `<tr><th style="text-align:left;vertical-align:top;padding:8px 16px 8px 0;white-space:nowrap;color:#6b5e50">${esc(k)}</th><td style="padding:8px 0;white-space:pre-wrap">${esc(v)}</td></tr>`,
    )
    .join("")}</table>`

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "送信が続いています。しばらくしてからお試しください。" }, { status: 429 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: "送信内容を読み取れませんでした。" }, { status: 400 })
  }

  // 隠し欄が埋まっている・開いて 3 秒以内の送信はボットとみなし、成功したふりをして捨てる
  const raw = body as Record<string, unknown>
  const started = Number(raw?.startedAt) || 0
  if ((typeof raw?.company === "string" && raw.company !== "") || (started && Date.now() - started < 3000)) {
    return NextResponse.json({ ok: true })
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "入力内容をご確認ください。", fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }
  const d = parsed.data

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error("[contact] RESEND_API_KEY が設定されていません")
    return NextResponse.json({ ok: false, error: "ただいまフォームをご利用いただけません。お電話でお問い合わせください。" }, { status: 500 })
  }

  const resend = new Resend(apiKey)
  const verifiedFrom = process.env.CONTACT_FROM
  const from = verifiedFrom || "RAKEY FIELD <onboarding@resend.dev>"
  const to = (process.env.CONTACT_TO || SITE.email)
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean)

  const notice = await resend.emails.send({
    from,
    to,
    replyTo: d.email,
    subject: `【お問い合わせ】${INQUIRY_TYPES[d.type]} ／ ${d.name} 様`,
    text: `ホームページからお問い合わせがありました。\nこのメールに返信すると、お客様に届きます。\n\n${toText(d)}`,
    html: `<p>ホームページからお問い合わせがありました。<br>このメールに返信すると、お客様に届きます。</p>${toHtml(d)}`,
  })
  if (notice.error) {
    console.error("[contact] 通知メールの送信に失敗", notice.error)
    return NextResponse.json({ ok: false, error: "送信に失敗しました。お手数ですがお電話でお問い合わせください。" }, { status: 502 })
  }

  // 自動返信はドメイン認証済みのときだけ（未認証だとお客様のアドレスには送れない）
  if (verifiedFrom) {
    const reply = await resend.emails.send({
      from: verifiedFrom,
      to: d.email,
      replyTo: to[0], // お客様の返信はお店（先頭の宛先）へ
      subject: "【RAKEY FIELD】お問い合わせありがとうございます",
      text: `${d.name} 様\n\nRAKEY FIELD にお問い合わせいただき、ありがとうございます。\n内容を確認のうえ、担当よりご連絡いたします。\nお急ぎの場合はお電話（${SITE.tel.display}／${SITE.hours}・${SITE.closed}）でどうぞ。\n\n――― 送信内容 ―――\n\n${toText(d)}\n\n――――――――――\nRAKEY FIELD\n${SITE.address.postal} ${SITE.address.full}\nTEL ${SITE.tel.display}`,
    })
    if (reply.error) console.error("[contact] 自動返信の送信に失敗", reply.error)
  }

  return NextResponse.json({ ok: true })
}
