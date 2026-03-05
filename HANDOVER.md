# Electric Mall - Development Handover

**Last Updated:** March 5, 2026  
**Handover From:** PVE (Proxmox Host)  
**Handover To:** CT117 (172.16.16.117) SSH Session

---

## 🌐 Live URLs & Deployment Status

### Production Sites
| Domain | URL | Container Port | Public Port | Status |
|--------|-----|----------------|-------------|--------|
| **Electric Mall (Next.js)** | https://electricmall.myapps.com.ng | 3000 | 8040 | ✅ **LIVE** |
| Electric Mall (WooCommerce) | https://electricmall.com.ng | 80 | 8019 | ✅ **LIVE** (Backend) |

### Admin Access
- **WP Admin:** https://electricmall.com.ng/wp-admin
- **WooCommerce:** https://electricmall.com.ng/wp-admin/admin.php?page=wc-admin

### Cloudflare Tunnels
- Managed on PVE host via `cloudflared`
- Configuration: `/root/.cloudflare/tunnel_config.json` (PVE)
- Traffic flow: `Internet → Cloudflare → PVE Tunnel → CT117:8040` (Next.js)
- Traffic flow: `Internet → Cloudflare → PVE Tunnel → CT117:8019` (WooCommerce)

---

## 🏗️ Full Architecture

### Infrastructure Overview
```
┌─────────────────────────────────────────────────────────────┐
│  PVE Host (Proxmox 8.x) - 172.16.16.1                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Cloudflare Tunnel (cloudflared)                      │  │
│  │  Routes:                                              │  │
│  │  - electricmall.myapps.com.ng → CT117:8040 (Next.js) │  │
│  │  - electricmall.com.ng → CT117:8019 (WooCommerce)    │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  CT117 - Docker Host (172.16.16.117)                  │  │
│  │  - Privileged LXC container                           │  │
│  │  - Docker CE 27.x                                     │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Electric Mall Next.js Stack                    │  │  │
│  │  │  Network: electricmall-nextjs_default           │  │  │
│  │  │                                                  │  │  │
│  │  │  ┌────────────────────────────────────────────┐  │  │  │
│  │  │  │ electricmall-nextjs                        │  │  │  │
│  │  │  │ Tech: Next.js 14, React, Node 22          │  │  │  │
│  │  │  │ Port: 8040→3000                           │  │  │  │
│  │  │  │ WooCommerce API: http://172.16.16.117:8019│  │  │  │
│  │  │  │ Standalone build, health checks           │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                        │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │  Electric Mall WooCommerce Stack                │  │  │
│  │  │  Network: electricmallcomng_site-network        │  │  │
│  │  │                                                  │  │  │
│  │  │  ┌────────────────────────────────────────────┐  │  │  │
│  │  │  │ electricmall.com.ng-nginx (Port 8019→80)  │  │  │  │
│  │  │  │ electricmall.com.ng-php (WP + WooCommerce)│  │  │  │
│  │  │  │ electricmall.com.ng-mysql (Product DB)    │  │  │  │
│  │  │  │ WordPress API exposed via /wp-json/       │  │  │  │
│  │  │  └────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack
- **Framework:** Next.js 14 (App Router, React 18)
- **Node:** 22.x
- **Backend:** WooCommerce REST API + WPGraphQL
- **Styling:** Tailwind CSS 3.x
- **State:** React Context (Cart, Auth)
- **Payment:** WooCommerce native checkout
- **Build:** Standalone output, Docker

---

## 📦 Docker Containers & Networking

### Active Containers on CT117
```bash
# Next.js Frontend (Port 8040)
docker ps | grep "electricmall-nextjs"

electricmall-nextjs   # Next.js app

# WooCommerce Backend (Port 8019)
docker ps | grep "electricmall.com.ng"

electricmall.com.ng-nginx
electricmall.com.ng-php      # WordPress + WooCommerce
electricmall.com.ng-mysql
```

### Networks
```bash
# List networks
pct exec 117 -- docker network ls | grep electricmall

electricmall-nextjs_default           # Next.js network
electricmallcomng_site-network        # WooCommerce network
```

---

## 🔐 Environment Variables & Secrets

### Next.js Environment (.env.local)
**Location:** In Docker image or `/opt/docker-sites/electricmall-nextjs/.env.local` on CT117

```env
# WooCommerce API
NEXT_PUBLIC_WC_STORE_URL=http://172.16.16.117:8019
WC_CONSUMER_KEY=************  # ⚠️ Secret - WooCommerce API key
WC_CONSUMER_SECRET=************  # ⚠️ Secret

