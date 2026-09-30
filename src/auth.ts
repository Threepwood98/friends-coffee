import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcrypt";
import NextAuth, { CredentialsSignin, type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

import authConfig from "@/auth.config";
import { getPrisma } from "@/lib/prisma";
import { consumeLoginRateLimit, recordSuccessfulLogin } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validators/auth";
import { userRoleSchema } from "@/lib/validators/user";

const DUMMY_PASSWORD_HASH =
  "$2b$12$vKuRmLDIYXC9D5az1A1IBehWIC3wS0Z7sYbg4vLy5FjL3AdnuMy.u";

class LoginRateLimitError extends CredentialsSignin {
  code = "rate_limit";
}

const googleClientId = process.env.AUTH_GOOGLE_ID?.trim();
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET?.trim();

if (Boolean(googleClientId) !== Boolean(googleClientSecret)) {
  throw new Error(
    "AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET must be configured together.",
  );
}

const googleProvider =
  googleClientId && googleClientSecret
    ? Google({ clientId: googleClientId, clientSecret: googleClientSecret })
    : null;

export const isGoogleAuthConfigured = googleProvider !== null;

const providers: NextAuthConfig["providers"] = [
  ...(googleProvider ? [googleProvider] : []),
  Credentials({
    credentials: {
      email: { label: "Correo electrónico", type: "email" },
      password: { label: "Contraseña", type: "password" },
    },
    async authorize(credentials, request) {
      const parsedCredentials = loginSchema.safeParse(credentials);

      if (!parsedCredentials.success) {
        return null;
      }

      const { email, password } = parsedCredentials.data;
      const rateLimit = consumeLoginRateLimit(request.headers, email);

      if (!rateLimit.allowed) {
        throw new LoginRateLimitError();
      }

      const prisma = await getPrisma();
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          passwordHash: true,
          role: true,
        },
      });
      const passwordMatches = await compare(
        password,
        user?.passwordHash ?? DUMMY_PASSWORD_HASH,
      );
      const role = userRoleSchema.safeParse(user?.role);

      if (!user?.passwordHash || !passwordMatches || !role.success) {
        return null;
      }

      recordSuccessfulLogin(request.headers, email);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: role.data,
      };
    },
  }),
];

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const prisma = await getPrisma();

  return {
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    providers,
  };
});
