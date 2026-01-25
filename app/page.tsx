"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { Menu, X, Phone, Mail, MapPin, Clock, Car, Key, Wrench, Shield, Package, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

// Hero images
const heroImages = [
  "/images/e1100f09-74ca-4a8c-a6bd.jpeg",
  "/images/30ebf32b-768b-4a9c-ba64.jpeg",
  "/images/c8e91041-abe4-41d1-9b89.jpeg",
]

// Loading Animation Component
function LoadingAnimation({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2500)
    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
          className="relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="text-5xl md:text-7xl font-bold tracking-wider text-background"
            style={{ fontFamily: "var(--font-bebas-neue), Impact, sans-serif" }}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            RAKEY FIELD
          </motion.div>
        </motion.div>
        <motion.div
          className="flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-primary"
              animate={{
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.15,
              }}
            />
          ))}
        </motion.div>
        <motion.p
          className="text-background/70 text-sm tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          地域のカーライフをサポート
        </motion.p>
      </div>
    </motion.div>
  )
}

// Header Component
function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { label: "コンセプト", href: "#concept" },
    { label: "ストーリー", href: "#origin" },
    { label: "サービス", href: "#services" },
    { label: "会社概要", href: "#company" },
    { label: "お問い合わせ", href: "#contact" },
  ]

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ delay: 2.5, duration: 0.5 }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <a
          href="#"
          className="text-2xl md:text-3xl font-bold tracking-wider text-foreground"
          style={{ fontFamily: "var(--font-bebas-neue), Impact, sans-serif" }}
        >
          RAKEY FIELD
        </a>

        {/* Desktop Navigation with Dropdown */}
        <nav className="hidden md:flex items-center gap-6">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-1 text-foreground hover:text-primary">
                メニュー
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {navItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild>
                  <a href={item.href} className="cursor-pointer">
                    {item.label}
                  </a>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                お問い合わせ
              </Button>
            </DialogTrigger>
            <ContactModal />
          </Dialog>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="メニューを開く"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden bg-background border-t border-border"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="py-2 text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-primary text-primary-foreground">
                    お問い合わせ
                  </Button>
                </DialogTrigger>
                <ContactModal />
              </Dialog>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

// Contact Modal Component
function ContactModal() {
  return (
    <DialogContent className="max-w-md mx-4">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-foreground">お問い合わせ</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">お名前</Label>
          <Input id="name" placeholder="山田 太郎" className="text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス</Label>
          <Input id="email" type="email" placeholder="example@email.com" className="text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">電話番号</Label>
          <Input id="phone" type="tel" placeholder="090-1234-5678" className="text-base" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="message">お問い合わせ内容</Label>
          <Textarea id="message" placeholder="ご相談内容をご記入ください" rows={4} className="text-base" />
        </div>
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          送信する
        </Button>
        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-2">お電話でのお問い合わせ</p>
          <a href="tel:072-339-4549" className="flex items-center gap-2 text-primary font-medium">
            <Phone className="h-4 w-4" />
            072-339-4549
          </a>
        </div>
      </div>
    </DialogContent>
  )
}

// Hero Slider Component
function HeroSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          <img
            src={heroImages[currentIndex] || "/placeholder.svg"}
            alt="RAKEY FIELD"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/40" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-center px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 0.8 }}
        >
          <h1
            className="text-5xl md:text-8xl font-bold tracking-wider text-background mb-6"
            style={{ fontFamily: "var(--font-bebas-neue), Impact, sans-serif" }}
          >
            RAKEY FIELD
          </h1>
          <p className="text-lg md:text-xl text-background/90 max-w-2xl mx-auto leading-relaxed text-balance">
            この地域の人々のカーライフを一生涯サポートする
          </p>
        </motion.div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-12 h-1 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-background" : "bg-background/40"
            }`}
            aria-label={`スライド ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

// Fade In Up Animation Wrapper
function FadeInUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}

// Parallax Section Component
function ParallaxSection({ children, imageUrl }: { children: React.ReactNode; imageUrl: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])

  return (
    <div ref={ref} className="relative overflow-hidden">
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ y }}
      >
        <img
          src={imageUrl || "/placeholder.svg"}
          alt=""
          className="w-full h-[120%] object-cover"
        />
        <div className="absolute inset-0 bg-foreground/70" />
      </motion.div>
      {children}
    </div>
  )
}

// Concept Section
function ConceptSection() {
  return (
    <section id="concept" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <FadeInUp>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">私たちの想い</h2>
        </FadeInUp>
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <FadeInUp delay={0.1}>
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img
                src="/images/concept-photo.jpeg"
                alt="RAKEY FIELD 駐車場"
                className="w-full h-64 md:h-80 lg:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <div className="space-y-6">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
                この地域（「堺市中区」「陶器」、「福田」）の人々のカーライフを一生涯サポートする。
              </p>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
                子どもたちが集い、遊び、大人になって車を買う、そして車の相談で立ち寄る。
              </p>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty">
                陶器の人々の人生における車の相談事をトータル的にサポートします。
              </p>
            </div>
          </FadeInUp>
        </div>
      </div>
    </section>
  )
}

