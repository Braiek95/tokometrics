import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createShopSchema } from "@/lib/validators";
import { checkRateLimit, getClientId, API_RATE_LIMIT } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";

export async function GET(request: Request) {
  try {
    // Rate limit
    const clientId = getClientId(request);
    const rl = checkRateLimit(`shops-get:${clientId}`, API_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const shops = await prisma.shop.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            orders: true,
            products: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ shops });
  } catch (error) {
    logger.error("API error", error, "shops");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Rate limit
    const clientId = getClientId(request);
    const rl = checkRateLimit(`shops-post:${clientId}`, API_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = createShopSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const name = sanitizeString(parsed.data.name, 100);
    const region = sanitizeString(parsed.data.region, 10);
    const currency = sanitizeString(parsed.data.currency, 10);

    const shop = await prisma.shop.create({
      data: {
        name,
        region,
        currency,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ shop }, { status: 201 });
  } catch (error) {
    logger.error("API error", error, "shops");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
