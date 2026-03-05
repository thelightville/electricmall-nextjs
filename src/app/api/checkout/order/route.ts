import { NextRequest, NextResponse } from 'next/server'

const WP_URL = process.env.WORDPRESS_URL || 'http://172.16.16.117:8019'
const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY!
const WC_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET!
const wcAuth = () => Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64')

/**
 * GET /api/checkout/order?order_id=123
 * Fetches a WooCommerce order by ID.
 */
export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('order_id')
  if (!orderId) {
    return NextResponse.json({ error: 'Missing order_id' }, { status: 400 })
  }

  try {
    const res = await fetch(`${WP_URL}/wp-json/wc/v3/orders/${orderId}`, {
      headers: { Authorization: `Basic ${wcAuth()}` },
      cache: 'no-store',
    })
    if (!res.ok) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    const order = await res.json()
    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
