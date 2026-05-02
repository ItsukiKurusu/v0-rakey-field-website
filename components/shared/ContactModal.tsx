import { Phone } from "lucide-react"
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function ContactModal() {
  return (
    <DialogContent className="max-w-md mx-4">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-foreground">お問い合わせ</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="modal-name">お名前</Label>
          <Input id="modal-name" placeholder="山田 太郎" className="text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="modal-email">メールアドレス</Label>
          <Input id="modal-email" type="email" placeholder="example@email.com" className="text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="modal-phone">電話番号</Label>
          <Input id="modal-phone" type="tel" placeholder="090-1234-5678" className="text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="modal-message">お問い合わせ内容</Label>
          <Textarea id="modal-message" placeholder="ご相談内容をご記入ください" rows={4} className="text-base" />
        </div>
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          送信する
        </Button>
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">お電話でのお問い合わせ</p>
          <a href="tel:072-339-4549" className="flex items-center gap-2 text-primary font-medium hover:underline">
            <Phone className="h-4 w-4" />
            072-339-4549
          </a>
        </div>
      </div>
    </DialogContent>
  )
}
