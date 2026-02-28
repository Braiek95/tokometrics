"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";
import { Radio, Users, Eye, DollarSign } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/animations";

interface RoomSummary {
  roomName: string;
  totalRevenue: number;
  totalOrders: number;
  totalViewers: number;
  totalGmv: number;
  sessionCount: number;
  avgRevenuePerSession: number;
  hosts: string[];
}

interface LiveStreamRoomsProps {
  roomSummary: RoomSummary[];
}

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

function formatNumber(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toLocaleString();
}

const ROOM_COLORS = [
  "#f43f5e", "#8b5cf6", "#3b82f6", "#f59e0b",
  "#10b981", "#ec4899", "#06b6d4", "#f97316",
];

export function LiveStreamRooms({ roomSummary }: LiveStreamRoomsProps) {
  const { language } = useLanguage();

  if (!roomSummary || roomSummary.length === 0) return null;

  const totalRevenue = roomSummary.reduce((sum, r) => sum + r.totalRevenue, 0);
  const totalViewers = roomSummary.reduce((sum, r) => sum + r.totalViewers, 0);
  const totalSessions = roomSummary.reduce((sum, r) => sum + r.sessionCount, 0);

  const chartData = roomSummary.map((r, i) => ({
    name: r.roomName,
    revenue: r.totalRevenue,
    orders: r.totalOrders,
    fill: ROOM_COLORS[i % ROOM_COLORS.length],
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
            <CardTitle className="flex items-center gap-2 text-base">
              <Radio className="h-4 w-4 text-rose-500" />
              {t(language, "liveStreamRooms")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t(language, "totalRooms")}: {roomSummary.length} · {t(language, "sessions")}: {totalSessions}
            </p>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <motion.div
            className="grid grid-cols-3 gap-3"
            variants={staggerContainer(0.07, 0.1)}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 240, damping: 22 } },
              }}
              className="rounded-lg border p-3 text-center"
            >
              <DollarSign className="mx-auto h-4 w-4 text-rose-500 mb-1" />
              <p className="text-lg font-bold text-rose-500">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">{t(language, "totalRevenue")}</p>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 240, damping: 22 } },
              }}
              className="rounded-lg border p-3 text-center"
            >
              <Eye className="mx-auto h-4 w-4 text-blue-500 mb-1" />
              <p className="text-lg font-bold text-blue-500">{formatNumber(totalViewers)}</p>
              <p className="text-xs text-muted-foreground">{t(language, "viewers")}</p>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 240, damping: 22 } },
              }}
              className="rounded-lg border p-3 text-center"
            >
              <Users className="mx-auto h-4 w-4 text-violet-500 mb-1" />
              <p className="text-lg font-bold text-violet-500">{totalSessions}</p>
              <p className="text-xs text-muted-foreground">{t(language, "sessions")}</p>
            </motion.div>
          </motion.div>

          {/* Bar Chart - Revenue by Room */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" height={50} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), t(language, "revenue")]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="revenue"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive
                  animationBegin={400}
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <motion.rect key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Room Detail Cards */}
          <div className="space-y-2">
            {roomSummary.map((room, i) => {
              const revenueRatio = totalRevenue > 0 ? ((room.totalRevenue / totalRevenue) * 100).toFixed(1) : "0";
              const color = ROOM_COLORS[i % ROOM_COLORS.length];

              return (
                <motion.div
                  key={room.roomName}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06, type: "spring", stiffness: 200, damping: 22 }}
                  whileHover={{ backgroundColor: "hsl(var(--muted)/0.4)", x: 2 }}
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors cursor-default"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: color + "18" }}
                    >
                      <Radio className="h-4 w-4" style={{ color }} />
                    </div>
                    <div>
                      <p className="font-medium text-xs">{room.roomName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {room.hosts.length > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            {room.hosts.slice(0, 2).join(", ")}
                          </span>
                        )}
                        <Badge variant="outline" className="py-0 text-[10px]">
                          {room.sessionCount} {t(language, "sessions")}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-xs font-semibold" style={{ color }}>
                        {formatCurrency(room.totalRevenue)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{revenueRatio}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(room.totalViewers)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{t(language, "viewers")}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(room.avgRevenuePerSession)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{t(language, "avgPerSession")}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
