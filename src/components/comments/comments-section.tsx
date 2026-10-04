"use client";

import { ThumbsUp, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";

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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [focusTargetId, setFocusTargetId] = useState<string | null | undefined>(
    undefined,
  );
  const headingRef = useRef<HTMLHeadingElement>(null);
  const commentRefs = useRef(new Map<string, HTMLLIElement>());
  const [confirmedLikes, setConfirmedLikes] = useState<LikeStates>({});
  const [optimisticLikes, setOptimisticLike] = useOptimistic(
    confirmedLikes,
    (current: LikeStates, update: { commentId: string; state: LikeState }) => ({
      ...current,
      [update.commentId]: update.state,
    }),
  );
  const [isLikePending, startLikeTransition] = useTransition();

  useEffect(() => {
    if (focusTargetId === undefined) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      if (focusTargetId) {
        commentRefs.current.get(focusTargetId)?.focus();
      } else {
        headingRef.current?.focus();
      }

      setFocusTargetId(undefined);
    });

    return () => cancelAnimationFrame(frame);
  }, [focusTargetId]);

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
    setStatusMessage(null);
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
      setStatusMessage("Comentario publicado.");
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
    setStatusMessage(null);
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

  async function handleDelete(
    commentId: string,
    nextFocusTargetId: string | null,
  ) {
    if (!window.confirm("¿Quieres borrar este comentario?")) {
      return;
    }

    setMessage(null);
    setStatusMessage(null);
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
      setStatusMessage("Comentario borrado.");
      setFocusTargetId(nextFocusTargetId);
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
      className="flex min-w-0 scroll-mt-[calc(var(--site-header-height)+env(safe-area-inset-top)+1rem)] flex-col gap-4 border-t border-coffee/10 pt-5 sm:pt-6"
    >
      <h2
        ref={headingRef}
        id="comments-heading"
        tabIndex={-1}
        className="font-heading text-2xl font-normal text-coffee focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Comentarios:
      </h2>

      {statusMessage ? (
        <p role="status" className="text-sm text-muted-foreground">
          {statusMessage}
        </p>
      ) : null}

      {message ? (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      ) : null}

      {isHydrated && state.isAuthed ? (
        <form
          className="flex flex-col gap-3"
          aria-busy={isSending}
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
            aria-describedby={`comment-${productId}-count`}
            placeholder="¿Qué te ha parecido?…"
            className="min-h-28 rounded-xl bg-background/70 p-4 md:text-base"
            disabled={isSending}
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              id={`comment-${productId}-count`}
              className="text-xs text-muted-foreground tabular-nums"
            >
              {text.length}/{COMMENT_MAX_LENGTH}
            </span>
            <Button
              type="submit"
              size="sm"
              className="min-h-11 max-w-full"
              disabled={isSending || !text.trim()}
            >
              {isSending ? "Publicando…" : "Publicar comentario"}
            </Button>
          </div>
        </form>
      ) : isHydrated ? (
        <p className="flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
          <Link
            href={loginUrl(productSlug)}
            className="inline-flex min-h-11 items-center rounded-sm font-medium underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Inicia sesión
          </Link>
          para comentar y dar like.
        </p>
      ) : null}

      {displayedItems.length > 0 ? (
        <ul className="flex min-w-0 flex-col">
          {displayedItems.map((comment, index) => {
            const nextFocusTargetId =
              displayedItems[index + 1]?.id ??
              displayedItems[index - 1]?.id ??
              null;

            return (
              <li
                key={comment.id}
                ref={(node) => {
                  if (node) {
                    commentRefs.current.set(comment.id, node);
                  } else {
                    commentRefs.current.delete(comment.id);
                  }
                }}
                tabIndex={-1}
                className="flex min-w-0 flex-col gap-3 border-t border-coffee/10 py-4 first:border-t-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-xl text-primary-foreground"
                  >
                    {comment.authorName.trim()[0]?.toUpperCase() ?? "F"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-medium leading-snug">
                      {comment.authorName}
                    </p>
                    <time
                      dateTime={comment.createdAt}
                      className="text-xs text-muted-foreground"
                    >
                      {comment.createdAtLabel}
                    </time>
                  </div>
                </div>

                <p className="text-sm leading-6 break-words">{comment.text}</p>

                <div className="flex flex-wrap items-center gap-2">
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
                      data-icon="inline-start"
                      className={cn(comment.liked && "fill-current")}
                      aria-hidden
                    />
                    <span className="tabular-nums">{comment.likeCount}</span>
                  </Button>

                  {canDelete(comment) ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={
                        deletingId === comment.id
                          ? `Borrando comentario de ${comment.authorName}`
                          : `Borrar comentario de ${comment.authorName}`
                      }
                      className="min-h-11 text-destructive hover:text-destructive"
                      disabled={deletingId !== null}
                      onClick={() =>
                        handleDelete(comment.id, nextFocusTargetId)
                      }
                    >
                      <Trash2 data-icon="inline-start" aria-hidden />
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
