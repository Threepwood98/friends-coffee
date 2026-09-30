import type { NextAuthConfig } from "next-auth";

import { resolveUserRole } from "@/lib/validators/user";

const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === "production",
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = resolveUserRole(user.role);
      }

      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.role = resolveUserRole(token.role);

      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
