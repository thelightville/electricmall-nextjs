import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  Zap,
  Shield,
  Truck,
  HeadphonesIcon,
  Star,
  CheckCircle2,
  Flame,
} from 'lucide-react'
import apolloClient from '@/lib/apollo-client'
import { GET_CATEGORIES, GET_FEATURED_PRODUCTS, GET_SALE_PRODUCTS } from '@/lib/graphql/queries'
import { ProductCard } from '@/components/product/product-card'
import type { ProductCategory, ProductListItem } from '@/types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Electric Mall Nigeria — Online Electrical Superstore',
  description:
    "Nigeria's #1 online electrical superstore. Shop cables, switches, solar, Schneider, CHINT & more. Nationwide delivery.",
}

async function getHomeData() {
  try {
    const [categoriesRes, featuredRes, saleRes] = await Promise.all([
      apolloClient.query({ query: GET_CATEGORIES }),
      apolloClient.query({ query: GET_FEATURED_PRODUCTS, variables: { first: 10 } }),
      apolloClient.query({ query: GET_SALE_PRODUCTS, variables: { first: 8 } }),
    ])
    return {
      categories: (categoriesRes.data?.productCategories?.nodes || []) as ProductCategory[],
      featuredProducts: (featuredRes.data?.products?.nodes || []) as ProductListItem[],
      saleProducts: (saleRes.data?.products?.nodes || []) as ProductListItem[],
    }
  } catch {
    return { categories: [], featuredProducts: [], saleProducts: [] }
  }
}

const features = [
  { icon: Truck,           title: 'Nationwide Delivery', desc: 'Fast delivery anywhere in Nigeria' },
  { icon: Shield,          title: 'Genuine Products',    desc: '100% authentic branded equipment' },
  { icon: HeadphonesIcon,  title: '24/7 Support',        desc: 'Expert technical support always available' },
  { icon: Star,            title: 'Best Prices',         desc: 'Save up to 10% off high street prices' },
]

// Unsplash fallbacks per category slug when WooCommerce has no image
const CATEGORY_STOCK: Record<string, string> = {
  'cable-and-cable-management': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  'lighting':                   'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400&q=80',
  'solar-powered':              'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80',
  'distribution-boards':        'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&q=80',
  'electrical-industrial':      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80',
  'schneider-sections':         'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=400&q=80',
  'chint':                      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
  'switches-and-sockets':       'https://images.unsplash.com/photo-1580741569373-6dbaabf94e97?w=400&q=80',
  'wiring-accessories':         'https://images.unsplash.com/photo-1580741569373-6dbaabf94e97?w=400&q=80',
  'inverters':                  'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&q=80',
}
const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&q=80'

const brands = [
  { name: 'Schneider Electric', abbr: 'SE', color: '#3DCD58', text: '#fff' },
  { name: 'CHINT',              abbr: 'CH', color: '#e60012', text: '#fff' },
  { name: 'OSRAM',              abbr: 'OS', color: '#ff9900', text: '#222' },
  { name: 'Legrand',            abbr: 'LG', color: '#5b2d8e', text: '#fff' },
  { name: 'Havells',            abbr: 'HV', color: '#e31837', text: '#fff' },
  { name: 'Siemens',            abbr: 'SI', color: '#009999', text: '#fff' },
  { name: 'Hager',              abbr: 'HG', color: '#004494', text: '#fff' },
  { name: 'Philips',            abbr: 'PH', color: '#0066a1', text: '#fff' },
]

