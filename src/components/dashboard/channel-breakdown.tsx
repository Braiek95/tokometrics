"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";
import { Radio, Video, ShoppingBag, Users } from "lucide-react";
import { fadeUp, staggerContainer, listItem } from "@/lib/animations";

interface ChannelData {
  liveStreamRevenue: number;
  shortVideoRevenue: number;
  mallRevenue: number;
  influencerRevenue: number;
  liveStreamOrders: number;
  shortVideoOrders: number;
  mallOrders: number;
  influencerOrders: number;
}

const CHANNEL_COLORS = {
  liveStream: "#f43f5e",
  shortVideo: "#8b5cf6",
  mall: "#3b82f6",
  influencer: "#f59e0b",
};

const CHANNEL_ICONS = {
  liveStream: Radio,
  shortVideo: Video,
  mall: ShoppingBag,
  influencer: Users,
};

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
}

function ChannelBar({
  percent,
  color,
  delay,
}: {
  percent: number;
  color: string;
  delay: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <div ref={ref} className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={inView ? { width: `${percent}%` } : { width: 0 }}
        transition={{ delay, type: "spring", stiffness: 55, damping: 14 }}
      />
    </div>
  );
}

export function ChannelBreakdown({ data }: { data: ChannelData }) {
  const { language } = useLanguage();

  const total =
    data.liveStreamRevenue +
    data.shortVideoRevenue +
    data.mallRevenue +
    data.influencerRevenue;

  const totalOrders =
    data.liveStreamOrders +
    data.shortVideoOrders +
    data.mallOrders +
    data.influencerOrders;

  const channels = [
    {
      key: "liveStream" as const,
      label: t(language, "liveStream"),
      revenue: data.liveStreamRevenue,
      orders: data.liveStreamOrders,
    },
    {
      key: "shortVideo" as const,
      label: t(language, "shortVideo"),
      revenue: data.shortVideoRevenue,
      orders: data.shortVideoOrders,
    },
    {
      key: "mall" as const,
      label: t(language, "mall"),
      revenue: data.mallRevenue,
      orders: data.mallOrders,
    },
    {
      key: "influencer" as const,
      label: t(language, "influencer"),
      revenue: data.influencerRevenue,
      orders: data.influencerOrders,
    },
  ];

  const pieData = channels.map((c) => ({
    name: c.label,
    value: c.revenue,
    color: CHANNEL_COLORS[c.key],
  }));

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -1 }}
      transition={{ duration: 0.25 }}
    >
      <Card>
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CardTitle className="text-base">{t(language, "channelContribution")}</CardTitle>
          </motion.div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Pie Chart */}
            <motion.div
              className="flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 180, damping: 22 }}
            >
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={900}
                    animationEasing="ease-out"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      t(language, "revenue"),
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Channel List */}
            <motion.div
              className="space-y-3"
              variants={staggerContainer(0.08, 0.25)}
              initial="hidden"
              animate="visible"
            >
              {channels.map((channel, i) => {
                const revenueRatio = total > 0 ? (channel.revenue / total) * 100 : 0;
                const ordersRatio = totalOrders > 0 ? (channel.orders / totalOrders) * 100 : 0;
                const Icon = CHANNEL_ICONS[channel.key];
                const color = CHANNEL_COLORS[channel.key];

                return (
                  <motion.div
                    key={channel.key}
                    variants={listItem}
                    className="space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="flex h-6 w-6 items-center justify-center rounded"
                          style={{ backgroundColor: color + "20" }}
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                          <Icon className="h-3.5 w-3.5" style={{ color }} />
                        </motion.div>
                        <span className="text-sm font-medium">{channel.label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold">
                          {formatCurrency(channel.revenue)}
                        </span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {revenueRatio.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <ChannelBar
                      percent={revenueRatio}
                      color={color}
                      delay={0.3 + i * 0.08}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {channel.orders.toLocaleString()} {t(language, "orders")}
                      </span>
                      <span>
                        {ordersRatio.toFixed(1)}% {t(language, "contribution")}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
