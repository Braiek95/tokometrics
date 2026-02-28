"use client";

import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";
import { fadeUp } from "@/lib/animations";

interface RevenueChartProps {
  data: { date: string; revenue: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  const { language } = useLanguage();

  const chartConfig = {
    revenue: {
      label: t(language, "revenue"),
      color: "hsl(var(--chart-1))",
    },
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
    >
      <Card className="overflow-hidden">
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <CardTitle>{t(language, "revenue")}</CardTitle>
          </motion.div>
        </CardHeader>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(var(--chart-1))" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/40" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => {
                    try { return format(parseISO(v), "MMM d"); } catch { return v; }
                  }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
                  }
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, t(language, "revenue")]}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  fill="url(#revenueGrad)"
                  isAnimationActive
                  animationBegin={300}
                  animationDuration={1000}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </motion.div>
      </Card>
    </motion.div>
  );
}
