"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";
import { ShoppingCart, DollarSign, CalendarDays } from "lucide-react";

interface PeriodData {
  revenue: number;
  orders: number;
}

interface PeriodSalesProps {
  today: PeriodData;
  monthly: PeriodData;
  annual: PeriodData;
  currency?: string;
}

function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function PeriodContent({
  revenue,
  orders,
  currency,
  revenueLabel,
  ordersLabel,
  icon: Icon,
  color,
}: {
  revenue: number;
  orders: number;
  currency: string;
  revenueLabel: string;
  ordersLabel: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <motion.div
      className="flex items-center gap-4 py-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <motion.div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: color + "20" }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 350, damping: 20 }}
      >
        <Icon className="h-6 w-6" style={{ color }} />
      </motion.div>
      <div className="flex flex-1 gap-6">
        <div>
          <p className="text-xs text-muted-foreground">{revenueLabel}</p>
          <motion.p
            className="text-xl font-bold tracking-tight"
            style={{ color }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 250, damping: 22 }}
          >
            {formatCurrency(revenue, currency)}
          </motion.p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{ordersLabel}</p>
          <motion.p
            className="text-xl font-bold tracking-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 250, damping: 22 }}
          >
            {orders.toLocaleString()}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}

export function PeriodSales({
  today,
  monthly,
  annual,
  currency = "USD",
}: PeriodSalesProps) {
  const { language } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 24 }}
    >
      <Card>
        <CardContent className="pt-4">
          <Tabs defaultValue="today">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">{t(language, "today")}</TabsTrigger>
              <TabsTrigger value="monthly">{t(language, "thisMonth")}</TabsTrigger>
              <TabsTrigger value="annual">{t(language, "thisYear")}</TabsTrigger>
            </TabsList>

            <TabsContent value="today" className="mt-4">
              <PeriodContent
                revenue={today.revenue}
                orders={today.orders}
                currency={currency}
                revenueLabel={t(language, "totalRevenue")}
                ordersLabel={t(language, "totalOrders")}
                icon={CalendarDays}
                color="#8b5cf6"
              />
            </TabsContent>

            <TabsContent value="monthly" className="mt-4">
              <PeriodContent
                revenue={monthly.revenue}
                orders={monthly.orders}
                currency={currency}
                revenueLabel={t(language, "totalRevenue")}
                ordersLabel={t(language, "totalOrders")}
                icon={DollarSign}
                color="#3b82f6"
              />
            </TabsContent>

            <TabsContent value="annual" className="mt-4">
              <PeriodContent
                revenue={annual.revenue}
                orders={annual.orders}
                currency={currency}
                revenueLabel={t(language, "totalRevenue")}
                ordersLabel={t(language, "totalOrders")}
                icon={ShoppingCart}
                color="#10b981"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
