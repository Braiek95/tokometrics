"use client";

import { useState, use } from "react";
import { useQuery } from "@tanstack/react-query";
import { subDays } from "date-fns";
import { DollarSign, TrendingUp, TrendingDown, Download } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { OrdersChart } from "@/components/dashboard/orders-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { ChannelBreakdown } from "@/components/dashboard/channel-breakdown";
import { GmvChannels } from "@/components/dashboard/gmv-channels";
import { SalesTarget } from "@/components/dashboard/sales-target";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";
import { exportCSV } from "@/lib/export";
import { pageEnter, spring, ease } from "@/lib/animations";
import { toast } from "sonner";

const CATEGORY_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function PulseSkeleton({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`rounded-xl bg-muted/60 ${className}`}
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

const sectionVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { ...spring.gentle, delay: i * 0.09 },
  }),
};

export default function RevenuePage({ params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = use(params);
  const { language } = useLanguage();

  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const fromISO = dateRange.from.toISOString();
  const toISO = dateRange.to.toISOString();

  const { data: shopData } = useQuery({
    queryKey: ["shop", shopId],
    queryFn: async () => {
      const res = await fetch(`/api/shops/${shopId}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const { data: metricsData, isLoading: metricsLoading } = useQuery({
    queryKey: ["shop-metrics", shopId, fromISO, toISO],
    queryFn: async () => {
      const res = await fetch(`/api/shops/${shopId}/metrics?from=${fromISO}&to=${toISO}`);
      if (!res.ok) throw new Error("Failed to fetch metrics");
      return res.json();
    },
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ["shop-revenue", shopId, fromISO, toISO],
    queryFn: async () => {
      const res = await fetch(`/api/shops/${shopId}/revenue?from=${fromISO}&to=${toISO}`);
      if (!res.ok) throw new Error("Failed to fetch revenue");
      return res.json();
    },
  });

  const { data: categoryData, isLoading: categoryLoading } = useQuery({
    queryKey: ["shop-categories", shopId],
    queryFn: async () => {
      const res = await fetch(`/api/shops/${shopId}/categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const chartRevenueData = revenueData?.map((d: { date: string; revenue: number }) => ({ date: d.date, revenue: d.revenue })) ?? [];
  const chartOrdersData = revenueData?.map((d: { date: string; orderCount: number }) => ({ date: d.date, orders: d.orderCount })) ?? [];
  const chartCategoryData = categoryData?.map((d: { category: string; revenue: number }, i: number) => ({ category: d.category, revenue: d.revenue, fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length] })) ?? [];

  const totalRevenue = metricsData?.metrics?.revenue ?? 0;
  const revenueChange = metricsData?.changes?.revenue ?? 0;
  const currency = shopData?.shop?.currency ?? "USD";

  const channelData = metricsData?.metrics ? {
    liveStreamRevenue: metricsData.metrics.liveStreamRevenue ?? 0,
    shortVideoRevenue: metricsData.metrics.shortVideoRevenue ?? 0,
    mallRevenue: metricsData.metrics.mallRevenue ?? 0,
    influencerRevenue: metricsData.metrics.influencerRevenue ?? 0,
    liveStreamOrders: metricsData.metrics.liveStreamOrders ?? 0,
    shortVideoOrders: metricsData.metrics.shortVideoOrders ?? 0,
    mallOrders: metricsData.metrics.mallOrders ?? 0,
    influencerOrders: metricsData.metrics.influencerOrders ?? 0,
  } : null;

  const isPositive = revenueChange > 0;
  const isNegative = revenueChange < 0;

  return (
    <motion.div
      className="space-y-6"
      variants={pageEnter}
      initial="hidden"
      animate="visible"
    >
      <PageHeader title={t(language, "revenue")} description={t(language, "salesTrend")}>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => {
            if (revenueData?.length) {
              exportCSV(revenueData.map((d: any) => ({ date: d.date, revenue: d.revenue, orders: d.orderCount })), "revenue_report");
              toast.success(t(language, "exportSuccess"));
            }
          }} disabled={!revenueData?.length}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            CSV
          </Button>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
      </PageHeader>

      {/* ① Revenue Headline */}
      <motion.div custom={0} variants={sectionVariant}>
        {metricsLoading ? (
          <PulseSkeleton className="h-[100px]" />
        ) : (
          <Card className="overflow-hidden border">
            {/* Accent bar */}
            <motion.div
              className="h-[3px] bg-gradient-to-r from-primary via-primary/50 to-transparent"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.25, duration: 0.55, ease: ease.out }}
            />
            <CardContent className="flex items-center gap-6 pt-5 pb-5">
              <motion.div
                className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10"
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...spring.snap, delay: 0.15 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <DollarSign className="h-8 w-8 text-primary" />
              </motion.div>

              <div className="space-y-1">
                <motion.p
                  className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {t(language, "totalRevenue")}
                </motion.p>
                <motion.h2
                  className="text-3xl font-bold tracking-tight tabular-nums"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring.gentle, delay: 0.22 }}
                >
                  ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </motion.h2>
                <motion.p
                  className="flex items-center gap-1.5 text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.span
                    className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                      isPositive ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : isNegative ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                    }`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ ...spring.snap, delay: 0.35 }}
                  >
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : isNegative ? <TrendingDown className="h-3 w-3" /> : null}
                    {revenueChange > 0 ? "+" : ""}{revenueChange.toFixed(1)}%
                  </motion.span>
                  {t(language, "vsPreviousPeriod")}
                </motion.p>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* ② Targets */}
      <motion.div custom={1} variants={sectionVariant}>
        {metricsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[0,1,2].map(i => <PulseSkeleton key={i} className="h-[120px]" />)}
          </div>
        ) : metricsData?.targets ? (
          <SalesTarget
            monthlyGoal={metricsData.targets.monthlyGoal}
            annualGoal={metricsData.targets.annualGoal}
            monthlyRevenue={metricsData.targets.monthlyRevenue}
            annualRevenue={metricsData.targets.annualRevenue}
            monthlyProgress={metricsData.targets.monthlyProgress}
            annualProgress={metricsData.targets.annualProgress}
            todayRevenue={metricsData.targets.todayRevenue}
            currency={currency}
          />
        ) : null}
      </motion.div>

      {/* ③ Revenue Chart */}
      <motion.div custom={2} variants={sectionVariant}>
        {revenueLoading ? <PulseSkeleton className="h-[360px]" /> : <RevenueChart data={chartRevenueData} />}
      </motion.div>

      {/* ④ Channel Breakdown */}
      <motion.div custom={3} variants={sectionVariant}>
        {metricsLoading ? <PulseSkeleton className="h-[300px]" /> : channelData ? <ChannelBreakdown data={channelData} /> : null}
      </motion.div>

      {/* ⑤ GMV by Channel */}
      <motion.div custom={4} variants={sectionVariant}>
        {revenueLoading ? <PulseSkeleton className="h-[300px]" /> : revenueData?.length ? <GmvChannels data={revenueData} /> : null}
      </motion.div>

      {/* ⑥ Orders + Category */}
      <motion.div custom={5} variants={sectionVariant} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {revenueLoading ? <PulseSkeleton className="h-[300px]" /> : <OrdersChart data={chartOrdersData} />}
        {categoryLoading ? <PulseSkeleton className="h-[300px]" /> : chartCategoryData.length > 0 ? <CategoryChart data={chartCategoryData} /> : null}
      </motion.div>
    </motion.div>
  );
}
