'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, ArrowRight } from 'lucide-react'

interface OrderData {
  id: number
  status: string
  total: string
  date_created: string
  billing: {
    first_name: string
    last_name: string
    email: string
  }
  line_items: Array<{
    id: number
    name: string
    quantity: number
    total: string
  }>
}

function CheckoutCompleteContent() {
  const params = useSearchParams()
  const ref = params.get('ref') || params.get('reference') || params.get('transaction_id')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ref) { setLoading(false); return }
    fetch(`/api/checkout/order?ref=${ref}`)
      .then((r) => r.json())
      .then((data) => { if (data.id) setOrder(data) })
      .finally(() => setLoading(false))
  }, [ref])

  if (loading) {
    return (
      <div className="container-main section-padding">
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Confirming your order…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-main section-padding">
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-14 h-14 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold text-brand-dark mb-3">
          {order ? `Order #${order.id} Confirmed!` : 'Payment Received!'}
        </h1>
        <p className="text-gray-500 text-lg mb-2">
          Thank you{order ? `, ${order.billing.first_name}` : ''}! Your order has been placed.
        </p>
        {ref && (
          <p className="text-sm text-gray-400 mb-8">
            Transaction Reference: <span className="font-mono font-medium text-brand-dark">{ref}</span>
          </p>
        )}

        {order && (
          <div className="card p-6 text-left mb-8">
            <h2 className="font-semibold text-brand-dark mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-brand-primary" /> Order Summary
            </h2>
            <div className="space-y-3">
              {order.line_items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.name} × {item.quantity}</span>
                  <span className="font-medium">₦{Number(item.total).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span className="text-brand-primary">₦{Number(order.total).toLocaleString()}</span>
              </div>
            </div>
            {order.billing.email && (
              <p className="text-sm text-gray-400 mt-4">
                A confirmation email has been sent to <strong>{order.billing.email}</strong>
              </p>
            )}
          </div>
        )}

        <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-5 mb-8 text-left">
          <h3 className="font-semibold text-brand-dark mb-2">What&apos;s Next?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>📦 We will pack your order within 1 business day</li>
            <li>🚚 Delivery takes 1–3 business days in Lagos, 3–7 days nationwide</li>
            <li>📞 Questions? Call us: <a href="tel:09099992184" className="text-brand-primary font-medium">09099992184</a></li>
            <li>💬 WhatsApp: <a href="https://wa.me/2349099992184" className="text-brand-primary font-medium">+234 909 999 2184</a></li>
          </ul>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/shop" className="btn-primary">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/my-account" className="btn-secondary">
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutCompletePage() {
  return (
    <Suspense fallback={<div className="container-main section-padding text-center py-20"><div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
      <CheckoutCompleteContent />
    </Suspense>
  )
}
