'use client'

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '@/components/cart/cart-context'
import { cn } from '@/lib/utils'

interface AddToCartButtonProps {
  productId: number
  stockStatus?: string | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AddToCartButton({
  productId,
  stockStatus,
  className,
  size = 'md',
}: AddToCartButtonProps) {
  const { addItem, isLoading } = useCart()
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const isOutOfStock = stockStatus === 'OUT_OF_STOCK'

  const handleAdd = async () => {
    if (isOutOfStock || adding) return
    setAdding(true)
    try {
      await addItem(productId)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {
      // handled in context
    } finally {
      setAdding(false)
    }
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  }

  if (isOutOfStock) {
    return (
      <button
        disabled
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold',
          'bg-gray-200 text-gray-500 cursor-not-allowed',
          sizes[size],
          className
        )}
      >
        Out of Stock
      </button>
    )
  }

  return (
    <button
      onClick={handleAdd}
      disabled={adding || isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-semibold',
        'transition-all duration-200 active:scale-95',
        added
          ? 'bg-green-600 text-white'
          : 'bg-brand-primary text-white hover:bg-red-700',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        sizes[size],
        className
      )}
    >
      <ShoppingCart className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      {adding ? 'Adding…' : added ? '✓ Added!' : 'Add to Cart'}
    </button>
  )
}
