import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import {
  createReviewAction,
  fetchAllReviews,
  fetchMyReview,
} from '@/actions/review-actions';
import { ReviewClientValues } from '@/types';
import type { Review } from '@prisma/client';

//Queries
export function useMyReview() {
  const { user } = useUser();
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: ['review', 'user', userId], // ⬅️ EXACTLY matches layout.tsx
    queryFn: fetchMyReview, // server action returns Review | null
    enabled: !!userId,
  });
}

export function useAllReviews() {
  return useQuery<Review[] | { message: string }>({
    queryKey: ['reviews', 'all'],
    queryFn: fetchAllReviews,
  });
}

//Mutations

export function useCreateReview() {
  const { user } = useUser();
  const userId = user?.id ?? null;
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (vals: ReviewClientValues) => {
      const res = await createReviewAction(vals);
      if (!res.success) throw new Error(res.error);
      return res.reviewId;
    },
    onSuccess: () => {
      toast('Thanks for your review!');
      qc.invalidateQueries({ queryKey: ['review', 'user', userId] }); // ⬅️ same key
    },
    onError: (e: unknown) => {
      const msg = e instanceof Error ? e.message : 'Failed to create review';
      toast.error(msg);
    },
  });
}

export function useDeleteReview() {
  const qc = useQueryClient();
  const { user } = useUser();
  const userId = user?.id ?? null;

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const res = await fetch(`/api/review/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => 'Failed to delete review');
        throw new Error(msg || 'Failed to delete review');
      }
      return res.json() as Promise<{ message: string }>;
    },
    onSuccess: data => {
      toast(data.message);
      qc.invalidateQueries({ queryKey: ['review', 'user', userId] });
      qc.invalidateQueries({ queryKey: ['reviews', 'all'] });
    },
    onError: (e: unknown) => {
      toast.error(e instanceof Error ? e.message : 'Delete failed');
    },
  });
}