// Origin Story Section with Parallax
function OriginSection() {
  const originStories = [
    "子どもたちが、家族で乗っていた車に名前をつけた＝RAKEY（家族みんなの頭文字）",
    "子どもたちが作ったステッカーを車に貼っていた=今のロゴ",
    "元々ガレージの場所は趣味で借りていた",
    "露天を出して、地域の子どもたち向けに祭りをしていた",
    "みんながこの場所を『RAKEY FIELD』と呼ぶようになった",
  ]

  return (
    <ParallaxSection imageUrl={heroImages[1]}>
      <section id="origin" className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <FadeInUp>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
              RAKEY FIELDの由来
            </h2>
          </FadeInUp>
          <div className="max-w-2xl mx-auto">
            <div className="bg-background/95 rounded-2xl p-8 shadow-lg">
              <ul className="space-y-4">
                {originStories.map((story, index) => (
                  <FadeInUp key={index} delay={index * 0.1}>
                    <li className="flex items-start gap-4 text-foreground">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {index + 1}
                      </span>
                      <span className="text-base md:text-lg leading-relaxed pt-1">
                        {story}
                      </span>
                    </li>
                  </FadeInUp>
                ))}
              </ul>
            </div>
            <FadeInUp delay={0.6}>
              <div className="mt-8 max-w-md mx-auto">
                <div className="relative rounded-2xl overflow-hidden shadow-lg bg-background/95 p-6">
                  <img
                    src="/images/logo-raw.jpg"
                    alt="RAKEY FIELD ロゴ"
                    className="w-full h-auto object-contain"
                  />
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    子どもたちが作ったオリジナルロゴ
                  </p>
                </div>
              </div>
            </FadeInUp>
          </div>
        </div>
      </section>
    </ParallaxSection>
  )
}

