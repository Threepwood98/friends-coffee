"use server";

import { getCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export interface MyInteractionState {
  isAuthed: boolean;
  isAdmin: boolean;
  rating: number | null;
  likedCommentIds: string[];
  userId: string | null;
}

export async function getMyInteractionState(
  productId: string,
): Promise<MyInteractionState> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      isAuthed: false,
      isAdmin: false,
      rating: null,
      likedCommentIds: [],
      userId: null,
    };
  }

  const prisma = await getPrisma();
  const [rating, likes] = await Promise.all([
    prisma.rating.findUnique({
      where: { userId_productId: { userId: user.id, productId } },
      select: { value: true },
    }),
    prisma.commentLike.findMany({
      where: { userId: user.id, comment: { productId } },
      select: { commentId: true },
    }),
  ]);

  return {
    isAuthed: true,
    isAdmin: user.role === "ADMIN",
    rating: rating?.value ?? null,
    likedCommentIds: likes.map((like) => like.commentId),
    userId: user.id,
  };
}
