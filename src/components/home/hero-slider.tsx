'use client'

/**
 * HeroSlider — full-width auto-advancing image carousel for the homepage hero.
 * Pure React + Tailwind, no extra dependencies.
 */

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight, Shield } from 'lucide-react'

const slides = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=900&q=85',
    imageAlt: 'Electrical switchboard and industrial panel',
    badge: "Nigeria's #1 Electrical Superstore",
    heading: (
      <>
        Quality Electrical<br />
        <span className="text-gradient">Equipment</span><br />
        at Best Prices
      </>
    ),
    body: 'Shop cables, switches, lighting, solar products, distribution boards and industrial equipment — delivered anywhere in Nigeria.',
    cta: { label: 'Shop All Products', href: '/shop' },
    secondary: { label: 'Schneider Products', href: '/product-category/schneider-sections' },
    badge2Label: '100% Genuine',
    badge2Sub: 'All brands verified',
    topBadgeLabel: 'Up to',
    topBadgeBig: '10% OFF',
    topBadgeSub: 'high street prices',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=900&q=85',
    imageAlt: 'Solar panels generating clean energy',
    badge: 'Clean Energy Solutions',
    heading: (
      <>
        Power Your Home<br />
        <span className="text-gradient">Solar Energy</span><br />
        Starting ₦15,000
      </>
    ),
    body: 'Full range of solar inverters, panels and batteries for homes and businesses. Free technical advice on every order across Nigeria.',
    cta: { label: 'Shop Solar Products', href: '/product-category/solar-powered' },
    secondary: { label: 'View Inverters', href: '/product-category/solar-powered' },
    badge2Label: 'Free Advice',
    badge2Sub: 'Expert guidance included',
    topBadgeLabel: 'Save',
    topBadgeBig: 'Energy',
    topBadgeSub: 'go green today',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=900&q=85',
    imageAlt: 'Modern distribution board and electrical panel',
    badge: 'Schneider & CHINT Specialists',
    heading: (
      <>
        Authorised<br />
        <span className="text-gradient">Brand Dealer</span><br />
        in Nigeria
      </>
    ),
    body: 'We stock Schneider Electric, CHINT, Legrand, OSRAM, Havells and more. 100% genuine products with manufacturer warranty.',
    cta: { label: 'Schneider Products', href: '/product-category/schneider-sections' },
    secondary: { label: 'CHINT Products', href: '/product-category/chint' },
    badge2Label: 'Guaranteed',
    badge2Sub: 'Manufacturer warranty',
    topBadgeLabel: 'Top',
    topBadgeBig: 'Brands',
    topBadgeSub: 'all genuine',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=85',
    imageAlt: 'Electrical cables and wiring management',
    badge: 'Cables & Wiring',
    heading: (
      <>
        Cables &<br />
        <span className="text-gradient">Wiring</span><br />
        All Specifications
      </>
    ),
    body: 'From single-core to armoured cables, flexible conduits to trunking — everything for residential, commercial and industrial wiring jobs.',
    cta: { label: 'Shop Cables', href: '/product-category/cable-and-cable-management' },
    secondary: { label: 'View All Products', href: '/shop' },
    badge2Label: 'Fast Delivery',
    badge2Sub: 'Nationwide shipping',
    topBadgeLabel: 'Over',
    topBadgeBig: '10K+',
    topBadgeSub: 'products in stock',
  },
]

export function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [])
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [])

  useEffect(() => {
    if (paused) return
    const timer = setInterval(next, 5500)
    return () => clearInterval(timer)
  }, [next, paused])

  const slide = slides[current]

  return (
    <section
      className="bg-gradient-to-br from-[#0f0f0f] via-brand-dark to-[#1a0505] text-white overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-main py-12 md:py-18">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">

          {/* ── Left: animated content ────────────────────────────── */}
          <div
            key={slide.id}
            className="animate-fade-up"
          >
            <div className="inline-flex items-center gap-2 bg-brand-primary/20 border border-brand-primary/30 rounded-full px-4 py-1.5 text-sm text-brand-accent font-medium mb-6">
              <span className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-pulse" />
              {slide.badge}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold leading-tight mb-6">
              {slide.heading}
            </h1>

            <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-lg">
              {slide.body}
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link href={slide.cta.href} className="btn-primary text-base px-8 py-3.5 rounded-xl">
                {slide.cta.label} <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href={slide.secondary.href}
                className="inline-flex items-center justify-center gap-2 font-semibold text-base px-8 py-3.5 rounded-xl border-2 border-white/30 text-white bg-transparent hover:bg-white hover:text-brand-dark transition-all duration-200"
              >
                {slide.secondary.label}
              </Link>
            </div>

            {/* Trust stats */}
            <div className="flex items-center gap-8 pt-6 border-t border-white/10">
              <div>
                <p className="text-2xl font-extrabold text-white">10K+</p>
                <p className="text-xs text-gray-400 mt-0.5">Products</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-2xl font-extrabold text-white">5K+</p>
                <p className="text-xs text-gray-400 mt-0.5">Happy Customers</p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-2xl font-extrabold text-brand-accent">10%</p>
                <p className="text-xs text-gray-400 mt-0.5">Off High Street</p>
              </div>
            </div>
          </div>

          {/* ── Right: image + slider controls ───────────────────── */}
          <div className="hidden lg:block relative">
            <div className="relative w-full h-[440px] rounded-2xl overflow-hidden shadow-2xl">
              {slides.map((s, i) => (
                <div
                  key={s.id}
                  className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
                >
                  <Image
                    src={s.image}
                    alt={s.imageAlt}
                    fill
                    className="object-cover"
                    priority={i === 0}
                    sizes="700px"
                  />
                </div>
              ))}
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0f0f0f]/50 pointer-events-none" />

              {/* Floating badge bottom-left */}
              <div className="absolute bottom-5 left-5 bg-white rounded-xl p-3.5 shadow-xl flex items-center gap-3 z-10">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-dark leading-tight">{slide.badge2Label}</p>
                  <p className="text-xs text-gray-500">{slide.badge2Sub}</p>
                </div>
              </div>

              {/* Floating badge top-right */}
              <div className="absolute top-5 right-5 bg-brand-accent rounded-xl px-4 py-2.5 shadow-lg text-center z-10">
                <p className="text-[10px] font-bold text-brand-dark uppercase tracking-wide">{slide.topBadgeLabel}</p>
                <p className="text-2xl font-extrabold text-brand-dark leading-none">{slide.topBadgeBig}</p>
                <p className="text-[10px] font-medium text-brand-dark/70">{slide.topBadgeSub}</p>
              </div>

              {/* Prev / Next buttons */}
              <button
                onClick={prev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-10"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors z-10"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-2 mt-4">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? 'w-8 bg-brand-primary'
                      : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ── Mobile: slide image ────────────────────────────── */}
          <div className="lg:hidden relative h-52 w-full rounded-xl overflow-hidden shadow-xl">
            {slides.map((s, i) => (
              <div
                key={s.id}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  i === current ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Image src={s.image} alt={s.imageAlt} fill className="object-cover" priority={i === 0} sizes="100vw" />
              </div>
            ))}
          </div>

          {/* ── Mobile: dot indicators ───────────────────────────── */}
          <div className="flex lg:hidden items-center justify-center gap-2 mt-3">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-brand-primary' : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
