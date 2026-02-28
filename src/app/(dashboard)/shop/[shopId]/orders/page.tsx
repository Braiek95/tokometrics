"use client";

import { useState, use } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OrderStatus } from "@/generated/prisma/enums";
import { useLanguage } from "@/providers/language-provider";
import { t } from "@/lib/i18n";
import { pageEnter, sectionEnter } from "@/lib/animations";

const STATUS_COLORS: Record<string, string> = {
  PENDING:    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  PROCESSING: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  SHIPPED:    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  DELIVERED:  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  COMPLETED:  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  REFUNDED:   "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  RETURNED:   "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

interface OrderRow {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  currency: string;
  createdAt: string;
  _count: { items: number };
  [key: string]: unknown;
}

export default function OrdersPage({ params }: { params: Promise<{ shopId: string }> }) {
  const { shopId } = use(params);
  const { language } = useLanguage();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data, isLoading } = useQuery({
    queryKey: ["shop-orders", shopId, page, pageSize, statusFilter, search, sortBy, sortOrder],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), pageSize: String(pageSize), sortBy, sortOrder });
      if (statusFilter) p.set("status", statusFilter);
      if (search) p.set("search", search);
      const res = await fetch(`/api/shops/${shopId}/orders?${p}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  const ORDER_STATUSES = [
    { value: null,         label: t(language, "all") },
    { value: "PENDING",    label: t(language, "pending") },
    { value: "PROCESSING", label: t(language, "processing") },
    { value: "SHIPPED",    label: t(language, "shipped") },
    { value: "COMPLETED",  label: t(language, "delivered") },
    { value: "CANCELLED",  label: t(language, "cancelled") },
  ];

  const STATUS_LABELS: Record<string, string> = {
    PENDING:    t(language, "pending"),
    PROCESSING: t(language, "processing"),
    SHIPPED:    t(language, "shipped"),
    DELIVERED:  t(language, "delivered"),
    COMPLETED:  t(language, "delivered"),
    CANCELLED:  t(language, "cancelled"),
    REFUNDED:   t(language, "refunded"),
    RETURNED:   t(language, "cancelled"),
  };

  const columns: DataTableColumn<OrderRow>[] = [
    {
      key: "orderNumber",
      label: t(language, "orderId"),
      sortable: true,
      render: (order) => <span className="font-mono text-sm font-medium">{order.orderNumber}</span>,
    },
    {
      key: "status",
      label: t(language, "orderStatus"),
      sortable: true,
      render: (order) => (
        <Badge variant="secondary" className={STATUS_COLORS[order.status] ?? ""}>
          {STATUS_LABELS[order.status] ?? order.status}
        </Badge>
      ),
    },
    {
      key: "items",
      label: t(language, "products"),
      render: (order) => (
        <span className="tabular-nums text-muted-foreground">
          {order._count.items} {t(language, "itemsCount")}
        </span>
      ),
    },
    {
      key: "totalAmount",
      label: t(language, "amount"),
      sortable: true,
      render: (order) => (
        <span className="font-semibold tabular-nums">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: order.currency ?? "USD",
          }).format(order.totalAmount)}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: t(language, "orderDate"),
      sortable: true,
      render: (order) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(order.createdAt), "MMM dd, yyyy")}
        </span>
      ),
    },
  ];

  return (
    <motion.div className="space-y-6" variants={pageEnter} initial="hidden" animate="visible">
      <PageHeader
        title={t(language, "orders")}
        description={t(language, "allOrders")}
      />

      {/* Filters */}
      <motion.div
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        variants={sectionEnter}
      >
        <div className="flex flex-wrap gap-2">
          {ORDER_STATUSES.map((s) => (
            <motion.div key={s.label} whileTap={{ scale: 0.95 }}>
              <Button
                variant={statusFilter === s.value ? "default" : "outline"}
                size="sm"
                onClick={() => { setStatusFilter(s.value); setPage(1); }}
              >
                {s.label}
              </Button>
            </motion.div>
          ))}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t(language, "searchOrders")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 w-[240px]"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">{t(language, "search")}</Button>
        </form>
      </motion.div>

      <motion.div variants={sectionEnter}>
        <DataTable<OrderRow>
          columns={columns}
          data={data?.data ?? []}
          totalItems={data?.total ?? 0}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onSort={(k, d) => { setSortBy(k); setSortOrder(d); setPage(1); }}
          sortKey={sortBy}
          sortDirection={sortOrder}
          isLoading={isLoading}
        />
      </motion.div>
    </motion.div>
  );
}
