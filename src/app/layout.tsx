import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Providers } from '@/components/providers/providers'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/cart/cart-drawer'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Electric Mall Nigeria — Online Electrical Superstore',
    template: '%s | Electric Mall Nigeria',
  },
  description:
    'Shop quality cables, switches, lighting, distribution boards, solar products and industrial equipment at the best prices. Delivered anywhere in Nigeria.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://electricmall.myapps.com.ng'
  ),
  openGraph: {
    siteName: 'Electric Mall Nigeria',
    locale: 'en_NG',
    type: 'website',
  },
  keywords: [
    'electrical supplies Nigeria',
    'cables Nigeria',
    'Schneider Nigeria',
    'LED lights Nigeria',
    'distribution boards',
    'solar panels Nigeria',
    'buy electrical online',
    'electricmall',
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body>
        <Providers>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          {/* CartDrawer is mounted here unconditionally so it's always in the DOM */}
          <CartDrawer />
        </Providers>
      </body>
    </html>
  )
}
