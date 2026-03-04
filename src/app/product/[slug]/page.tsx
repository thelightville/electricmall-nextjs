import { notFound } from 'next/navigation'
import Image from 'next/image'
import { Metadata } from 'next'
import apolloClient from '@/lib/apollo-client'
import { GET_PRODUCT, GET_PRODUCT_SLUGS } from '@/lib/graphql/queries'
import { AddToCartButton } from '@/components/product/add-to-cart-button'
import { ProductCard } from '@/components/product/product-card'
import { formatPrice, getStockLabel } from '@/lib/utils'
import type { Product } from '@/types'
import { ChevronRight, Package, ShieldCheck, Truck } from 'lucide-react'
import Link from 'next/link'

export const revalidate = 3600

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  try {
    const { data } = await apolloClient.query({
      query: GET_PRODUCT_SLUGS,
      variables: { first: 200 },
    })
    return (data?.products?.nodes || []).map((p: { slug: string }) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { data } = await apolloClient.query({
      query: GET_PRODUCT,
      variables: { slug: params.slug },
    })
    const product = data?.product
    if (!product) return {}
    return {
      title: product.name,
      description: product.shortDescription?.replace(/<[^>]*>/g, '').slice(0, 160) || product.name,
      openGraph: {
        title: product.name,
        images: product.image?.sourceUrl ? [product.image.sourceUrl] : [],
      },
    }
  } catch {
    return {}
  }
}

export default async function ProductPage({ params }: Props) {
  let product: Product | null = null
  try {
    const { data } = await apolloClient.query({
      query: GET_PRODUCT,
      variables: { slug: params.slug },
    })
    product = data?.product
  } catch {
    return notFound()
  }

  if (!product) return notFound()

  const isSimple = product.__typename === 'SimpleProduct'
  const isVariable = product.__typename === 'VariableProduct'
  const simpleProduct = isSimple ? (product as unknown as import('@/types').SimpleProduct) : null
  const variableProduct = isVariable ? (product as unknown as import('@/types').VariableProduct) : null

  const price = isSimple ? simpleProduct?.price : variableProduct?.price
  const regularPrice = isSimple ? simpleProduct?.regularPrice : variableProduct?.regularPrice
  const salePrice = isSimple ? simpleProduct?.salePrice : undefined
  const stockStatus = isSimple ? simpleProduct?.stockStatus : 'IN_STOCK'
  const { label: stockLabel, inStock } = getStockLabel(stockStatus)

  const galleryImages = [
    product.image,
    ...(product.galleryImages?.nodes || []),
  ].filter(Boolean)

  const categories = product.productCategories?.nodes || []
  const relatedProducts = (product.related?.nodes || []) as import('@/types').ProductListItem[]

  return (
    <div className="container-main section-padding">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/shop" className="hover:text-brand-primary transition-colors">Shop</Link>
        {categories[0] && (
          <>
            <ChevronRight className="w-3 h-3" />
            <Link
              href={`/product-category/${categories[0].slug}`}
              className="hover:text-brand-primary transition-colors"
            >
              {categories[0].name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3 h-3" />
        <span className="text-brand-gray font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
            {galleryImages[0]?.sourceUrl ? (
              <Image
                src={galleryImages[0].sourceUrl}
                alt={galleryImages[0].altText || product.name}
                fill
                className="object-contain p-6"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <Package className="w-24 h-24" />
              </div>
            )}
          </div>
          {galleryImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {galleryImages.slice(0, 6).map((img, i) => (
                img && (
                  <div
                    key={i}
                    className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border-2 border-gray-100 cursor-pointer hover:border-brand-primary transition-colors"
                  >
                    <Image
                      src={img.sourceUrl}
                      alt={img.altText || `Image ${i + 1}`}
                      fill
                      className="object-contain p-1"
                      sizes="80px"
                    />
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/product-category/${cat.slug}`}
                  className="text-xs font-medium text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full hover:bg-brand-primary hover:text-white transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-extrabold text-brand-dark leading-tight mb-4">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            {price && (
              <span className="text-3xl font-extrabold text-brand-primary">
                {formatPrice(price)}
              </span>
            )}
            {salePrice && regularPrice && salePrice !== regularPrice && (
              <span className="text-lg text-gray-400 line-through">
                {formatPrice(regularPrice)}
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-2.5 h-2.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className={`text-sm font-medium ${inStock ? 'text-green-600' : 'text-gray-500'}`}>
              {stockLabel}
            </span>
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <div
              className="text-sm text-gray-600 leading-relaxed mb-6 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.shortDescription }}
            />
          )}

          {/* Variable product variations notice */}
          {isVariable && variableProduct?.variations && (
            <div className="mb-6 p-3 bg-brand-accent/10 border border-brand-accent/30 rounded-lg text-sm text-brand-gray">
              This product has multiple variations. Please visit the original store to select your options.
            </div>
          )}

          {/* Add to cart */}
          <div className="flex gap-3 mb-8">
            <AddToCartButton
              productId={product.databaseId}
              stockStatus={stockStatus}
              size="lg"
              className="flex-1"
            />
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-100">
            {[
              { icon: ShieldCheck, text: 'Genuine Product' },
              { icon: Truck, text: 'Nigeria Delivery' },
              { icon: Package, text: '2yr Warranty' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-brand-primary" />
                </div>
                <span className="text-xs text-gray-500 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="card p-6 mb-12">
          <h2 className="text-lg font-bold text-brand-dark mb-4">Product Description</h2>
          <div
            className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="section-title mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
