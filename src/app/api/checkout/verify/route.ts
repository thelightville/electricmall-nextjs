import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!
const WP_URL = process.env.WORDPRESS_URL || 'http://172.16.16.117:8019'
const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY!
const WC_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET!

const wcAuth = () => Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64')

/**
 * POST /api/checkout/verify
 * Verifies Paystack transaction and creates WooCommerce order.
 */
export async function POST(request: NextRequest) {
  const { reference, billing } = await request.json()

  if (!reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 })
  }

  // Verify with Paystack
  const psRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  })

  const psData = await psRes.json()
  if (!psData.status || psData.data?.status !== 'success') {
    return NextResponse.json({ error: 'Payment not verified' }, { status: 402 })
  }

  const amount = psData.data.amount / 100

  // Create WC order
  const nameParts = (billing?.first_name || '').split(' ')
  const orderPayload = {
    payment_method: 'paystack',
    payment_method_title: 'Paystack',
    set_paid: true,
    transaction_id: reference,
    status: 'processing',
    billing: {
      first_name: billing?.first_name || '',
      last_name: billing?.last_name || '',
      address_1: billing?.address_1 || '',
      city: billing?.city || '',
      state: billing?.state || '',
      postcode: billing?.postcode || '',
      country: billing?.country || 'NG',
      email: billing?.email || psData.data.customer?.email || '',
      phone: billing?.phone || '',
    },
    shipping: {
      first_name: billing?.first_name || '',
      last_name: billing?.last_name || '',
      address_1: billing?.address_1 || '',
      city: billing?.city || '',
      state: billing?.state || '',
      postcode: billing?.postcode || '',
      country: billing?.country || 'NG',
    },
    customer_note: billing?.order_notes || '',
    meta_data: [
      { key: '_paystack_reference', value: reference },
      { key: '_transaction_amount', value: amount },
    ],
  }

  try {
    const wcRes = await fetch(`${WP_URL}/wp-json/wc/v3/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${wcAuth()}`,
      },
      body: JSON.stringify(orderPayload),
    })

    if (!wcRes.ok) {
      const errText = await wcRes.text()
      console.error('[verify] WC error:', errText)
      return NextResponse.json({ error: 'Order creation failed' }, { status: 500 })
    }

    const order = await wcRes.json()
    return NextResponse.json({ orderId: order.id, reference })
  } catch (err) {
    console.error('[verify] error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

/**
 * GET /api/checkout/order?ref=xxx
 * Looks up a WC order by Paystack reference in meta_data.
 */
export async function GET(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get('ref')
  if (!ref) return NextResponse.json({ error: 'Missing ref' }, { status: 400 })

  try {
    const res = await fetch(
      `${WP_URL}/wp-json/wc/v3/orders?meta_key=_paystack_reference&meta_value=${encodeURIComponent(ref)}&per_page=1`,
      { headers: { Authorization: `Basic ${wcAuth()}` } }
    )
    const orders = await res.json()
    if (Array.isArray(orders) && orders.length > 0) {
      return NextResponse.json(orders[0])
    }
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
