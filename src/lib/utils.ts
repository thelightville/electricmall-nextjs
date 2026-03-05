import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a WooCommerce Store API price integer to a display string.
 * The Store API returns prices as integers scaled by 10^minor_unit.
 * e.g. "125000" with minor_unit=2 → ₦1,250.00
 */
export function formatStorePrice(
  value: string | number,
  minorUnit: number = 2,
  currencySymbol: string = '₦'
): string {
  const num = Number(value)
  if (isNaN(num)) return `${currencySymbol}0.00`
  const divisor = Math.pow(10, minorUnit)
  const amount = num / divisor
  return `${currencySymbol}${amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format a WooCommerce REST API price string to a display string.
 * REST API returns prices like "1250.00".
 */
export function formatPrice(
  value: string | number | undefined | null,
  currencySymbol: string = '₦'
): string {
  if (value === undefined || value === null) return ''
  // Strip HTML tags (WC sometimes returns <span>₦1,000</span>)
  // Also strip commas so parseFloat('2,480.00') → 2480 not 2
  const clean = String(value).replace(/<[^>]*>/g, '').replace(/₦/g, '').replace(/,/g, '').trim()
  const num = parseFloat(clean)
  if (isNaN(num)) return String(value).replace(/<[^>]*>/g, '')
  return `${currencySymbol}${num.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** Convert naira amount to kobo (for Paystack) */
export function toKobo(naira: number): number {
  return Math.round(naira * 100)
}

/** Generate a random transaction reference */
export function generateReference(prefix: string = 'EM'): string {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 100000)
  return `${prefix}-${timestamp}-${random}`
}

/** Truncate text to a max length */
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen).trimEnd() + '…'
}

/** Get stock status label */
export function getStockLabel(status: string | null | undefined): {
  label: string
  inStock: boolean
} {
  switch (status) {
    case 'IN_STOCK':
      return { label: 'In Stock', inStock: true }
    case 'OUT_OF_STOCK':
      return { label: 'Out of Stock', inStock: false }
    case 'ON_BACKORDER':
      return { label: 'Available on Backorder', inStock: true }
    default:
      return { label: 'In Stock', inStock: true }
  }
}
