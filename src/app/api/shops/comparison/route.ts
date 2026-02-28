import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay, endOfDay } from "date-fns";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const now = new Date();

    const toDate = searchParams.get("to")
      ? endOfDay(new Date(searchParams.get("to")!))
      : endOfDay(now);
    const fromDate = searchParams.get("from")
      ? startOfDay(new Date(searchParams.get("from")!))
      : startOfDay(subDays(now, 30));

    // Get all shops for this user
    const shops = await prisma.shop.findMany({
      where: { userId: session.user.id, status: "ACTIVE" },
      select: { id: true, name: true, currency: true },
    });

    // Get metrics for each shop
    const shopMetrics = await Promise.all(
      shops.map(async (shop) => {
        const agg = await prisma.dailyMetric.aggregate({
          where: {
            shopId: shop.id,
            date: { gte: fromDate, lte: toDate },
          },
          _sum: {
            revenue: true,
            orderCount: true,
            liveStreamRevenue: true,
            shortVideoRevenue: true,
            mallRevenue: true,
            influencerRevenue: true,
          },
        });

        return {
          shopId: shop.id,
          shopName: shop.name,
          currency: shop.currency,
          revenue: agg._sum.revenue ?? 0,
          orders: agg._sum.orderCount ?? 0,
          liveStreamRevenue: agg._sum.liveStreamRevenue ?? 0,
          shortVideoRevenue: agg._sum.shortVideoRevenue ?? 0,
          mallRevenue: agg._sum.mallRevenue ?? 0,
          influencerRevenue: agg._sum.influencerRevenue ?? 0,
        };
      })
    );

    const totalRevenue = shopMetrics.reduce((sum, s) => sum + s.revenue, 0);

    const result = shopMetrics
      .sort((a, b) => b.revenue - a.revenue)
      .map((s) => ({
        ...s,
        revenueRatio: totalRevenue > 0 ? (s.revenue / totalRevenue) * 100 : 0,
      }));

    return NextResponse.json({ shops: result, totalRevenue });
  } catch (error) {
    logger.error("API error", error, "shops-comparison");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
