import type { NextAuthConfig } from "next-auth";

const DISABLE_AUTH = process.env.DISABLE_AUTH === "true";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // ── Direct-access mode: never block, never redirect to login ──
      if (DISABLE_AUTH) return true;

      const isLoggedIn = !!auth?.user;
      const isOnDashboard =
        nextUrl.pathname.startsWith("/shops") ||
        nextUrl.pathname.startsWith("/shop") ||
        nextUrl.pathname.startsWith("/settings");
      const isOnAuth =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/register");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }

      if (isOnAuth && isLoggedIn) {
        return Response.redirect(new URL("/shops", nextUrl));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [],
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
