import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { seedShopData } from "@/services/mock/generator";
import { verifyOAuthState } from "@/lib/oauth-crypto";
import { notifyShopConnected } from "@/lib/feishu";
import { logger } from "@/lib/logger";
import { addDays } from "date-fns";

const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const MOCK_MODE = process.env.MOCK_MODE === "true";
const TIKTOK_CLIENT_ID = process.env.TIKTOK_CLIENT_ID;
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;

// TikTok Shop token endpoint
const TIKTOK_TOKEN_URL = "https://auth.tiktok-shops.com/api/v2/token/get";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code || !state) {
      logger.warn("OAuth callback missing code or state", "tiktok-callback");
      return NextResponse.redirect(new URL("/shops?error=oauth_failed", NEXT_PUBLIC_APP_URL));
    }

    // ─── Verify CSRF state ─────────────────────────────────────
    const userId = verifyOAuthState(state);
    if (!userId) {
      logger.error("Invalid or expired OAuth state", undefined, "tiktok-callback");
      return NextResponse.redirect(new URL("/shops?error=oauth_invalid_state", NEXT_PUBLIC_APP_URL));
    }

    // ─── Verify user session matches state ─────────────────────
    const session = await auth();
    if (!session?.user?.id || session.user.id !== userId) {
      logger.error("Session mismatch with OAuth state", undefined, "tiktok-callback", {
        sessionUserId: session?.user?.id,
        stateUserId: userId,
      });
      return NextResponse.redirect(new URL("/shops?error=oauth_failed", NEXT_PUBLIC_APP_URL));
    }

    // ─── Mock Mode ─────────────────────────────────────────────
    if (MOCK_MODE) {
      return handleMockCallback(code, userId);
    }

    // ─── Real TikTok Token Exchange ────────────────────────────
    if (!TIKTOK_CLIENT_ID || !TIKTOK_CLIENT_SECRET) {
      logger.error("TikTok credentials not configured", undefined, "tiktok-callback");
      return NextResponse.redirect(new URL("/shops?error=config_error", NEXT_PUBLIC_APP_URL));
    }

    const tokenRes = await fetch(TIKTOK_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        app_key: TIKTOK_CLIENT_ID,
        app_secret: TIKTOK_CLIENT_SECRET,
        auth_code: code,
        grant_type: "authorized_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.data?.access_token) {
      logger.error("TikTok token exchange failed", new Error(JSON.stringify(tokenData)), "tiktok-callback");
      return NextResponse.redirect(new URL("/shops?error=token_failed", NEXT_PUBLIC_APP_URL));
    }

    const {
      access_token,
      refresh_token,
      access_token_expire_in,
      open_id,
      seller_name,
    } = tokenData.data;

    const shopName = seller_name || `TikTok Shop ${open_id?.slice(0, 6) ?? ""}`;

    // Create shop
    const shop = await prisma.shop.create({
      data: {
        name: shopName,
        status: "ACTIVE",
        userId,
      },
    });

    // Store tokens
    await prisma.tikTokToken.create({
      data: {
        shopId: shop.id,
        accessToken: access_token,
        refreshToken: refresh_token || "",
        expiresAt: new Date(Date.now() + (access_token_expire_in || 86400) * 1000),
        scopes: ["shop.base.read", "order.base.read", "product.base.read", "finance.data.read"],
      },
    });

    // Create default settings
    await prisma.shopSettings.create({
      data: {
        shopId: shop.id,
        notificationsEnabled: true,
        emailNotifications: true,
        syncIntervalMinutes: 30,
        monthlyRevenueGoal: 10000,
      },
    });

    logger.info("TikTok shop connected successfully", "tiktok-callback", {
      shopId: shop.id,
      shopName,
    });

    // Notify Feishu
    notifyShopConnected(shopName, shop.region).catch(() => {});

    return NextResponse.redirect(new URL(`/shop/${shop.id}`, NEXT_PUBLIC_APP_URL));
  } catch (error) {
    logger.error("OAuth callback error", error, "tiktok-callback");
    return NextResponse.redirect(new URL("/shops?error=oauth_failed", NEXT_PUBLIC_APP_URL));
  }
}

// ─── Mock Callback Handler ──────────────────────────────────────────

async function handleMockCallback(code: string, userId: string) {
  const shopName = decodeURIComponent(code);

  const shop = await prisma.shop.create({
    data: {
      name: shopName,
      status: "CONNECTING",
      userId,
    },
  });

  await prisma.tikTokToken.create({
    data: {
      shopId: shop.id,
      accessToken: `mock_access_${shop.id}_${Date.now()}`,
      refreshToken: `mock_refresh_${shop.id}_${Date.now()}`,
      expiresAt: addDays(new Date(), 30),
      scopes: ["product.read", "product.write", "order.read", "order.write", "shop.read"],
    },
  });

  await prisma.shopSettings.create({
    data: {
      shopId: shop.id,
      notificationsEnabled: true,
      emailNotifications: true,
      syncIntervalMinutes: 30,
      monthlyRevenueGoal: 10000,
    },
  });

  await seedShopData(shop.id);

  await prisma.shop.update({
    where: { id: shop.id },
    data: { status: "ACTIVE" },
  });

  logger.info("Mock shop connected", "tiktok-callback", { shopId: shop.id, shopName });
  notifyShopConnected(shopName, "US").catch(() => {});

  return NextResponse.redirect(new URL(`/shop/${shop.id}`, NEXT_PUBLIC_APP_URL));
}
