'use client'

import { ApolloProvider } from '@apollo/client'
import { SessionProvider } from 'next-auth/react'
import apolloClient from '@/lib/apollo-client'
import { CartProvider } from '@/components/cart/cart-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ApolloProvider client={apolloClient}>
        <CartProvider>
          {children}
        </CartProvider>
      </ApolloProvider>
    </SessionProvider>
  )
}
