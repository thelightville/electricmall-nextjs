'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Cart } from '@/types'
import {
  getCart,
  getCartToken,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateItem,
  removeCartItem as apiRemoveItem,
  applyCoupon as apiApplyCoupon,
} from '@/lib/store-api'

interface CartContextType {
  cart: Cart | null
  isLoading: boolean
  isOpen: boolean
  cartError: string | null
  clearCartError: () => void
  openCart: () => void
  closeCart: () => void
  addItem: (productId: number, quantity?: number) => Promise<void>
  updateItem: (key: string, quantity: number) => Promise<void>
  removeItem: (key: string) => Promise<void>
  applyCoupon: (code: string) => Promise<void>
  refreshCart: () => Promise<void>
  itemCount: number
}

const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [cartError, setCartError] = useState<string | null>(null)

  const refreshCart = useCallback(async () => {
    try {
      const data = await getCart()
      setCart(data)
    } catch (err) {
      console.error('Cart fetch error:', err)
    }
  }, [])

  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  const addItem = useCallback(async (productId: number, quantity = 1) => {
    setIsLoading(true)
    try {
      const data = await apiAddToCart(productId, quantity)
      setCart(data)
      setIsOpen(true) // auto-open drawer on add
    } catch (err) {
      console.error('Add to cart error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateItem = useCallback(async (key: string, quantity: number) => {
    setIsLoading(true)
    try {
      const data = await apiUpdateItem(key, quantity)
      setCart(data)
    } catch (err) {
      console.error('Update cart error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const removeItem = useCallback(async (key: string) => {
    setIsLoading(true)
    setCartError(null)
    console.log('[cart] removeItem called, key:', key, '| current token:', getCartToken()?.slice(0, 20))
    try {
      const data = await apiRemoveItem(key)
      console.log('[cart] removeItem success, items now:', data?.items?.length)
      setCart(data)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to remove item'
      console.error('Remove cart item error:', err)
      setCartError(msg)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const applyCoupon = useCallback(async (code: string) => {
    setIsLoading(true)
    try {
      const data = await apiApplyCoupon(code)
      setCart(data)
    } catch (err) {
      console.error('Apply coupon error:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const itemCount = cart?.items_count ?? 0

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isOpen,
        cartError,
        clearCartError: () => setCartError(null),
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        updateItem,
        removeItem,
        applyCoupon,
        refreshCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
