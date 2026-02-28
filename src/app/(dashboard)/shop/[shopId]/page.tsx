"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { motion } from "framer-motion";
import { LayoutGrid, BarChart3, Package, Radio, FileText, LogOut } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { MetricGrid } from "@/components/dashboard/metric-grid";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { OrdersChart } from "@/components/dashboard/orders-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { SalesTarget } from "@/components/dashboard/sales-target";
import { PeriodSales } from "@/components/dashboard/period-sales";
import { ChannelBreakdown } from "@/components/dashboard/channel-breakdown";
import { GmvChannels } from "@/components/dashboard/gmv-channels";
import { LiveStreamRooms } from "@/components/dashboard/livestream-rooms";
import { ProductRanking } from "@/components/dashboard/product-ranking";
import { ShopComparison } from "@/components/dashboard/shop-comparison";
import { Button } from "@/components/ui/button";
import type { MetricData } from "@/types";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";
import { exportPDF } from "@/lib/export-pdf";

const CATEGORY_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

type TabKey = "overview" | "channels" | "products" | "live";

const TABS: { key: TabKey; icon: React.ElementType; enLabel: string; zhLabel: string }[] = [
  { key: "overview", icon: LayoutGrid, enLabel: "Overview", zhLabel: "概览" },
  { key: "channels", icon: BarChart3, enLabel: "Channels", zhLabel: "渠道" },
  { key: "products", icon: Package, enLabel: "Products", zhLabel: "产品" },
  { key: "live", icon: Radio, enLabel: "Live Stream", zhLabel: "直播" },
];

function PulseSkeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-muted/60 ${className}`} />;
}

export default function ShopOverviewPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = use(params);
  const { language } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const fromISO = dateRange.from.toISOString();
  const toISO = dateRange.to.toISOString();

  // ─── Queries ──────────────────────────────────
  const { data: shopData } = useQuery({
    queryKey: ["shop", shopId],
    queryFn: () => fetch(`/api/shops/${shopId}`).then((r) => r.json()),
  });

  const { data: metricsData, isLoading: mL } = useQuery({
    queryKey: ["shop-metrics", shopId, fromISO, toISO],
    queryFn: () => fetch(`/api/shops/${shopId}/metrics?from=${fromISO}&to=${toISO}`).then((r) => r.json()),
  });

  const { data: revenueData, isLoading: rL } = useQuery({
    queryKey: ["shop-revenue", shopId, fromISO, toISO],
    queryFn: () => fetch(`/api/shops/${shopId}/revenue?from=${fromISO}&to=${toISO}`).then((r) => r.json()),
  });

  const { data: categoryData, isLoading: cL } = useQuery({
    queryKey: ["shop-categories", shopId],
    queryFn: () => fetch(`/api/shops/${shopId}/categories`).then((r) => r.json()),
  });

  const { data: productsData, isLoading: pL } = useQuery({
    queryKey: ["shop-products-ranking", shopId],
    queryFn: () => fetch(`/api/shops/${shopId}/products?pageSize=20&sortBy=totalRevenue&sortOrder=desc`).then((r) => r.json()),
  });

  const { data: roomsData, isLoading: lL } = useQuery({
    queryKey: ["shop-livestream-rooms", shopId, fromISO, toISO],
    queryFn: () => fetch(`/api/shops/${shopId}/livestream-rooms?from=${fromISO}&to=${toISO}`).then((r) => r.json()),
  });

  // ─── Derived data ─────────────────────────────
  const shopName = shopData?.shop?.name ?? "Overview";
  const currency = shopData?.shop?.currency ?? "USD";
  const currencySymbol = new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 0 }).format(0).replace(/[\d.,\s]/g, "").trim() || currency;
  const md = metricsData;

  const metrics: MetricData[] = md?.metrics
    ? [
        { label: t(language, "totalRevenue"), value: md.metrics.revenue ?? 0, change: md.changes?.revenue ?? 0, prefix: currencySymbol },
        { label: t(language, "totalOrders"), value: md.metrics.orders ?? 0, change: md.changes?.orders ?? 0 },
        { label: t(language, "unitsSold"), value: md.metrics.unitsSold ?? 0, change: md.changes?.unitsSold ?? 0 },
        { label: t(language, "avgOrderValue"), value: md.metrics.aov ?? 0, change: md.changes?.aov ?? 0, prefix: currencySymbol },
        { label: t(language, "conversionRate"), value: md.metrics.conversionRate ?? 0, change: md.changes?.conversionRate ?? 0, suffix: "%" },
        { label: t(language, "newCustomers"), value: md.metrics.newCustomers ?? 0, change: md.changes?.newCustomers ?? 0 },
      ]
    : [];

  const revenueArr = Array.isArray(revenueData) ? revenueData : [];
  const categoryArr = Array.isArray(categoryData) ? categoryData : [];

  const chartRevenue = revenueArr.map((d: any) => ({ date: d.date, revenue: d.revenue }));
  const chartOrders = revenueArr.map((d: any) => ({ date: d.date, orders: d.orderCount }));
  const chartCategory = categoryArr.map((d: any, i: number) => ({
    category: d.category,
    revenue: d.revenue,
    fill: CATEGORY_COLORS[i % 5],
  }));

  const channelData = md?.metrics
    ? {
        liveStreamRevenue: md.metrics.liveStreamRevenue ?? 0,
        shortVideoRevenue: md.metrics.shortVideoRevenue ?? 0,
        mallRevenue: md.metrics.mallRevenue ?? 0,
        influencerRevenue: md.metrics.influencerRevenue ?? 0,
        liveStreamOrders: md.metrics.liveStreamOrders ?? 0,
        shortVideoOrders: md.metrics.shortVideoOrders ?? 0,
        mallOrders: md.metrics.mallOrders ?? 0,
        influencerOrders: md.metrics.influencerOrders ?? 0,
      }
    : null;

  // ─── Export ───────────────────────────────────
  function handleExport() {
    exportPDF({
      shopName,
      currency,
      dateRange: {
        from: dateRange.from.toISOString().split("T")[0],
        to: dateRange.to.toISOString().split("T")[0],
      },
      metrics: md?.metrics ? {
        revenue: md.metrics.revenue ?? 0,
        orders: md.metrics.orders ?? 0,
        unitsSold: md.metrics.unitsSold ?? 0,
        aov: md.metrics.aov ?? 0,
        conversionRate: md.metrics.conversionRate ?? 0,
        newCustomers: md.metrics.newCustomers ?? 0,
      } : undefined,
      channels: channelData ? {
        liveStreamRevenue: channelData.liveStreamRevenue,
        shortVideoRevenue: channelData.shortVideoRevenue,
        mallRevenue: channelData.mallRevenue,
        influencerRevenue: channelData.influencerRevenue,
      } : undefined,
      revenueData: revenueArr,
      language,
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeader title={shopName} description={t(language, "dashboard")}>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => router.push("/shops")}>
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            {t(language, "exitShop")}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={mL}>
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            PDF
          </Button>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </PageHeader>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-muted/50 p-1 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {language === "zh" ? tab.zhLabel : tab.enLabel}
            </button>
          );
        })}
      </div>

      {/* ═══════ OVERVIEW ═══════ */}
      {activeTab === "overview" && (
        <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Period Sales */}
          {mL ? <PulseSkeleton className="h-[90px]" /> : md?.period ? (
            <PeriodSales today={md.period.today} monthly={md.period.monthly} annual={md.period.annual} currency={currency} />
          ) : null}

          {/* Targets */}
          {mL ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <PulseSkeleton className="h-[120px]" />
              <PulseSkeleton className="h-[120px]" />
              <PulseSkeleton className="h-[120px]" />
            </div>
          ) : md?.targets ? (
            <SalesTarget
              monthlyGoal={md.targets.monthlyGoal} annualGoal={md.targets.annualGoal}
              monthlyRevenue={md.targets.monthlyRevenue} annualRevenue={md.targets.annualRevenue}
              monthlyProgress={md.targets.monthlyProgress} annualProgress={md.targets.annualProgress}
              todayRevenue={md.targets.todayRevenue} currency={currency}
            />
          ) : null}

          {/* KPI Grid */}
          {mL ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((i) => <PulseSkeleton key={i} className="h-[110px]" />)}
            </div>
          ) : metrics.length > 0 ? <MetricGrid metrics={metrics} /> : null}

          {/* Revenue + Orders Charts */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {rL ? <><PulseSkeleton className="h-[360px]" /><PulseSkeleton className="h-[360px]" /></> : (
              <>
                {chartRevenue.length > 0 && <RevenueChart data={chartRevenue} />}
                {chartOrders.length > 0 && <OrdersChart data={chartOrders} />}
              </>
            )}
          </div>

          {/* Shop Comparison */}
          <ShopComparison fromISO={fromISO} toISO={toISO} />
        </motion.div>
      )}

      {/* ═══════ CHANNELS ═══════ */}
      {activeTab === "channels" && (
        <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {mL ? <PulseSkeleton className="h-[300px]" /> : channelData ? <ChannelBreakdown data={channelData} /> : null}
          {rL ? <PulseSkeleton className="h-[300px]" /> : revenueArr.length > 0 ? <GmvChannels data={revenueArr} /> : null}
          {cL ? <PulseSkeleton className="h-[300px]" /> : chartCategory.length > 0 ? <CategoryChart data={chartCategory} /> : null}
        </motion.div>
      )}

      {/* ═══════ PRODUCTS ═══════ */}
      {activeTab === "products" && (
        <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {pL ? <PulseSkeleton className="h-[300px]" /> : productsData?.data?.length > 0 ? <ProductRanking products={productsData.data} /> : null}
          {cL ? <PulseSkeleton className="h-[300px]" /> : chartCategory.length > 0 ? <CategoryChart data={chartCategory} /> : null}
        </motion.div>
      )}

      {/* ═══════ LIVE STREAM ═══════ */}
      {activeTab === "live" && (
        <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {lL ? <PulseSkeleton className="h-[300px]" /> : roomsData?.roomSummary?.length > 0 ? <LiveStreamRooms roomSummary={roomsData.roomSummary} /> : null}
          {rL ? <PulseSkeleton className="h-[300px]" /> : revenueArr.length > 0 ? <GmvChannels data={revenueArr} /> : null}
        </motion.div>
      )}
    </div>
  );
}
