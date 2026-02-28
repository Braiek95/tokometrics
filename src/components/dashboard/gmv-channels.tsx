"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface DailyChannelData {
  date: string;
  liveStreamRevenue: number;
  shortVideoRevenue: number;
  mallRevenue: number;
  influencerRevenue: number;
}

const COLORS = {
  liveStream: "#f43f5e",
  shortVideo: "#8b5cf6",
  mall: "#3b82f6",
  influencer: "#f59e0b",
};

function formatYAxis(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
}

function formatTooltip(value: number) {
  return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function GmvChannels({ data }: { data: DailyChannelData[] }) {
  const { language } = useLanguage();

  const totals = data.reduce(
    (acc, d) => ({
      liveStream: acc.liveStream + d.liveStreamRevenue,
      shortVideo: acc.shortVideo + d.shortVideoRevenue,
      mall: acc.mall + d.mallRevenue,
      influencer: acc.influencer + d.influencerRevenue,
    }),
    { liveStream: 0, shortVideo: 0, mall: 0, influencer: 0 }
  );

  const totalGMV = totals.liveStream + totals.shortVideo + totals.mall + totals.influencer;

  const summaryCards = [
    { key: "liveStream", label: t(language, "liveStreamGMV"), value: totals.liveStream, color: COLORS.liveStream },
    { key: "shortVideo", label: t(language, "shortVideoGMV"), value: totals.shortVideo, color: COLORS.shortVideo },
    { key: "mall", label: t(language, "mallGMV"), value: totals.mall, color: COLORS.mall },
    { key: "influencer", label: t(language, "influencerGMV"), value: totals.influencer, color: COLORS.influencer },
  ];

  const chartData = data.map((d) => ({
    date: format(parseISO(d.date), "MM/dd"),
    [t(language, "liveStream")]: d.liveStreamRevenue,
    [t(language, "shortVideo")]: d.shortVideoRevenue,
    [t(language, "mall")]: d.mallRevenue,
    [t(language, "influencer")]: d.influencerRevenue,
  }));

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <Card>
        <CardHeader>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CardTitle className="text-base">{t(language, "gmvByChannel")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t(language, "totalGMV")}: $
              {totalGMV.toLocaleString("en-US", { maximumFractionDigits: 0 })}
            </p>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Cards */}
          <motion.div
            className="grid grid-cols-2 gap-3 sm:grid-cols-4"
            variants={staggerContainer(0.07, 0.1)}
            initial="hidden"
            animate="visible"
          >
            {summaryCards.map((card) => (
              <motion.div
                key={card.key}
                variants={{
                  hidden: { opacity: 0, y: 10, scale: 0.95 },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 240, damping: 22 } },
                }}
                whileHover={{ y: -2, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg border p-3 cursor-default"
                style={{
                  borderColor: card.color + "40",
                  backgroundColor: card.color + "08",
                }}
              >
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <p className="mt-1 text-sm font-bold" style={{ color: card.color }}>
                  ${card.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {totalGMV > 0 ? ((card.value / totalGMV) * 100).toFixed(1) : 0}%
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Stacked Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  interval={Math.floor(chartData.length / 8)}
                />
                <YAxis
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [formatTooltip(value), name]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey={t(language, "liveStream")} stackId="a" fill={COLORS.liveStream} isAnimationActive animationBegin={400} animationDuration={800} />
                <Bar dataKey={t(language, "shortVideo")} stackId="a" fill={COLORS.shortVideo} isAnimationActive animationBegin={500} animationDuration={800} />
                <Bar dataKey={t(language, "mall")} stackId="a" fill={COLORS.mall} isAnimationActive animationBegin={600} animationDuration={800} />
                <Bar dataKey={t(language, "influencer")} stackId="a" fill={COLORS.influencer} radius={[4, 4, 0, 0]} isAnimationActive animationBegin={700} animationDuration={800} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
