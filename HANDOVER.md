# Electric Mall — Development Handover

**Date**: March 5, 2026  
**Transferred from**: PVE1 (`172.16.16.20`) VS Code session  
**Transfer to**: CT117 (`172.16.16.117`) VS Code Remote SSH session  
**Reason**: Keeping development workloads scoped to the container/VM where they run

---

## Project Overview

Next.js 14 headless e-commerce storefront for **electricmall.com.ng** — an electrical supplies shop in Nigeria.  
Backend: WooCommerce + WPGraphQL API on the same CT117 host (port 8019).

- **Staging URL**: https://electricmall.myapps.com.ng *(to be promoted to production)*
- **WooCommerce admin**: https://electricmall.com.ng/wp-admin
- **GitHub**: `thelightville/electricmall-nextjs`, branch `master`

---

## Architecture

```
Cloudflare → cloudflared tunnel (PVE1/2/3)
           → nginx :8080 (cloudflare-tunnel-proxy.conf)
           → electricmall.myapps.com.ng server block → CT117:8040 (Next.js)
           → electricmall.com.ng map entry → CT117:8019 (WooCommerce WordPress)
```

### Containers on CT117

| Container | Stack dir | Port | Purpose |
|-----------|-----------|------|---------|
| `electricmall-nextjs` | `/opt/docker-sites/electricmall-nextjs/` | 8040 | Next.js frontend |
| WooCommerce stack | `/opt/docker-sites/electricmall.com.ng/` | 8019→80 | WordPress + WooCommerce |

---

## Repository State

- **Branch**: `master`
- **Last commit**: `feat: fix product slugs, images, logo + world-class visual redesign`
- **Remote**: `https://github.com/thelightville/electricmall-nextjs`
- **Status**: verify with `git status` on CT117 after clone

---

## Environment Variables

Create `/opt/electricmall-nextjs/.env.local` on CT117.  
Get values from `/root/electricmall-nextjs/.env.local` on PVE1 (copy securely via SSH, never commit):

```env
NEXT_PUBLIC_WORDPRESS_URL=https://electricmall.com.ng
NEXT_PUBLIC_GRAPHQL_URL=https://electricmall.com.ng/graphql
NEXT_PUBLIC_SITE_URL=https://electricmall.myapps.com.ng
NEXT_PUBLIC_SITE_NAME=Electric Mall
NEXT_PUBLIC_CURRENCY=NGN
WOOCOMMERCE_URL=https://electricmall.com.ng
WOOCOMMERCE_CONSUMER_KEY=<see .env.local on PVE1>
WOOCOMMERCE_CONSUMER_SECRET=<see .env.local on PVE1>
NEXTAUTH_SECRET=<see .env.local on PVE1>
NEXTAUTH_URL=https://electricmall.myapps.com.ng
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=<see .env.local on PVE1 — LIVE key>
PAYSTACK_SECRET_KEY=<see .env.local on PVE1 — LIVE key>
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=<see .env.local on PVE1>
FLUTTERWAVE_SECRET_KEY=<see .env.local on PVE1>
FLUTTERWAVE_SECRET_HASH=<see .env.local on PVE1>
REVALIDATION_SECRET=<see .env.local on PVE1>
```

> ⚠️ Paystack and Flutterwave keys are **LIVE** production keys. Handle with care.

---

## Docker Stack Details

**Dockerfile**: `Dockerfile.prebuilt` — uses `node:20-slim` (NOT Alpine)  
> **Critical**: Must use `node:20-slim` (glibc) because `sharp@0.33.5` requires glibc.  
> Alpine will fail with a native module error.

**Stack dir on CT117**: `/opt/docker-sites/electricmall-nextjs/`

The build is pre-compiled on the dev machine. The Dockerfile expects:
```
/opt/docker-sites/electricmall-nextjs/
├── standalone/           ← .next/standalone contents
├── .next/static/         ← static assets
├── public/               ← public directory
└── Dockerfile.prebuilt
```

---

## Development Setup on CT117

CT117 currently has `git` but **no Node.js**. First-time setup:

