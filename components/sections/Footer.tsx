const navLinks = [
  { label: "コンセプト", href: "#concept" },
  { label: "ストーリー", href: "#origin" },
  { label: "サービス", href: "#services" },
  { label: "会社概要", href: "#company" },
  { label: "お問い合わせ", href: "#contact" },
]

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-6 py-14">
        <div className="flex flex-col items-center text-center gap-6">
          <span
            className="text-4xl font-bold tracking-wider"
            style={{ fontFamily: "var(--font-bebas-neue), Impact, sans-serif" }}
          >
            RAKEY FIELD
          </span>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-background/55 hover:text-background transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="text-sm text-background/55 space-y-1">
            <p>〒599-8242 大阪府堺市中区陶器北845-7</p>
            <p>TEL: 072-339-4549</p>
          </div>

          <div className="w-full h-px bg-background/10" />

          <p className="text-xs text-background/35">
            © {new Date().getFullYear()} RAKEY FIELD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
