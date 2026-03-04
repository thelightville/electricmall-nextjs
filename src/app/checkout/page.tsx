'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCart } from '@/components/cart/cart-context'
import { formatStorePrice, generateReference, toKobo } from '@/lib/utils'
import { CreditCard, Wallet, Globe } from 'lucide-react'

const checkoutSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(8, 'Phone number required'),
  address_1: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postcode: z.string().optional(),
  country: z.string().optional(),
  order_notes: z.string().optional(),
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const { cart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState<'paystack' | 'flutterwave' | 'stripe'>('paystack')
  const [submitting, setSubmitting] = useState(false)

  const totals = cart?.totals
  const minorUnit = totals?.currency_minor_unit ?? 2

  const totalNaira = totals
    ? Number(totals.total_price) / Math.pow(10, minorUnit)
    : 0

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { country: 'NG' },
  })

  const onSubmit = async (data: CheckoutFormData) => {
    setSubmitting(true)
    const ref = generateReference('EM')

    try {
      if (paymentMethod === 'paystack') {
        // Dynamically load Paystack
        const PaystackPop = (await import('@paystack/inline-js')).default
        const handler = new PaystackPop()
        handler.newTransaction({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
          email: data.email,
          amount: toKobo(totalNaira),
          ref,
          currency: 'NGN',
          metadata: {
            custom_fields: [
              { display_name: 'Name', variable_name: 'name', value: `${data.first_name} ${data.last_name}` },
              { display_name: 'Phone', variable_name: 'phone', value: data.phone },
            ],
          },
          onSuccess: async (transaction: { reference: string }) => {
            // Verify + create order
            await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reference: transaction.reference, billing: data, payment_method: 'paystack' }),
            })
            window.location.href = `/checkout/complete?ref=${transaction.reference}`
          },
          onCancel: () => setSubmitting(false),
        })
      } else if (paymentMethod === 'flutterwave') {
        const { useFlutterwave, closePaymentModal } = await import('flutterwave-react-v3')
        // For Flutterwave, we redirect to their hosted page
        const response = await fetch('/api/checkout/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gateway: 'flutterwave', amount: totalNaira, email: data.email, ref, billing: data }),
        })
        const result = await response.json()
        if (result.link) {
          window.location.href = result.link
        }
      } else if (paymentMethod === 'stripe') {
        const response = await fetch('/api/checkout/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gateway: 'stripe', amount: totalNaira, email: data.email, ref, billing: data }),
        })
        const result = await response.json()
        if (result.url) {
          window.location.href = result.url
        }
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setSubmitting(false)
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container-main section-padding text-center">
        <p className="text-gray-500">Your cart is empty.</p>
        <a href="/shop" className="btn-primary mt-4 inline-flex">Shop Now</a>
      </div>
    )
  }

  return (
    <div className="container-main section-padding">
      <h1 className="section-title mb-8">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Billing details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-bold text-brand-dark mb-5">Billing Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-field">First Name *</label>
                  <input {...register('first_name')} className="input-field" placeholder="John" />
                  {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
                </div>
                <div>
                  <label className="label-field">Last Name *</label>
                  <input {...register('last_name')} className="input-field" placeholder="Doe" />
                  {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
                </div>
                <div>
                  <label className="label-field">Email Address *</label>
                  <input {...register('email')} type="email" className="input-field" placeholder="john@example.com" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="label-field">Phone Number *</label>
                  <input {...register('phone')} type="tel" className="input-field" placeholder="08012345678" />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
                <div className="sm:col-span-2">
                  <label className="label-field">Address *</label>
                  <input {...register('address_1')} className="input-field" placeholder="House number, Street name" />
                  {errors.address_1 && <p className="text-red-500 text-xs mt-1">{errors.address_1.message}</p>}
                </div>
                <div>
                  <label className="label-field">City *</label>
                  <input {...register('city')} className="input-field" placeholder="Lagos" />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="label-field">State *</label>
                  <input {...register('state')} className="input-field" placeholder="Lagos State" />
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="label-field">Postcode</label>
                  <input {...register('postcode')} className="input-field" placeholder="100001" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label-field">Order Notes (optional)</label>
                  <textarea
                    {...register('order_notes')}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Special instructions for your order..."
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-brand-dark mb-5">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { id: 'paystack', label: 'Pay with Paystack', icon: CreditCard, desc: 'Debit/Credit cards, Bank transfer, USSD' },
                  { id: 'flutterwave', label: 'Pay with Flutterwave', icon: Wallet, desc: 'Cards, Mobile money, Bank transfer' },
                  { id: 'stripe', label: 'Pay with Stripe', icon: Globe, desc: 'International cards (Visa, Mastercard, Amex)' },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      paymentMethod === method.id
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id as typeof paymentMethod)}
                      className="mt-1 accent-brand-primary"
                    />
                    <div className="flex items-start gap-3">
                      <method.icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${paymentMethod === method.id ? 'text-brand-primary' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-semibold text-brand-dark">{method.label}</p>
                        <p className="text-gray-500 text-sm">{method.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-bold text-brand-dark mb-5">Your Order</h2>

              <div className="space-y-3 mb-5">
                {cart.items.map((item) => (
                  <div key={item.key} className="flex justify-between text-sm gap-2">
                    <span className="text-gray-600 line-clamp-2">{item.name} × {item.quantity}</span>
                    <span className="font-medium flex-shrink-0">
                      {formatStorePrice(item.totals.line_total, item.totals.currency_minor_unit)}
                    </span>
                  </div>
                ))}
              </div>

              {totals && (
                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatStorePrice(totals.total_items, minorUnit)}</span>
                  </div>
                  {Number(totals.total_discount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>−{formatStorePrice(totals.total_discount, minorUnit)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2">
                    <span>Total</span>
                    <span className="text-brand-primary">
                      {formatStorePrice(totals.total_price, minorUnit)}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full mt-6 justify-center py-4"
              >
                {submitting ? 'Processing…' : `Place Order — ${formatStorePrice(totals?.total_price || '0', minorUnit)}`}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                🔒 Secured by {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
