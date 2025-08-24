'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useUser } from '@clerk/nextjs';
import { useDeleteReview } from '@/lib/queries/review';
import { StarRating } from './StarRating';

type Review = {
  id: string;
  customerId: string;
  rating: number;
  comment: string;
  authorName: string;
  authorImageUrl: string;
  createdAt: string | Date;
};

export function ReviewCard({ review }: { review: Review }) {
  const { user } = useUser();
  const { mutate: deleteReview, isPending } = useDeleteReview();

  const isOwner = user?.id === review.customerId;
  const date = new Date(review.createdAt);

  return (
    <article className="rounded-2xl border p-4 bg-hc-teal-500/5">
      <div className="flex items-start gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-border">
          {review.authorImageUrl ? (
            <Image
              src={review.authorImageUrl}
              alt={review.authorName}
              fill
              sizes="40px"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-hc-cream" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {review.authorName}
              </p>
              <p className="text-xs text-muted-foreground">
                {date.toLocaleDateString()}
              </p>
            </div>
            <StarRating
              value={review.rating}
              label="Rating"
            />
          </div>

          <q className="mt-6 text-sm whitespace-pre-line">{review.comment}</q>

          {isOwner && (
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => deleteReview(review.id)}
                disabled={isPending}>
                {isPending ? 'Deleting…' : 'Delete review'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
