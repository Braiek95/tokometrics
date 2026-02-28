import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, endOfDay, differenceInDays, startOfMonth, endOfMonth, startOfYear } from "date-fns";

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

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: { shopSettings: true },
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    if (shop.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const now = new Date();

    const toDate = searchParams.get("to")
      ? endOfDay(new Date(searchParams.get("to")!))
      : endOfDay(now);
    const fromDate = searchParams.get("from")
      ? startOfDay(new Date(searchParams.get("from")!))
      : startOfDay(subDays(now, 30));

    const periodLength = differenceInDays(toDate, fromDate) + 1;
    const prevTo = startOfDay(fromDate);
    const prevFrom = startOfDay(subDays(prevTo, periodLength));

    // Current period aggregation
    const currentMetrics = await prisma.dailyMetric.aggregate({
      where: {
        shopId,
        date: { gte: fromDate, lte: toDate },
      },
      _sum: {
        revenue: true,
        orderCount: true,
        unitsSold: true,
        newCustomers: true,
        liveStreamRevenue: true,
        shortVideoRevenue: true,
        mallRevenue: true,
        influencerRevenue: true,
        liveStreamOrders: true,
        shortVideoOrders: true,
        mallOrders: true,
        influencerOrders: true,
      },
      _avg: {
        averageOrderValue: true,
        conversionRate: true,
      },
    });

    // Previous period aggregation
    const previousMetrics = await prisma.dailyMetric.aggregate({
      where: {
        shopId,
        date: { gte: prevFrom, lt: prevTo },
      },
      _sum: {
        revenue: true,
        orderCount: true,
        unitsSold: true,
        newCustomers: true,
      },
      _avg: {
        averageOrderValue: true,
        conversionRate: true,
      },
    });

    // ─── Monthly metrics ─────────────────────────────────────────
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const monthlyAgg = await prisma.dailyMetric.aggregate({
      where: { shopId, date: { gte: monthStart, lte: monthEnd } },
      _sum: { revenue: true, orderCount: true },
    });

    // ─── Annual metrics ──────────────────────────────────────────
    const yearStart = startOfYear(now);
    const annualAgg = await prisma.dailyMetric.aggregate({
      where: { shopId, date: { gte: yearStart, lte: now } },
      _sum: { revenue: true, orderCount: true },
    });

    // ─── Today metrics ───────────────────────────────────────────
    const todayStart = startOfDay(now);
    const todayAgg = await prisma.dailyMetric.aggregate({
      where: { shopId, date: { gte: todayStart, lte: now } },
      _sum: { revenue: true, orderCount: true },
    });

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

    function percentChange(current: number, previous: number): number {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    }

    const changes = {
      revenue: percentChange(current.revenue, previous.revenue),
      orders: percentChange(current.orders, previous.orders),
      unitsSold: percentChange(current.unitsSold, previous.unitsSold),
      aov: percentChange(current.aov, previous.aov),
      conversionRate: percentChange(current.conversionRate, previous.conversionRate),
      newCustomers: percentChange(current.newCustomers, previous.newCustomers),
    };

    // ─── Targets ─────────────────────────────────────────────────
    const monthlyGoal = shop.shopSettings?.monthlyRevenueGoal ?? 10000;
    const annualGoal = shop.shopSettings?.annualRevenueGoal ?? monthlyGoal * 12;
    const monthlyRevenue = monthlyAgg._sum.revenue ?? 0;
    const annualRevenue = annualAgg._sum.revenue ?? 0;

    return NextResponse.json({
      metrics: current,
      changes,
      targets: {
        monthlyGoal,
        annualGoal,
        monthlyRevenue,
        annualRevenue,
        monthlyProgress: monthlyGoal > 0 ? (monthlyRevenue / monthlyGoal) * 100 : 0,
        annualProgress: annualGoal > 0 ? (annualRevenue / annualGoal) * 100 : 0,
        todayRevenue: todayAgg._sum.revenue ?? 0,
        todayOrders: todayAgg._sum.orderCount ?? 0,
      },
      period: {
        monthly: { revenue: monthlyRevenue, orders: monthlyAgg._sum.orderCount ?? 0 },
        annual: { revenue: annualRevenue, orders: annualAgg._sum.orderCount ?? 0 },
        today: { revenue: todayAgg._sum.revenue ?? 0, orders: todayAgg._sum.orderCount ?? 0 },
      },
    });
  } catch (error) {
    logger.error("API error", error, "shops-shopId-metrics");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
