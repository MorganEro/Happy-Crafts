import { auth } from '@clerk/nextjs/server';
import db from '@/lib/db';
import { isProductCategory, isProductTag } from '@/lib/constants';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
export async function DELETE(req: Request) {
  const { userId } = await auth();
  const { productId } = await req.json();

  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await db.product.delete({
      where: { id: productId },
    });
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

// app/api/products/route.ts (example)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cat = searchParams.get('category');
  const rawTags = searchParams.getAll('tag');

  const category = cat && isProductCategory(cat) ? cat : undefined;
  const tags = rawTags.filter(isProductTag);

  const products = await prisma.product.findMany({
    where: {
      category,
      ...(tags.length ? { tags: { hasEvery: tags } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(products);
}
