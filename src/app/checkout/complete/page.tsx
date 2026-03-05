'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Copy, Check, ArrowRight } from 'lucide-react'

const BANK = {
  name: 'Wema Bank',
  accountName: 'Electricmall',
  accountNumber: '0122884371',
}

interface OrderData {
  id: number
  status: string
  total: string
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

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={copy}
      className="ml-2 p-1 rounded hover:bg-brand-primary/10 text-brand-primary transition-colors"
      title="Copy"
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
    </button>
  )
}

function CheckoutCompleteContent() {
  const params = useSearchParams()
  const orderId = params.get('order_id')
  const method = params.get('method') || 'bacs'
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) { setLoading(false); return }
    fetch(`/api/checkout/order?order_id=${orderId}`)
      .then((r) => r.json())
      .then((data) => { if (data.id) setOrder(data) })
      .finally(() => setLoading(false))
  }, [orderId])

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

  const displayOrderId = order?.id || orderId

  return (
    <div className="container-main section-padding">
      <div className="max-w-2xl mx-auto py-8">

        {/* Success header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-brand-dark mb-2">
            Order #{displayOrderId} Placed!
          </h1>
          <p className="text-gray-500 text-lg">
            Thank you{order ? `, ${order.billing.first_name}` : ''}! Your order has been received.
          </p>
        </div>

        {/* Bank transfer instructions */}
        <div className="bg-brand-primary/5 border-2 border-brand-primary/20 rounded-2xl p-6 mb-6">
          <h2 className="font-bold text-brand-dark text-lg mb-1">
            💳 Complete Your Payment
          </h2>
          <p className="text-gray-600 text-sm mb-5">
            Transfer the exact order amount to the account below. Use your Order ID as the payment reference.
          </p>

          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500">Bank Name</span>
              <span className="font-semibold text-brand-dark">{BANK.name}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500">Account Name</span>
              <span className="font-semibold text-brand-dark">{BANK.accountName}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500">Account Number</span>
              <div className="flex items-center">
                <span className="font-bold text-brand-primary text-lg tracking-widest">{BANK.accountNumber}</span>
                <CopyButton text={BANK.accountNumber} />
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-500">Amount</span>
              <span className="font-bold text-brand-dark text-base">
                {order ? `₦${Number(order.total).toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : 'As shown in your order'}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-brand-accent/10 rounded-b-xl">
              <span className="text-sm font-semibold text-brand-dark">Payment Reference</span>
              <div className="flex items-center">
                <span className="font-bold text-brand-dark">Order #{displayOrderId}</span>
                {displayOrderId && <CopyButton text={`Order #${displayOrderId}`} />}
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3 text-center">
            Your order will not be shipped until payment has cleared in our account.
          </p>
        </div>

        {/* Order summary */}
        {order && (
          <div className="card p-6 mb-6">
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
                <span className="text-brand-primary">₦{Number(order.total).toLocaleString('en-NG', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            {order.billing.email && (
              <p className="text-sm text-gray-400 mt-4 pt-3 border-t border-gray-100">
                A confirmation email has been sent to <strong>{order.billing.email}</strong>
              </p>
            )}
          </div>
        )}

        {/* What's next */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
          <h3 className="font-semibold text-brand-dark mb-3">What happens next?</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>🏦 Transfer the order amount to the Wema Bank account above</li>
            <li>📋 Use <strong>Order #{displayOrderId}</strong> as your payment reference</li>
            <li>📦 We will pack your order within 1 business day of payment confirmation</li>
            <li>🚚 Delivery: 1–3 days within Lagos, 3–7 days nationwide</li>
            <li>📞 Questions? Call: <a href="tel:09099992184" className="text-brand-primary font-medium">09099992184</a></li>
            <li>💬 WhatsApp: <a href="https://wa.me/2349099992184" className="text-brand-primary font-medium">+234 909 999 2184</a></li>
          </ul>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/shop" className="btn-primary">
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/my-account" className="btn-secondary">
            My Account
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutCompletePage() {
  return (
    <Suspense fallback={
      <div className="container-main section-padding text-center py-20">
        <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    }>
      <CheckoutCompleteContent />
    </Suspense>
  )
}
