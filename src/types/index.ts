// =======================
// Electric Mall — Shared TypeScript Types
// =======================

export interface ProductImage {
  sourceUrl: string
  altText: string
}

export interface ProductCategory {
  id: string
  name: string
  slug: string
  count?: number
  image?: ProductImage | null
  description?: string
}

export interface ProductVariationAttribute {
  name: string
  value: string
}

export interface ProductVariation {
  id: string
  databaseId: number
  name: string
  stockStatus: string
  stockQuantity?: number | null
  attributes: {
    nodes: ProductVariationAttribute[]
  }
}

export interface SimpleProduct {
  __typename: 'SimpleProduct'
  price?: string | null
  regularPrice?: string | null
  salePrice?: string | null
  stockStatus?: string | null
  stockQuantity?: number | null
}

export interface VariableProduct {
  __typename: 'VariableProduct'
  price?: string | null
  regularPrice?: string | null
  variations?: {
    nodes: ProductVariation[]
  }
}

export type ProductBase = {
  id: string
  databaseId: number
  name: string
  slug: string
  description?: string | null
  shortDescription?: string | null
  image?: ProductImage | null
  galleryImages?: { nodes: ProductImage[] }
  productCategories?: { nodes: ProductCategory[] }
  related?: { nodes: ProductListItem[] }
}

export type Product = ProductBase & (SimpleProduct | VariableProduct | { __typename: string })

export interface ProductListItem {
  id: string
  databaseId: number
  name: string
  slug: string
  image?: ProductImage | null
  __typename?: string
  price?: string | null
  regularPrice?: string | null
  salePrice?: string | null
  stockStatus?: string | null
}

// ─── Cart (WooCommerce Store API) ───────────────────────────────────────────

export interface CartItemImage {
  id: number
  src: string
  thumbnail: string
  srcset: string
  sizes: string
  name: string
  alt: string
}

export interface CartItemPrice {
  value: number
  displayValue: string
  raw: number
}

export interface CartItem {
  key: string
  id: number
  quantity: number
  quantity_limit: number
  name: string
  short_description: string
  description: string
  sku: string
  low_stock_remaining: number | null
  backorders_allowed: boolean
  show_backorder_badge: boolean
  sold_individually: boolean
  permalink: string
  images: CartItemImage[]
  variation: Array<{ attribute: string; value: string }>
  item_data: unknown[]
  prices: {
    price: string
    regular_price: string
    sale_price: string
    price_range: null
    currency_code: string
    currency_symbol: string
    currency_minor_unit: number
    currency_decimal_separator: string
    currency_thousand_separator: string
    currency_prefix: string
    currency_suffix: string
  }
  totals: {
    line_subtotal: string
    line_subtotal_tax: string
    line_total: string
    line_total_tax: string
    currency_code: string
    currency_symbol: string
    currency_minor_unit: number
  }
}

export interface CartTotals {
  total_items: string
  total_items_tax: string
  total_fees: string
  total_fees_tax: string
  total_discount: string
  total_discount_tax: string
  total_shipping: string
  total_shipping_tax: string
  total_price: string
  total_tax: string
  tax_lines: Array<{
    name: string
    price: string
    rate: string
  }>
  currency_code: string
  currency_symbol: string
  currency_minor_unit: number
  currency_decimal_separator: string
  currency_thousand_separator: string
  currency_prefix: string
  currency_suffix: string
}

export interface Cart {
  coupons: Array<{ code: string; discount_type: string; totals: CartTotals }>
  shipping_rates: unknown[]
  shipping_address: unknown
  billing_address: unknown
  items: CartItem[]
  items_count: number
  items_weight: number
  cross_sells: unknown[]
  needs_payment: boolean
  needs_shipping: boolean
  has_calculated_shipping: boolean
  fees: unknown[]
  totals: CartTotals
  errors: unknown[]
  payment_requirements: string[]
  extensions: unknown
}

// ─── Checkout / Order ────────────────────────────────────────────────────────

export interface CheckoutAddress {
  first_name: string
  last_name: string
  company?: string
  address_1: string
  address_2?: string
  city: string
  state: string
  postcode: string
  country: string
  email?: string
  phone?: string
}

export interface CheckoutFormData {
  billing: CheckoutAddress & { email: string; phone: string }
  shipping?: CheckoutAddress
  ship_to_different_address?: boolean
  order_notes?: string
  payment_method: 'paystack' | 'flutterwave' | 'stripe'
}

export interface Order {
  id: number
  status: string
  currency: string
  total: string
  billing: CheckoutAddress & { email: string; phone: string }
  line_items: Array<{
    id: number
    name: string
    quantity: number
    total: string
  }>
  payment_method: string
  transaction_id?: string
  date_created: string
}
