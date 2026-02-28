import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, endOfDay } from "date-fns";

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

    const shop = await prisma.shop.findUnique({ where: { id: shopId } });

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

    const dailyMetrics = await prisma.dailyMetric.findMany({
      where: {
        shopId,
        date: { gte: fromDate, lte: toDate },
      },
      select: {
        date: true,
        revenue: true,
        orderCount: true,
        liveStreamRevenue: true,
        shortVideoRevenue: true,
        mallRevenue: true,
        influencerRevenue: true,
        liveStreamOrders: true,
        shortVideoOrders: true,
        mallOrders: true,
        influencerOrders: true,
      },
      orderBy: { date: "asc" },
    });

    const result = dailyMetrics.map((metric) => ({
      date: metric.date.toISOString(),
      revenue: metric.revenue,
      orderCount: metric.orderCount,
      liveStreamRevenue: metric.liveStreamRevenue,
      shortVideoRevenue: metric.shortVideoRevenue,
      mallRevenue: metric.mallRevenue,
      influencerRevenue: metric.influencerRevenue,
      liveStreamOrders: metric.liveStreamOrders,
      shortVideoOrders: metric.shortVideoOrders,
      mallOrders: metric.mallOrders,
      influencerOrders: metric.influencerOrders,
    }));

    return NextResponse.json(result);
  } catch (error) {
    logger.error("API error", error, "shops-shopId-revenue");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
