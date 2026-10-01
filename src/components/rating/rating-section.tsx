"use client";

import { Coffee } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { submitRatingAction } from "@/actions/rating";
import type { MyInteractionState } from "@/actions/interactions";
import { cn } from "cn";
import type { RatingSummaryDto } from "@/lib/interaction-types";

const averageFormatter = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 1,
});

function loginUrl(productSlug: string) {
  return `/login?callbackUrl=${encodeURIComponent(`/carta/${productSlug}`)}`;
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

  const displayedRating =
    optimisticRating ?? (isHydrated ? state.rating : null);
  const displayedSummary = optimisticSummary ?? summary;

  function handleRate(value: number) {
    if (!state.isAuthed) {
      router.push(loginUrl(productSlug));
      return;
    }

    setOptimisticRating(value);

    if (state.rating == null) {
      if (summary.count > 0) {
        const previousAverage = summary.average ?? 0;
        const nextAverage =
          (previousAverage * summary.count + value) / (summary.count + 1);

        setOptimisticSummary({
          average: Number(nextAverage.toFixed(1)),
          count: summary.count + 1,
        });
      } else {
        setOptimisticSummary({ average: value, count: 1 });
      }
    }

    void submitRatingAction(productId, value);
  }

  const summaryText =
    displayedSummary.count > 0
      ? `${averageFormatter.format(displayedSummary.average ?? 0)} de 5 · ${displayedSummary.count} ${displayedSummary.count === 1 ? "valoración" : "valoraciones"}`
      : "Sin valoraciones todavía";

  return (
    <section
      aria-labelledby="rating-heading"
      className="friends-surface friends-raised flex flex-col gap-5 p-6 sm:p-8"
    >
      <div>
        <p className="friends-kicker mb-1 text-[0.68rem] font-semibold text-primary">
          Tu taza cuenta
        </p>
        <h2
          id="rating-heading"
          className="font-heading text-3xl font-normal text-coffee sm:text-4xl"
        >
          Valora este producto
        </h2>
      </div>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div
          role="group"
          aria-label="Puntuación con tazas"
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
                aria-label={`Valorar con ${value} taza${value === 1 ? "" : "s"} de 5`}
                aria-pressed={displayedRating === value}
                className={cn(
                  "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  selected
                    ? "bg-accent/20 text-coffee"
                    : "bg-secondary/30 text-muted-foreground/40",
                )}
              >
                <Coffee className="size-7 fill-current" aria-hidden />
              </button>
            );
          })}
        </div>

        <p className="rounded-full bg-secondary/35 px-4 py-2 text-sm text-muted-foreground">
          {summaryText}
        </p>
      </div>

      {isHydrated && !state.isAuthed ? (
        <p className="text-sm text-muted-foreground">
          <a
            href={loginUrl(productSlug)}
            className="font-medium underline underline-offset-4 hover:text-foreground"
          >
            Inicia sesión
          </a>{" "}
          para dejar tu valoración.
        </p>
      ) : null}
    </section>
  );
}
