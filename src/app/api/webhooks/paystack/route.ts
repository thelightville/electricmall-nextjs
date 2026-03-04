import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!
const WP_URL = process.env.WORDPRESS_URL || 'http://172.16.16.117:8019'
const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY!
const WC_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET!

/**
 * Paystack webhook handler.
 * Verifies HMAC-SHA512 signature then creates a WC order on charge.success.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-paystack-signature') || ''

  // Verify webhook signature
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(rawBody)
    .digest('hex')

  if (hash !== signature) {
    console.warn('[paystack-webhook] invalid signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event: { event: string; data: Record<string, unknown> }
  try {
    event = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (event.event === 'charge.success') {
    const data = event.data
    const metadata = (data.metadata as Record<string, unknown>) || {}
    const customFields = (metadata.custom_fields as Array<{ variable_name: string; value: string }>) || []

    const getField = (name: string) =>
      customFields.find((f) => f.variable_name === name)?.value || ''

    const amount = Number(data.amount) / 100 // kobo → naira

    try {
      // Create WooCommerce order via REST API
      const orderPayload = {
        payment_method: 'paystack',
        payment_method_title: 'Paystack',
        set_paid: true,
        transaction_id: data.reference,
        billing: {
          first_name: getField('name').split(' ')[0] || '',
          last_name: getField('name').split(' ').slice(1).join(' ') || '',
          email: (data.customer as { email?: string })?.email || '',
          phone: getField('phone') || '',
          country: 'NG',
        },
        line_items: [], // Note: populate from cart if needed
        meta_data: [
          { key: '_paystack_reference', value: data.reference },
          { key: '_paystack_amount', value: amount },
        ],
      }

      const auth = Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64')
      const wcRes = await fetch(`${WP_URL}/wp-json/wc/v3/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify(orderPayload),
      })

      if (!wcRes.ok) {
        console.error('[paystack-webhook] WC order creation failed:', await wcRes.text())
      } else {
        const order = await wcRes.json()
        console.log('[paystack-webhook] order created:', order.id, 'ref:', data.reference)
      }
    } catch (err) {
      console.error('[paystack-webhook] error creating order:', err)
    }
  }

  return NextResponse.json({ received: true })
}
