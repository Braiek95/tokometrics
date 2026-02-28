"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  Target,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import type { MetricData } from "@/types";
import { staggerContainer } from "@/lib/animations";

const iconMap: Record<string, LucideIcon> = {
  // English
  Revenue: DollarSign,
  "Total Revenue": DollarSign,
  Orders: ShoppingCart,
  "Total Orders": ShoppingCart,
  "Units Sold": Package,
  AOV: TrendingUp,
  "Avg. Order Value": TrendingUp,
  Conversion: Target,
  "Conversion Rate": Target,
  Customers: Users,
  "New Customers": Users,
  // Chinese
  总营收: DollarSign,
  总订单数: ShoppingCart,
  销售数量: Package,
  平均订单价值: TrendingUp,
  转化率: Target,
  新客户: Users,
};

interface MetricGridProps {
  metrics: MetricData[];
}

export function MetricGrid({ metrics }: MetricGridProps) {
  return (
    <motion.div
      className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      variants={staggerContainer(0.07, 0)}
      initial="hidden"
      animate="visible"
    >
      {metrics.map((metric, i) => (
        <MetricCard
          key={metric.label}
          title={metric.label}
          value={metric.value}
          change={metric.change}
          prefix={metric.prefix}
          suffix={metric.suffix}
          icon={iconMap[metric.label] ?? DollarSign}
          index={i}
        />
      ))}
    </motion.div>
  );
}
