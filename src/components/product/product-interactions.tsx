"use client";

import { useEffect, useState } from "react";

import {
  getMyInteractionState,
  type MyInteractionState,
} from "@/actions/interactions";
import { CommentsSection } from "@/components/comments/comments-section";
import { RatingSection } from "@/components/rating/rating-section";
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

interface ProductInteractionsProps {
  productId: string;
  productSlug: string;
  summary: RatingSummaryDto;
  comments: ProductCommentDto[];
}

export function ProductInteractions({
  productId,
  productSlug,
  summary,
  comments,
}: ProductInteractionsProps) {
  const [state, setState] = useState<MyInteractionState>(GUEST_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    getMyInteractionState(productId)
      .then((nextState) => {
        if (active) {
          setState(nextState);
        }
      })
      .catch(() => {
        // Keep the guest state on failure; the page still works read-only.
      })
      .finally(() => {
        if (active) {
          setIsLoaded(true);
        }
      });

    return () => {
      active = false;
    };
  }, [productId]);

  const resolvedState = isLoaded ? state : GUEST_STATE;

  return (
    <div className="flex flex-col gap-6">
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
