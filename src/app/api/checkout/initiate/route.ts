import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const FLUTTERWAVE_SECRET = process.env.FLUTTERWAVE_SECRET_KEY!
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY!

/**
 * Initiates a payment session for Flutterwave or Stripe.
 * Paystack is handled client-side via @paystack/inline-js.
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { gateway, amount, email, ref, billing } = body

  if (!gateway || !amount || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (gateway === 'flutterwave') {
    try {
      const res = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${FLUTTERWAVE_SECRET}`,
        },
        body: JSON.stringify({
          tx_ref: ref,
          amount,
          currency: 'NGN',
          redirect_url: `${process.env.NEXTAUTH_URL}/checkout/complete`,
          customer: {
            email,
            name: `${billing.first_name} ${billing.last_name}`.trim(),
            phonenumber: billing.phone,
          },
          customizations: {
            title: 'ElectricMall',
            description: 'Order payment',
            logo: 'https://electricmall.com.ng/wp-content/uploads/2020/06/electric-mall-logo.png',
          },
          meta: { billing },
        }),
      })

      const data = await res.json()
      if (data.status === 'success') {
        return NextResponse.json({ link: data.data.link })
      }
      return NextResponse.json({ error: data.message || 'Flutterwave error' }, { status: 500 })
    } catch (err) {
      return NextResponse.json({ error: 'Flutterwave initiation failed' }, { status: 500 })
    }
  }

  if (gateway === 'stripe') {
    if (!STRIPE_SECRET || STRIPE_SECRET.startsWith('sk_placeholder')) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
    }
    try {
      const stripe = new Stripe(STRIPE_SECRET)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: email,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: Math.round(amount * 100),
              product_data: { name: 'ElectricMall Order' },
            },
            quantity: 1,
          },
        ],
        metadata: { ref, ...billing },
        success_url: `${process.env.NEXTAUTH_URL}/checkout/complete?ref=${ref}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/checkout`,
      })
      return NextResponse.json({ url: session.url })
    } catch (err) {
      return NextResponse.json({ error: 'Stripe session failed' }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Unknown gateway' }, { status: 400 })
}
