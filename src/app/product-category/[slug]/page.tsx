import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import apolloClient from '@/lib/apollo-client'
import { GET_CATEGORIES, GET_CATEGORY, GET_PRODUCTS, GET_CATEGORY_SLUGS } from '@/lib/graphql/queries'
import ProductGrid from '@/components/product/product-grid'
import type { ProductListItem, ProductCategory } from '@/types'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const revalidate = 3600

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  try {
    const { data } = await apolloClient.query({ query: GET_CATEGORY_SLUGS })
    return (data?.productCategories?.nodes || []).map((c: { slug: string }) => ({ slug: c.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { data } = await apolloClient.query({
      query: GET_CATEGORY,
      variables: { slug: params.slug },
    })
    const cat = data?.productCategory
    if (!cat) return {}
    const desc = `Shop ${cat.name} products at Electric Mall Nigeria — quality electrical supplies at the best prices.`
    return {
      title: cat.name,
      description: desc,
      openGraph: {
        title: `${cat.name} | Electric Mall Nigeria`,
        description: desc,
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: `${cat.name} | Electric Mall Nigeria`,
        description: desc,
      },
    }
  } catch {
    return {}
  }
}

export default async function CategoryPage({ params }: Props) {
  let category: ProductCategory | null = null
  let products: ProductListItem[] = []

  try {
    const [catRes, productsRes] = await Promise.all([
      apolloClient.query({ query: GET_CATEGORY, variables: { slug: params.slug } }),
      apolloClient.query({
        query: GET_PRODUCTS,
        variables: { first: 40, category: params.slug },
      }),
    ])
    category = catRes.data?.productCategory
    products = productsRes.data?.products?.nodes || []
  } catch {
    return notFound()
  }

  if (!category) return notFound()

  return (
    <div className="container-main section-padding">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-brand-primary transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link href="/shop" className="hover:text-brand-primary transition-colors">Shop</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-brand-gray font-medium">{category.name}</span>
      </nav>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">{category.name}</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} products</p>
        </div>
      </div>

      {category.description && (
        <div
          className="text-sm text-gray-600 mb-8 prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: category.description }}
        />
      )}

      <ProductGrid products={products} />
    </div>
  )
}
