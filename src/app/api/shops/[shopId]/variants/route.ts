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

    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }
    if (shop.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch products with their variants, ordered by revenue
    const products = await prisma.product.findMany({
      where: { shopId },
      include: {
        variants: {
          orderBy: { totalRevenue: "desc" },
        },
      },
      orderBy: { totalRevenue: "desc" },
      take: 20,
    });

    // Build ranking: products with inline variant breakdown
    const ranking = products.map((product) => ({
      id: product.id,
      name: product.name,
      category: product.category,
      totalSold: product.totalSold,
      totalRevenue: product.totalRevenue,
      rating: product.rating,
      stock: product.stock,
      status: product.status,
      variantCount: product.variants.length,
      variants: product.variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        price: v.price,
        stock: v.stock,
        totalSold: v.totalSold,
        totalRevenue: v.totalRevenue,
      })),
    }));

    // Also build a flat variant ranking (SKU-level)
    const allVariants = products.flatMap((p) =>
      p.variants.map((v) => ({
        ...v,
        productName: p.name,
        category: p.category,
        productRating: p.rating,
      }))
    );
    allVariants.sort((a, b) => b.totalRevenue - a.totalRevenue);

    return NextResponse.json({
      productRanking: ranking,
      variantRanking: allVariants.slice(0, 30),
    });
  } catch (error) {
    logger.error("API error", error, "shops-variants");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
