import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
import { resolveUserRole, type UserRole } from "@/lib/validators/user";

export interface AuthenticatedUser {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: UserRole;
}

export const getCurrentUser = cache(
  async function getCurrentUser(): Promise<AuthenticatedUser | null> {
    const session = await auth();

    if (!session?.user.id) {
      return null;
    }

    const prisma = await getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      role: resolveUserRole(user.role),
    };
  },
);

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}
