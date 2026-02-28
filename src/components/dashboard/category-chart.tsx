"use client";

import { motion } from "framer-motion";
import { Pie, PieChart, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fadeUp, staggerContainer } from "@/lib/animations";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";

interface CategoryChartProps {
  data: { category: string; revenue: number; fill: string }[];
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

function buildChartConfig(
  data: { category: string; revenue: number; fill: string }[]
): ChartConfig {
  const config: ChartConfig = {};
  data.forEach((item, index) => {
    config[item.category] = {
      label: item.category,
      color: item.fill || COLORS[index % COLORS.length],
    };
  });
  return config;
}

function formatRevenue(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
}

export function CategoryChart({ data }: CategoryChartProps) {
  const { language } = useLanguage();
  const chartConfig = buildChartConfig(data);
  const total = data.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
    >
      <Card>
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <CardTitle>{t(language, "revenueByCategory")}</CardTitle>
          </motion.div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 160, damping: 22 }}
            >
              <ChartContainer
                config={chartConfig}
                className="h-[250px] w-[250px] shrink-0"
              >
                <PieChart accessibilityLayer>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => formatRevenue(Number(value))}
                        nameKey="category"
                      />
                    }
                  />
                  <Pie
                    data={data}
                    dataKey="revenue"
                    nameKey="category"
                    innerRadius={60}
                    outerRadius={100}
                    strokeWidth={2}
                    stroke="hsl(var(--background))"
                    isAnimationActive
                    animationBegin={200}
                    animationDuration={900}
                    animationEasing="ease-out"
                  >
                    {data.map((entry, index) => (
                      <Cell
                        key={entry.category}
                        fill={entry.fill || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </motion.div>

            <motion.div
              className="flex flex-col gap-2"
              variants={staggerContainer(0.07, 0.35)}
              initial="hidden"
              animate="visible"
            >
              {data.map((item, index) => {
                const percentage =
                  total > 0 ? ((item.revenue / total) * 100).toFixed(1) : "0.0";
                const color = item.fill || COLORS[index % COLORS.length];

                return (
                  <motion.div
                    key={item.category}
                    className="flex items-center gap-2 cursor-default"
                    variants={{
                      hidden: { opacity: 0, x: -10 },
                      visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 220, damping: 24 } },
                    }}
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className="h-3 w-3 shrink-0 rounded-sm"
                      style={{ backgroundColor: color }}
                      whileHover={{ scale: 1.3 }}
                      transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {item.category}
                    </span>
                    <span className="ml-auto text-sm font-medium tabular-nums pl-4">
                      {percentage}%
                    </span>
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
