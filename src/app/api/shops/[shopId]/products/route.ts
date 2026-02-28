import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ProductStatus } from "@/generated/prisma/client";
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
    const status = searchParams.get("status") as ProductStatus | null;
    const category = searchParams.get("category");
    const sortBy = searchParams.get("sortBy") ?? "totalRevenue";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? "asc" : "desc";
    const search = sanitizeSearch(searchParams.get("search") ?? "");

    // Build where clause
    const where: Record<string, unknown> = {
      shopId,
    };

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ];
    }

    // Validate sortBy is a valid Product field
    const validSortFields = [
      "name",
      "sku",
      "price",
      "stock",
      "totalSold",
      "totalRevenue",
      "rating",
      "status",
      "createdAt",
      "updatedAt",
    ];
    const safeSortBy = validSortFields.includes(sortBy)
      ? sortBy
      : "totalRevenue";

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          variants: {
            orderBy: { totalRevenue: "desc" },
          },
        },
        orderBy: { [safeSortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    // Add variantCount to each product
    const data = products.map((p) => ({
      ...p,
      variantCount: p.variants.length,
    }));

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    logger.error("API error", error, "shops-shopId-products");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
