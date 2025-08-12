import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

type ProductWithRelations = {
  id: string;
  name: string;
  company: string;
  description: string;
  image: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  customerId: string;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    authorName: string | null;
    authorImageUrl: string | null;
    createdAt: Date;
    updatedAt: Date | null;
    customerId: string;
    productId: string;
  }>;
  images: Array<{
    id: string;
    url: string;
    altText: string | null;
    isPrimary: boolean;
    productId: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
  likes: Array<{
    id: string;
    customerId: string;
    productId: string;
    createdAt: Date;
  }>;
  _count: {
    likes: number;
    reviews: number;
  };
  averageRating?: number;
  likeCount?: number;
  hasLiked?: boolean;
};

type RouteCtx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: RouteCtx) {
  try {
    const { id } = await ctx.params; // <-- await the params

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        reviews: { orderBy: { createdAt: 'desc' } },
        images: true,
        likes: true,
        _count: { select: { reviews: true, likes: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const reviews = product.reviews ?? [];
    const averageRating =
      reviews.length ? reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length : 0;

    // Define the response data type
    type ProductResponse = Omit<ProductWithRelations, 'likes' | '_count'> & {
      images: Array<{ id: string; url: string; altText: string | null; isPrimary: boolean; productId: string; createdAt: Date; updatedAt: Date; }>;
      reviews: Array<{
        id: string;
        rating: number;
        comment: string | null;
        authorName: string | null;
        authorImageUrl: string | null;
        createdAt: Date;
        updatedAt: Date | null;
        customerId: string;
        productId: string;
      }>;
      averageRating: number;
      likeCount: number;
      reviewCount: number;
      hasLiked: boolean;
    };

    const responseData: ProductResponse = {
      ...product,
      images: product.images ?? [],
      reviews,
      averageRating: Number(averageRating.toFixed(1)),
      likeCount: product._count?.likes ?? 0,
      reviewCount: product._count?.reviews ?? 0,
      hasLiked: false,
    };
    
    // Remove the _count property as it's not needed in the response
    delete (responseData as Partial<typeof responseData> & { _count?: unknown })._count;

    const session = await auth();
    const { userId: clerkId } = session;
    if (clerkId) {
      responseData.hasLiked = (product.likes ?? []).some(like => like.customerId === clerkId);
    }

    return NextResponse.json(responseData);
  } catch (err) {
    console.error('Error fetching product:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


import { isAdmin } from '@/lib/auth-utils';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return new NextResponse('Forbidden: Admin access required', { status: 403 });
    }

    // Delete the product
    try {
      await prisma.product.delete({
        where: { id: params.id },
      });
    } catch (error: unknown) {
      // Check if error is a Prisma error with code property
      const isPrismaError = error && 
                          typeof error === 'object' && 
                          'code' in error && 
                          typeof error.code === 'string';
                          
      if (isPrismaError && error.code === 'P2025') { // Record not found
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      console.error('Error deleting product:', error);
      throw error;
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated
    const session = await auth();
    if (!session.userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin
    const isUserAdmin = await isAdmin();
    if (!isUserAdmin) {
      return new NextResponse('Forbidden: Admin access required', { status: 403 });
    }

    // Parse and validate request body
    const body = await request.json();
    const { name, company, description, image, price } = body;

    if (!name || !company || !description || !image || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update the product
    try {
      const updatedProduct = await prisma.product.update({
        where: { id: params.id },
        data: {
          name,
          company,
          description,
          image,
          price: Number(price),
        },
      });

      return NextResponse.json(updatedProduct);
    } catch (error: unknown) {
      // Check if error is a Prisma error with code property
      const isPrismaError = error && 
                          typeof error === 'object' && 
                          'code' in error && 
                          typeof error.code === 'string';
                          
      if (isPrismaError && error.code === 'P2025') { // Record not found
        return NextResponse.json(
          { error: 'Product not found' },
          { status: 404 }
        );
      }
      console.error('Error updating product:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in PATCH /api/products/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