// Services Section
function ServicesSection() {
  const services = [
    { icon: Car, title: "自動車 買取/販売", description: "新車・中古車の買取から販売まで幅広く対応いたします。" },
    { icon: Key, title: "レンタカー", description: "必要な時に、必要な車を。短期から長期まで柔軟に対応。" },
    { icon: Package, title: "アンティーク雑貨 輸入販売", description: "アメリカンヴィンテージを中心とした雑貨を取り揃えています。" },
    { icon: Wrench, title: "メンテナンス・車検・板金", description: "定期点検から車検、板金修理まで、お車のメンテナンスはお任せください。" },
    { icon: Shield, title: "生命保険・損害保険", description: "お車と一緒に、保険のご相談も承ります。" },
  ]

  return (
    <section id="services" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <FadeInUp>
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
              おまかせください！
            </h1>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-8">
              お電話１本ですべてOKです！
            </h1>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.2}>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">サービス</h2>
            <p className="text-lg text-muted-foreground">車のことならなんでも承る</p>
          </div>
        </FadeInUp>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <FadeInUp key={index} delay={index * 0.1}>
              <motion.div
                className="bg-card p-6 rounded-xl shadow-sm border border-border cursor-pointer h-full"
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <service.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </motion.div>
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// Gallery Section
function GallerySection() {
  const galleryItems = [
    { image: "/images/comics.jpg", caption: "アメリカの雑誌" },
    { image: "/images/garage-soto-hiki.jpg", caption: "ガレージの外観①" },
    { image: "/images/garage-soto.jpg", caption: "ガレージの外観②" },
    { image: "/images/garage.jpg", caption: "アメリカ雑貨コレクション" },
    { image: "/images/garage2-tate.jpg", caption: "アメリカ雑貨コレクション" },
    { image: "/images/Hot Wheels.jpg", caption: "Hot Wheelsのコレクション" },
    { image: "/images/impala.jpg", caption: "オーナーの愛車" },
    { image: "/images/impala-mae.JPG", caption: "オーナーの愛車" },
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryItems.length)
  }

  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <FadeInUp>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-12">
            ギャラリー
          </h2>
        </FadeInUp>

        <div className="max-w-5xl mx-auto">
          <FadeInUp delay={0.1}>
            <div className="relative rounded-2xl overflow-hidden shadow-lg bg-card">
              {/* Image Container */}
              <div className="relative h-96 md:h-[500px] bg-muted flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    className="absolute inset-0"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.5 }}
                  >
                    <img
                      src={galleryItems[currentIndex].image}
                      alt={galleryItems[currentIndex].caption}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 hover:bg-background text-foreground transition-colors"
                  aria-label="前の画像"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-background/80 hover:bg-background text-foreground transition-colors"
                  aria-label="次の画像"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>

              {/* Caption and Counter */}
              <div className="p-6 border-t border-border">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-lg font-semibold text-foreground mb-3">
                    {galleryItems[currentIndex].caption}
                  </p>
                </motion.div>
                <p className="text-sm text-muted-foreground">
                  {currentIndex + 1} / {galleryItems.length}
                </p>
              </div>

              {/* Dot Indicators */}
              <div className="flex justify-center gap-2 pb-6 px-6">
                {galleryItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-primary w-6"
                        : "bg-border w-2 hover:bg-primary/50"
                    }`}
                    aria-label={`画像 ${index + 1} に移動`}
                  />
                ))}
              </div>
            </div>
          </FadeInUp>
        </div>
      </div>
    </section>
  )
}

// Company Info Section
function CompanySection() {
  const qualifications = [
    "古物商許可",
    "レンタカー事業者証明書",
    "損害保険募集人資格",
  ]

  const companyInfo = [
    { label: "社名", value: "RAKEY FIELD" },
    { label: "代表", value: "清水 健 (Ken Shimizu)" },
    { label: "住所", value: "〒599-8242 大阪府堺市中区陶器北845-7" },
  ]

  return (
    <section id="company" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Company Profile */}
          <FadeInUp>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">会社概要</h2>
              <div className="space-y-4">
                {companyInfo.map((info, index) => (
                  <div
                    key={index}
                    className="flex flex-col md:flex-row md:items-center py-4 border-b border-border"
                  >
                    <span className="text-sm text-muted-foreground md:w-24 mb-1 md:mb-0">
                      {info.label}
                    </span>
                    <span className="text-foreground font-medium">{info.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeInUp>

          {/* Qualifications */}
          <FadeInUp delay={0.2}>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">資格・許可</h2>
              <ul className="space-y-4">
                {qualifications.map((qual, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-3 text-foreground"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {qual}
                  </li>
                ))}
              </ul>
            </div>
          </FadeInUp>
        </div>
      </div>
    </section>
  )
}

// Contact Section
function ContactSection() {
  return (
    <section id="contact" className="py-20 md:py-32 bg-secondary">
      <div className="container mx-auto px-4">
        <FadeInUp>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">お問い合わせ</h2>
            <p className="text-lg text-muted-foreground">お気軽にご相談ください</p>
          </div>
        </FadeInUp>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FadeInUp delay={0.1}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h3 className="text-xl font-bold text-foreground mb-6">お電話でのお問い合わせ</h3>
                <div className="space-y-4">
                  <a
                    href="tel:072-339-4549"
                    className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <span className="text-sm text-muted-foreground block">TEL</span>
                      <span className="text-lg font-medium text-foreground">072-339-4549</span>
                    </div>
                  </a>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="text-sm text-muted-foreground block">FAX</span>
                      <span className="text-foreground">072-339-4551</span>
                    </div>
                  </div>
                  <a
                    href="tel:090-1893-0467"
                    className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <span className="text-sm text-muted-foreground block">MOBILE</span>
                      <span className="text-lg font-medium text-foreground">090-1893-0467</span>
                    </div>
                  </a>
                </div>
              </div>
            </FadeInUp>

            <FadeInUp delay={0.2}>
              <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                <h3 className="text-xl font-bold text-foreground mb-6">その他のお問い合わせ</h3>
                <div className="space-y-4">
                  <a
                    href="mailto:haegiwa.com@icloud.com"
                    className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
                  >
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <span className="text-sm text-muted-foreground block">メールでのお問い合わせ</span>
                      <span className="text-foreground break-all">haegiwa.com@icloud.com</span>
                    </div>
                  </a>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="text-sm text-muted-foreground block">営業時間</span>
                      <span className="text-foreground">10:00 〜 18:00</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <span className="text-sm text-muted-foreground block">定休日</span>
                      <span className="text-foreground">不定休</span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeInUp>
          </div>

          <FadeInUp delay={0.3}>
            <div className="mt-8 bg-card p-6 rounded-xl shadow-sm border border-border">
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <span className="text-sm text-muted-foreground block">所在地</span>
                  <span className="text-foreground">〒599-8242 大阪府堺市中区陶器北845-7</span>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                    フォームからお問い合わせ
                  </Button>
                </DialogTrigger>
                <ContactModal />
              </Dialog>
            </div>
          </FadeInUp>
        </div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center">
          <span
            className="text-3xl font-bold tracking-wider mb-4"
            style={{ fontFamily: "var(--font-bebas-neue), Impact, sans-serif" }}
          >
            RAKEY FIELD
          </span>
          <p className="text-background/70 text-sm mb-4">
            〒599-8242 大阪府堺市中区陶器北845-7
          </p>
          <p className="text-background/50 text-xs">
            © {new Date().getFullYear()} RAKEY FIELD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

// Main Page Component
export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingAnimation onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {!isLoading && (
        <main className="min-h-screen">
          <Header />
          <HeroSlider />
          <ConceptSection />
          <OriginSection />
          <ServicesSection />
          <GallerySection />
          <CompanySection />
          <ContactSection />
          <Footer />
        </main>
      )}
    </>
  )
}
