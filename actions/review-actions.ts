'use server';

import prisma from '@/lib/db';
import { reviewCreateSchema } from '@/types/zod-schema';
import { ZodError } from 'zod';
import { auth, currentUser } from '@clerk/nextjs/server';
import { Review } from '@prisma/client';

type CreateReviewResult =
  | { success: true; reviewId: string }
  | { success: false; error: string };

export async function createReviewAction(
  raw: unknown
): Promise<CreateReviewResult> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: 'Unauthorized' };

    // enforce one review per user
    const already = await prisma.review.findFirst({
      where: { customerId: userId },
    });
    if (already)
      return { success: false, error: 'You already submitted a review.' };

    const parsed = reviewCreateSchema.parse(raw);

    // Fill author fields from Clerk if not provided
    const user = await currentUser();
    const authorName =
      parsed.authorName ??
      ([user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() ||
        'Anonymous');
    const authorImageUrl = parsed.authorImageUrl ?? user?.imageUrl ?? '';

    const created = await prisma.review.create({
      data: {
        customerId: userId,
        rating: parsed.rating,
        comment: parsed.comment,
        authorName,
        authorImageUrl,
      },
    });

    return { success: true, reviewId: created.id };
  } catch (err: unknown) {
    if (err instanceof ZodError) {
      return {
        success: false,
        error: err.issues.map(i => i.message).join(', '),
      };
    }
    if (err instanceof Error) {
      return { success: false, error: err.message };
    }
    return { success: false, error: 'Failed to create review' };
  }
}

/** Fetch all reviews (you already had this; keeping here for locality) */
export async function fetchAllReviews(): Promise<
  Review[] | { message: string }
> {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return reviews;
  } catch (e) {
    return { message: 'Failed to load reviews' };
  }
}
export async function fetchLatestReviews(limit = 12) {
  return prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/** Fetch the current user’s review (or null) */
export async function fetchMyReview() {
  const { userId } = await auth();
  if (!userId) return null;
  return prisma.review.findFirst({ where: { customerId: userId } });
}
