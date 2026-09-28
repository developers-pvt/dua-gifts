# 🎁 GIFT STUDIO — Project Memory & Operations Guide

> **Last Updated:** September 2026  
> **Repository Root:** `/mnt/f/GIFT_STUDIO` (`F:\GIFT_STUDIO`)

---

## 📌 1. Project Overview & Architecture

**GIFT STUDIO** is a production-ready consolidated gift commerce platform where customers can combine curated in-store gifts with external shopping URLs (Zara, Amazon, Sephora, Etsy, Apple, etc.) into **one gift hamper**, pay once via unified checkout, and track fulfillment through a 6-stage pipeline (Procurement $\rightarrow$ Quality Check $\rightarrow$ Gift Assembly $\rightarrow$ Packaging $\rightarrow$ Shipping $\rightarrow$ Delivery).

### Core Components
```text
GIFT_STUDIO/
├── backend/
│   └── apps/backend/           # Medusa JS v2 Headless E-Commerce & Admin API (Port 9000)
│       ├── src/
│       │   ├── admin/routes/   # Custom Admin Dashboards (Employee Hub & Manager Hub)
│       │   ├── api/store/      # Store APIs (gift-orders, shop-anywhere, ai-gift, etc.)
│       │   └── services/       # AI & Marketplace scraping providers
│       ├── scripts/            # Embedded PostgreSQL starter & seed scripts
│       └── medusa-config.ts    # Medusa configuration & CORS settings
│
├── frontend-shopco/            # Shop.co Customer Storefront - Next.js 14 App Router (Port 3000)
│   ├── src/
│   │   ├── app/                # Pages: /, /shop, /shop-anywhere, /create-gift, /track
│   │   └── lib/medusa.ts       # Typed Medusa Client & Store API functions
│   └── package.json
│
├── start-dev.bat               # Windows one-click startup batch script
└── memory.md                   # System state, troubleshooting memory, and hosting guide
```

---

## 🛠️ 2. Local Development & Service Ports

