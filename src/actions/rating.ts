"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import type { RatingSummaryDto } from "@/lib/interaction-types";
import { getPrisma } from "@/lib/prisma";
import { getProductRatingSummary, upsertProductRating } from "@/lib/ratings";
import { ratingValueSchema } from "@/lib/validators/interactions";

export interface SubmitRatingActionState {
  message: string;
  rating?: number;
  summary?: RatingSummaryDto;
}

export async function submitRatingAction(
  productId: string,
  value: number,
): Promise<SubmitRatingActionState> {
  const user = await requireUser();
  const parsed = ratingValueSchema.safeParse(value);

  if (!parsed.success) {
    return { message: "La valoración debe ser un número entre 1 y 5." };
  }

  const prisma = await getPrisma();

  try {
    await upsertProductRating(prisma, {
      userId: user.id,
      productId,
      value: parsed.data,
    });
  } catch (error) {
    console.error("Rating submission failed.", error);
    return { message: "No hemos podido guardar tu valoración." };
  }

  const [product, summary] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      select: { slug: true },
    }),
    getProductRatingSummary(prisma, productId),
  ]);

  if (product) {
    revalidatePath(`/menu/${product.slug}`);
    revalidatePath("/menu");
  }

  return { message: "", rating: parsed.data, summary };
}
