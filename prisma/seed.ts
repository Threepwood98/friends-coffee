import { randomUUID } from "node:crypto";

import { hashPassword } from "better-auth/crypto";
import { z } from "zod";

import { getPrisma } from "../src/lib/prisma";
import { userRoleSchema } from "../src/lib/validators/user";
import { catalog, catalogProductCount } from "./catalog";

const prisma = await getPrisma();

const REQUIRE_ADMIN_FLAG = "--require-admin";
const ADMIN_ROLE = userRoleSchema.parse("ADMIN");

const adminCredentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(128),
});

async function seedCatalog() {
  const created = await prisma.$transaction(async (transaction) => {
    const [userCount, categoryCount, productCount] = await Promise.all([
      transaction.user.count(),
      transaction.category.count(),
      transaction.product.count(),
    ]);

    if (userCount > 0 || categoryCount > 0 || productCount > 0) {
      return false;
    }

    for (const category of catalog) {
      await transaction.category.create({
        data: {
          name: category.name,
          slug: category.slug,
          position: category.position,
          products: {
            create: category.products.map((product) => ({
              ...product,
              available: true,
            })),
          },
        },
      });
    }

    return true;
  });

  console.info(
    created
      ? `Seeded ${catalog.length} categories and ${catalogProductCount} products.`
      : "Catalog already initialized; no changes applied.",
  );
}

function readAdminCredentials() {
  const requireAdmin = process.argv.includes(REQUIRE_ADMIN_FLAG);
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email && !password) {
    if (requireAdmin) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD are required for the production seed.",
      );
    }

    console.info("Admin seed skipped because credentials are not configured.");
    return null;
  }

  if (!email || !password) {
    throw new Error(
      "ADMIN_EMAIL and ADMIN_PASSWORD must be configured together.",
    );
  }

  const credentials = adminCredentialsSchema.safeParse({ email, password });

  if (!credentials.success) {
    throw new Error(
      "Admin credentials are invalid. Use a valid email and a password between 8 and 128 characters.",
    );
  }

  return credentials.data;
}

async function seedAdmin(
  credentials: z.infer<typeof adminCredentialsSchema> | null,
) {
  if (!credentials) {
    return;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  if (existingUser) {
    const existingRole = userRoleSchema.safeParse(existingUser.role);

    if (!existingRole.success || existingRole.data !== ADMIN_ROLE) {
      throw new Error(
        "The configured admin email belongs to a non-admin user; no changes were applied.",
      );
    }

    const credentialAccount = await prisma.account.findFirst({
      where: {
        userId: existingUser.id,
        providerId: "credential",
        accountId: existingUser.id,
      },
      select: { id: true },
    });

    if (!credentialAccount) {
      await prisma.account.create({
        data: {
          id: randomUUID(),
          accountId: existingUser.id,
          providerId: "credential",
          userId: existingUser.id,
          password: await hashPassword(credentials.password),
        },
      });

      console.info("Credential account added to the existing admin.");
      return;
    }

    console.info("Admin already exists; no changes applied.");
    return;
  }

  const userId = randomUUID();
  const password = await hashPassword(credentials.password);

  await prisma.$transaction(async (transaction) => {
    await transaction.user.create({
      data: {
        id: userId,
        email: credentials.email,
        name: "Administrador",
        role: ADMIN_ROLE,
      },
    });
    await transaction.account.create({
      data: {
        id: randomUUID(),
        accountId: userId,
        providerId: "credential",
        userId,
        password,
      },
    });
  });

  console.info("Admin created.");
}

async function main() {
  const adminCredentials = readAdminCredentials();

  await seedCatalog();
  await seedAdmin(adminCredentials);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Seed failed.");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
