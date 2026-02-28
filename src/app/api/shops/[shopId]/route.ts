import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateShopSchema } from "@/lib/validators";
import { notifyShopDisconnected } from "@/lib/feishu";
import { checkRateLimit, getClientId, STRICT_RATE_LIMIT } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { shopId } = await params;

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        shopSettings: true,
        _count: {
          select: {
            orders: true,
            products: true,
          },
        },
        orders: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }

    if (shop.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({ shop });
  } catch (error) {
    logger.error("API error", error, "shops-shopId");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { shopId } = await params;

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }

    if (shop.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateShopSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Sanitize string inputs
    const sanitizedData: Record<string, unknown> = {};
    if (parsed.data.name) sanitizedData.name = sanitizeString(parsed.data.name, 100);
    if (parsed.data.region) sanitizedData.region = sanitizeString(parsed.data.region, 10);
    if (parsed.data.currency) sanitizedData.currency = sanitizeString(parsed.data.currency, 10);
    if (parsed.data.status) sanitizedData.status = sanitizeString(parsed.data.status, 20);

    const updatedShop = await prisma.shop.update({
      where: { id: shopId },
      data: sanitizedData,
    });

    return NextResponse.json({ shop: updatedShop });
  } catch (error) {
    logger.error("API error", error, "shops-shopId");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ shopId: string }> }
) {
  try {
    // Rate limit - strict for destructive operations
    const clientId = getClientId(request);
    const rl = checkRateLimit(`delete-shop:${clientId}`, STRICT_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { shopId } = await params;

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found" },
        { status: 404 }
      );
    }

    if (shop.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.shop.delete({
      where: { id: shopId },
    });

    // Notify Feishu about disconnection
    notifyShopDisconnected(shop.name, "User deleted shop").catch(() => {});

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    logger.error("API error", error, "shops-shopId");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
