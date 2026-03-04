'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Search, Menu, X, Zap, Phone } from 'lucide-react'
import { useCart } from '@/components/cart/cart-context'

const navigation = [
  { name: 'Shop', href: '/shop' },
  { name: 'Schneider', href: '/product-category/schneider-sections' },
  { name: 'Cables', href: '/product-category/cable-and-cable-management' },
  { name: 'Lighting', href: '/product-category/lighting' },
  { name: 'Solar', href: '/product-category/solar-powered' },
  { name: 'Electrical Industrial', href: '/product-category/electrical-industrial' },
]

export function Header() {
  const { itemCount, openCart } = useCart()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-100">
      {/* Top bar */}
      <div className="bg-brand-dark text-white text-xs py-2 hidden md:block">
        <div className="container-main flex justify-between items-center">
          <div className="flex items-center gap-1 text-gray-300">
            <Phone className="w-3 h-3" />
            <span>Got Questions? Call us 24/7!</span>
            <a href="tel:09099992184" className="text-brand-accent hover:text-white ml-1 font-medium">
              09099992184
            </a>
            <span className="mx-1 text-gray-600">|</span>
            <a href="tel:09155565200" className="text-brand-accent hover:text-white font-medium">
              09155565200
            </a>
          </div>
          <div className="flex items-center gap-4 text-gray-300">
            <a href="https://electricmall.com.ng/wp-admin" className="hover:text-white transition-colors">
              WP Admin
            </a>
            <Link href="/my-account" className="hover:text-white transition-colors">
              My Account
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container-main py-4 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-9 h-9 bg-brand-primary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-brand-dark leading-none block">
              Electric<span className="text-brand-primary">Mall</span>
            </span>
            <span className="text-[10px] text-gray-400 leading-none tracking-wider uppercase">
              Nigeria
            </span>
          </div>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
          <div className="flex w-full rounded-lg overflow-hidden border-2 border-brand-primary focus-within:shadow-brand-sm transition-shadow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for cables, switches, solar products..."
              className="flex-1 px-4 py-2.5 text-sm text-gray-700 outline-none bg-gray-50"
            />
            <button
              type="submit"
              className="bg-brand-primary text-white px-4 hover:bg-red-700 transition-colors flex items-center gap-1"
            >
              <Search className="w-4 h-4" />
              <span className="text-sm font-medium hidden lg:block">Search</span>
            </button>
          </div>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-3 ml-auto md:ml-0">
          {/* Cart */}
          <button
            onClick={openCart}
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-6 h-6 text-brand-gray" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>

          {/* Account */}
          <Link
            href="/my-account"
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-brand-gray hover:bg-gray-100 transition-colors"
          >
            My Account
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Desktop nav */}
      <nav className="border-t border-gray-100 hidden md:block">
        <div className="container-main flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex-shrink-0 px-4 py-2 text-sm font-medium text-brand-gray rounded-md hover:bg-brand-primary hover:text-white transition-colors whitespace-nowrap"
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/shop"
            className="ml-auto flex-shrink-0 px-4 py-2 text-sm font-medium bg-brand-accent text-brand-dark rounded-md hover:bg-yellow-300 transition-colors"
          >
            All Products
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white shadow-lg">
          {/* Mobile search */}
          <form onSubmit={handleSearch} className="px-4 pt-4 pb-2">
            <div className="flex rounded-lg overflow-hidden border-2 border-brand-primary">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-3 py-2.5 text-sm outline-none bg-gray-50"
              />
              <button type="submit" className="bg-brand-primary text-white px-4">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
          <nav className="px-4 pb-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-brand-gray rounded-lg hover:bg-gray-100 transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/my-account"
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-brand-gray rounded-lg hover:bg-gray-100 transition-colors"
            >
              My Account
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
