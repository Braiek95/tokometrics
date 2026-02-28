import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validators";
import { checkRateLimit, getClientId, STRICT_RATE_LIMIT } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    // Rate limit
    const clientId = getClientId(request);
    const rl = checkRateLimit(`chpwd:${clientId}`, STRICT_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
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
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = parsed.data;

    // Fetch the user with their hashed password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.hashedPassword);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash and update the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { hashedPassword },
    });

    return NextResponse.json(
      { message: "Password changed successfully" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("API error", error, "auth-change-password");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
