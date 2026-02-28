"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";
import { Star, TrendingUp, ChevronDown, ChevronRight } from "lucide-react";
import { fadeUp } from "@/lib/animations";

interface VariantRank {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  totalSold: number;
  totalRevenue: number;
}

interface ProductRank {
  id: string;
  name: string;
  category: string | null;
  totalSold: number;
  totalRevenue: number;
  rating: number;
  stock: number;
  status: string;
  variants?: VariantRank[];
  variantCount?: number;
}

const RANK_LABELS = ["🥇", "🥈", "🥉"];

interface ProductRowProps {
  product: ProductRank;
  index: number;
  totalRevenue: number;
  topRevenue: number;
}

function VariantRow({ variant, productRevenue }: { variant: VariantRank; productRevenue: number }) {
  const ratio = productRevenue > 0 ? ((variant.totalRevenue / productRevenue) * 100).toFixed(1) : "0.0";

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-12 items-center gap-2 rounded px-2 py-1.5 text-xs bg-muted/30 ml-6"
    >
      <div className="col-span-1" />
      <div className="col-span-4 space-y-0.5">
        <p className="truncate text-muted-foreground">{variant.name}</p>
        <span className="font-mono text-[10px] text-muted-foreground/70">{variant.sku}</span>
      </div>
      <div className="col-span-2 text-right font-semibold">
        ${variant.totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
      </div>
      <div className="col-span-2 text-right text-muted-foreground">
        {variant.totalSold.toLocaleString()}
      </div>
      <div className="col-span-2 text-right font-medium text-primary/70">
        {ratio}%
      </div>
      <div className="col-span-1 text-right text-muted-foreground">
        {variant.stock}
      </div>
    </motion.div>
  );
}

function ProductRow({ product, index, totalRevenue, topRevenue }: ProductRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4, margin: "-20px" });
  const { language } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  const ratio = totalRevenue > 0 ? ((product.totalRevenue / totalRevenue) * 100).toFixed(1) : "0.0";
  const barWidth = topRevenue > 0 ? (product.totalRevenue / topRevenue) * 100 : 0;
  const hasVariants = product.variants && product.variants.length > 0;

  return (
    <div>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: -20 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 24 }}
        whileHover={{ backgroundColor: "hsl(var(--muted)/0.4)", x: 2 }}
        onClick={() => hasVariants && setExpanded(!expanded)}
        className={`grid grid-cols-12 items-center gap-2 rounded-lg px-2 py-2.5 text-sm transition-colors ${hasVariants ? "cursor-pointer" : "cursor-default"}`}
      >
        {/* Rank */}
        <div className="col-span-1 flex items-center justify-center">
          {index < 3 ? (
            <motion.span
              className="text-base"
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : { scale: 0 }}
              transition={{ delay: index * 0.05 + 0.1, type: "spring", stiffness: 300, damping: 18 }}
            >
              {RANK_LABELS[index]}
            </motion.span>
          ) : (
            <motion.span
              className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: "#64748b" }}
              initial={{ scale: 0 }}
              animate={inView ? { scale: 1 } : { scale: 0 }}
              transition={{ delay: index * 0.05 + 0.1, type: "spring", stiffness: 280, damping: 20 }}
            >
              {index + 1}
            </motion.span>
          )}
        </div>

        {/* Product name + bar */}
        <div className="col-span-4 space-y-1">
          <div className="flex items-center gap-1">
            {hasVariants && (
              expanded
                ? <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                : <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            )}
            <p className="truncate font-medium leading-tight text-xs">{product.name}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary/60"
                initial={{ width: 0 }}
                animate={inView ? { width: `${barWidth}%` } : { width: 0 }}
                transition={{ delay: index * 0.05 + 0.15, type: "spring", stiffness: 60, damping: 14 }}
              />
            </div>
            {product.category && (
              <Badge variant="secondary" className="py-0 text-[10px]">
                {product.category}
              </Badge>
            )}
            {hasVariants && (
              <Badge variant="outline" className="py-0 text-[10px]">
                {product.variants!.length} {t(language, "models")}
              </Badge>
            )}
          </div>
        </div>

        {/* Revenue */}
        <div className="col-span-2 text-right text-xs font-semibold">
          ${product.totalRevenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </div>

        {/* Units */}
        <div className="col-span-2 text-right text-xs text-muted-foreground">
          {product.totalSold.toLocaleString()}
        </div>

        {/* Ratio */}
        <div className="col-span-2 text-right text-xs font-medium text-primary">
          {ratio}%
        </div>

        {/* Rating */}
        <div className="col-span-1 flex items-center justify-end gap-0.5 text-xs text-amber-500">
          <Star className="h-2.5 w-2.5 fill-current" />
          <span>{product.rating.toFixed(1)}</span>
        </div>
      </motion.div>

      {/* Variant Rows */}
      <AnimatePresence>
        {expanded && hasVariants && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-0.5 pb-1"
          >
            {product.variants!.map((variant) => (
              <VariantRow key={variant.id} variant={variant} productRevenue={product.totalRevenue} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ProductRanking({ products }: { products: ProductRank[] }) {
  const { language } = useLanguage();

  const totalRevenue = products.reduce((sum, p) => sum + p.totalRevenue, 0);
  const sorted = [...products]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);

  const topRevenue = sorted[0]?.totalRevenue ?? 1;
  const hasAnyVariants = sorted.some((p) => p.variants && p.variants.length > 0);

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
              <TrendingUp className="h-4 w-4 text-primary" />
              {hasAnyVariants ? t(language, "variantRanking") : t(language, "productRanking")}
            </CardTitle>
            {hasAnyVariants && (
              <p className="text-xs text-muted-foreground mt-1">
                {language === "zh" ? "点击产品展开款式明细" : "Click a product to expand model details"}
              </p>
            )}
          </motion.div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {/* Header */}
            <motion.div
              className="grid grid-cols-12 gap-2 px-2 text-xs font-medium text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <span className="col-span-1">{t(language, "rank")}</span>
              <span className="col-span-4">{t(language, "productName")}</span>
              <span className="col-span-2 text-right">{t(language, "salesAmount")}</span>
              <span className="col-span-2 text-right">{t(language, "totalSold")}</span>
              <span className="col-span-2 text-right">{t(language, "salesRatio")}</span>
              <span className="col-span-1 text-right">{t(language, "rating")}</span>
            </motion.div>

            <div className="divide-y divide-border/40">
              {sorted.map((product, index) => (
                <ProductRow
                  key={product.id}
                  product={product}
                  index={index}
                  totalRevenue={totalRevenue}
                  topRevenue={topRevenue}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
