"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Store, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ShopGrid } from "@/app/(dashboard)/shops/shop-grid";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";

export default function ShopsPage() {
  const { language } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const res = await fetch("/api/shops");
      if (!res.ok) throw new Error("Failed to fetch shops");
      return res.json();
    },
  });

  const shops = data?.shops ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t(language, "myShops")}
        description={t(language, "manageShops")}
      >
        <Button asChild>
          <Link href="/api/tiktok/auth">
            <Plus className="h-4 w-4" />
            {t(language, "connectNewShop")}
          </Link>
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="h-[130px] rounded-xl bg-muted/60"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
            />
          ))}
        </div>
      ) : shops.length === 0 ? (
        <EmptyState
          icon={Store}
          title={t(language, "noShopsConnected")}
          description={t(language, "noShopsDesc")}
        >
          <Button asChild>
            <Link href="/api/tiktok/auth">
              <Plus className="h-4 w-4" />
              {t(language, "connectFirstShop")}
            </Link>
          </Button>
        </EmptyState>
      ) : (
        <ShopGrid shops={shops} />
      )}
    </div>
  );
}
