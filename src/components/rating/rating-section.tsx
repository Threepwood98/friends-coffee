"use client";

import { StarIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { submitRatingAction } from "@/actions/rating";
import type { MyInteractionState } from "@/actions/interactions";
import { cn } from "cn";
import type { RatingSummaryDto } from "@/lib/interaction-types";

const averageFormatter = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 1,
});

function loginUrl(productSlug: string) {
  return `/login?callbackUrl=${encodeURIComponent(`/menu/${productSlug}`)}`;
}

interface RatingSectionProps {
  productId: string;
  productSlug: string;
  summary: RatingSummaryDto;
  state: MyInteractionState;
  isHydrated: boolean;
}

export function RatingSection({
  productId,
  productSlug,
  summary,
  state,
  isHydrated,
}: RatingSectionProps) {
  const router = useRouter();
  const [optimisticRating, setOptimisticRating] = useState<number | null>(null);
  const [optimisticSummary, setOptimisticSummary] =
    useState<RatingSummaryDto | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const displayedRating =
    optimisticRating ?? (isHydrated ? state.rating : null);
  const displayedSummary = optimisticSummary ?? summary;

  function handleRate(value: number) {
    if (!isHydrated || isPending) {
      return;
    }

    if (!state.isAuthed) {
      router.push(loginUrl(productSlug));
      return;
    }

    const previousRating = displayedRating;
    const previousSummary = displayedSummary;
    const totalBeforeVote =
      (previousSummary.average ?? 0) * previousSummary.count;
    const nextSummary =
      previousRating == null
        ? {
            average: (totalBeforeVote + value) / (previousSummary.count + 1),
            count: previousSummary.count + 1,
          }
        : {
            average:
              previousSummary.count > 0
                ? (totalBeforeVote - previousRating + value) /
                  previousSummary.count
                : value,
            count: Math.max(1, previousSummary.count),
          };

    setMessage(null);
    setOptimisticRating(value);
    setOptimisticSummary(nextSummary);

    startTransition(async () => {
      try {
        const result = await submitRatingAction(productId, value);

        if (result.message || result.rating == null || !result.summary) {
          setOptimisticRating(previousRating);
          setOptimisticSummary(previousSummary);
          setMessage(
            result.message || "No hemos podido guardar tu valoración.",
          );
          return;
        }

        setOptimisticRating(result.rating);
        setOptimisticSummary(result.summary);
      } catch {
        setOptimisticRating(previousRating);
        setOptimisticSummary(previousSummary);
        setMessage("No hemos podido guardar tu valoración.");
      }
    });
  }

  const summaryText =
    displayedSummary.count > 0
      ? `${averageFormatter.format(displayedSummary.average ?? 0)} de 5 · ${displayedSummary.count} ${displayedSummary.count === 1 ? "valoración" : "valoraciones"}`
      : "Sin valoraciones todavía";

  return (
    <section
      aria-labelledby="rating-heading"
      aria-busy={!isHydrated || isPending}
      className="flex min-w-0 flex-col gap-2 pb-5 sm:pb-6"
    >
      <h2
        id="rating-heading"
        className="font-heading text-2xl font-normal text-coffee"
      >
        Tu valoración:
      </h2>

      <div className="flex flex-wrap items-center gap-3">
        <div
          role="group"
          aria-label="Puntuación con estrellas"
          className="flex items-center gap-1"
        >
          {[1, 2, 3, 4, 5].map((value) => {
            const selected =
              displayedRating != null && value <= displayedRating;

            return (
              <button
                key={value}
                type="button"
                onClick={() => handleRate(value)}
                aria-label={`Valorar con ${value} estrella${value === 1 ? "" : "s"} de 5`}
                aria-pressed={displayedRating === value}
                disabled={!isHydrated || isPending}
                className={cn(
                  "inline-flex size-11 items-center justify-center rounded-lg hover:bg-accent/15 hover:text-coffee motion-safe:transition-[color,background-color,transform] motion-safe:hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-60",
                  selected
                    ? "bg-accent/15 text-coffee"
                    : "text-muted-foreground",
                )}
              >
                <StarIcon
                  className={cn("size-7", selected && "fill-current")}
                  aria-hidden
                />
              </button>
            );
          })}
        </div>

        <p
          aria-live="polite"
          aria-atomic="true"
          className="text-sm text-muted-foreground"
        >
          {summaryText}
        </p>
      </div>

      {isHydrated && !state.isAuthed ? (
        <p className="flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
          <Link
            href={loginUrl(productSlug)}
            className="inline-flex min-h-11 items-center rounded-sm font-medium underline underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Inicia sesión
          </Link>
          para dejar tu valoración.
        </p>
      ) : null}

      {message ? (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      ) : null}
    </section>
  );
}
