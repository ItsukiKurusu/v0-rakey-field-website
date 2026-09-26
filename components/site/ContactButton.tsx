"use client"

import { Mail } from "lucide-react"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { ContactModal } from "@/components/shared/ContactModal"
import type { InquiryType } from "@/lib/contact"

/** フォームのモーダルを開くボタン（サーバーで描くページの中に置ける小さな島） */
export function ContactButton({
  type = "other",
  label = "フォームで相談する",
  className = "",
}: {
  type?: InquiryType
  label?: string
  className?: string
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className={`inline-flex items-center justify-center gap-2 font-bold transition-colors ${className}`}>
          <Mail className="h-4 w-4" aria-hidden="true" />
          {label}
        </button>
      </DialogTrigger>
      <ContactModal type={type} />
    </Dialog>
  )
}
