'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, Trash2, Tag, ArrowRight, ShoppingCart } from 'lucide-react'
import { useCart } from '@/components/cart/cart-context'
import { formatStorePrice } from '@/lib/utils'

export default function CartPage() {
  const { cart, updateItem, removeItem, applyCoupon, isLoading, cartError, clearCartError } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [couponError, setCouponError] = useState('')
  const [couponLoading, setCouponLoading] = useState(false)

  const totals = cart?.totals
  const minorUnit = totals?.currency_minor_unit ?? 2

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      await applyCoupon(couponCode.trim())
      setCouponCode('')
    } catch (err: unknown) {
      setCouponError(err instanceof Error ? err.message : 'Invalid coupon code')
    } finally {
      setCouponLoading(false)
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-main section-padding">
        <div className="text-center py-20">
          <ShoppingCart className="w-20 h-20 text-gray-200 mx-auto mb-5" />
          <h1 className="text-2xl font-bold text-brand-dark mb-3">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">Add some products to get started</p>
          <Link href="/shop" className="btn-primary">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container-main section-padding">
      <h1 className="section-title mb-8">Shopping Cart</h1>

      {cartError && (
        <div className="flex items-center justify-between gap-2 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <span>⚠ {cartError}</span>
          <button onClick={clearCartError} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.key} className="card p-4 flex gap-4">
              <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                {item.images?.[0]?.src ? (
                  <Image
                    src={item.images[0].src}
                    alt={item.images[0].alt || item.name}
                    fill
                    className="object-contain"
                    sizes="96px"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/product/${item.id}`}
                  className="font-semibold text-brand-dark hover:text-brand-primary transition-colors line-clamp-2"
                >
                  {item.name}
                </Link>
                {item.variation?.length > 0 && (
                  <p className="text-sm text-gray-400 mt-1">
                    {item.variation.map((v) => `${v.attribute}: ${v.value}`).join(', ')}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  {/* Quantity */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateItem(item.key, item.quantity - 1)}
                      disabled={isLoading || item.quantity <= 1}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-40"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateItem(item.key, item.quantity + 1)}
                      disabled={isLoading}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-40"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Price + remove */}
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-brand-primary">
                      {formatStorePrice(item.totals.line_total, item.totals.currency_minor_unit)}
                    </span>
                    <button
                      onClick={() => removeItem(item.key)}
                      disabled={isLoading}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Coupon */}
          <form onSubmit={handleApplyCoupon} className="card p-4">
            <h3 className="font-semibold text-brand-dark mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Apply Coupon
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Enter coupon code"
                className="input-field flex-1"
              />
              <button
                type="submit"
                disabled={couponLoading || !couponCode.trim()}
                className="btn-primary px-5 py-3"
              >
                {couponLoading ? '…' : 'Apply'}
              </button>
            </div>
            {couponError && <p className="text-red-500 text-sm mt-2">{couponError}</p>}
            {cart.coupons?.length > 0 && (
              <div className="mt-2 space-y-1">
                {cart.coupons.map((c) => (
                  <p key={c.code} className="text-green-600 text-sm">
                    ✓ Coupon "{c.code}" applied
                  </p>
                ))}
              </div>
            )}
          </form>
        </div>

        {/* Order summary */}
        {totals && (
          <div className="card p-6 h-fit sticky top-24">
            <h2 className="text-lg font-bold text-brand-dark mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({cart.items_count} items)</span>
                <span className="font-medium">{formatStorePrice(totals.total_items, minorUnit)}</span>
              </div>
              {Number(totals.total_discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>−{formatStorePrice(totals.total_discount, minorUnit)}</span>
                </div>
              )}
              {Number(totals.total_shipping) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">{formatStorePrice(totals.total_shipping, minorUnit)}</span>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-base">
                <span className="text-brand-dark">Total</span>
                <span className="text-brand-primary text-lg">
                  {formatStorePrice(totals.total_price, minorUnit)}
                </span>
              </div>
            </div>

            <Link href="/checkout" className="btn-primary w-full mt-6 justify-center">
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/shop" className="btn-secondary w-full mt-3 justify-center text-sm">
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
