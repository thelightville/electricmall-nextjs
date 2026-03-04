'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Cart, CartItem } from '@/types'
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateItem,
  removeCartItem as apiRemoveItem,
  applyCoupon as apiApplyCoupon,
} from '@/lib/store-api'

interface CartContextType {
  cart: Cart | null
  isLoading: boolean
  isOpen: boolean
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
    try {
      const data = await apiRemoveItem(key)
      setCart(data)
    } catch (err) {
      console.error('Remove cart item error:', err)
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