| Service | Local Address | Details / Credentials |
| :--- | :--- | :--- |
| **Customer Storefront** | [http://localhost:3000](http://localhost:3000) | Next.js 14 App Router storefront |
| **Medusa Admin Dashboard** | [http://localhost:9000/app](http://localhost:9000/app) | **Email:** `admin@giftstudio.com`<br>**Password:** `admin123` |
| **Medusa Backend API** | [http://localhost:9000](http://localhost:9000) | Health endpoint: `http://localhost:9000/health` |
| **PostgreSQL Database** | `localhost:5433` | Embedded Postgres, user `postgres`, pass `password`, DB `medusa_db` |

---

## 🔍 3. Solved Local Environment Issues (Troubleshooting Memory)

### Issue: Missing Module / Broken Junctions (`G:\GIFT_STUDIO`)
* **Symptom:** Running backend commands or `scripts/start-db.mjs` failed with `Cannot find package 'embedded-postgres'` or broken module resolutions.
* **Root Cause:** 
  - The project was originally configured on Windows with NTFS junctions linking to `G:\GIFT_STUDIO\...`.
  - When `start-dev.bat` ran `subst G: "%~dp0"`, it mapped drive `G:` directly to `F:\GIFT_STUDIO\`. Consequently, `G:\GIFT_STUDIO` did not exist on drive `G:`, breaking all junction resolutions.
* **Fix Applied:**
  - Remapped virtual drive `G:` to `F:\` (`subst G: F:\`) so `G:\GIFT_STUDIO` properly points to `F:\GIFT_STUDIO\`.
  - Updated `start-dev.bat` to dynamically resolve `%~dp0..` so future runs automatically maintain the correct mapping:
    ```bat
    if not exist G:\GIFT_STUDIO\ (
        if exist G:\ subst G: /d >nul 2>&1
        for %%i in ("%~dp0..") do set "PARENT_DIR=%%~fi"
        subst G: "!PARENT_DIR!"
    )
    ```

### Issue: Missing Frontend Linkage
* **Symptom:** Next.js dev server in `frontend-shopco` failed to find local `next` executable and stalled on supply-chain/purging prompts.
* **Fix Applied:** 
  - Ran `pnpm install --ignore-workspace --config.confirmModulesPurge=false` inside `frontend-shopco` with non-interactive flags.

---

## 🚀 4. Production Hosting & Go-Live Guide

### Architecture Topology
```text
[ Customers ]
     │ (HTTPS)
     ▼
[ Next.js Storefront ] (Vercel)
     │ (API Calls)
     ▼
[ Medusa v2 Backend & Admin ] (Railway / Render)
     │                │
     ▼                ▼
[ PostgreSQL DB ]  [ Redis ]
(Supabase / Neon)  (Upstash)
```

### Option A: Standard Modern Cloud Stack (Recommended)

#### 1. Managed PostgreSQL & Redis
* **PostgreSQL:** Create a database on [Supabase](https://supabase.com) or [Neon](https://neon.tech).
  - Copy the pooler/direct connection string: `DATABASE_URL=postgres://user:pass@host:port/dbname`.
* **Redis:** Create a Redis instance on [Upstash](https://upstash.com) or [Railway](https://railway.app) for event bus and workflow caching.

#### 2. Deploy Medusa Backend (`backend/apps/backend`)
* **Host:** [Railway](https://railway.app) or [Render](https://render.com).
* **Root Directory:** `backend/apps/backend`
* **Build Command:** `pnpm install && npx medusa build`
* **Start Command:** `npx medusa start`
* **Required Environment Variables:**
  ```env
  NODE_ENV=production
  PORT=9000
  DATABASE_URL=postgres://... (From Supabase/Neon)
  REDIS_URL=redis://... (From Upstash)
  JWT_SECRET=production_random_strong_jwt_secret
  COOKIE_SECRET=production_random_strong_cookie_secret
  STORE_CORS=https://your-store.vercel.app,https://yourdomain.com
  ADMIN_CORS=https://your-backend.up.railway.app,https://yourdomain.com
  AUTH_CORS=https://your-store.vercel.app,https://your-backend.up.railway.app
  ```
* **Database Setup:** Run `npx medusa db:migrate` and create an admin user with `npx medusa user --email admin@yourstore.com --password YourStrongPassword`.
* **Live URLs Generated:**
  - API Base: `https://your-backend.up.railway.app`
  - Admin App: `https://your-backend.up.railway.app/app`

#### 3. Deploy Storefront (`frontend-shopco`)
* **Host:** [Vercel](https://vercel.com).
* **Root Directory:** `frontend-shopco`
* **Framework Preset:** Next.js
* **Required Environment Variables:**
  ```env
  NEXT_PUBLIC_MEDUSA_URL=https://your-backend.up.railway.app
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_giftstudio_web_99182
  ```
* Click **Deploy** to publish the customer-facing storefront.

#### 4. Custom Domains & DNS
* **Storefront:** Map `yourdomain.com` and `www.yourdomain.com` via CNAME to Vercel.
* **Backend API:** Map `api.yourdomain.com` via CNAME to Railway/Render.
* Update `STORE_CORS`, `ADMIN_CORS`, and `NEXT_PUBLIC_MEDUSA_URL` to the production domain.

---

### Option B: All-in-One VPS (DigitalOcean / Hetzner / AWS Lightsail)
* Cost: ~$6 - $12/month total.
* Setup: Run an Ubuntu server with Docker Compose containing:
  - Container 1: `postgres:16`
  - Container 2: `redis:7`
  - Container 3: Medusa Backend
  - Container 4: Next.js Frontend
  - Nginx Reverse Proxy with Let's Encrypt SSL (`certbot`).

---

## 📋 5. Pre-Launch Production Checklist

1. [ ] **Rotate Secrets:** Generate cryptographically secure values for `JWT_SECRET` and `COOKIE_SECRET`.
2. [ ] **Payment Provider:** Configure Stripe / PayPal / regional payment gateway in Medusa.
3. [ ] **Cloud Asset Storage:** Configure AWS S3, Cloudflare R2, or Cloudinary for persistent custom gift photo uploads.
4. [ ] **Transactional Email:** Set up Resend or SendGrid for automated customer order notifications and 6-stage tracking updates.

---

## 🇮🇳 6. India Localization, Apple UI, Speed & Inbuilt Browser Upgrades

1. **Performance & Speed**:
   - Enabled `compress: true`, `swcMinify: true`, and `experimental.optimizePackageImports` in `next.config.mjs`.
   - Removed blocking `priority` preloads from all product cards, footer badges, and navbar icons; implemented `loading="lazy"` and device image sizing.
   - Updated `start-dev.bat` with Next.js Turbopack flag (`--turbo`) for instant on-demand local compilation.
   - Replaced linear array searches in `giftstudio-products.ts` with an $O(1)$ fast lookup Map.

2. **India Localization**:
   - Converted all currencies across storefront, cart, checkout, and catalog to Indian Rupee (`₹` INR) with `toLocaleString("en-IN")`.
   - Replaced all Pakistani references with Indian locations (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Pune), festivals (Diwali, Rakhi, Karwa Chauth, Indian Weddings), and premier institutions (IITs, NITs, BITS, AIIMS).
   - Localized customer reviews, footer badges (UPI, RuPay, NetBanking, COD), and brand headers.

3. **Modern Apple-Style UI**:
   - Applied minimalist Apple design system: frosted glassmorphic navigation (`backdrop-blur-xl bg-white/80`), refined micro-shadows, delicate borders (`border-black/[0.06]`), and pill buttons.
   - Rebuilt Hero header with keynote-style typography, ambient gradients, interactive stats, and Apple workflow card.

4. **Dynamic Checkout System**:
   - Created `/checkout` route with Indian address validation (PIN code, 24+ Indian states/UTs, +91 phone numbers).
   - Removed all hardcoded totals and shipping fees; implemented dynamic tier calculations (Free delivery on orders $\ge$ ₹999).
   - Added working promo code engine (`FIRSTGIFT`, `DIWALI20`, `WELCOME10`, `FREESHIP`).
   - Integrated Indian payment selection (UPI / QR, Cards, Net Banking, COD).
   - Resilient order persistence in local storage and Medusa backend with instant tracking redirect.

5. **Inbuilt Indian Marketplace Browser**:
   - Integrated live in-browser experience inside `/shop-anywhere` with Apple-style browser chrome (traffic lights, omnibar, back/forward, URL bar).
   - Live search and switcher tabs for **Flipkart**, **Shopsy**, **Meesho**, **Amazon India**, and **Nykaa**.
   - Direct **"Add to Gift Studio Cart"** button on every product that immediately updates Redux cart and triggers floating Apple toast notification.
   - Direct external link verification and product inspector modal.