```bash
# Install Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Install gh CLI
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
  > /etc/apt/sources.list.d/github-cli.list
apt update && apt install -y gh

gh auth login

# Clone the repo
cd /opt
git clone https://github.com/thelightville/electricmall-nextjs.git
cd electricmall-nextjs
git checkout master
npm install

# Create .env.local (copy values from PVE1 /root/electricmall-nextjs/.env.local)
nano .env.local
```

---

## Deployment Workflow (from CT117)

```bash
cd /opt/electricmall-nextjs

# 1. Build
rm -rf .next && npm run build

# 2. Stage build (Dockerfile expects standalone/ as a subdirectory)
rm -rf /tmp/em-deploy && mkdir -p /tmp/em-deploy/standalone /tmp/em-deploy/.next
cp -r .next/standalone/. /tmp/em-deploy/standalone/
cp -r .next/static /tmp/em-deploy/.next/static
cp -r public /tmp/em-deploy/public

# 3. Copy to Docker stack dir
cp -r /tmp/em-deploy/standalone/. /opt/docker-sites/electricmall-nextjs/standalone/
cp -r /tmp/em-deploy/.next/static   /opt/docker-sites/electricmall-nextjs/.next/static
cp -r /tmp/em-deploy/public         /opt/docker-sites/electricmall-nextjs/public

# 4. Rebuild image and restart
cd /opt/docker-sites/electricmall-nextjs
docker compose build --no-cache
docker compose up -d

# 5. Verify
curl -s -o /dev/null -w 'HTTP %{http_code}\n' -H 'Host: electricmall.myapps.com.ng' http://localhost:8040/
```

---

## WooCommerce / GraphQL Notes

- **GraphQL endpoint**: `https://electricmall.com.ng/graphql` (WPGraphQL plugin must be active)
- **Apollo config**: `src/lib/apollo-client.ts` — uses `possibleTypes` to resolve product interfaces correctly (critical — removing this breaks product slug resolution)
- **Cart token**: stored in `localStorage` (key: `woo-cart-token`) — persists across browser sessions
- **Auth**: NextAuth.js credentials provider → WooCommerce GraphQL login → JWT 30-day sessions

---

## Nginx Routing (managed on PVE1)

```bash
# To make changes, SSH to PVE1:
ssh root@172.16.16.20
nano /etc/nginx/sites-enabled/cloudflare-tunnel-proxy.conf
nginx -t && nginx -s reload
# Then sync to PVE2 and PVE3:
scp /etc/nginx/sites-enabled/cloudflare-tunnel-proxy.conf root@172.16.16.22:/etc/nginx/sites-enabled/
scp /etc/nginx/sites-enabled/cloudflare-tunnel-proxy.conf root@172.16.16.23:/etc/nginx/sites-enabled/
ssh root@172.16.16.22 "nginx -t && nginx -s reload"
ssh root@172.16.16.23 "nginx -t && nginx -s reload"
```

---

## Key Source Files

| File | Purpose |
|------|---------|
| `src/lib/apollo-client.ts` | Apollo Client + possibleTypes (critical for product slugs) |
| `src/lib/store-api.ts` | WooCommerce REST cart API, localStorage token |
| `src/app/layout.tsx` | Root layout + SEO metadata |
| `src/app/product/[slug]/page.tsx` | Product detail + JSON-LD structured data |
| `src/app/my-account/page.tsx` | NextAuth login + WooCommerce account |
| `src/components/layout/header.tsx` | Header with search, cart, account |
| `src/components/layout/footer.tsx` | Footer (logo variant=light) |
| `src/components/home/hero-slider.tsx` | 4-slide hero, 5.5s auto, mobile images |

---

## TODO / Remaining Work

- [ ] **[HIGH]** Checkout flow + Paystack payment integration
- [ ] **[MEDIUM]** My Orders page (list WooCommerce orders for logged-in user)
- [ ] **[MEDIUM]** Account details page (update name/email/password)
- [ ] **[LOW]** OG social share image (1200×630 branded asset)
- [ ] **[LOW]** Wishlist / Save for later feature
- [ ] Promote from staging (`electricmall.myapps.com.ng`) to production (`electricmall.com.ng`) once checkout is complete

---

## SSH Access to CT117

From within cluster: `ssh root@172.16.16.117`  
From outside: `ssh -p 2117 root@142.180.236.143`  
VS Code Remote SSH alias: `ct117`
