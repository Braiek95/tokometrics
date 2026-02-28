# TikTokoMetrics - Setup Guide

## Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **PostgreSQL** 15+ (installed and running)
- **npm** (comes with Node.js)

---

## 1. Clone / Copy the Project

```bash
cd your-projects-folder
# copy or clone the tikshop-dash folder
cd tikshop-dash
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Set Up PostgreSQL Database

### 3a. Make sure PostgreSQL is running

**Windows:**
```bash
# Check if the service is running
sc query postgresql-x64-17
# Start it if not running
net start postgresql-x64-17
```

**Mac (Homebrew):**
```bash
brew services start postgresql@17
```

**Linux:**
```bash
sudo systemctl start postgresql
```

### 3b. Create the database

Open a terminal and run:

```bash
# Replace YOUR_PASSWORD with your actual postgres password
psql -U postgres -h localhost -c "CREATE DATABASE tikshop_dash;"
```

Or if you have pgAdmin, create a database called `tikshop_dash`.

## 4. Configure Environment Variables

Copy the example and edit:

```bash
cp .env.example .env
```

Or create a `.env` file in the project root with:

```env
# Database - UPDATE THE PASSWORD to your PostgreSQL password
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/tikshop_dash?schema=public"

# NextAuth
AUTH_SECRET="any-random-string-here-for-jwt-signing"
AUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
MOCK_MODE="true"
```

**Important:** Replace `YOUR_PASSWORD` with your actual PostgreSQL password for the `postgres` user.

If port 3000 is taken, change both `AUTH_URL` and `NEXT_PUBLIC_APP_URL` to your preferred port (e.g., `http://localhost:3333`).

## 5. Run Database Migrations

This creates all the tables:

```bash
npx prisma migrate dev
```

If prompted, just press Enter to accept the migration name.

## 6. Generate Prisma Client

```bash
npx prisma generate
```

## 7. Seed the Database (Demo Data)

This creates a demo user and 3 shops with 90 days of realistic data:

```bash
npx prisma db seed
```

You should see output like:
```
Creating demo user...
Creating shop: Glamour Beauty Co.
Creating shop: TechGadgets Asia
Creating shop: HomeStyle Living
--- Seed completed successfully! ---
```

## 8. Start the Dev Server

```bash
npm run dev
```

Open **http://localhost:3000** (or whatever port you configured).

---

## Demo Login Credentials

```
Email:    demo@tikshop.com
Password: demo123
```

---

## What You Can Do

- **Login/Register** - Create your own account or use the demo credentials
- **View Shops** - 3 pre-seeded shops with full data
- **Dashboard** - Revenue charts, order charts, category breakdown, 6 KPI metrics
- **Orders** - Paginated table with status filters and search
- **Products** - Product listing with category/status filters, ratings, stock levels
- **Revenue Analytics** - Detailed revenue page with date range picker
- **Connect New Shop** - Mock TikTok OAuth flow (creates a new shop with generated data)
- **Settings** - Shop settings (notifications, sync interval, revenue goals) and user settings
- **Dark Mode** - Toggle via the sun/moon icon in the header

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Backend | Next.js API Routes |
| Database | PostgreSQL + Prisma 7 |
| Auth | NextAuth v5 (JWT) |
| Charts | Recharts |
| State | TanStack React Query |

---

## Project Structure

```
tikshop-dash/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts             # Demo data seeder
│   └── migrations/         # SQL migrations
├── src/
│   ├── app/
│   │   ├── (auth)/         # Login & Register pages
│   │   ├── (dashboard)/    # Dashboard (sidebar + header + pages)
│   │   │   ├── shops/      # Shop listing
│   │   │   ├── shop/[shopId]/  # Per-shop pages (overview, orders, products, revenue, settings)
│   │   │   └── settings/   # User settings
│   │   ├── api/            # API routes (auth, shops, tiktok)
│   │   └── oauth/          # Mock TikTok OAuth page
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── layout/         # Sidebar, Header, ShopSwitcher
│   │   ├── dashboard/      # Charts, MetricCards
│   │   └── shared/         # DataTable, PageHeader, EmptyState
│   ├── lib/                # Prisma client, auth config, validators
│   ├── services/mock/      # Mock data generator
│   ├── providers/          # Theme, Session, Query providers
│   └── types/              # TypeScript types
├── .env                    # Environment variables (not committed)
└── next.config.ts          # Next.js config
```

---

## Troubleshooting

### "password authentication failed for user postgres"
Your PostgreSQL password in `.env` doesn't match. Update `DATABASE_URL` with the correct password.

### "database tikshop_dash does not exist"
Run: `psql -U postgres -h localhost -c "CREATE DATABASE tikshop_dash;"`

### Port already in use
Change the port: `npm run dev -- --port 3333` and update `.env` URLs to match.

### "Cannot find module @/generated/prisma/client"
Run: `npx prisma generate`

### Seed fails with unique constraint error
Reset and re-seed: `npx prisma migrate reset --force`
(This drops all data and re-applies migrations + seed)
