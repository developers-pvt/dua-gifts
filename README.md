# 🎁 GIFT STUDIO — Consolidated Gift Commerce Platform

> **Core Idea:** Customers can combine curated products from your store + supported external shopping sources (Amazon, Zara, Sephora, Etsy, Apple, etc.) into **one gift hamper**, **pay you once**, and you handle the sourcing, consolidation, 100% quality check, luxury packaging, and delivery.

---

## 🏛️ System Architecture

```text
GIFT_STUDIO/
├── backend/                      # Medusa JS v2 Headless E-Commerce Backend (Port 9000)
│   └── apps/backend/
│       ├── src/
│       │   ├── admin/routes/     # Custom Medusa Admin Dashboard Extensions
│       │   │   ├── employee-hub/ # Employee Workstation ("See → Work → Complete")
│       │   │   └── manager-hub/  # Manager Control Room ("See → Understand → Act")
│       │   ├── api/store/        # Store API routes (gift orders, shop anywhere, AI gift)
│       │   │   ├── gift-orders/
│       │   │   ├── shop-anywhere/
│       │   │   ├── ai-gift/
│       │   │   └── gift-operations/ (orders, tasks, ai-tools)
│       │   ├── services/         # Gift business store & providers (AI, Marketplace)
│       │   └── medusa-config.ts
│       └── scripts/              # Embedded PostgreSQL and key management
│
└── frontend-shopco/              # Shop.co Next.js 14 Customer Storefront (Port 3000)
    └── src/
        ├── app/
        │   ├── page.tsx          # Homepage with Gift Value Prop & Workflow Visualizer
        │   ├── shop/             # Our Products (Curated Store Gift Catalog)
        │   ├── shop-anywhere/    # URL Scraper & External Partner Product Importer
        │   ├── create-gift/      # Interactive Gift Builder with Single Checkout (Pay Once)
        │   └── track/            # Real-Time 6-Stage Consolidated Tracking
        └── lib/
            └── medusa.ts         # Medusa Client & Typed API Functions
```

---

## 🎁 Gift Business Workflow

```text
CUSTOMER
   ↓
SHOP.CO FRONTEND (http://localhost:3000)
   ↓
┌──────────────────────────┬──────────────────────────┐
│   Our Products           │   Shop Anywhere 🌐       │
│   (Curated Store Gifts)  │   (Zara, Amazon, Sephora,│
│                          │    Etsy, Apple, etc.)    │
└────────────┬─────────────┴────────────┬─────────────┘
             └─────────────┬────────────┘
                           ↓
                     CREATE GIFT 🎁
                           ↓
              Add Message + Luxury Packaging
              (Velvet Box, Satin Ribbon, Wax Seal, AI Note)
                           ↓
                     Add Recipient
                           ↓
                 PAY ONCE (Unified Checkout)
                           ↓
                  MEDUSA ORDER CREATED
                           ↓
        ┌──────────────────┴──────────────────┐
        ↓                                     ↓
   Our Products                         External Products
   (Reserved in Inventory)              (Procurement Pipeline)
        ↓                                     ↓
        └──────────────────┬──────────────────┘
                           ↓
                     All Items Arrive
                           ↓
                      QUALITY CHECK
                           ↓
                     GIFT ASSEMBLY
                           ↓
                        PACKING
                           ↓
                       SHIPPING
                           ↓
                       DELIVERY
```

---

## 🌐 Portals & URLs

### 1. Customer Storefront (Shop.co — `http://localhost:3000`)
- **Homepage:** `http://localhost:3000`
- **Our Products:** `http://localhost:3000/shop`
- **Shop Anywhere 🌐:** `http://localhost:3000/shop-anywhere`
- **Create Gift 🎁:** `http://localhost:3000/create-gift`
- **Track Order:** `http://localhost:3000/track?orderNumber=GFT-84920`

### 2. Medusa Admin Dashboard (`http://localhost:9000/app`)
- **Login:** `admin@giftstudio.com` / `admin123`
- **Employee Hub (In Admin Sidebar):** `http://localhost:9000/app/employee-hub`
  - Action board for Procurement, Quality Inspection, Gift Assembly, and Dispatch.
- **Manager Hub (In Admin Sidebar):** `http://localhost:9000/app/manager-hub`
  - Real-time fulfillment pipeline metrics, stage progression, AI Photo-to-Product creator, and AI Delay Assistant.
- **Core Medusa Admin:** Products, Orders, Inventory, Customers, Pricing, and Settings.
