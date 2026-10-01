"use client";

import { ThumbsUp, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createCommentAction, deleteCommentAction } from "@/actions/comments";
import type { MyInteractionState } from "@/actions/interactions";
import { toggleLikeAction } from "@/actions/likes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "cn";
import type { ProductCommentDto } from "@/lib/interaction-types";

const COMMENT_MAX_LENGTH = 500;

function loginUrl(productSlug: string) {
  return `/login?callbackUrl=${encodeURIComponent(`/carta/${productSlug}`)}`;
}

interface CommentsSectionProps {
  productId: string;
  productSlug: string;
  comments: ProductCommentDto[];
  state: MyInteractionState;
  isHydrated: boolean;
}

export function CommentsSection({
  productId,
  productSlug,
  comments,
  state,
  isHydrated,
}: CommentsSectionProps) {
  const router = useRouter();
  const [items, setItems] = useState<ProductCommentDto[]>(comments);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [likeOverrides, setLikeOverrides] = useState<Record<string, boolean>>(
    {},
  );

  function isLiked(commentId: string) {
    const override = likeOverrides[commentId];

    if (override !== undefined) {
      return override;
    }

    return isHydrated && state.likedCommentIds.includes(commentId);
  }

  function displayedLikeCount(commentId: string, serverCount: number) {
    const baseLiked = isHydrated
      ? state.likedCommentIds.includes(commentId)
      : false;
    const liked = likeOverrides[commentId] ?? baseLiked;

    if (liked === baseLiked) {
      return serverCount;
    }

    return Math.max(0, serverCount + (liked ? 1 : -1));
  }

  function handleSubmit() {
    setMessage(null);
    setIsSending(true);

    createCommentAction(productId, text).then((result) => {
      setIsSending(false);

      if (result.message) {
        setMessage(result.message);
        return;
      }

      if (result.comment) {
        setItems((current) => [result.comment!, ...current]);
      }

      setText("");
    });
  }

  function handleToggleLike(commentId: string) {
    if (!state.isAuthed) {
      router.push(loginUrl(productSlug));
      return;
    }

    const baseLiked = isHydrated
      ? state.likedCommentIds.includes(commentId)
      : false;
    const current = likeOverrides[commentId] ?? baseLiked;

    setLikeOverrides((previous) => ({
      ...previous,
      [commentId]: !current,
    }));

    void toggleLikeAction(commentId);
  }

  function handleDelete(commentId: string) {
    setMessage(null);

    deleteCommentAction(commentId).then((result) => {
      if (result.message) {
        setMessage(result.message);
        return;
      }

      setItems((current) =>
        current.filter((comment) => comment.id !== commentId),
      );
    });
  }

  const canDelete = (comment: ProductCommentDto) =>
    state.isAdmin || (isHydrated && comment.authorId === state.userId);

  return (
    <section
      aria-labelledby="comments-heading"
      className="friends-surface friends-raised flex scroll-mt-28 flex-col gap-6 p-6 sm:p-8"
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="friends-kicker mb-1 text-[0.68rem] font-semibold text-primary">
            La sobremesa
          </p>
          <h2
            id="comments-heading"
            className="font-heading text-3xl font-normal text-coffee sm:text-4xl"
          >
            Comentarios
          </h2>
        </div>
        <span className="inline-flex min-h-9 items-center rounded-full bg-secondary/45 px-3 text-xs font-semibold text-coffee tabular-nums">
          {items.length}
        </span>
      </div>

      {message ? (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      ) : null}

      {isHydrated && state.isAuthed ? (
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!text.trim()) {
              return;
            }
            handleSubmit();
          }}
        >
          <label htmlFor={`comment-${productId}`} className="sr-only">
            Escribe tu comentario
          </label>
          <Textarea
            id={`comment-${productId}`}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setMessage(null);
            }}
            maxLength={COMMENT_MAX_LENGTH}
            rows={3}
            placeholder="¿Qué te ha parecido? (máx. 500 caracteres)"
            className="min-h-28 rounded-2xl bg-background/70 p-4"
            disabled={isSending}
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground tabular-nums">
              {text.length}/{COMMENT_MAX_LENGTH}
            </span>
            <Button
              type="submit"
              size="sm"
              className="min-h-11"
              disabled={isSending || !text.trim()}
            >
              {isSending ? "Publicando..." : "Publicar comentario"}
            </Button>
          </div>
        </form>
      ) : isHydrated ? (
        <p className="text-sm text-muted-foreground">
          <a
            href={loginUrl(productSlug)}
            className="font-medium underline underline-offset-4 hover:text-foreground"
          >
            Inicia sesión
          </a>{" "}
          para comentar y dar like.
        </p>
      ) : null}

      {items.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {items.map((comment) => {
            const liked = isLiked(comment.id);
            const likeCount = displayedLikeCount(comment.id, comment.likeCount);

            return (
              <li
                key={comment.id}
                className="flex flex-col gap-3 rounded-2xl border border-coffee/10 bg-secondary/20 p-4 sm:p-5"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary font-heading text-xl text-primary-foreground"
                  >
                    {comment.authorName.trim()[0]?.toUpperCase() ?? "F"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{comment.authorName}</p>
                    <time className="text-xs text-muted-foreground">
                      {comment.createdAtLabel}
                    </time>
                  </div>
                </div>

                <p className="text-sm leading-6 break-words">{comment.text}</p>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-pressed={liked}
                    aria-label={`${liked ? "Quitar" : "Dar"} like a ${comment.authorName}`}
                    className="min-h-11"
                    onClick={() => handleToggleLike(comment.id)}
                  >
                    <ThumbsUp
                      className={cn("size-4", liked && "fill-current")}
                      aria-hidden
                    />
                    <span className="tabular-nums">{likeCount}</span>
                  </Button>

                  {canDelete(comment) ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label="Borrar comentario"
                      className="min-h-11 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      <span className="text-sm">Borrar</span>
                    </Button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Todavía no hay comentarios. ¡Anímate a ser la primera opinión!
        </p>
      )}
    </section>
  );
}
