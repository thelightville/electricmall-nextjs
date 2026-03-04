# ElectricMall Next.js Headless Storefront

Headless Next.js 14 storefront for [electricmall.com.ng](https://electricmall.com.ng) — Nigeria's premier online electrical components marketplace.

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS v3 + CSS custom properties |
| Data | Apollo Client 3.x + WPGraphQL 2.9.1 |
| Cart/Checkout | WooCommerce Store API v1 |
| Auth | NextAuth 4.x with WPGraphQL JWT |
| Animation | Framer Motion 12 |
| Forms | react-hook-form + zod |
| Payments | Paystack + Flutterwave + Stripe |
| Docker | Multi-stage Alpine (standalone output) |
| Deployment | CT117 (172.16.16.117) port 8031, Portainer-managed |

## Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-primary` | `#d60d06` | CTA buttons, prices, badges |
| `brand-accent` | `#fed700` | Secondary actions, highlights |
| `brand-dark` | `#181818` | Headings, body text |
| `brand-gray` | `#333e48` | Subtext, borders |

## Architecture

```
Cloudflare → cloudflared (PVE1/2/3) → nginx:8080 → http://172.16.16.117:8031
                                                              ↕
                                                    Next.js container
                                                              ↕
                                             WooCommerce (CT117:8019)
                                             GraphQL: /graphql
                                             Store API: /wp-json/wc/store/v1
```

## Quick Start (Development)

```bash
cp .env.example .env.local
# Fill in .env.local with real keys
npm install
npm run dev       # http://localhost:3000
```

## Production Deploy

```bash
bash /tmp/build-deploy-electricmall.sh
```

The script:
1. Runs `npm ci && npm run build`
2. Copies static assets into standalone bundle
3. Rsyncs to CT117:`/opt/docker-sites/electricmall-nextjs/`
4. Deploys/updates via Portainer API
5. Adds `electricmall.myapps.com.ng → http://172.16.16.117:8031` to nginx tunnel proxy on all 3 PVE nodes

## QA Tests

```bash
python3 /tmp/test_electricmall.py
# --base-url http://172.16.16.117:8031 (default)
```

29+ tests covering:
- All page routes return HTTP 200
- Static assets accessible (no 404s)
- Brand colors in CSS output
- Store API proxy working (correct field names: `total_items`, `total_price`)
- GraphQL categories loading
- All API routes accept/reject correctly
- NextAuth providers configured
- SEO meta tags present

## Project Structure

```
src/
├── app/
│   ├── page.tsx                       # Homepage
│   ├── shop/page.tsx                  # Product catalogue
│   ├── product/[slug]/page.tsx        # Product detail (ISR)
│   ├── product-category/[slug]/       # Category pages (SSG)
│   ├── cart/page.tsx                  # Cart with coupon
│   ├── checkout/page.tsx              # Checkout (Paystack/FW/Stripe)
│   ├── checkout/complete/page.tsx     # Order confirmation
│   ├── my-account/page.tsx            # Login / Register
│   ├── search/page.tsx                # Search results
│   └── api/
│       ├── auth/[...nextauth]/        # NextAuth
│       ├── auth/register/             # WPGraphQL registration
│       ├── store/[...path]/           # Store API proxy (CORS fix)
│       ├── checkout/verify/           # Paystack verification
│       ├── checkout/initiate/         # Flutterwave / Stripe initiation
│       ├── webhooks/paystack/         # Paystack webhook
│       ├── revalidate/                # ISR on-demand revalidation
│       └── health/                    # Docker health check
├── components/
│   ├── cart/            # CartContext + CartDrawer
│   ├── layout/          # Header + Footer
│   ├── product/         # ProductCard, ProductGrid, AddToCartButton
│   └── providers/       # Apollo + NextAuth + Cart providers
├── lib/
│   ├── apollo-client.ts
│   ├── store-api.ts     # WC Store API calls (via /api/store proxy)
│   ├── utils.ts         # formatStorePrice, formatPrice, toKobo
│   └── graphql/queries.ts
└── types/index.ts
```

## Known Issues & Fixes Applied

| Issue | Fix |
|-------|-----|
| CartDrawer invisible | Mounted unconditionally in `layout.tsx` (not conditionally in pages) |
| Store API CORS | All cart calls go through `/api/store/` proxy route |
| Static assets 404 | Explicitly copied `.next/static/` and `public/` in Dockerfile |
| AppArmor restrictions | `security_opt: apparmor:unconfined + seccomp:unconfined` in docker-compose.yml |
| Store API field names | Uses `total_items` / `total_discount` / `total_price` (NOT `subtotal`) |

## Payment Gateways

| Gateway | Client | Server |
|---------|--------|--------|
| **Paystack** | `@paystack/inline-js` popup | `/api/checkout/verify` HMAC verify |
| **Flutterwave** | Server-redirect | `/api/checkout/initiate` hosted page |
| **Stripe** | Server-redirect | `/api/checkout/initiate` Stripe Checkout |

## Contact / Domain

- Live: https://electricmall.myapps.com.ng  
- Origin: https://electricmall.com.ng  
- Internal: http://172.16.16.117:8031  
- Phone: 09099992184 / 09155565200  
- Email: shopping@electricmall.com.ng
