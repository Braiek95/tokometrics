"use client";

import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";
import { fadeUp } from "@/lib/animations";

interface OrdersChartProps {
  data: { date: string; orders: number }[];
}

export function OrdersChart({ data }: OrdersChartProps) {
  const { language } = useLanguage();

  const chartConfig = {
    orders: {
      label: t(language, "orders"),
      color: "hsl(var(--chart-2))",
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
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <CardTitle>{t(language, "orders")}</CardTitle>
          </motion.div>
        </CardHeader>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={data} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value: string) => {
                    try { return format(parseISO(value), "MMM dd"); } catch { return value; }
                  }}
                />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value: string) => {
                        try { return format(parseISO(value), "MMM dd, yyyy"); } catch { return value; }
                      }}
                    />
                  }
                />
                <Bar
                  dataKey="orders"
                  fill="var(--color-orders)"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive
                  animationBegin={350}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </motion.div>
      </Card>
    </motion.div>
  );
}
