import { Prisma, PrismaClient } from "@prisma/client";

export async function toggleCommentLike(
  db: PrismaClient,
  input: { userId: string; commentId: string },
): Promise<{ liked: boolean }> {
  return db.$transaction(async (tx: Prisma.TransactionClient) => {
    const existing = await tx.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId: input.userId,
          commentId: input.commentId,
        },
      },
      select: { commentId: true },
    });

    if (existing) {
      const comment = await tx.comment.findUnique({
        where: { id: input.commentId },
        select: { likeCount: true },
      });

      await tx.commentLike.delete({
        where: {
          userId_commentId: {
            userId: input.userId,
            commentId: input.commentId,
          },
        },
      });
      await tx.comment.update({
        where: { id: input.commentId },
        data: {
          likeCount: Math.max(0, (comment?.likeCount ?? 0) - 1),
        },
      });

      return { liked: false };
    }

    await tx.commentLike.create({
      data: { userId: input.userId, commentId: input.commentId },
    });
    await tx.comment.update({
      where: { id: input.commentId },
      data: { likeCount: { increment: 1 } },
    });

    return { liked: true };
  });
}
