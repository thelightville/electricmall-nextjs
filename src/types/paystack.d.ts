declare module '@paystack/inline-js' {
  interface PaystackTransaction {
    reference: string
    status: string
    message: string
    transaction: string
  }

  interface PaystackTransactionOptions {
    key: string
    email: string
    amount: number
    ref?: string
    currency?: string
    metadata?: Record<string, unknown>
    onSuccess?: (transaction: PaystackTransaction) => void
    onCancel?: () => void
    onError?: (error: Error) => void
  }

  class PaystackPop {
    newTransaction(options: PaystackTransactionOptions): void
    resumeTransaction(accessCode: string): void
    cancelTransaction(): void
  }

  export default PaystackPop
}
