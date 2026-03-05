'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCart } from '@/components/cart/cart-context'
import { formatStorePrice } from '@/lib/utils'
import { submitCheckout } from '@/lib/store-api'
import { Building2, Info } from 'lucide-react'

const BANK = {
  name: 'Wema Bank',
  accountName: 'Electricmall',
  accountNumber: '0122884371',
}

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
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const totals = cart?.totals
  const minorUnit = totals?.currency_minor_unit ?? 2

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { country: 'NG' },
  })

  const onSubmit = async (data: CheckoutFormData) => {
    setSubmitting(true)
    setError('')
    try {
      const result = await submitCheckout({
        billing_address: {
          first_name: data.first_name,
          last_name: data.last_name,
          address_1: data.address_1,
          city: data.city,
          state: data.state,
          postcode: data.postcode || '',
          country: data.country || 'NG',
          email: data.email,
          phone: data.phone,
        },
        shipping_address: {
          first_name: data.first_name,
          last_name: data.last_name,
          address_1: data.address_1,
          city: data.city,
          state: data.state,
          postcode: data.postcode || '',
          country: data.country || 'NG',
        },
        customer_note: data.order_notes,
        payment_method: 'bacs',
      })
      window.location.href = `/checkout/complete?order_id=${result.order_id}&method=bacs`
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place order. Please try again.')
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

          {/* Left — billing + payment */}
          <div className="lg:col-span-2 space-y-6">

            {/* Billing details */}
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

            {/* Payment method — Direct Bank Transfer */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-brand-dark mb-5">Payment Method</h2>

              {/* Selected option display */}
              <div className="flex items-start gap-4 p-4 rounded-xl border-2 border-brand-primary bg-brand-primary/5 mb-5">
                <Building2 className="w-5 h-5 text-brand-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-brand-dark">Direct Bank Transfer</p>
                  <p className="text-gray-500 text-sm">Pay directly into our bank account</p>
                </div>
              </div>

              {/* Bank details */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-dark mb-1">
                  <Info className="w-4 h-4 text-brand-primary" />
                  Bank Account Details
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <span className="text-gray-500">Bank Name</span>
                  <span className="font-semibold text-brand-dark">{BANK.name}</span>
                  <span className="text-gray-500">Account Name</span>
                  <span className="font-semibold text-brand-dark">{BANK.accountName}</span>
                  <span className="text-gray-500">Account Number</span>
                  <span className="font-bold text-brand-primary text-base tracking-wider">{BANK.accountNumber}</span>
                </div>
                <p className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                  Please use your <strong>Order ID</strong> as the payment reference. Your order will not be shipped until the funds have cleared in our account.
                </p>
              </div>
            </div>
          </div>

          {/* Right — order summary */}
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

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full mt-6 justify-center py-4"
              >
                {submitting ? 'Placing Order…' : `Place Order — ${formatStorePrice(totals?.total_price || '0', minorUnit)}`}
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                🏦 You will receive bank details on the confirmation page
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
