"use client";

import { ThumbsUp, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";

import { createCommentAction, deleteCommentAction } from "@/actions/comments";
import type { MyInteractionState } from "@/actions/interactions";
import { toggleLikeAction } from "@/actions/likes";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "cn";
import type { ProductCommentDto } from "@/lib/interaction-types";

const COMMENT_MAX_LENGTH = 500;

interface LikeState {
  liked: boolean;
  likeCount: number;
}

type LikeStates = Record<string, LikeState>;

function loginUrl(productSlug: string) {
  return `/login?callbackUrl=${encodeURIComponent(`/menu/${productSlug}`)}`;
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmedLikes, setConfirmedLikes] = useState<LikeStates>({});
  const [optimisticLikes, setOptimisticLike] = useOptimistic(
    confirmedLikes,
    (current: LikeStates, update: { commentId: string; state: LikeState }) => ({
      ...current,
      [update.commentId]: update.state,
    }),
  );
  const [isLikePending, startLikeTransition] = useTransition();

  function getLikeState(comment: ProductCommentDto): LikeState {
    const override = optimisticLikes[comment.id];

    if (override) {
      return override;
    }

    return {
      liked: isHydrated && state.likedCommentIds.includes(comment.id),
      likeCount: comment.likeCount,
    };
  }

  async function handleSubmit() {
    setMessage(null);
    setIsSending(true);

    try {
      const result = await createCommentAction(productId, text);

      if (result.message) {
        setMessage(result.message);
        return;
      }

      if (result.comment) {
        setItems((current) => [...current, result.comment!]);
      }

      setText("");
    } catch {
      setMessage("No hemos podido publicar tu comentario.");
    } finally {
      setIsSending(false);
    }
  }

  function handleToggleLike(comment: ProductCommentDto) {
    if (!isHydrated || isLikePending) {
      return;
    }

    if (!state.isAuthed) {
      router.push(loginUrl(productSlug));
      return;
    }

    const current = getLikeState(comment);
    const next = {
      liked: !current.liked,
      likeCount: Math.max(0, current.likeCount + (current.liked ? -1 : 1)),
    };

    setMessage(null);
    startLikeTransition(async () => {
      setOptimisticLike({ commentId: comment.id, state: next });

      try {
        const result = await toggleLikeAction(comment.id);

        if (result.message || result.likeCount == null) {
          setMessage(result.message || "No hemos podido actualizar el like.");
          return;
        }

        const likeCount = result.likeCount;

        setConfirmedLikes((previous) => ({
          ...previous,
          [comment.id]: {
            liked: result.liked,
            likeCount,
          },
        }));
      } catch {
        setMessage("No hemos podido actualizar el like.");
      }
    });
  }

  async function handleDelete(commentId: string) {
    if (!window.confirm("¿Quieres borrar este comentario?")) {
      return;
    }

    setMessage(null);
    setDeletingId(commentId);

    try {
      const result = await deleteCommentAction(commentId);

      if (result.message) {
        setMessage(result.message);
        return;
      }

      setItems((current) =>
        current.filter((comment) => comment.id !== commentId),
      );
    } catch {
      setMessage("No hemos podido borrar el comentario.");
    } finally {
      setDeletingId(null);
    }
  }

  const canDelete = (comment: ProductCommentDto) =>
    state.isAdmin || (isHydrated && comment.authorId === state.userId);

  const displayedItems = items
    .map((comment) => ({ ...comment, ...getLikeState(comment) }))
    .toSorted(
      (first, second) =>
        second.likeCount - first.likeCount ||
        Date.parse(second.createdAt) - Date.parse(first.createdAt),
    );

  return (
    <section
      aria-labelledby="comments-heading"
      className="flex scroll-mt-28 flex-col gap-4"
    >
      <h2
        id="comments-heading"
        className="font-heading text-2xl font-normal text-coffee"
      >
        Comentarios:
      </h2>

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
            void handleSubmit();
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
            placeholder="¿Qué te ha parecido?…"
            className="min-h-28 rounded-xl bg-background/70 p-4"
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
              {isSending ? "Publicando…" : "Publicar comentario"}
            </Button>
          </div>
        </form>
      ) : isHydrated ? (
        <p className="text-sm text-muted-foreground">
          <Link
            href={loginUrl(productSlug)}
            className="font-medium underline underline-offset-4 hover:text-foreground"
          >
            Inicia sesión
          </Link>{" "}
          para comentar y dar like.
        </p>
      ) : null}

      {displayedItems.length > 0 ? (
        <ul className="flex flex-col">
          {displayedItems.map((comment) => {
            return (
              <li
                key={comment.id}
                className="flex flex-col gap-3 border-t border-coffee/10 py-4 first:border-t-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-xl text-primary-foreground"
                  >
                    {comment.authorName.trim()[0]?.toUpperCase() ?? "F"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{comment.authorName}</p>
                    <time
                      dateTime={comment.createdAt}
                      className="text-xs text-muted-foreground"
                    >
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
                    aria-pressed={comment.liked}
                    aria-label={`${comment.liked ? "Quitar" : "Dar"} like a ${comment.authorName}`}
                    className="min-h-11"
                    disabled={!isHydrated || isLikePending}
                    onClick={() => handleToggleLike(comment)}
                  >
                    <ThumbsUp
                      className={cn("size-4", comment.liked && "fill-current")}
                      aria-hidden
                    />
                    <span className="tabular-nums">{comment.likeCount}</span>
                  </Button>

                  {canDelete(comment) ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label="Borrar comentario"
                      className="min-h-11 text-destructive hover:text-destructive"
                      disabled={deletingId !== null}
                      onClick={() => handleDelete(comment.id)}
                    >
                      <Trash2 className="size-4" aria-hidden />
                      <span className="text-sm">
                        {deletingId === comment.id ? "Borrando…" : "Borrar"}
                      </span>
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
