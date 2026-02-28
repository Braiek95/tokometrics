import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { shopSettingsSchema } from "@/lib/validators";

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

    // Verify shop exists and belongs to user
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

    // Find or create default settings
    let settings = await prisma.shopSettings.findUnique({
      where: { shopId },
    });

    if (!settings) {
      settings = await prisma.shopSettings.create({
        data: {
          shopId,
          notificationsEnabled: true,
          emailNotifications: true,
          syncIntervalMinutes: 30,
          monthlyRevenueGoal: 10000,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    logger.error("API error", error, "shops-shopId-settings");
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

    // Verify shop exists and belongs to user
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
    const parsed = shopSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Upsert settings: create if they don't exist, update if they do
    const settings = await prisma.shopSettings.upsert({
      where: { shopId },
      create: {
        shopId,
        ...parsed.data,
      },
      update: parsed.data,
    });

    return NextResponse.json({ settings });
  } catch (error) {
    logger.error("API error", error, "shops-shopId-settings");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
