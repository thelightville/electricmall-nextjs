'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import ProductGrid from '@/components/product/product-grid'
import { Search } from 'lucide-react'
import Link from 'next/link'

const SEARCH_PRODUCTS = gql`
  query SearchProducts($search: String!) {
    products(first: 48, where: { search: $search, status: "publish" }) {
      nodes {
        id
        databaseId
        name
        slug
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
          stockStatus
          image { sourceUrl altText }
          productCategories { nodes { name slug } }
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
          stockStatus
          image { sourceUrl altText }
          productCategories { nodes { name slug } }
        }
      }
    }
  }
`

function SearchContent() {
  const params = useSearchParams()
  const query = params.get('q') || ''

  const { data, loading, error } = useQuery(SEARCH_PRODUCTS, {
    variables: { search: query },
    skip: !query,
  })

  const products = data?.products?.nodes || []

  return (
    <div className="container-main section-padding">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-dark mb-2">
          {query ? `Search results for "${query}"` : 'Search Products'}
        </h1>
        {!loading && query && (
          <p className="text-gray-500">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </p>
        )}
      </div>

      {!query && (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Enter a search term to find products</p>
          <Link href="/shop" className="btn-secondary mt-4 inline-flex">
            Browse All Products
          </Link>
        </div>
      )}

      {query && (
        <ProductGrid
          products={products}
          loading={loading}
          emptyMessage={error ? 'Error loading products. Please try again.' : `No products found for "${query}"`}
        />
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container-main section-padding"><p className="text-gray-500">Loading…</p></div>}>
      <SearchContent />
    </Suspense>
  )
}
