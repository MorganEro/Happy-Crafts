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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Fetching product with ID:', id);
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        reviews: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        images: true,
        likes: true,
        _count: {
          select: {
            reviews: true,
            likes: true,
          },
        },
      },
    });
    
    console.log('Found product:', product ? 'yes' : 'no');
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Calculate average rating and prepare the response
    const reviews = product.reviews || [];
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / reviews.length
      : 0;
    
    // Prepare the response object
    const responseData: any = {
      ...product,
      images: product.images || [],
      reviews: reviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      likeCount: product._count?.likes || 0,
      reviewCount: product._count?.reviews || 0,
      hasLiked: false, // Will be set below if user is authenticated
    };
    
    // Remove the _count field as it's not needed in the response
    delete responseData._count;

    // Check if current user has liked the product
    const session = await auth();
    const { userId: clerkId } = session;
    
    if (clerkId) {
      responseData.hasLiked = (product.likes || []).some((like: { customerId: string }) => like.customerId === clerkId);
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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
    } catch (error: any) {
      if (error?.code === 'P2025') { // Record not found
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
    } catch (error: any) {
      if (error?.code === 'P2025') { // Record not found
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
