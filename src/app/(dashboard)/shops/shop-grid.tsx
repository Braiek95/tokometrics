"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Package, ExternalLink, Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";

interface Shop {
  id: string;
  name: string;
  region: string | null;
  status: string;
  _count: { orders: number; products: number };
}

const statusConfig: Record<string, { labelKey: string; color: string; bg: string }> = {
  ACTIVE:       { labelKey: "statusActive",       color: "#10b981", bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  PENDING:      { labelKey: "statusPending",      color: "#f59e0b", bg: "bg-amber-500/10   text-amber-700   dark:text-amber-400" },
  CONNECTING:   { labelKey: "statusConnecting",   color: "#3b82f6", bg: "bg-blue-500/10    text-blue-700    dark:text-blue-400" },
  DISCONNECTED: { labelKey: "statusDisconnected", color: "#94a3b8", bg: "bg-slate-500/10   text-slate-600   dark:text-slate-400" },
  ERROR:        { labelKey: "statusError",        color: "#ef4444", bg: "bg-red-500/10     text-red-700     dark:text-red-400" },
};

// ─── Delete Confirmation Dialog ──────────────────────────────────────────────
function DeleteConfirmDialog({
  shop,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  shop: Shop;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  const { language } = useLanguage();

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!isDeleting ? onCancel : undefined}
      />

      {/* Dialog */}
      <motion.div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scale: 0.88, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
      >
        <div className="relative rounded-2xl border bg-card p-6 shadow-2xl">
          {!isDeleting && (
            <button
              onClick={onCancel}
              className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {/* Icon */}
          <motion.div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10"
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 22, delay: 0.05 }}
          >
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </motion.div>

          {/* Content */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.3 }}
          >
            <h3 className="text-lg font-semibold">{t(language, "deleteShopTitle")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t(language, "deleteShopConfirm")}{" "}
              <span className="font-semibold text-foreground">"{shop.name}"</span>?
            </p>
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400 text-left">
              {t(language, "deleteShopWarning")}
              <ul className="mt-1.5 space-y-0.5">
                <li>• {shop._count.orders.toLocaleString()} {t(language, "deleteShopOrders")}</li>
                <li>• {shop._count.products.toLocaleString()} {t(language, "deleteShopProducts")}</li>
                <li>• {t(language, "deleteShopMetrics")}</li>
              </ul>
            </div>
          </motion.div>

          {/* Buttons */}
          <motion.div
            className="mt-5 flex gap-3"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.3 }}
          >
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={isDeleting}
            >
              {t(language, "deleteCancel")}
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={onConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t(language, "deleting")}
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t(language, "deleteConfirmBtn")}
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

// ─── Shop Card ───────────────────────────────────────────────────────────────
function ShopCard({
  shop,
  index,
  onDeleteClick,
}: {
  shop: Shop;
  index: number;
  onDeleteClick: (shop: Shop) => void;
}) {
  const { language } = useLanguage();
  const status = statusConfig[shop.status] ?? statusConfig.DISCONNECTED;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88, y: -10 }}
      transition={{ type: "spring", stiffness: 220, damping: 24, delay: index * 0.08 }}
    >
      <motion.div
        whileHover={{ y: -4, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
      >
        <Card className="group relative overflow-hidden border transition-shadow hover:shadow-lg">
          {/* Top accent line */}
          <motion.div
            className="h-[2px] w-full"
            style={{ backgroundColor: status.color }}
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2 + index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />

          {/* Delete button — appears on hover */}
          <motion.button
            className="absolute right-3 top-5 z-10 rounded-lg p-1.5 opacity-0 text-muted-foreground/0 transition-all hover:bg-red-500/10 hover:text-red-500 group-hover:opacity-100 group-hover:text-muted-foreground"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteClick(shop); }}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            title={t(language, "deleteShopTitle")}
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>

          <Link href={`/shop/${shop.id}`}>
            <CardHeader className="pr-10">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base pr-2">{shop.name}</CardTitle>
                <Badge variant="outline" className={`shrink-0 text-xs ${status.bg}`}>
                  {t(language, status.labelKey as any)}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                {shop.region ?? "—"}
                <span className="ml-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <ExternalLink className="h-3 w-3" />
                </span>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <motion.div
                  className="flex items-center gap-1.5"
                  whileHover={{ color: "#3b82f6", x: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>{shop._count.orders.toLocaleString()} {t(language, "orders")}</span>
                </motion.div>
                <motion.div
                  className="flex items-center gap-1.5"
                  whileHover={{ color: "#10b981", x: 1 }}
                  transition={{ duration: 0.15 }}
                >
                  <Package className="h-4 w-4" />
                  <span>{shop._count.products.toLocaleString()} {t(language, "products")}</span>
                </motion.div>
              </div>
            </CardContent>
          </Link>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Grid ───────────────────────────────────────────────────────────────
export function ShopGrid({ shops: initialShops }: { shops: Shop[] }) {
  const router = useRouter();
  const { language } = useLanguage();
  const [shops, setShops] = useState<Shop[]>(initialShops);
  const [pendingDelete, setPendingDelete] = useState<Shop | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/shops/${pendingDelete.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to delete shop");
      }

      setShops((prev) => prev.filter((s) => s.id !== pendingDelete.id));
      setPendingDelete(null);

      toast.success(`"${pendingDelete.name}" ${t(language, "shopDeletedSuccess")}`, {
        description: t(language, "shopDeletedDesc"),
      });

      router.refresh();
    } catch (err) {
      toast.error(t(language, "deleteFailed"), {
        description: err instanceof Error ? err.message : "Unexpected error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <motion.div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" layout>
        <AnimatePresence mode="popLayout">
          {shops.map((shop, i) => (
            <ShopCard
              key={shop.id}
              shop={shop}
              index={i}
              onDeleteClick={setPendingDelete}
            />
          ))}
        </AnimatePresence>

        {shops.length === 0 && (
          <motion.div
            className="col-span-full py-16 text-center text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-lg font-medium">{t(language, "noShopsConnected")}</p>
            <p className="mt-1 text-sm">{t(language, "noShopsDesc")}</p>
          </motion.div>
        )}
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {pendingDelete && (
          <DeleteConfirmDialog
            shop={pendingDelete}
            onConfirm={handleConfirmDelete}
            onCancel={() => { if (!isDeleting) setPendingDelete(null); }}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </>
  );
}
