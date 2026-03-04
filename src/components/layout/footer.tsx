import Link from 'next/link'
import { Phone, Mail, MapPin, Zap } from 'lucide-react'

const footerLinks = {
  shop: [
    { name: 'Schneider Products', href: '/product-category/schneider-sections' },
    { name: 'Cable Management', href: '/product-category/cable-and-cable-management' },
    { name: 'Lighting', href: '/product-category/lighting' },
    { name: 'Distribution Boards', href: '/product-category/distribution-boards' },
    { name: 'Solar Powered', href: '/product-category/solar-powered' },
    { name: 'CHINT Products', href: '/product-category/chint' },
  ],
  account: [
    { name: 'My Account', href: '/my-account' },
    { name: 'My Orders', href: '/my-account' },
    { name: 'Shopping Cart', href: '/cart' },
    { name: 'Checkout', href: '/checkout' },
  ],
  info: [
    { name: 'About Us', href: '/about-us' },
    { name: 'Contact Us', href: '/contact-us' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms & Conditions', href: '/terms-and-conditions' },
    { name: 'Returns Policy', href: '/refund_returns' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-brand-dark text-gray-300">
      {/* Main footer */}
      <div className="container-main py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 bg-brand-primary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold text-white leading-none block">
                Electric<span className="text-brand-primary">Mall</span>
              </span>
              <span className="text-[10px] text-gray-500 leading-none tracking-wider uppercase">
                Nigeria
              </span>
            </div>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed mb-5">
            Nigeria's leading online electrical superstore — quality cables,
            switches, lighting, and industrial equipment at competitive prices.
          </p>

          {/* Social links */}
          <div className="flex items-center gap-3">
            <a
              href="https://web.facebook.com/electricmal/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-primary flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </a>
            <a
              href="https://x.com/electricmallng"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-primary flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a
              href="https://instagram.com/electricmallnigeria"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-primary flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" fill="none" stroke="currentColor" strokeWidth="2"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2"/></svg>
            </a>
            <a
              href="https://www.linkedin.com/company/electricmall-nigeria/about/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-primary flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
            <a
              href="https://www.tiktok.com/@electricmallng"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-primary flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 12a3 3 0 100 6 3 3 0 000-6zm10.5-4.5A4.5 4.5 0 0115 3v1a4.5 4.5 0 004.5 4.5v1A5.5 5.5 0 0114 4h-1v14a3 3 0 01-4-2.83V9h-1a5 5 0 00-5 5 5 5 0 005 5 5 5 0 005-5V7.5h1a4.5 4.5 0 004.5 4.5z"/></svg>
            </a>
            <a
              href="https://api.whatsapp.com/send?phone=2349099992184&text=Thanks%20for%20contacting%20us"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-green-600 flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>
        </div>

        {/* Shop links */}
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5">
            Shop Categories
          </h3>
          <ul className="space-y-2.5">
            {footerLinks.shop.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-brand-accent transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* My Account */}
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5">
            My Account
          </h3>
          <ul className="space-y-2.5 mb-6">
            {footerLinks.account.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-brand-accent transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5">
            Information
          </h3>
          <ul className="space-y-2.5">
            {footerLinks.info.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-sm text-gray-400 hover:text-brand-accent transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-5">
            Customer Care
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-brand-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-400 leading-relaxed">
                No 14B Wole Ariyo Street, Off Admiralty Way,<br />
                Lekki Phase 1, Lagos Nigeria.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-brand-primary flex-shrink-0" />
              <div className="text-sm text-gray-400">
                <a href="tel:09099992184" className="hover:text-brand-accent transition-colors block">
                  09099992184
                </a>
                <a href="tel:09155565200" className="hover:text-brand-accent transition-colors block">
                  09155565200
                </a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-brand-primary flex-shrink-0" />
              <a
                href="mailto:shopping@electricmall.com.ng"
                className="text-sm text-gray-400 hover:text-brand-accent transition-colors"
              >
                shopping@electricmall.com.ng
              </a>
            </div>
            <a
              href="https://api.whatsapp.com/send?phone=2349099992184&text=Thanks%20for%20contacting%20us"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Electric Mall Nigeria. All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            Powered by{' '}
            <span className="text-brand-accent font-medium">Thelightville</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
