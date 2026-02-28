import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateProfileSchema } from "@/lib/validators";
import { checkRateLimit, getClientId, API_RATE_LIMIT } from "@/lib/rate-limit";
import { sanitizeString, sanitizeEmail } from "@/lib/sanitize";

export async function PATCH(request: Request) {
  try {
    // Rate limit
    const clientId = getClientId(request);
    const rl = checkRateLimit(`profile:${clientId}`, API_RATE_LIMIT);
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

    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData: Record<string, string> = {};
    if (parsed.data.name) sanitizedData.name = sanitizeString(parsed.data.name, 100);
    if (parsed.data.email) sanitizedData.email = sanitizeEmail(parsed.data.email);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: sanitizedData,
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    logger.error("API error", error, "auth-profile");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
