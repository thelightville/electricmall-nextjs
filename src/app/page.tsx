import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Zap, Shield, Truck, HeadphonesIcon, Star } from 'lucide-react'
import apolloClient from '@/lib/apollo-client'
import { GET_CATEGORIES, GET_FEATURED_PRODUCTS, GET_SALE_PRODUCTS } from '@/lib/graphql/queries'
import { ProductCard } from '@/components/product/product-card'
import type { ProductCategory, ProductListItem } from '@/types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Electric Mall Nigeria — Online Electrical Superstore',
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
  {
    icon: Truck,
    title: 'Nationwide Delivery',
    desc: 'Fast delivery anywhere in Nigeria',
  },
  {
    icon: Shield,
    title: 'Genuine Products',
    desc: '100% authentic branded electrical equipment',
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Support',
    desc: 'Expert technical support always available',
  },
  {
    icon: Star,
    title: 'Best Prices',
    desc: 'Save up to 10% off high street prices',
  },
]

export default async function HomePage() {
  const { categories, featuredProducts, saleProducts } = await getHomeData()

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-dark via-gray-900 to-brand-dark text-white overflow-hidden">
        <div className="container-main section-padding">
          <div className="max-w-2xl animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-brand-primary/20 border border-brand-primary/30 rounded-full px-4 py-1.5 text-sm text-brand-accent font-medium mb-6">
              <Zap className="w-4 h-4 fill-current" />
              Nigeria's #1 Electrical Superstore
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Quality Electrical<br />
              <span className="text-gradient">Equipment</span><br />
              at Best Prices
            </h1>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Shop cables, switches, lighting, solar products, distribution boards
              and industrial equipment. Delivered to your doorstep across Nigeria.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="btn-primary text-base px-8 py-4 rounded-xl">
                Shop All Products <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/product-category/schneider-sections" className="btn-secondary text-base px-8 py-4 rounded-xl border-white/30 text-white hover:bg-white hover:text-brand-dark">
                Schneider Products
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features strip */}
      <section className="bg-brand-primary">
        <div className="container-main py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">{title}</p>
                <p className="text-white/70 text-xs leading-tight mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section-padding">
          <div className="container-main">
            <div className="flex items-center justify-between mb-8">
              <h2 className="section-title">Shop by Category</h2>
              <Link href="/shop" className="text-sm font-medium text-brand-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 12).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/product-category/${cat.slug}`}
                  className="group card overflow-hidden text-center p-4 hover:border-brand-primary transition-colors"
                >
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-brand-primary/10 overflow-hidden flex items-center justify-center">
                    {cat.image?.sourceUrl ? (
                      <Image
                        src={cat.image.sourceUrl}
                        alt={cat.image.altText || cat.name}
                        width={64}
                        height={64}
                        className="object-cover group-hover:scale-110 transition-transform"
                      />
                    ) : (
                      <Zap className="w-7 h-7 text-brand-primary" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-brand-gray group-hover:text-brand-primary transition-colors leading-tight">
                    {cat.name}
                  </p>
                  {cat.count && (
                    <p className="text-xs text-gray-400 mt-0.5">{cat.count} products</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured products */}
      {featuredProducts.length > 0 && (
        <section className="section-padding bg-gray-50">
          <div className="container-main">
            <div className="flex items-center justify-between mb-8">
              <h2 className="section-title">Featured Products</h2>
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

      {/* On-sale products */}
      {saleProducts.length > 0 && (
        <section className="section-padding">
          <div className="container-main">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <h2 className="section-title">Weekly Deals</h2>
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

      {/* Brand CTA */}
      <section className="bg-brand-dark text-white section-padding">
        <div className="container-main text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Nigeria's Most Trusted Online Electrical Store
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            We offer a comprehensive range of high-quality electrical goods with
            savings of up to 10% off typical high-street prices.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/shop" className="btn-primary text-base px-8 py-4 rounded-xl">
              Browse All Products <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="https://api.whatsapp.com/send?phone=2349099992184"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary border-white/30 text-white hover:bg-white hover:text-brand-dark text-base px-8 py-4 rounded-xl"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
