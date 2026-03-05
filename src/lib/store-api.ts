/**
 * WooCommerce Store API client
 * Base: NEXT_PUBLIC_WORDPRESS_URL/wp-json/wc/store/v1
 *
 * IMPORTANT: Uses correct Store API field names:
 *   total_items   (NOT subtotal)
 *   total_discount (NOT discount_total)
 *   total_price   (final total)
 */

const STORE_API_BASE = '/api/store'

// ─── Cart Token (session storage) ────────────────────────────────────────────

export function getCartToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('woo-cart-token')
  } catch {
    return null
  }
}

export function setCartToken(token: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem('woo-cart-token', token)
  } catch {
    // ignore
  }
}

// ─── Request helper ───────────────────────────────────────────────────────────

interface StoreRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  nonce?: string
}

async function storeRequest<T>(
  path: string,
  options: StoreRequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, nonce } = options
  const token = getCartToken()

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) headers['Cart-Token'] = token
  if (nonce) headers['Nonce'] = nonce

  const res = await fetch(`${STORE_API_BASE}/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  // Capture new cart token from response header
  const newToken = res.headers.get('Cart-Token')
  if (newToken) setCartToken(newToken)

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error?.message || `Store API error: ${res.status}`)
  }

  return res.json() as Promise<T>
}

// ─── Cart endpoints ───────────────────────────────────────────────────────────

import type { Cart } from '@/types'

export async function getCart(): Promise<Cart> {
  return storeRequest<Cart>('cart')
}

export async function addToCart(productId: number, quantity: number = 1): Promise<Cart> {
  return storeRequest<Cart>('cart/add-item', {
    method: 'POST',
    body: { id: productId, quantity },
  })
}

export async function updateCartItem(key: string, quantity: number): Promise<Cart> {
  return storeRequest<Cart>('cart/update-item', {
    method: 'POST',
    body: { key, quantity },
  })
}

export async function removeCartItem(key: string): Promise<Cart> {
  // WooCommerce Store API uses POST /cart/remove-item with {key} in the JSON body.
  // DELETE routes do not exist for this endpoint.
  console.log('[removeCartItem] called with key:', key)
  const result = await storeRequest<Cart>('cart/remove-item', {
    method: 'POST',
    body: { key },
  })
  console.log('[removeCartItem] success, items remaining:', result?.items?.length)
  return result
}

export async function applyCoupon(code: string): Promise<Cart> {
  return storeRequest<Cart>('cart/apply-coupon', {
    method: 'POST',
    body: { code },
  })
}

export async function removeCoupon(code: string): Promise<Cart> {
  // WooCommerce Store API uses POST /cart/remove-coupon with {code} in the body.
  return storeRequest<Cart>('cart/remove-coupon', {
    method: 'POST',
    body: { code },
  })
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export interface CheckoutPayload {
  billing_address: {
    first_name: string
    last_name: string
    company?: string
    address_1: string
    address_2?: string
    city: string
    state: string
    postcode: string
    country: string
    email: string
    phone: string
  }
  shipping_address?: {
    first_name: string
    last_name: string
    address_1: string
    address_2?: string
    city: string
    state: string
    postcode: string
    country: string
  }
  payment_method: string
  payment_data?: Array<{ key: string; value: string }>
  customer_note?: string
}

export async function submitCheckout(payload: CheckoutPayload): Promise<{
  order_id: number
  status: string
  payment_result: { payment_status: string; redirect_url: string }
}> {
  return storeRequest('checkout', { method: 'POST', body: payload })
}
