import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOAuthState } from "@/lib/oauth-crypto";
import { logger } from "@/lib/logger";
import { checkRateLimit, getClientId, AUTH_RATE_LIMIT } from "@/lib/rate-limit";

const MOCK_MODE = process.env.MOCK_MODE === "true";
const TIKTOK_CLIENT_ID = process.env.TIKTOK_CLIENT_ID;

// TikTok Shop OAuth authorize URL
const TIKTOK_AUTH_BASE = "https://services.tiktokshop.com/open/authorize";

export async function GET(request: NextRequest) {
  try {
    // Rate limit OAuth initiation
    const clientId = getClientId(request);
    const rl = checkRateLimit(`tiktok-auth:${clientId}`, AUTH_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many authorization attempts. Please try again later." },
        { status: 429 }
      );
    }

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const state = createOAuthState(userId);
    const origin = request.nextUrl.origin;
    const redirectUri = `${origin}/api/tiktok/callback`;

    // ─── Mock Mode ────────────────────────────────────────────
    if (MOCK_MODE) {
      const mockAuthUrl = `${origin}/oauth/tiktok/mock?state=${state}&redirect_uri=${encodeURIComponent(redirectUri)}`;
      return NextResponse.redirect(mockAuthUrl);
    }

    // ─── Real TikTok Shop OAuth ───────────────────────────────
    if (!TIKTOK_CLIENT_ID) {
      logger.error("TIKTOK_CLIENT_ID not configured", undefined, "tiktok-auth");
      return NextResponse.json(
        { error: "TikTok API not configured. Please set TIKTOK_CLIENT_ID in environment variables." },
        { status: 500 }
      );
    }

    const authUrl = new URL(TIKTOK_AUTH_BASE);
    authUrl.searchParams.set("app_key", TIKTOK_CLIENT_ID);
    authUrl.searchParams.set("state", state);

    logger.info("Redirecting to TikTok OAuth", "tiktok-auth", { userId });

    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    logger.error("TikTok auth route error", error, "tiktok-auth");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
