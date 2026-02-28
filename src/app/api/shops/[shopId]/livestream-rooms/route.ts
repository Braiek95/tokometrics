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

    // Fetch daily metrics with live stream rooms
    const metrics = await prisma.dailyMetric.findMany({
      where: {
        shopId,
        date: { gte: fromDate, lte: toDate },
      },
      include: {
        liveStreamRooms: {
          orderBy: { revenue: "desc" },
        },
      },
      orderBy: { date: "asc" },
    });

    // Per-day room breakdown
    const dailyRooms = metrics.map((m) => ({
      date: m.date.toISOString().split("T")[0],
      totalLiveRevenue: m.liveStreamRevenue,
      totalLiveOrders: m.liveStreamOrders,
      roomCount: m.liveStreamRooms.length,
      rooms: m.liveStreamRooms.map((r) => ({
        id: r.id,
        roomName: r.roomName,
        hostName: r.hostName,
        startTime: r.startTime?.toISOString() ?? null,
        endTime: r.endTime?.toISOString() ?? null,
        viewers: r.viewers,
        revenue: r.revenue,
        orderCount: r.orderCount,
        gmv: r.gmv,
      })),
    }));

    // Aggregate room performance across all days
    const roomAggregates: Record<string, {
      roomName: string;
      totalRevenue: number;
      totalOrders: number;
      totalViewers: number;
      totalGmv: number;
      sessionCount: number;
      hosts: Set<string>;
    }> = {};

    for (const m of metrics) {
      for (const r of m.liveStreamRooms) {
        if (!roomAggregates[r.roomName]) {
          roomAggregates[r.roomName] = {
            roomName: r.roomName,
            totalRevenue: 0,
            totalOrders: 0,
            totalViewers: 0,
            totalGmv: 0,
            sessionCount: 0,
            hosts: new Set(),
          };
        }
        const agg = roomAggregates[r.roomName];
        agg.totalRevenue += r.revenue;
        agg.totalOrders += r.orderCount;
        agg.totalViewers += r.viewers;
        agg.totalGmv += r.gmv;
        agg.sessionCount++;
        if (r.hostName) agg.hosts.add(r.hostName);
      }
    }

    const roomSummary = Object.values(roomAggregates)
      .map((r) => ({
        roomName: r.roomName,
        totalRevenue: parseFloat(r.totalRevenue.toFixed(2)),
        totalOrders: r.totalOrders,
        totalViewers: r.totalViewers,
        totalGmv: parseFloat(r.totalGmv.toFixed(2)),
        sessionCount: r.sessionCount,
        avgRevenuePerSession: parseFloat((r.totalRevenue / r.sessionCount).toFixed(2)),
        hosts: Array.from(r.hosts),
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    return NextResponse.json({
      dailyRooms,
      roomSummary,
    });
  } catch (error) {
    logger.error("API error", error, "shops-livestream-rooms");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
