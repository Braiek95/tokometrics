import NextAuth, { type Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";
import { loginSchema } from "@/lib/validators";

/**
 * ─── Auth ────────────────────────────────────────────────────────────
 *
 * Direct-access (no-login) mode:
 *   Set DISABLE_AUTH="true" in .env to skip the login screen entirely
 *   and run the dashboard as a single fixed "Owner" account. Because the
 *   whole data model is scoped to a user, we don't remove auth — we make
 *   auth() always return the Owner session, so every route keeps working.
 *
 *   To re-enable normal email/password login later, set
 *   DISABLE_AUTH="false" (or remove it). Nothing else needs to change.
 */

const {
  handlers,
  auth: nextAuthAuth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
});

// ─── No-login mode ────────────────────────────────────────────────────

const DISABLE_AUTH = process.env.DISABLE_AUTH === "true";
const OWNER_ID = process.env.DEFAULT_USER_ID || "owner";
const OWNER_EMAIL = process.env.DEFAULT_USER_EMAIL || "owner@tokometrics.local";
const OWNER_NAME = process.env.DEFAULT_USER_NAME || "Owner";

// Ensure the Owner row exists (orders/shops have an FK to User).
// Cached so it only hits the DB once per server instance.
let ensureOwnerPromise: Promise<void> | null = null;
function ensureOwner(): Promise<void> {
  if (!ensureOwnerPromise) {
    ensureOwnerPromise = prisma.user
      .upsert({
        where: { id: OWNER_ID },
        update: {},
        create: {
          id: OWNER_ID,
          email: OWNER_EMAIL,
          name: OWNER_NAME,
          hashedPassword: "", // unused in no-login mode
        },
      })
      .then(() => undefined)
      .catch(() => {
        // allow a retry on next call if the upsert failed
        ensureOwnerPromise = null;
      });
  }
  return ensureOwnerPromise;
}

function ownerSession(): Session {
  return {
    user: { id: OWNER_ID, name: OWNER_NAME, email: OWNER_EMAIL },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  } as Session;
}

/**
 * In no-login mode, always resolve to the Owner session.
 * Otherwise, defer to the real NextAuth implementation.
 *
 * Note: route handlers and server components in this project call
 * `await auth()` with no arguments, which is what we override here.
 */
const auth = (
  DISABLE_AUTH
    ? (async () => {
        await ensureOwner();
        return ownerSession();
      })
    : nextAuthAuth
) as typeof nextAuthAuth;

export { handlers, auth, signIn, signOut };
