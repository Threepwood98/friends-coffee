import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaInitialization: Promise<void> | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

async function configureSqlite() {
  // These statements are static; no user input reaches the raw query API.
  await prisma.$queryRawUnsafe("PRAGMA journal_mode = WAL");
  await prisma.$queryRawUnsafe("PRAGMA busy_timeout = 5000");
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

function initializePrisma() {
  if (!globalForPrisma.prismaInitialization) {
    globalForPrisma.prismaInitialization = configureSqlite();
  }

  return globalForPrisma.prismaInitialization;
}

export async function getPrisma() {
  await initializePrisma();

  return prisma;
}
