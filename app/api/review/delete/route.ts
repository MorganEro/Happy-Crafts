import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { reviewId } = await req
    .json()
    .catch(() => ({} as { reviewId?: string }));
  if (!reviewId) {
    return new NextResponse('Missing reviewId', { status: 400 });
  }

  // Ensure the review belongs to this user
  const existing = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!existing || existing.customerId !== userId) {
    return new NextResponse('Not found', { status: 404 });
  }

  await prisma.review.delete({ where: { id: reviewId } });

  return NextResponse.json({ message: 'Review deleted' });
}
