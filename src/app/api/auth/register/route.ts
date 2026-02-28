import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validators";
import { checkRateLimit, getClientId, AUTH_RATE_LIMIT } from "@/lib/rate-limit";
import { sanitizeEmail, sanitizeString } from "@/lib/sanitize";

export async function POST(request: Request) {
  try {
    // Rate limit
    const clientId = getClientId(request);
    const rl = checkRateLimit(`register:${clientId}`, AUTH_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const name = sanitizeString(parsed.data.name, 100);
    const email = sanitizeEmail(parsed.data.email);
    const { password } = parsed.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    });

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    logger.error("API error", error, "auth-register");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
