"use client";

import { useEffect, useState } from "react";

import {
  getMyInteractionState,
  type MyInteractionState,
} from "@/actions/interactions";
import { CommentsSection } from "@/components/comments/comments-section";
import { RatingSection } from "@/components/rating/rating-section";
import { Button } from "@/components/ui/button";
import type {
  ProductCommentDto,
  RatingSummaryDto,
} from "@/lib/interaction-types";

const GUEST_STATE: MyInteractionState = {
  isAuthed: false,
  isAdmin: false,
  rating: null,
  likedCommentIds: [],
  userId: null,
};

interface ProductInteractionsClientProps {
  productId: string;
  productSlug: string;
  summary: RatingSummaryDto;
  comments: ProductCommentDto[];
}

export function ProductInteractionsClient({
  productId,
  productSlug,
  summary,
  comments,
}: ProductInteractionsClientProps) {
  const [state, setState] = useState<MyInteractionState>(GUEST_STATE);
  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [requestVersion, setRequestVersion] = useState(0);

  useEffect(() => {
    let active = true;

    getMyInteractionState(productId)
      .then((nextState) => {
        if (active) {
          setState(nextState);
          setLoadStatus("ready");
        }
      })
      .catch(() => {
        if (active) {
          setLoadStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [productId, requestVersion]);

  const isLoaded = loadStatus === "ready";
  const resolvedState = isLoaded ? state : GUEST_STATE;

  return (
    <div className="flex min-w-0 flex-col">
      {loadStatus === "error" ? (
        <div
          role="alert"
          className="mb-4 flex flex-col items-start gap-3 rounded-xl border border-destructive/40 bg-card p-4 text-sm text-destructive"
        >
          <p>No hemos podido cargar tus opciones de participación.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setLoadStatus("loading");
              setRequestVersion((current) => current + 1);
            }}
          >
            Reintentar
          </Button>
        </div>
      ) : null}
      <RatingSection
        productId={productId}
        productSlug={productSlug}
        summary={summary}
        state={resolvedState}
        isHydrated={isLoaded}
      />
      <CommentsSection
        productId={productId}
        productSlug={productSlug}
        comments={comments}
        state={resolvedState}
        isHydrated={isLoaded}
      />
    </div>
  );
}
