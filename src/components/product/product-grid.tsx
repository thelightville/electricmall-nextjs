import { ProductCard } from './product-card'
import type { ProductListItem } from '@/types'

interface ProductGridProps {
  products: ProductListItem[]
  loading?: boolean
  columns?: 3 | 4 | 5
  emptyMessage?: string
}

export default function ProductGrid({ products, loading, columns = 4, emptyMessage }: ProductGridProps) {
  if (loading) {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-${columns} gap-4`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="aspect-square skeleton" />
            <div className="p-3 space-y-2">
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-2/3 rounded" />
              <div className="skeleton h-5 w-1/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-lg">{emptyMessage || 'No products found'}</p>
        <p className="text-sm mt-1">Try adjusting your filters or search query</p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-${columns} gap-4`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
