"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/auth";
import {
  createProductComment,
  deleteProductComment,
  getCommentProductSlug,
} from "@/lib/comments";
import { getPrisma } from "@/lib/prisma";
import { consumeCommentRateLimit } from "@/lib/rate-limit";
import type { ProductCommentDto } from "@/lib/interaction-types";
import { commentTextSchema } from "@/lib/validators/interactions";

export interface CreateCommentActionState {
  message: string;
  comment?: ProductCommentDto;
}

export async function createCommentAction(
  productId: string,
  text: string,
): Promise<CreateCommentActionState> {
  const user = await requireUser();
  const parsed = commentTextSchema.safeParse(text);

  if (!parsed.success) {
    return {
      message:
        parsed.error.issues[0]?.message ??
        "El comentario debe tener entre 1 y 500 caracteres.",
    };
  }

  const requestHeaders = await headers();
  const rateLimit = consumeCommentRateLimit(requestHeaders, user.email);

  if (!rateLimit.allowed) {
    return {
      message:
        "Has comentado demasiado rápido. Espera antes de volver a intentarlo.",
    };
  }

  const prisma = await getPrisma();
  let comment: ProductCommentDto | undefined;

  try {
    comment = await createProductComment(prisma, {
      userId: user.id,
      productId,
      text: parsed.data,
    });
  } catch (error) {
    console.error("Comment creation failed.", error);
    return { message: "No hemos podido publicar tu comentario." };
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { slug: true },
  });

  if (product) {
    revalidatePath(`/carta/${product.slug}`);
  }

  return { message: "", comment };
}

export interface DeleteCommentActionState {
  message: string;
}

export async function deleteCommentAction(
  commentId: string,
): Promise<DeleteCommentActionState> {
  const user = await requireUser();
  const prisma = await getPrisma();
  const commentSlug = await getCommentProductSlug(prisma, commentId);

  try {
    await deleteProductComment(prisma, {
      commentId,
      actorId: user.id,
      actorRole: user.role,
    });
  } catch (error) {
    console.error("Comment deletion failed.", error);
    return { message: "No hemos podido borrar el comentario." };
  }

  if (commentSlug) {
    revalidatePath(`/carta/${commentSlug}`);
  }

  return { message: "" };
}
