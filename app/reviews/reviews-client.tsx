'use client';

import { useAllReviews } from '@/lib/queries/review';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import type { Review } from '@prisma/client';

export function ReviewsListClient() {
  const { data, isLoading, isError } = useAllReviews();

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading reviews…</div>;
  }

  if (isError || !data) {
    return <div className="text-sm text-red-600">Failed to load reviews.</div>;
  }

  if ('message' in data) {
    return <div className="text-sm text-red-600">{data.message}</div>;
  }

  if (data.length === 0) {
    return <div className="text-sm text-muted-foreground">No reviews yet.</div>;
  }

  // here TypeScript knows data is Review[]
  return (
    <ul className="space-y-4">
      {data.map((r: Review) => (
        <li key={r.id}>
          <ReviewCard review={r} />
        </li>
      ))}
    </ul>
  );
}
