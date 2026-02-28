"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";
import { Store } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface ShopMetric {
  shopId: string;
  shopName: string;
  currency: string;
  revenue: number;
  orders: number;
  revenueRatio: number;
}

const SHOP_COLORS = [
  "#3b82f6",
  "#f43f5e",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
];

interface ShopComparisonProps {
  fromISO: string;
  toISO: string;
}

function ShopBar({
  ratio,
  color,
  index,
}: {
  ratio: number;
  color: string;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div ref={ref} className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={inView ? { width: `${ratio}%` } : { width: 0 }}
        transition={{
          delay: 0.3 + index * 0.1,
          type: "spring",
          stiffness: 55,
          damping: 14,
        }}
      />
    </div>
  );
}

export function ShopComparison({ fromISO, toISO }: ShopComparisonProps) {
  const { language } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ["shops-comparison", fromISO, toISO],
    queryFn: async () => {
      const res = await fetch(
        `/api/shops/comparison?from=${fromISO}&to=${toISO}`
      );
      if (!res.ok) throw new Error("Failed to fetch comparison");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t(language, "shopComparison")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.15 }}
              >
                <div className="h-4 w-40 rounded bg-muted" />
                <div className="h-2 w-full rounded-full bg-muted" />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data?.shops?.length) return null;

  const shops: ShopMetric[] = data.shops;
  const total: number = data.totalRevenue;

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CardTitle className="flex items-center gap-2 text-base">
              <Store className="h-4 w-4 text-primary" />
              {t(language, "shopComparison")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t(language, "totalRevenue")}: $
              {total.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
          </motion.div>
        </CardHeader>
        <CardContent>
          <motion.div
            className="space-y-4"
            variants={staggerContainer(0.1, 0.15)}
            initial="hidden"
            animate="visible"
          >
            {shops.map((shop, index) => {
              const color = SHOP_COLORS[index % SHOP_COLORS.length];
              return (
                <motion.div
                  key={shop.shopId}
                  className="space-y-1.5 cursor-default"
                  variants={{
                    hidden: { opacity: 0, y: 8 },
                    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 220, damping: 24 } },
                  }}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: color }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 + index * 0.08, type: "spring", stiffness: 300 }}
                      />
                      <span className="font-medium">{shop.shopName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span className="text-muted-foreground text-xs">
                        {shop.orders.toLocaleString()} {t(language, "orders")}
                      </span>
                      <span className="font-semibold">
                        ${shop.revenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </span>
                      <motion.span
                        className="w-12 text-right text-xs font-bold"
                        style={{ color }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        {shop.revenueRatio.toFixed(1)}%
                      </motion.span>
                    </div>
                  </div>
                  <ShopBar ratio={shop.revenueRatio} color={color} index={index} />
                </motion.div>
              );
            })}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
