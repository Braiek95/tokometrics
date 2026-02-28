"use client";

import { motion } from "framer-motion";
import { BarChart3, Radio, Package, LayoutGrid } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";

export type DashboardTab = "overview" | "channels" | "products" | "live";

interface DashboardTabsProps {
  active: DashboardTab;
  onChange: (tab: DashboardTab) => void;
}

const TAB_CONFIG: { key: DashboardTab; icon: React.ElementType; labelKey: string }[] = [
  { key: "overview", icon: LayoutGrid, labelKey: "tabOverview" },
  { key: "channels", icon: BarChart3, labelKey: "tabChannels" },
  { key: "products", icon: Package, labelKey: "tabProducts" },
  { key: "live", icon: Radio, labelKey: "tabLive" },
];

export function DashboardTabs({ active, onChange }: DashboardTabsProps) {
  const { language } = useLanguage();

  return (
    <div className="flex gap-1 rounded-xl bg-muted/50 p-1 overflow-x-auto">
      {TAB_CONFIG.map((tab) => {
        const isActive = active === tab.key;
        const Icon = tab.icon;

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap
              ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/70"}`}
          >
            {isActive && (
              <motion.div
                layoutId="dashboard-tab-bg"
                className="absolute inset-0 rounded-lg bg-background shadow-sm"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5" />
              {t(language, tab.labelKey as any)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
