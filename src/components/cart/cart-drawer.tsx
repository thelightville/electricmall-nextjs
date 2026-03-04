'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from './cart-context'
import { formatStorePrice } from '@/lib/utils'

export function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem, isLoading } = useCart()
  const overlayRef = useRef<HTMLDivElement>(null)

  const totals = cart?.totals
  const minorUnit = totals?.currency_minor_unit ?? 2

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-brand-primary" />
                <h2 className="text-lg font-bold text-brand-gray">
                  Your Cart
                  {(cart?.items_count ?? 0) > 0 && (
                    <span className="ml-2 text-sm font-normal text-gray-500">
                      ({cart?.items_count} {cart?.items_count === 1 ? 'item' : 'items'})
                    </span>
                  )}
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {!cart || cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-200 mb-4" />
                  <p className="text-gray-500 font-medium">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Add some products to get started
                  </p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="mt-6 btn-primary text-sm px-6 py-2 rounded-full"
                  >
                    Shop Now
                  </Link>
                </div>
              ) : (
                cart.items.map((item) => (
                  <div key={item.key} className="flex gap-4 pb-4 border-b border-gray-100">
                    {/* Image */}
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                      {item.images?.[0]?.src ? (
                        <Image
                          src={item.images[0].src}
                          alt={item.images[0].alt || item.name}
                          fill
                          className="object-contain"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <ShoppingCart className="w-6 h-6 text-gray-300" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-gray leading-snug line-clamp-2">
                        {item.name}
                      </p>
                      {item.variation?.length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {item.variation.map((v) => `${v.attribute}: ${v.value}`).join(', ')}
                        </p>
                      )}
                      <p className="text-sm font-bold text-brand-primary mt-1">
                        {formatStorePrice(
                          item.totals.line_total,
                          item.totals.currency_minor_unit
                        )}
                      </p>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateItem(item.key, item.quantity - 1)}
                          disabled={isLoading || item.quantity <= 1}
                          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-40"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(item.key, item.quantity + 1)}
                          disabled={isLoading}
                          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeItem(item.key)}
                          disabled={isLoading}
                          className="ml-auto p-1 text-gray-400 hover:text-red-500 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer totals + CTA */}
            {cart && cart.items.length > 0 && totals && (
              <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 space-y-3">
                {/* Line items total */}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatStorePrice(totals.total_items, minorUnit)}</span>
                </div>

                {Number(totals.total_discount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>−{formatStorePrice(totals.total_discount, minorUnit)}</span>
                  </div>
                )}

                {Number(totals.total_shipping) > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span>{formatStorePrice(totals.total_shipping, minorUnit)}</span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-brand-gray border-t border-gray-200 pt-3">
                  <span>Total</span>
                  <span className="text-brand-primary text-lg">
                    {formatStorePrice(totals.total_price, minorUnit)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="text-center py-3 px-4 rounded-lg border-2 border-brand-gray text-brand-gray font-semibold text-sm hover:bg-brand-gray hover:text-white transition-colors"
                  >
                    View Cart
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-brand-primary text-white font-semibold text-sm hover:bg-red-700 transition-colors"
                  >
                    Checkout <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )}

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
                <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