export default async function HomePage() {
  const { categories, featuredProducts, saleProducts } = await getHomeData()

  return (
    <>
      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#0f0f0f] via-brand-dark to-[#1a0505] text-white overflow-hidden">
        <div className="container-main py-14 md:py-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left: content */}
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-brand-primary/20 border border-brand-primary/30 rounded-full px-4 py-1.5 text-sm text-brand-accent font-medium mb-6">
                <Zap className="w-4 h-4 fill-current" />
                Nigeria&apos;s #1 Electrical Superstore
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Quality Electrical<br />
                <span className="text-gradient">Equipment</span><br />
                at Best Prices
              </h1>
              <p className="text-gray-300 text-lg mb-8 leading-relaxed max-w-lg">
                Shop cables, switches, lighting, solar products, distribution boards
                and industrial equipment — delivered to your doorstep across Nigeria.
              </p>
              <div className="flex flex-wrap gap-4 mb-10">
                <Link href="/shop" className="btn-primary text-base px-8 py-3.5 rounded-xl">
                  Shop All Products <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/product-category/schneider-sections"
                  className="btn-secondary text-base px-8 py-3.5 rounded-xl border-white/20 text-white hover:bg-white hover:text-brand-dark"
                >
                  Schneider Products
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

            {/* Right: hero image */}
            <div className="hidden lg:block">
              <div className="relative w-full h-[460px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80"
                  alt="Electrical equipment showcase"
                  fill
                  className="object-cover"
                  priority
                  sizes="700px"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#0f0f0f]/50" />

                {/* Floating badge: genuine */}
                <div className="absolute bottom-6 left-6 bg-white rounded-xl p-3.5 shadow-xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-brand-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-brand-dark leading-tight">100% Genuine</p>
                    <p className="text-xs text-gray-500">All brands verified</p>
                  </div>
                </div>

                {/* Floating badge: discount */}
                <div className="absolute top-6 right-6 bg-brand-accent rounded-xl px-4 py-2.5 shadow-lg text-center">
                  <p className="text-[10px] font-bold text-brand-dark uppercase tracking-wide">Up to</p>
                  <p className="text-2xl font-extrabold text-brand-dark leading-none">10% OFF</p>
                  <p className="text-[10px] font-medium text-brand-dark/70">high street prices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES STRIP ───────────────────────────────────────────────── */}
      <section className="bg-brand-primary">
        <div className="container-main py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">{title}</p>
                <p className="text-white/70 text-xs leading-tight mt-0.5 hidden sm:block">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <section className="section-padding">
          <div className="container-main">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">Shop by Category</h2>
                <p className="text-gray-500 text-sm mt-1">Find exactly what you need</p>
              </div>
              <Link href="/shop" className="text-sm font-medium text-brand-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.slice(0, 12).map((cat) => {
                const imgSrc =
                  cat.image?.sourceUrl ||
                  CATEGORY_STOCK[cat.slug] ||
                  DEFAULT_CATEGORY_IMAGE
                return (
                  <Link
                    key={cat.id}
                    href={`/product-category/${cat.slug}`}
                    className="group card overflow-hidden text-center hover:border-brand-primary hover:shadow-brand-sm transition-all"
                  >
                    <div className="relative h-24 overflow-hidden bg-gray-100">
                      <Image
                        src={imgSrc}
                        alt={cat.image?.altText || cat.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />
                      <div className="absolute inset-0 bg-brand-dark/35 group-hover:bg-brand-primary/45 transition-colors" />
                    </div>
                    <div className="px-2 py-2.5">
                      <p className="text-xs font-semibold text-brand-dark group-hover:text-brand-primary transition-colors leading-tight line-clamp-2">
                        {cat.name}
                      </p>
                      {cat.count && (
                        <p className="text-[10px] text-gray-400 mt-0.5">{cat.count} items</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* ─── FEATURED PRODUCTS ────────────────────────────────────────────── */}
      {featuredProducts.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="container-main">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">Featured Products</h2>
                <p className="text-gray-500 text-sm mt-1">Hand-picked top sellers</p>
              </div>
              <Link href="/shop" className="text-sm font-medium text-brand-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="product-grid">
              {featuredProducts.slice(0, 10).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── PROMO BANNER ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1400&q=80"
            alt="Professional electrical installation"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-brand-dark/80" />
        </div>
        <div className="relative container-main py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-brand-accent/20 border border-brand-accent/30 rounded-full px-4 py-1.5 text-sm text-brand-accent font-medium mb-5">
              <Flame className="w-4 h-4" />
              Solar Energy Special
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
              Power Your Home with Solar<br />
              <span className="text-brand-accent">Starting from &#8358;15,000</span>
            </h2>
            <p className="text-gray-300 text-base mb-8 leading-relaxed">
              Full range of inverters, solar panels, and batteries for homes and
              businesses — with free technical advice on every order.
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/product-category/solar-powered" className="btn-primary px-8 py-3.5 rounded-xl text-base">
                Shop Solar <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <CheckCircle2 className="w-5 h-5 text-brand-accent flex-shrink-0" />
                Free installation advice
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── WEEKLY DEALS ─────────────────────────────────────────────────── */}
      {saleProducts.length > 0 && (
        <section className="section-padding">
          <div className="container-main">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="section-title">Weekly Deals</h2>
                  <p className="text-gray-500 text-sm mt-1">Limited stock — grab them fast</p>
                </div>
                <span className="badge-sale text-sm">HOT</span>
              </div>
              <Link href="/shop?filter=sale" className="text-sm font-medium text-brand-primary hover:underline flex items-center gap-1">
                View all deals <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="product-grid">
              {saleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── SHOP BY BRAND ────────────────────────────────────────────────── */}
      <section className="section-padding bg-gray-50">
        <div className="container-main">
          <div className="text-center mb-10">
            <h2 className="section-title">Top Brands We Carry</h2>
            <p className="text-gray-500 mt-2">Only authorised, authentic products from world-class manufacturers</p>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {brands.map((brand) => (
              <Link
                key={brand.name}
                href={`/shop?search=${encodeURIComponent(brand.name.split(' ')[0])}`}
                className="card p-3 text-center hover:shadow-brand-sm hover:border-brand-primary transition-all group"
              >
                <div
                  className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center text-xs font-extrabold group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: brand.color, color: brand.text }}
                >
                  {brand.abbr}
                </div>
                <p className="text-[10px] font-semibold text-brand-dark leading-tight line-clamp-2 group-hover:text-brand-primary transition-colors">
                  {brand.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US ────────────────────────────────────────────────── */}
      <section className="section-padding">
        <div className="container-main">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=700&q=80"
                alt="Electric Mall warehouse"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/60 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-brand-dark">Fast Nationwide Delivery</p>
                    <p className="text-xs text-gray-500">Order before 3pm for same-day dispatch</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary rounded-full px-4 py-1.5 text-sm font-medium mb-5">
                <Zap className="w-4 h-4" /> Why Electric Mall?
              </div>
              <h2 className="section-title mb-5">
                Nigeria&apos;s Most Trusted<br />Electrical Supplier
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                We offer a comprehensive range of high-quality electrical goods with savings
                of up to 10% off typical high-street prices. From residential wiring to
                industrial installations — we&apos;ve got you covered.
              </p>
              <ul className="space-y-3">
                {[
                  'Over 10,000 products in stock',
                  '100% genuine, brand-authorised products',
                  'Expert technical support 24/7',
                  'Flexible payment & trade accounts',
                  'Fast delivery anywhere in Nigeria',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-brand-gray">
                    <CheckCircle2 className="w-5 h-5 text-brand-primary flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4 mt-8">
                <Link href="/shop" className="btn-primary px-8 py-3.5 rounded-xl">
                  Browse All Products <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="https://api.whatsapp.com/send?phone=2349099992184"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary px-8 py-3.5 rounded-xl"
                >
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ───────────────────────────────────────────────────── */}
      <section className="bg-brand-dark text-white section-padding">
        <div className="container-main text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Ready to power your project?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            Call us 24/7 or browse over 10,000 products online —
            with next-day delivery anywhere in Nigeria.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/shop" className="btn-primary text-base px-10 py-4 rounded-xl">
              Shop Now <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="tel:09099992184"
              className="btn-secondary border-white/20 text-white hover:bg-white hover:text-brand-dark text-base px-10 py-4 rounded-xl"
            >
              Call 09099992184
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