# App config
NEXT_PUBLIC_SITE_URL=https://electricmall.myapps.com.ng
NODE_ENV=production
```

### WooCommerce Configuration
**Location:** WordPress admin → WooCommerce → Settings → Advanced → REST API

- **API User:** Create dedicated API user with read/write permissions
- **Keys:** Generate via WP admin → WooCommerce → Settings → Advanced → REST API
- **Note:** Store Consumer Key/Secret securely, needed for Next.js .env

---

## 🛠️ Dev Toolchain Setup on CT117

### Prerequisites
```bash
# SSH into CT117
ssh root@172.16.16.117

# Required software
docker --version        # Docker 27.x
docker compose version  # V2
node --version          # Node 22+
npm --version           # npm 10+
```

### Clone Repository on CT117
```bash
# SSH into CT117
ssh root@172.16.16.117

# Clone from GitHub
cd /root
git clone git@github.com:thelightville/electricmall-nextjs.git
cd electricmall-nextjs

# Checkout master branch
git checkout master
git pull origin master
```

### Install Dependencies
```bash
# On CT117, inside the cloned repo
cd /root/electricmall-nextjs

# Install dependencies
npm install

# Build Next.js standalone
npm run build
```

---

## 🚀 Deployment Workflow from CT117

### Method 1: Deploy via Docker Compose (Recommended)
```bash
# SSH into CT117
cd /opt/docker-sites/electricmall-nextjs

# Pull latest code
git pull origin master

# Rebuild and restart
docker compose down
docker compose build --no-cache
docker compose up -d

# Verify
curl -I http://localhost:8040/
```

### Method 2: Hot Deploy (Quick Updates)
```bash
# SSH into CT117
cd /root/electricmall-nextjs

# Pull changes
git pull origin master

# Rebuild
npm install
npm run build

# Copy standalone to running container
docker cp .next/standalone electricmall-nextjs:/app/
docker cp public electricmall-nextjs:/app/public/
docker cp .next/static electricmall-nextjs:/app/.next/static/

# Restart container
docker restart electricmall-nextjs
```

### Method 3: Deploy Script (Automated)
```bash
# Use included deploy.sh script
cd /root/electricmall-nextjs
./deploy.sh

# Script performs:
# - Git pull
# - npm install & build
# - Docker rebuild
# - Container restart
```

---

## 🔧 Infrastructure Dependencies (External to CT117)

### Managed on PVE Host
1. **Cloudflare Tunnel** (`cloudflared`)
   - Config: `/root/.cloudflare/tunnel_config.json`
   - Service: `systemctl status cloudflared@electricmall-tunnel`
   - Routes:
     - `electricmall.myapps.com.ng` → `http://172.16.16.117:8040`
     - `electricmall.com.ng` → `http://172.16.16.117:8019`
   - Restart: `systemctl restart cloudflared@electricmall-tunnel`

2. **Container Lifecycle**
   - CT117 starts on PVE boot
   - Containers have `restart: unless-stopped` policy

### DNS Configuration (Cloudflare Dashboard)
- **electricmall.myapps.com.ng** → CNAME to Cloudflare Tunnel UUID
- **electricmall.com.ng** → CNAME to Cloudflare Tunnel UUID
- Proxy: ✅ Enabled (orange cloud)
- SSL/TLS: Full (strict)

---

## ⚠️ Known Issues & TODO Items

### Recent Fixes (Commit d679cfd)
1. **✅ Cart Persistence** - Switched from sessionStorage to localStorage
2. **✅ Remove Cart Item** - Fixed API method from DELETE to POST
3. **✅ Remove Coupon** - Fixed API method from DELETE to POST
4. **✅ Brand Logos** - Added 11 electrical brand logos
5. **✅ Logo Variations** - Added 3 ElectricMall logo variants
6. **✅ Hero Slider** - Added homepage hero slider component
7. **✅ Middleware** - Added Next.js middleware for routing

### TODO List
- [ ] Set up proper product image optimization (WebP)
- [ ] Add product search functionality
- [ ] Implement product filtering (category, price, brand)
- [ ] Add user authentication (WooCommerce customer accounts)
- [ ] Implement order tracking
- [ ] Add payment gateway integration (Paystack/Flutterwave)
- [ ] Set up email notifications (order confirmations)
- [ ] Add product reviews and ratings
- [ ] Implement wishlist functionality
- [ ] Add SEO metadata for all pages
- [ ] Set up analytics (Google Analytics/Plausible)
- [ ] Add error monitoring (Sentry)

---

## 🔑 SSH Access to Target Host

### CT117 (Docker Host)
```bash
# From PVE or any host with access
ssh root@172.16.16.117

# From external (via PVE stream proxy)
ssh -p 2117 root@142.180.236.143

# Container shell access
pct enter 117  # From PVE host only
```

