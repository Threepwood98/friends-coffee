"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import { getCommentProductSlug } from "@/lib/comments";
import { toggleCommentLike } from "@/lib/likes";
import { getPrisma } from "@/lib/prisma";
import { consumeLikeRateLimit } from "@/lib/rate-limit";

export interface ToggleLikeActionState {
  liked: boolean;
  likeCount?: number;
  message: string;
}

export async function toggleLikeAction(
  commentId: string,
): Promise<ToggleLikeActionState> {
  const user = await requireUser();

  const requestHeaders = await headers();
  const rateLimit = consumeLikeRateLimit(requestHeaders, user.email);

  if (!rateLimit.allowed) {
    return {
      liked: false,
      message:
        "Has dado like demasiado rápido. Espera antes de volver a intentarlo.",
    };
  }

  const prisma = await getPrisma();

  try {
    const result = await toggleCommentLike(prisma, {
      userId: user.id,
      commentId,
    });

    const commentSlug = await getCommentProductSlug(prisma, commentId);

    if (commentSlug) {
      revalidatePath(`/menu/${commentSlug}`);
    }

    return { ...result, message: "" };
  } catch (error) {
    console.error("Like toggling failed.", error);
    return { liked: false, message: "No hemos podido actualizar el like." };
  }
}
