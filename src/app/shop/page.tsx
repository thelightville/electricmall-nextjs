'use client'

import { useState, Suspense } from 'react'
import { useQuery } from '@apollo/client'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'
import { GET_PRODUCTS, GET_CATEGORIES } from '@/lib/graphql/queries'
import { ProductCard } from '@/components/product/product-card'
import ProductGrid from '@/components/product/product-grid'
import type { ProductListItem, ProductCategory } from '@/types'
import { useSearchParams } from 'next/navigation'

const SORT_OPTIONS = [
  { label: 'Latest', value: 'DATE_DESC' },
  { label: 'Price: Low to High', value: 'PRICE_ASC' },
  { label: 'Price: High to Low', value: 'PRICE_DESC' },
  { label: 'Name: A-Z', value: 'NAME_ASC' },
]

function ShopContent() {
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || ''
  )

  const { data: productsData, loading, fetchMore } = useQuery(GET_PRODUCTS, {
    variables: {
      first: 20,
      category: selectedCategory || undefined,
    },
  })

  const { data: categoriesData } = useQuery(GET_CATEGORIES)

  const products: ProductListItem[] = productsData?.products?.nodes || []
  const categories: ProductCategory[] = categoriesData?.productCategories?.nodes || []
  const pageInfo = productsData?.products?.pageInfo

  const loadMore = () => {
    if (pageInfo?.hasNextPage) {
      fetchMore({
        variables: {
          first: 20,
          after: pageInfo.endCursor,
          category: selectedCategory || undefined,
        },
      })
    }
  }

  return (
    <div className="container-main section-padding">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">
            {selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.name || 'Products'
              : 'All Products'}
          </h1>
          {!loading && (
            <p className="text-gray-500 text-sm mt-1">
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-60 flex-shrink-0">
          <div className="card p-4 sticky top-24">
            <h3 className="font-bold text-brand-dark mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Categories
            </h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !selectedCategory
                      ? 'bg-brand-primary text-white font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  All Products
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                      selectedCategory === cat.slug
                        ? 'bg-brand-primary text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="truncate">{cat.name}</span>
                    {cat.count && (
                      <span className={`text-xs ml-1 flex-shrink-0 ${selectedCategory === cat.slug ? 'text-white/70' : 'text-gray-400'}`}>
                        ({cat.count})
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={products} loading={loading} columns={4} />

          {pageInfo?.hasNextPage && (
            <div className="text-center mt-10">
              <button
                onClick={loadMore}
                className="btn-secondary px-8 py-3"
              >
                Load More Products <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="container-main section-padding"><div className="product-grid">{Array.from({length:8}).map((_,i)=><div key={i} className="skeleton aspect-[3/4] rounded-xl" />)}</div></div>}>
      <ShopContent />
    </Suspense>
  )
}
