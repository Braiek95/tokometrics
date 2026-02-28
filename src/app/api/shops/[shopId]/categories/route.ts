import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
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
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    if (shop.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const categories = await prisma.product.groupBy({
      by: ["category"],
      where: {
        shopId,
        category: { not: null },
      },
      _sum: {
        totalRevenue: true,
      },
      orderBy: {
        _sum: {
          totalRevenue: "desc",
        },
      },
    });

    const result = categories.map((item) => ({
      category: item.category ?? "Uncategorized",
      revenue: item._sum.totalRevenue ?? 0,
    }));

    return NextResponse.json(result);
  } catch (error) {
    logger.error("API error", error, "shops-shopId-categories");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
