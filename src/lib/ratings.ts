import { Prisma, PrismaClient } from "@prisma/client";

import type { RatingSummaryDto } from "@/lib/interaction-types";

type InteractionDb = PrismaClient | Prisma.TransactionClient;

export async function getProductRatingSummary(
  db: InteractionDb,
  productId: string,
): Promise<RatingSummaryDto> {
  const aggregated = await db.rating.aggregate({
    where: { productId },
    _avg: { value: true },
    _count: { value: true },
  });

  return {
    average: aggregated._avg.value,
    count: aggregated._count.value,
  };
}

export async function upsertProductRating(
  db: InteractionDb,
  input: { userId: string; productId: string; value: number },
): Promise<void> {
  await db.rating.upsert({
    where: {
      userId_productId: {
        userId: input.userId,
        productId: input.productId,
      },
    },
    update: { value: input.value },
    create: {
      userId: input.userId,
      productId: input.productId,
      value: input.value,
    },
  });
}
