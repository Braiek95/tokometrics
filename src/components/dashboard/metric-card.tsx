"use client";

import { useEffect, useRef } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { spring, ease, cardLift, accentLine, iconPop } from "@/lib/animations";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  index?: number;
}

// Smooth spring-driven number counter
function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const motionVal = useMotionValue(0);
  const display = useSpring(motionVal, spring.counter);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    return display.on("change", (latest) => {
      if (!ref.current) return;
      let f: string;
      if (latest >= 1_000_000) f = `${(latest / 1_000_000).toFixed(1)}M`;
      else if (latest >= 1_000) f = `${(latest / 1_000).toFixed(1)}k`;
      else f = latest.toLocaleString("en-US", { maximumFractionDigits: 2 });
      ref.current.textContent = `${prefix}${f}${suffix}`;
    });
  }, [display, prefix, suffix]);

  // Static initial value (server-compatible)
  let init: string;
  if (value >= 1_000_000) init = `${(value / 1_000_000).toFixed(1)}M`;
  else if (value >= 1_000) init = `${(value / 1_000).toFixed(1)}k`;
  else init = value.toLocaleString("en-US", { maximumFractionDigits: 2 });

  return <span ref={ref}>{prefix}{init}{suffix}</span>;
}

export function MetricCard({
  title,
  value,
  change,
  prefix,
  suffix,
  icon: Icon,
  index = 0,
}: MetricCardProps) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  const delay = index * 0.06;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...spring.gentle, delay }}
    >
      <motion.div
        variants={cardLift}
        initial="rest"
        whileHover="hover"
        className="rounded-xl"
      >
        <Card className="overflow-hidden border bg-card">
          {/* Top accent line — sweeps in after card appears */}
          <motion.div
            className="h-[2px] w-full bg-gradient-to-r from-primary/80 via-primary/40 to-transparent"
            variants={accentLine(delay + 0.18)}
            initial="hidden"
            animate="visible"
          />

          <CardContent className="pt-5 pb-4">
            <div className="flex items-start justify-between">
              {/* Icon */}
              <motion.div
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"
                variants={iconPop}
                initial="hidden"
                animate="visible"
                transition={{ delay: delay + 0.1 }}
                whileHover={{ rotate: 8, scale: 1.12 }}
              >
                <Icon className="h-5 w-5 text-primary" />
              </motion.div>

              {/* Change badge */}
              <motion.span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                  isPositive && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  isNegative && "bg-red-500/10 text-red-600 dark:text-red-400",
                  !isPositive && !isNegative && "bg-muted text-muted-foreground"
                )}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...spring.snap, delay: delay + 0.22 }}
              >
                {isPositive && <ArrowUp className="h-3 w-3" />}
                {isNegative && <ArrowDown className="h-3 w-3" />}
                {Math.abs(change).toFixed(1)}%
              </motion.span>
            </div>

            <div className="mt-4 space-y-0.5">
              <motion.p
                className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.16, duration: 0.35 }}
              >
                {title}
              </motion.p>

              <motion.h3
                className="text-2xl font-bold tracking-tight tabular-nums"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring.gentle, delay: delay + 0.2 }}
              >
                {typeof value === "number" ? (
                  <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
                ) : (
                  `${prefix ?? ""}${value}${suffix ?? ""}`
                )}
              </motion.h3>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
