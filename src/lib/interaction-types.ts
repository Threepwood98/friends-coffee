export interface ProductCommentDto {
  id: string;
  text: string;
  createdAt: string;
  createdAtLabel: string;
  likeCount: number;
  authorName: string;
  authorId: string;
}

export interface RatingSummaryDto {
  average: number | null;
  count: number;
}
