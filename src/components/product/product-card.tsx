'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Eye } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/components/cart/cart-context'
import { formatPrice, cn } from '@/lib/utils'
import type { ProductListItem } from '@/types'

interface ProductCardProps {
  product: ProductListItem
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, isLoading } = useCart()
  const [adding, setAdding] = useState(false)

  const isSale = !!(product.salePrice && product.regularPrice && product.salePrice !== product.regularPrice)
  const isOutOfStock = product.stockStatus === 'OUT_OF_STOCK'
  const displayPrice = product.salePrice || product.price || product.regularPrice

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isOutOfStock || adding) return
    setAdding(true)
    try {
      await addItem(product.databaseId)
    } catch {
      // error handled in context
    } finally {
      setAdding(false)
    }
  }

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group card overflow-hidden block"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {product.image?.sourceUrl ? (
          <Image
            src={product.image.sourceUrl}
            alt={product.image.altText || product.name}
            fill
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-300">
            <svg viewBox="0 0 64 64" className="w-12 h-12 mb-1 text-gray-200" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="8" y="14" width="48" height="36" rx="3"/>
              <path d="M20 26h4m4 0h4m4 0h4M20 32h4m4 0h4m4 0h4M20 38h12"/>
              <path d="M8 20h48" strokeWidth="1"/>
            </svg>
            <span className="text-[10px] text-gray-400 font-medium">No image</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isSale && <span className="badge-sale">SALE</span>}
          {isOutOfStock && <span className="badge-out-of-stock">Out of Stock</span>}
        </div>

        {/* Hover actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || adding || isLoading}
            className={cn(
              'translate-y-4 group-hover:translate-y-0 transition-all duration-300',
              'bg-brand-primary text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg',
              'flex items-center gap-1.5',
              'hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed'
            )}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {adding ? 'Adding…' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="p-3">
        <h3 className="text-xs font-medium text-brand-gray leading-snug line-clamp-2 group-hover:text-brand-primary transition-colors min-h-[2.5rem]">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          {displayPrice && (
            <span className="text-sm font-bold text-brand-primary">
              {formatPrice(displayPrice)}
            </span>
          )}
          {isSale && product.regularPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.regularPrice)}
            </span>
          )}
        </div>
        {isOutOfStock && (
          <p className="text-xs text-gray-400 mt-1">Out of stock</p>
        )}
      </div>
    </Link>
  )
}
