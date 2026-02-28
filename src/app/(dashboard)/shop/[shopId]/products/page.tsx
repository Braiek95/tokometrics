"use client";

import { useState, use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Star } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductStatus } from "@/generated/prisma/enums";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";
import { motion } from "framer-motion";
import { pageEnter, sectionEnter } from "@/lib/animations";

// Status options built dynamically with translations

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  INACTIVE: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  OUT_OF_STOCK: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

interface ProductRow {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  totalSold: number;
  totalRevenue: number;
  rating: number;
  category: string | null;
  status: ProductStatus;
  [key: string]: unknown;
}

export default function ProductsPage({
  params,
}: {
  params: Promise<{ shopId: string }>;
}) {
  const { shopId } = use(params);
  const { language } = useLanguage();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("totalRevenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch products
  const { data, isLoading } = useQuery({
    queryKey: [
      "shop-products",
      shopId,
      page,
      pageSize,
      statusFilter,
      categoryFilter,
      search,
      sortBy,
      sortOrder,
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        sortOrder,
      });
      if (statusFilter) params.set("status", statusFilter);
      if (categoryFilter) params.set("category", categoryFilter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/shops/${shopId}/products?${params}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  // Fetch categories for the filter
  const { data: categoryData } = useQuery({
    queryKey: ["shop-categories", shopId],
    queryFn: async () => {
      const res = await fetch(`/api/shops/${shopId}/categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const categories: string[] = categoryData
    ? categoryData.map((c: { category: string }) => c.category)
    : [];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function handleSort(key: string, direction: "asc" | "desc") {
    setSortBy(key);
    setSortOrder(direction);
    setPage(1);
  }

  const columns: DataTableColumn<ProductRow>[] = [
    {
      key: "name",
      label: t(language, "productName"),
      sortable: true,
      render: (product) => (
        <span className="font-medium">{product.name}</span>
      ),
    },
    {
      key: "sku",
      label: "SKU",
      sortable: true,
      render: (product) => (
        <span className="font-mono text-xs text-muted-foreground">
          {product.sku}
        </span>
      ),
    },
    {
      key: "price",
      label: t(language, "price"),
      sortable: true,
      render: (product) => formatCurrency(product.price),
    },
    {
      key: "stock",
      label: t(language, "inStock"),
      sortable: true,
      render: (product) => (
        <span
          className={
            product.stock === 0
              ? "text-red-600 dark:text-red-400 font-medium"
              : ""
          }
        >
          {product.stock.toLocaleString()}
        </span>
      ),
    },
    {
      key: "totalSold",
      label: t(language, "totalSold"),
      sortable: true,
      render: (product) => product.totalSold.toLocaleString(),
    },
    {
      key: "totalRevenue",
      label: t(language, "totalRevenue"),
      sortable: true,
      render: (product) => (
        <span className="font-medium">{formatCurrency(product.totalRevenue)}</span>
      ),
    },
    {
      key: "rating",
      label: t(language, "rating"),
      sortable: true,
      render: (product) => (
        <div className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span>{product.rating.toFixed(1)}</span>
        </div>
      ),
    },
    {
      key: "status",
      label: t(language, "shopStatus"),
      sortable: true,
      render: (product) => (
        <Badge
          variant="secondary"
          className={STATUS_COLORS[product.status] ?? ""}
        >
          {product.status === "OUT_OF_STOCK"
            ? t(language, "outOfStockLabel")
            : product.status === "INACTIVE"
            ? t(language, "inactiveLabel")
            : t(language, "activeLabel")}
        </Badge>
      ),
    },
  ];

  return (
    <motion.div className="space-y-6" variants={pageEnter} initial="hidden" animate="visible">
      <PageHeader
        title={t(language, "products")}
        description={t(language, "allProducts")}
      />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={statusFilter ?? "ALL"}
            onValueChange={(val) => {
              setStatusFilter(val === "ALL" ? null : val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t(language, "allStatuses2")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t(language, "allStatuses2")}</SelectItem>
              <SelectItem value="ACTIVE">{t(language, "activeLabel")}</SelectItem>
              <SelectItem value="INACTIVE">{t(language, "inactiveLabel")}</SelectItem>
              <SelectItem value="OUT_OF_STOCK">{t(language, "outOfStockLabel")}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={categoryFilter ?? "ALL"}
            onValueChange={(val) => {
              setCategoryFilter(val === "ALL" ? null : val);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t(language, "allCategories")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">{t(language, "allCategories")}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t(language, "searchProducts")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 w-[250px]"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">{t(language, "search")}</Button>
        </form>
      </div>

      {/* Data Table */}
      <DataTable<ProductRow>
        columns={columns}
        data={data?.data ?? []}
        totalItems={data?.total ?? 0}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onSort={handleSort}
        sortKey={sortBy}
        sortDirection={sortOrder}
        isLoading={isLoading}
      />
    </motion.div>
  );
}
