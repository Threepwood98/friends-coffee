import type { Metadata } from "next";
import Link from "next/link";

import { deleteCommentAction } from "@/actions/comments";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { getPrisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Comentarios",
  description: "Moderación de los comentarios de los clientes.",
};

export default async function AdminCommentsPage() {
  await requireAdmin();
  const prisma = await getPrisma();
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      text: true,
      createdAt: true,
      likeCount: true,
      user: { select: { name: true, email: true } },
      product: { select: { slug: true, name: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
          Moderación
        </p>
        <h1 className="text-balance break-words text-2xl font-semibold tracking-tight sm:text-3xl">
          Comentarios
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          {comments.length === 0
            ? "Aún no hay comentarios que revisar."
            : `Se muestran los ${comments.length} comentarios ${comments.length === 100 ? "más recientes" : "recibidos"}.`}
        </p>
      </div>

      {comments.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Todo tranquilo por aquí</CardTitle>
            <CardDescription>
              Cuando los clientes comenten, aparecerán en esta lista.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {comments.map((comment) => (
            <li key={comment.id} className="min-w-0">
              <Card className="h-full">
                <CardHeader className="min-w-0">
                  <CardTitle className="break-words">
                    {comment.user.name ?? "Cliente"} ·{" "}
                    <Link
                      href={`/menu/${comment.product.slug}`}
                      className="inline-flex min-h-11 max-w-full items-center break-words text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {comment.product.name}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    {formatDateTime(comment.createdAt)} · {comment.likeCount}{" "}
                    {comment.likeCount === 1 ? "like" : "likes"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <blockquote className="flex-1 text-sm leading-relaxed break-words whitespace-pre-wrap">
                    {comment.text}
                  </blockquote>
                  <div className="mt-4">
                    <ConfirmDeleteButton
                      title="Borrar comentario"
                      itemLabel={`comentario de ${comment.user.name ?? "Cliente"} sobre ${comment.product.name}`}
                      onConfirm={() => deleteCommentAction(comment.id)}
                    />
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
