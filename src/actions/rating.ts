"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";
import { upsertProductRating } from "@/lib/ratings";
import { ratingValueSchema } from "@/lib/validators/interactions";

export interface SubmitRatingActionState {
  message: string;
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

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });

  if (product) {
    revalidatePath(`/carta/${product.slug}`);
  }

  return { message: "" };
}
