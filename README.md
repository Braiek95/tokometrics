# TokoMetrics 🛍️

**TokoMetrics** is a powerful analytics and management dashboard for TikTok Shop merchants. Connect your TikTok Shop account and get a complete view of your sales, orders, products, and revenue — all in one place.

🌐 **Live:** [tokometrics.com](https://tokometrics.com)

---

## Features

- 📊 **Sales Analytics** — Daily, monthly, and annual revenue tracking with trend charts
- 🎯 **Revenue Targets** — Monitor progress toward monthly and annual goals with completion rates
- 📺 **Channel Breakdown** — Live stream, short video, mall, and influencer sales contribution ratios
- 📈 **Daily GMV** — Per-channel GMV tracking (live/video/mall/influencer)
- 📦 **Product Ranking** — Best-selling products with performance metrics
- 🏪 **Multi-Shop** — Connect and compare multiple TikTok shops with sales ratios
- 🌏 **Bilingual** — Full English and Chinese (中文) support including legal pages
- 🌙 **Dark Mode** — System, light, and dark themes
- 🔔 **Feishu Integration** — Webhook notifications for shop events and daily reports
- 🔒 **Security** — Rate limiting, input sanitization, CSRF protection, HMAC-signed OAuth state

---

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Database:** PostgreSQL + Prisma ORM v7
- **Auth:** NextAuth.js v5 (JWT + Credentials)
- **UI:** Tailwind CSS v4 + shadcn/ui + Radix UI
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Language:** TypeScript

---

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-username/tokometrics.git
cd tokometrics
npm install
```

> `npm install` will automatically run `prisma generate` (postinstall script).

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values. See `.env.example` for all available options.

### 3. Set up the database

```bash
npm run db:push      # Create tables
npm run db:seed      # Seed demo data
```

Demo account:
- **Email:** `demo@tokometrics.com`
- **Password:** `demo123`

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## TikTok Shop API Approval Guide

### Step 1: Deploy the app

Deploy to Vercel, Railway, or any hosting with HTTPS:

```bash
# Vercel
npx vercel --prod

# Or push to GitHub and connect to Railway/Render
```

Set all environment variables from `.env.example` in your hosting dashboard.

### Step 2: Register at TikTok Shop Partner Center

1. Go to [TikTok Shop Partner Center](https://partner.tiktokshop.com)
2. Register as a **Technology Partner**
3. Create a new app with the following details:

| Field | Value |
|-------|-------|
| App Name | TokoMetrics |
| App Description | Merchant analytics dashboard for TikTok Shop — sales tracking, channel analytics, product ranking, and multi-shop comparison |
| Redirect URI | `https://yourdomain.com/api/tiktok/callback` |
| Privacy Policy URL | `https://yourdomain.com/privacy` |
| Terms of Service URL | `https://yourdomain.com/terms` |

### Step 3: Request API Scopes

Request these read-only scopes:

| Scope | Purpose |
|-------|---------|
| `shop.base.read` | Shop profile, name, status, currency |
| `order.base.read` | Order analytics and reporting |
| `product.base.read` | Product performance ranking |
| `finance.data.read` | Revenue tracking and target monitoring |

### Step 4: Configure environment

After TikTok approves your app, update `.env`:

```env
TIKTOK_CLIENT_ID="your-app-key"
TIKTOK_CLIENT_SECRET="your-app-secret"
MOCK_MODE="false"
```

### TikTok Review Checklist

Before submitting for review, verify:

- [x] HTTPS enabled on live URL
- [x] Privacy Policy page accessible (bilingual EN/ZH)
- [x] Terms of Service page accessible (bilingual EN/ZH)
- [x] OAuth redirect URI matches exactly
- [x] Only read-only API scopes requested
- [x] Clear data usage description in Privacy Policy
- [x] User can revoke access (disconnect shop)
- [x] Demo account available for TikTok reviewers
- [x] Error handling on all API routes
- [x] Rate limiting on auth and sensitive routes
- [x] Security headers (CSP, X-Content-Type-Options, Referrer-Policy)

---

## Feishu / Lark Integration

TokoMetrics can send notifications to Feishu (飞书) via webhook:

1. Create a Feishu Bot in your group chat
2. Copy the webhook URL
3. Set `FEISHU_WEBHOOK_URL` in `.env`

Supported notifications:
- 🔗 Shop connected/disconnected
- 📊 Daily sales reports
- 🎉 Target achievements
- ❌ Sync errors

For Feishu Open API (spreadsheet sync), also set `FEISHU_APP_ID` and `FEISHU_APP_SECRET`.

---

## Security Features

| Feature | Implementation |
|---------|---------------|
| Authentication | NextAuth.js v5 with JWT sessions |
| Password hashing | bcrypt (12 rounds) |
| OAuth CSRF protection | HMAC-SHA256 signed state with nonce + timestamp |
| Rate limiting | In-memory rate limiter (auth: 10/min, API: 60/min, strict: 5/min) |
| Input sanitization | XSS prevention via HTML escaping and tag stripping |
| Security headers | CSP, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| Route protection | Middleware-based auth check on all dashboard routes |
| Data ownership | All API routes verify shop belongs to authenticated user |
| Error logging | Structured logging with context on all API routes |

---

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |

---

## Legal

- [Privacy Policy](https://tokometrics.com/privacy) (English + 中文)
- [Terms of Service](https://tokometrics.com/terms) (English + 中文)

---

## License

MIT © [TokoMetrics](https://tokometrics.com)
