"use client"

import { useEffect, useId, useRef, useState } from "react"
import { CheckCircle2, Loader2, Phone } from "lucide-react"
import { contactSchema, INQUIRY_TYPES, NEEDS_DATE, type InquiryType } from "@/lib/contact"
import { SITE } from "@/lib/site"

type Status = "idle" | "sending" | "done" | "error"
type Errors = Partial<Record<"name" | "phone" | "email" | "type" | "date" | "message", string>>

const field =
  "mt-1.5 block w-full rounded-lg border border-ink/20 bg-white/80 px-3.5 py-3 text-base text-ink placeholder:text-ink/35 transition-colors focus:border-rust focus:outline-none focus:ring-2 focus:ring-rust/25 aria-[invalid=true]:border-rust"
const label = "text-sm font-bold text-ink"

/**
 * お問い合わせフォーム（トップの #contact とサービスページのモーダルで共通）。
 * defaultType を渡すと、ご用件を選んだ状態で開く。
 */
export function ContactForm({ defaultType = "other", idPrefix }: { defaultType?: InquiryType; idPrefix?: string }) {
  const auto = useId()
  const id = (name: string) => `${idPrefix ?? auto}-${name}`
  const [type, setType] = useState<InquiryType>(defaultType)
  const [status, setStatus] = useState<Status>("idle")
  const [errors, setErrors] = useState<Errors>({})
  const [message, setMessage] = useState("")
  const startedAt = useRef(0)
  const doneRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  useEffect(() => {
    if (status === "done") doneRef.current?.focus()
  }, [status])

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === "sending") return
    const form = e.currentTarget
    const values = Object.fromEntries(new FormData(form)) as Record<string, string>
    const payload = { ...values, startedAt: startedAt.current }

    const parsed = contactSchema.safeParse(payload)
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors
      const next: Errors = {}
      for (const k of Object.keys(f) as (keyof Errors)[]) next[k] = f[k]?.[0]
      setErrors(next)
      setStatus("idle")
      form.querySelector<HTMLElement>("[aria-invalid=true]")?.focus()
      return
    }

    setErrors({})
    setStatus("sending")
    setMessage("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: Record<string, string[]> }
      if (res.ok && json.ok) {
        setStatus("done")
        form.reset()
        return
      }
      if (json.fields) {
        const next: Errors = {}
        for (const [k, v] of Object.entries(json.fields)) next[k as keyof Errors] = v?.[0]
        setErrors(next)
      }
      setMessage(json.error ?? "送信に失敗しました。お手数ですがお電話でお問い合わせください。")
      setStatus("error")
    } catch {
      setMessage("通信に失敗しました。電波の良い場所で再度お試しいただくか、お電話でお問い合わせください。")
      setStatus("error")
    }
  }

  if (status === "done") {
    return (
      <div ref={doneRef} tabIndex={-1} className="rounded-2xl bg-paper p-8 text-center text-ink outline-none" role="status">
        <CheckCircle2 className="mx-auto h-12 w-12 text-teal" aria-hidden="true" />
        <p className="mt-4 text-xl font-black">送信しました。ありがとうございます。</p>
        <p className="mt-3 text-sm leading-relaxed text-ink/75">
          内容を確認のうえ、担当よりご連絡いたします。
          <br />
          お急ぎの場合はお電話でどうぞ。
        </p>
        <a href={SITE.tel.href} className="mt-5 inline-flex items-center gap-2 font-display text-2xl tracking-wider text-rust">
          <Phone className="h-5 w-5" aria-hidden="true" />
          {SITE.tel.display}
        </a>
        <button type="button" onClick={() => setStatus("idle")} className="mt-6 block w-full text-sm font-bold text-ink/60 underline underline-offset-4">
          続けて別のお問い合わせをする
        </button>
      </div>
    )
  }

  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={id(`${k}-err`)} className="mt-1.5 text-sm font-bold text-rust">
        {errors[k]}
      </p>
    ) : null
  const aria = (k: keyof Errors) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? id(`${k}-err`) : undefined,
  })
  const required = <span className="ml-1.5 rounded bg-rust px-1.5 py-0.5 text-[0.65rem] font-bold text-paper">必須</span>

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-5 rounded-2xl bg-paper p-6 text-ink md:p-8">
      <div>
        <label htmlFor={id("type")} className={label}>
          ご用件{required}
        </label>
        <select id={id("type")} name="type" value={type} onChange={(e) => setType(e.target.value as InquiryType)} className={field} {...aria("type")}>
          {Object.entries(INQUIRY_TYPES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        {err("type")}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={id("name")} className={label}>
            お名前{required}
          </label>
          <input id={id("name")} name="name" autoComplete="name" placeholder="山田 太郎" className={field} {...aria("name")} />
          {err("name")}
        </div>
        <div>
          <label htmlFor={id("phone")} className={label}>
            電話番号
          </label>
          <input id={id("phone")} name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="090-1234-5678" className={field} {...aria("phone")} />
          {err("phone")}
        </div>
      </div>

      <div>
        <label htmlFor={id("email")} className={label}>
          メールアドレス{required}
        </label>
        <input id={id("email")} name="email" type="email" autoComplete="email" inputMode="email" placeholder="example@email.com" className={field} {...aria("email")} />
        {err("email")}
      </div>

      {NEEDS_DATE.includes(type) && (
        <div>
          <label htmlFor={id("date")} className={label}>
            ご希望日
          </label>
          <input
            id={id("date")}
            name="date"
            placeholder={type === "rental-car" ? "例：10月12日 10時〜10月13日 18時" : "例：10月12日の午前"}
            className={field}
            {...aria("date")}
          />
          {err("date")}
        </div>
      )}

      <div>
        <label htmlFor={id("message")} className={label}>
          お問い合わせ内容{required}
        </label>
        <textarea
          id={id("message")}
          name="message"
          rows={5}
          placeholder={
            type === "car-sales"
              ? "車種・年式・走行距離など、分かる範囲でお書きください"
              : type === "maintenance"
                ? "車種と、気になっている症状や車検の満了日などをお書きください"
                : "ご相談内容をご記入ください"
          }
          className={`${field} resize-y`}
          {...aria("message")}
        />
        {err("message")}
      </div>

      {/* ボット対策の隠し欄（人には見えない・読み上げない） */}
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          会社名
          <input name="company" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {status === "error" && message && (
        <p className="rounded-lg bg-rust/10 px-4 py-3 text-sm font-bold text-rust" role="alert">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="flex w-full items-center justify-center gap-2 rounded-full bg-rust py-4 text-base font-bold text-paper shadow-lg shadow-rust/25 transition-colors hover:bg-[#c64d35] disabled:opacity-70"
      >
        {status === "sending" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            送信しています…
          </>
        ) : (
          "この内容で送信する"
        )}
      </button>
      <p className="text-center text-xs leading-relaxed text-ink/55">
        いただいた情報は、お問い合わせへの回答にのみ使用します。
      </p>
    </form>
  )
}