### GitHub SSH Keys
**Location on CT117:** `/root/.ssh/id_rsa` (deploy key)

```bash
# Test GitHub access from CT117
ssh -T git@github.com
# Should return: "Hi thelightville! You've successfully authenticated..."
```

---

## 📊 Current Deployment Status Summary

### Last Deployment
- **Commit:** `d679cfd` (fix: cart persistence, remove item API, coupon removal)
- **Date:** March 5, 2026
- **Deployed By:** Manual deployment
- **Status:** ✅ **PRODUCTION LIVE**

### Recent Commits
```
d679cfd - fix: cart persistence, remove item API, coupon removal (Latest)
92b9be2 - feat: fix product slugs, images, logo + world-class visual redesign
ee6b388 - fix: port 8040, Suspense boundaries, default exports, type fixes
0eba86b - feat: initial ElectricMall Next.js 14 headless storefront
```

### Verified Pages
- ✅ Homepage (/) → Product showcases, hero slider, brands
- ✅ Shop (/shop) → Product listing
- ✅ Product Pages (/product/[slug]) → Product details, add to cart
- ✅ Cart (/cart) → Cart management, quantity updates, remove items
- ✅ Checkout (/checkout) → WooCommerce checkout integration
- ✅ Order Complete (/checkout/complete) → Order confirmation

### Git Status
```bash
On branch master
Your branch is up to date with 'origin/master'.
nothing to commit, working tree clean
```

---

## 🛒 WooCommerce Integration Details

### API Endpoints Used
```
# WordPress REST API v2 endpoints
GET  /wp-json/wc/store/v1/products
GET  /wp-json/wc/store/v1/products/:id
GET  /wp-json/wc/store/v1/products/categories

# Cart API  (WooCommerce Store API)
GET  /wp-json/wc/store/v1/cart
POST /wp-json/wc/store/v1/cart/add-item
POST /wp-json/wc/store/v1/cart/update-item
POST /wp-json/wc/store/v1/cart/remove-item  # ⚠️ Uses POST, not DELETE
POST /wp-json/wc/store/v1/cart/apply-coupon
POST /wp-json/wc/store/v1/cart/remove-coupon  # ⚠️ Uses POST, not DELETE

# Checkout
POST /wp-json/wc/store/v1/checkout
```

### Cart Token Management
- **Storage:** `localStorage` (key: `woo-cart-token`)
- **Persistence:** Survives browser restarts
- **Cleared:** On order completion or manual clear
- **Important:** Session tokens are stored locally, not on server

---

## 🔗 Quick Reference Links

| Resource | Location |
|----------|----------|
| **Live Site** | https://electricmall.myapps.com.ng |
| **WooCommerce Backend** | https://electricmall.com.ng/wp-admin |
| **GitHub Repo** | https://github.com/thelightville/electricmall-nextjs |
| **Latest Commit** | https://github.com/thelightville/electricmall-nextjs/commit/d679cfd |
| **Docker Container** | `ssh root@172.16.16.117` → `docker ps \| grep electricmall` |
| **Container Logs** | `docker logs electricmall-nextjs` |
| **WooCommerce Logs** | WP Admin → WooCommerce → Status → Logs |

---

## 📞 Support Contacts

For deployment issues:
- **Infrastructure:** Check CT117 status on PVE: `pct status 117`
- **Cloudflare Tunnel:** Restart on PVE: `systemctl restart cloudflared@electricmall-tunnel`
- **Next.js Issues:** Check container logs: `docker logs electricmall-nextjs`
- **WooCommerce Issues:** Check WP logs or contact WooCommerce support
- **Cart/Checkout Issues:** Verify WooCommerce Store API is enabled in WP Admin

---

## 🚨 Critical Notes

### Cart API Method Changes
**Recent fix (commit d679cfd):** WooCommerce Store API requires **POST** requests for:
- `/cart/remove-item` (was incorrectly using DELETE)
- `/cart/remove-coupon` (was incorrectly using DELETE)

If you see cart removal errors, verify these endpoints use POST with body payload.

### Product Images
All product images are managed in WooCommerce. Next.js uses `next/image` with:
- Remote patterns configured for WooCommerce media
- Automatic image optimization
- Lazy loading enabled

### Performance
- Next.js uses ISR (Incremental Static Regeneration) for product pages
- Cache revalidation: 60 seconds default
- Product data cached client-side in React Context

---

**End of Handover Document**  
*All information current as of March 5, 2026*  
*Next review: After first deployment from CT117 SSH session*  
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
