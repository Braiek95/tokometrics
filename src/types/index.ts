import type {
  Shop,
  Order,
  OrderItem,
  Product,
  DailyMetric,
  ShopSettings,
} from "@/generated/prisma/client";
import { ShopStatus, OrderStatus, ProductStatus } from "@/generated/prisma/enums";

export type { Shop, Order, OrderItem, Product, DailyMetric, ShopSettings };
export { ShopStatus, OrderStatus, ProductStatus };

export interface MetricData {
  label: string;
  value: number | string;
  change: number;
  changeLabel: string;
  prefix?: string;
  suffix?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  [key: string]: string | number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface DateRange {
  from: Date;
  to: Date;
}

export interface ShopWithMetrics extends Shop {
  _count?: {
    orders: number;
    products: number;
  };
  totalRevenue?: number;
}
