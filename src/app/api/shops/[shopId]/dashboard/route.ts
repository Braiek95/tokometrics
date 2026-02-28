import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  subDays, startOfDay, endOfDay, differenceInDays,
  startOfMonth, endOfMonth, startOfYear,
} from "date-fns";

/**
 * Combined Dashboard API — returns ALL dashboard data in ONE request
 * This eliminates 6 separate API calls and drastically speeds up loading
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { shopId } = await params;

    // ── Shop + Settings (1 query) ─────────────────────────────────
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: { shopSettings: true },
    });

    if (!shop || shop.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const now = new Date();
    const toDate = searchParams.get("to") ? endOfDay(new Date(searchParams.get("to")!)) : endOfDay(now);
    const fromDate = searchParams.get("from") ? startOfDay(new Date(searchParams.get("from")!)) : startOfDay(subDays(now, 30));

    const periodLength = differenceInDays(toDate, fromDate) + 1;
    const prevTo = startOfDay(fromDate);
    const prevFrom = startOfDay(subDays(prevTo, periodLength));

    // ── Run ALL queries in parallel ────────────────────────────────
    const [
      currentMetrics,
      previousMetrics,
      monthlyAgg,
      annualAgg,
      todayAgg,
      dailyRevenue,
      categories,
      products,
      liveStreamRooms,
    ] = await Promise.all([
      // Current period
      prisma.dailyMetric.aggregate({
        where: { shopId, date: { gte: fromDate, lte: toDate } },
        _sum: {
          revenue: true, orderCount: true, unitsSold: true, newCustomers: true,
          liveStreamRevenue: true, shortVideoRevenue: true, mallRevenue: true, influencerRevenue: true,
          liveStreamOrders: true, shortVideoOrders: true, mallOrders: true, influencerOrders: true,
        },
        _avg: { averageOrderValue: true, conversionRate: true },
      }),

      // Previous period
      prisma.dailyMetric.aggregate({
        where: { shopId, date: { gte: prevFrom, lt: prevTo } },
        _sum: { revenue: true, orderCount: true, unitsSold: true, newCustomers: true },
        _avg: { averageOrderValue: true, conversionRate: true },
      }),

      // Monthly
      prisma.dailyMetric.aggregate({
        where: { shopId, date: { gte: startOfMonth(now), lte: endOfMonth(now) } },
        _sum: { revenue: true, orderCount: true },
      }),

      // Annual
      prisma.dailyMetric.aggregate({
        where: { shopId, date: { gte: startOfYear(now), lte: now } },
        _sum: { revenue: true, orderCount: true },
      }),

      // Today
      prisma.dailyMetric.aggregate({
        where: { shopId, date: { gte: startOfDay(now), lte: now } },
        _sum: { revenue: true, orderCount: true },
      }),

      // Daily revenue data for charts
      prisma.dailyMetric.findMany({
        where: { shopId, date: { gte: fromDate, lte: toDate } },
        select: {
          date: true, revenue: true, orderCount: true, unitsSold: true,
          liveStreamRevenue: true, shortVideoRevenue: true, mallRevenue: true, influencerRevenue: true,
        },
        orderBy: { date: "asc" },
      }),

      // Categories
      prisma.product.groupBy({
        by: ["category"],
        where: { shopId, status: "ACTIVE" },
        _sum: { totalRevenue: true, totalSold: true },
        _count: true,
        orderBy: { _sum: { totalRevenue: "desc" } },
      }),

      // Top products
      prisma.product.findMany({
        where: { shopId },
        include: {
          variants: { orderBy: { totalRevenue: "desc" } },
        },
        orderBy: { totalRevenue: "desc" },
        take: 20,
      }),

      // Live stream rooms
      prisma.liveStreamRoom.findMany({
        where: {
          dailyMetric: { shopId, date: { gte: fromDate, lte: toDate } },
        },
        select: { roomName: true, hostName: true, revenue: true, orderCount: true, viewers: true, gmv: true },
      }),
    ]);

    // ── Build response ─────────────────────────────────────────────

    const current = {
      revenue: currentMetrics._sum.revenue ?? 0,
      orders: currentMetrics._sum.orderCount ?? 0,
      unitsSold: currentMetrics._sum.unitsSold ?? 0,
      aov: currentMetrics._avg.averageOrderValue ?? 0,
      conversionRate: currentMetrics._avg.conversionRate ?? 0,
      newCustomers: currentMetrics._sum.newCustomers ?? 0,
      liveStreamRevenue: currentMetrics._sum.liveStreamRevenue ?? 0,
      shortVideoRevenue: currentMetrics._sum.shortVideoRevenue ?? 0,
      mallRevenue: currentMetrics._sum.mallRevenue ?? 0,
      influencerRevenue: currentMetrics._sum.influencerRevenue ?? 0,
      liveStreamOrders: currentMetrics._sum.liveStreamOrders ?? 0,
      shortVideoOrders: currentMetrics._sum.shortVideoOrders ?? 0,
      mallOrders: currentMetrics._sum.mallOrders ?? 0,
      influencerOrders: currentMetrics._sum.influencerOrders ?? 0,
    };

    const previous = {
      revenue: previousMetrics._sum.revenue ?? 0,
      orders: previousMetrics._sum.orderCount ?? 0,
      unitsSold: previousMetrics._sum.unitsSold ?? 0,
      aov: previousMetrics._avg.averageOrderValue ?? 0,
      conversionRate: previousMetrics._avg.conversionRate ?? 0,
      newCustomers: previousMetrics._sum.newCustomers ?? 0,
    };

    function pct(c: number, p: number) {
      if (p === 0) return c > 0 ? 100 : 0;
      return ((c - p) / p) * 100;
    }

    const monthlyGoal = shop.shopSettings?.monthlyRevenueGoal ?? 10000;
    const annualGoal = shop.shopSettings?.annualRevenueGoal ?? monthlyGoal * 12;
    const monthlyRevenue = monthlyAgg._sum.revenue ?? 0;
    const annualRevenue = annualAgg._sum.revenue ?? 0;

    // Aggregate rooms by name
    const roomMap = new Map<string, { roomName: string; hosts: Set<string>; revenue: number; orders: number; viewers: number; gmv: number; sessions: number }>();
    for (const room of liveStreamRooms) {
      const existing = roomMap.get(room.roomName);
      if (existing) {
        existing.revenue += room.revenue;
        existing.orders += room.orderCount;
        existing.viewers += room.viewers;
        existing.gmv += room.gmv;
        existing.sessions += 1;
        existing.hosts.add(room.hostName);
      } else {
        roomMap.set(room.roomName, {
          roomName: room.roomName,
          hosts: new Set([room.hostName]),
          revenue: room.revenue,
          orders: room.orderCount,
          viewers: room.viewers,
          gmv: room.gmv,
          sessions: 1,
        });
      }
    }

    const roomSummary = Array.from(roomMap.values())
      .map((r) => ({
        ...r,
        hosts: Array.from(r.hosts),
        avgRevenuePerSession: r.sessions > 0 ? r.revenue / r.sessions : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Category data
    const categoryData = categories.map((c) => ({
      category: c.category,
      revenue: c._sum.totalRevenue ?? 0,
      unitsSold: c._sum.totalSold ?? 0,
      productCount: c._count,
    }));

    // Revenue chart data
    const revenueChartData = dailyRevenue.map((d) => ({
      date: d.date.toISOString().split("T")[0],
      revenue: d.revenue,
      orderCount: d.orderCount,
      unitsSold: d.unitsSold,
      liveStreamRevenue: d.liveStreamRevenue,
      shortVideoRevenue: d.shortVideoRevenue,
      mallRevenue: d.mallRevenue,
      influencerRevenue: d.influencerRevenue,
    }));

    // Products with variant count
    const productData = products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      price: p.price,
      stock: p.stock,
      totalSold: p.totalSold,
      totalRevenue: p.totalRevenue,
      rating: p.rating,
      category: p.category,
      status: p.status,
      variantCount: p.variants.length,
      variants: p.variants.map((v) => ({
        id: v.id, name: v.name, sku: v.sku, price: v.price,
        stock: v.stock, totalSold: v.totalSold, totalRevenue: v.totalRevenue,
      })),
    }));

    const response = NextResponse.json({
      shop: { id: shop.id, name: shop.name, currency: shop.currency, region: shop.region, status: shop.status },
      metrics: current,
      changes: {
        revenue: pct(current.revenue, previous.revenue),
        orders: pct(current.orders, previous.orders),
        unitsSold: pct(current.unitsSold, previous.unitsSold),
        aov: pct(current.aov, previous.aov),
        conversionRate: pct(current.conversionRate, previous.conversionRate),
        newCustomers: pct(current.newCustomers, previous.newCustomers),
      },
      targets: {
        monthlyGoal, annualGoal, monthlyRevenue, annualRevenue,
        monthlyProgress: monthlyGoal > 0 ? (monthlyRevenue / monthlyGoal) * 100 : 0,
        annualProgress: annualGoal > 0 ? (annualRevenue / annualGoal) * 100 : 0,
        todayRevenue: todayAgg._sum.revenue ?? 0,
        todayOrders: todayAgg._sum.orderCount ?? 0,
      },
      period: {
        today: { revenue: todayAgg._sum.revenue ?? 0, orders: todayAgg._sum.orderCount ?? 0 },
        monthly: { revenue: monthlyRevenue, orders: monthlyAgg._sum.orderCount ?? 0 },
        annual: { revenue: annualRevenue, orders: annualAgg._sum.orderCount ?? 0 },
      },
      revenue: revenueChartData,
      categories: categoryData,
      products: productData,
      roomSummary,
    });

    // Cache for 60 seconds
    response.headers.set("Cache-Control", "private, max-age=60, stale-while-revalidate=120");
    return response;
  } catch (error) {
    logger.error("API error", error, "shops-shopId-dashboard");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
