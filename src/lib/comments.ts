import { Prisma, PrismaClient } from "@prisma/client";

import { formatDateTime } from "@/lib/format";
import type { ProductCommentDto } from "@/lib/interaction-types";

type InteractionDb = PrismaClient | Prisma.TransactionClient;

interface CommentWithAuthor {
  id: string;
  text: string;
  likeCount: number;
  createdAt: Date;
  user: { id: string; name: string | null };
}

export class ProductCommentForbiddenError extends Error {
  constructor() {
    super("No tienes permiso para borrar este comentario.");
    this.name = "ProductCommentForbiddenError";
  }
}

const commentWithAuthorSelect = {
  id: true,
  text: true,
  likeCount: true,
  createdAt: true,
  user: { select: { id: true, name: true } },
} as const;

function toCommentDto(comment: CommentWithAuthor): ProductCommentDto {
  return {
    id: comment.id,
    text: comment.text,
    createdAt: comment.createdAt.toISOString(),
    createdAtLabel: formatDateTime(comment.createdAt),
    likeCount: comment.likeCount,
    authorName: comment.user.name ?? "Anónimo",
    authorId: comment.user.id,
  };
}

export async function getProductComments(
  db: InteractionDb,
  productId: string,
): Promise<ProductCommentDto[]> {
  const comments = await db.comment.findMany({
    where: { productId },
    orderBy: [{ likeCount: "desc" }, { createdAt: "desc" }],
    select: commentWithAuthorSelect,
  });

  return comments.map(toCommentDto);
}

export async function createProductComment(
  db: InteractionDb,
  input: { userId: string; productId: string; text: string },
): Promise<ProductCommentDto> {
  const comment = await db.comment.create({
    data: {
      userId: input.userId,
      productId: input.productId,
      text: input.text,
    },
    select: commentWithAuthorSelect,
  });

  return toCommentDto(comment);
}

export async function deleteProductComment(
  db: InteractionDb,
  input: { commentId: string; actorId: string; actorRole: "USER" | "ADMIN" },
): Promise<boolean> {
  const comment = await db.comment.findUnique({
    where: { id: input.commentId },
    select: { userId: true },
  });

  if (!comment) {
    return false;
  }

  if (comment.userId !== input.actorId && input.actorRole !== "ADMIN") {
    throw new ProductCommentForbiddenError();
  }

  await db.comment.delete({ where: { id: input.commentId } });

  return true;
}

export async function getCommentProductSlug(
  db: InteractionDb,
  commentId: string,
): Promise<string | null> {
  const comment = await db.comment.findUnique({
    where: { id: commentId },
    select: { product: { select: { slug: true } } },
  });

  return comment?.product.slug ?? null;
}
