import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/generated/prisma/client";
import { sanitizeSearch } from "@/lib/sanitize";

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
    });

    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    if (shop.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const pageSize = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get("pageSize") ?? "10", 10))
    );
    const status = searchParams.get("status") as OrderStatus | null;
    const sortBy = searchParams.get("sortBy") ?? "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const search = sanitizeSearch(searchParams.get("search") ?? "");

    // Build where clause
    const where: Record<string, unknown> = {
      shopId,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
      ];
    }

    // Validate sortBy is a valid Order field
    const validSortFields = [
      "createdAt",
      "updatedAt",
      "totalAmount",
      "orderNumber",
      "customerName",
      "status",
    ];
    const safeSortBy = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
          _count: {
            select: { items: true },
          },
        },
        orderBy: { [safeSortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      data: orders,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    logger.error("API error", error, "shops-shopId-orders");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
