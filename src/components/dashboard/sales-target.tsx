"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";
import { Target, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { fadeUp } from "@/lib/animations";

interface SalesTargetProps {
  monthlyGoal: number;
  annualGoal: number;
  monthlyRevenue: number;
  annualRevenue: number;
  monthlyProgress: number;
  annualProgress: number;
  todayRevenue: number;
  currency?: string;
}

function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function AnimatedProgressBar({
  percent,
  color,
  delay = 0.3,
}: {
  percent: number;
  color: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div ref={ref} className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={inView ? { width: `${clamped}%` } : { width: 0 }}
        transition={{
          delay,
          type: "spring",
          stiffness: 50,
          damping: 15,
        }}
      />
      {/* Shimmer sweep */}
      {inView && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%)`,
            backgroundSize: "200% 100%",
          }}
          initial={{ backgroundPosition: "-200% 0" }}
          animate={{ backgroundPosition: "200% 0" }}
          transition={{ delay: delay + 0.2, duration: 0.8, ease: "easeOut" }}
        />
      )}
    </div>
  );
}

function AnimatedCount({
  value,
  currency,
}: {
  value: number;
  currency: string;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {formatCurrency(value, currency)}
    </motion.span>
  );
}

export function SalesTarget({
  monthlyGoal,
  annualGoal,
  monthlyRevenue,
  annualRevenue,
  monthlyProgress,
  annualProgress,
  todayRevenue,
  currency = "USD",
}: SalesTargetProps) {
  const { language } = useLanguage();

  const getStatus = (progress: number) => {
    if (progress >= 100)
      return { text: t(language, "aheadOfTarget"), color: "#10b981", icon: TrendingUp };
    if (progress >= 70)
      return { text: t(language, "onTrack"), color: "#3b82f6", icon: TrendingUp };
    return { text: t(language, "behindTarget"), color: "#f59e0b", icon: TrendingDown };
  };

  const monthlyStatus = getStatus(monthlyProgress);
  const annualStatus = getStatus(annualProgress);

  const cards = [
    {
      label: t(language, "today"),
      icon: Minus,
      color: "#8b5cf6",
      gradient: "from-violet-500/10 to-violet-600/5",
      content: (
        <>
          <p className="text-2xl font-bold tracking-tight">
            <AnimatedCount value={todayRevenue} currency={currency} />
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{t(language, "totalRevenue")}</p>
        </>
      ),
    },
    {
      label: t(language, "monthlyTarget"),
      icon: Target,
      color: "#3b82f6",
      gradient: "from-blue-500/10 to-blue-600/5",
      content: (
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold tracking-tight">
              <AnimatedCount value={monthlyRevenue} currency={currency} />
            </p>
            <p className="mb-0.5 text-sm text-muted-foreground">
              / {formatCurrency(monthlyGoal, currency)}
            </p>
          </div>
          <AnimatedProgressBar percent={monthlyProgress} color={monthlyStatus.color} delay={0.5} />
          <div className="flex items-center justify-between text-xs">
            <motion.span
              className="font-semibold"
              style={{ color: monthlyStatus.color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {monthlyProgress.toFixed(1)}% {t(language, "completed")}
            </motion.span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <monthlyStatus.icon className="h-3 w-3" style={{ color: monthlyStatus.color }} />
              {monthlyStatus.text}
            </span>
          </div>
        </div>
      ),
    },
    {
      label: t(language, "annualTarget"),
      icon: Target,
      color: "#10b981",
      gradient: "from-emerald-500/10 to-emerald-600/5",
      content: (
        <div className="space-y-3">
          <div className="flex items-end justify-between">
            <p className="text-2xl font-bold tracking-tight">
              <AnimatedCount value={annualRevenue} currency={currency} />
            </p>
            <p className="mb-0.5 text-sm text-muted-foreground">
              / {formatCurrency(annualGoal, currency)}
            </p>
          </div>
          <AnimatedProgressBar percent={annualProgress} color={annualStatus.color} delay={0.6} />
          <div className="flex items-center justify-between text-xs">
            <motion.span
              className="font-semibold"
              style={{ color: annualStatus.color }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {annualProgress.toFixed(1)}% {t(language, "completed")}
            </motion.span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <annualStatus.icon className="h-3 w-3" style={{ color: annualStatus.color }} />
              {annualStatus.text}
            </span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          variants={fadeUp}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -2 }}
          style={{ transition: "transform 0.2s ease" }}
        >
          <Card
            className={`border-0 bg-gradient-to-br ${card.gradient} overflow-hidden`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <motion.div
                  className="flex h-7 w-7 items-center justify-center rounded-lg"
                  style={{ backgroundColor: card.color + "25" }}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 280, damping: 22 }}
                >
                  <card.icon className="h-4 w-4" style={{ color: card.color }} />
                </motion.div>
                {card.label}
              </CardTitle>
            </CardHeader>
            <CardContent>{card.content}</CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
