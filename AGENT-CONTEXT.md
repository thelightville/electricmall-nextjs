# electricmall.com.ng — Agent Context File
> **Purpose:** Paste this file's content into a new chat session after a reboot to immediately restore context.
> **Updated:** 2026-03-04

---

## Project Summary

Headless Next.js 14 e-commerce storefront for **electricmall.com.ng** (an electrical supplies shop in Nigeria).
- Backend: WooCommerce + WPGraphQL API at `https://electricmall.com.ng/graphql`
- Frontend: Next.js 14, App Router, TypeScript, Tailwind CSS, Apollo Client
- Live URL: **https://electricmall.myapps.com.ng** (Cloudflare tunnel → CT117:8040)
- Source: `/root/electricmall-nextjs/` on PVE1 (172.16.16.20)
- Container: `electricmall-nextjs` on CT117 (172.16.16.117), port **8040**

---

## Infrastructure

| Component | Detail |
|-----------|--------|
| Build machine | PVE1: `ssh root@172.16.16.20` (this machine) |
| Container host | CT117: `ssh root@172.16.16.117` |
| Docker dir | `/opt/docker-sites/electricmall-nextjs/` on CT117 |
| Dockerfile | `Dockerfile.prebuilt` — uses `node:20-slim` (glibc for sharp) |
| Cloudflare | Tunnel → nginx port 8080 → CT117:8040 |
| sharp version | `0.33.5` (glibc build, requires `node:20-slim` not Alpine) |

### Deploy procedure
```bash
# 1. Build on PVE1
cd /root/electricmall-nextjs && npm run build

# 2. Stage correctly (Dockerfile expects standalone/ subdirectory)
rm -rf /tmp/em-deploy && mkdir -p /tmp/em-deploy/standalone
cp -r .next/standalone/. /tmp/em-deploy/standalone/
cp -r .next/static /tmp/em-deploy/.next/static
cp -r public /tmp/em-deploy/public

# 3. Rsync to CT117
rsync -az --no-perms --delete /tmp/em-deploy/standalone/ root@172.16.16.117:/opt/docker-sites/electricmall-nextjs/standalone/
rsync -az --no-perms --delete /tmp/em-deploy/.next/static/ root@172.16.16.117:/opt/docker-sites/electricmall-nextjs/.next/static/
rsync -az --no-perms --delete /tmp/em-deploy/public/ root@172.16.16.117:/opt/docker-sites/electricmall-nextjs/public/

# 4. Rebuild Docker image and restart
ssh root@172.16.16.117 "cd /opt/docker-sites/electricmall-nextjs && docker compose build --no-cache && docker compose up -d"

# 5. Verify
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://electricmall.myapps.com.ng
```

---

## Current Status (2026-03-04 — updated)

### ✅ Completed
| Feature | File | Notes |
|---------|------|-------|
| SVG → Real PNG logo | `src/components/layout/logo.tsx` | Uses `electricmall-logo-v2.png` (transparent, 247×120), height=88px |
| Header + Footer logo | `header.tsx`, `footer.tsx` | `variant=dark` header, `variant=light` (inverted) footer |
| Hero slider | `src/components/home/hero-slider.tsx` | 4 slides, auto 5.5s, prev/next, dots. **Mobile image added** per slide |
| **Cart persistence** | `src/lib/store-api.ts` | Changed `sessionStorage` → `localStorage` for `woo-cart-token` |
| **SEO: layout** | `src/app/layout.tsx` | Added `openGraph.title/description/images`, `twitter` card |
| **SEO: product pages** | `src/app/product/[slug]/page.tsx` | OG description, twitter card, **JSON-LD Product structured data** |
| **SEO: category pages** | `src/app/product-category/[slug]/page.tsx` | Full OG + twitter metadata |
| Search | `src/app/search/page.tsx` | Fully working — GraphQL query, header routes to `/search?q=` |
| My Account | `src/app/my-account/page.tsx` | NextAuth credentials, WooCommerce GraphQL login, JWT 30-day sessions |
| Deployed | CT117:8040 | HTTP 200 ✅ |

### ⏳ Remaining / Optional
| Priority | Item |
|----------|------|
| High | Checkout / Paystack payment integration |
| Medium | My Orders page (list WooCommerce orders for logged-in user) |
| Medium | Account details page (update name/email/password) |
| Low | OG social share image (1200×630 branded image for link previews) |
| Low | Wishlist / Save for later |

---

## Key Files
```
src/
  app/
    page.tsx                    — Homepage (calls HeroSlider)
    layout.tsx                  — Root layout, Header + Footer
    shop/page.tsx               — Shop listing
    product/[slug]/page.tsx     — Product detail
    product-category/[slug]/    — Category listing
  components/
    layout/
      header.tsx                — Top nav, search, cart icon
      footer.tsx                — Footer
      logo.tsx                  ← NEW: SVG logo component
    home/
      hero-slider.tsx           ← NEW: 4-slide hero carousel
    product/
      product-card.tsx          — Product grid card
  lib/
    apollo-client.ts            — Apollo + possibleTypes fix
    graphql/queries.ts          — GQL queries
public/images/
  electricmall-logo-wide.png    — Original PNG (white bg, not used)
  electricmall-logo.png         — Small PNG (not used)
```

---

## Known Issues / Gotchas
- `btn-secondary` in `globals.css` has `bg-white text-brand-gray` — adding `text-white` makes it invisible. Always write button className inline when on dark backgrounds.
- `node:20-alpine` breaks sharp (musl vs glibc). Must use `node:20-slim`.
- Cloudflare edge cache may serve stale HTML after deploy — hard refresh (`Ctrl+Shift+R`) or purge cache in CF dashboard.
- The `standalone/` subdirectory in the rsync MUST be a subdirectory — the Dockerfile does `COPY standalone/ ./`, not `COPY . ./`.

---

## Brand Colors (Tailwind)
```
brand-primary:  #d60d06  (red)
brand-accent:   #fed700  (yellow)
brand-dark:     #181818
brand-gray:     #4a4a4a
```
