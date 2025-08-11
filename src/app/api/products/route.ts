import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getPrismaClient } from '@/lib/prisma';
import { ensureAdmin } from '@/lib/check-role';
import { productSchema } from '@/lib/form-utils';

/**
 * POST endpoint for creating a new product
 * Expects a JSON body with product data
 * Handles file uploads to Supabase Storage
 */
export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    // Check if user is admin using our utility
    try {
      await ensureAdmin();
    } catch (error) {
      return new NextResponse('Forbidden: Admin access required', { status: 403 });
    }

    const body = await request.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid product data', 
          details: validation.error.format() 
        },
        { status: 400 }
      );
    }

    // Get a Prisma client with RLS context
    const prisma = await getPrismaClient();
    if (!prisma) {
      throw new Error('Failed to initialize Prisma client');
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the main product
      const product = await tx.product.create({
        data: {
          name: validation.data.name,
          company: validation.data.company,
          description: validation.data.description,
          price: validation.data.price,
          image: validation.data.image, // This should be the main image URL
          customerId: userId,
        },
      });

      // 2. If there are additional images, create ProductImage records
      if (validation.data.additionalImages && validation.data.additionalImages.length > 0) {
        await tx.productImage.createMany({
          data: validation.data.additionalImages.map((imgUrl: string, index: number) => ({
            url: imgUrl,
            altText: `${validation.data.name} - Image ${index + 2}`,
            isPrimary: false,
            productId: product.id,
          })),
        });
      }

      // 3. If there's a main image, ensure it exists in ProductImage
      if (validation.data.image) {
        // First, check if an image with this URL already exists for this product
        const existingImage = await tx.productImage.findFirst({
          where: {
            url: validation.data.image,
            productId: product.id,
          },
        });

        if (existingImage) {
          // Update existing image
          await tx.productImage.update({
            where: { id: existingImage.id },
            data: { isPrimary: true },
          });
        } else {
          // Create new image
          await tx.productImage.create({
            data: {
              url: validation.data.image,
              altText: `${validation.data.name} - Main Image`,
              isPrimary: true,
              productId: product.id,
            },
          });
        }
      }

      // Return the created product with its images
      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          images: true,
        },
      });
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    
    // If there's an error and it has a fileUrl property, log it for manual cleanup
    if (error && typeof error === 'object' && 'fileUrl' in error && typeof error.fileUrl === 'string') {
      console.warn('File may need manual cleanup:', error.fileUrl);
      // Note: In a production environment, you might want to implement a cleanup job
      // or use a more robust solution for handling failed uploads
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for retrieving a list of products
 * Includes related reviews and likes counts
 * Sorted by creation date (newest first)
 */
export async function GET() {
  try {
    const prisma = await getPrismaClient();
    if (!prisma) {
      throw new Error('Failed to initialize Prisma client');
    }

    const products = await prisma.product.findMany({
      include: {
        reviews: true,
        likes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to include review count and average rating
    const productsWithStats = products.map((product) => {
      const reviewCount = product.reviews.length;
      const averageRating =
        reviewCount > 0
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviewCount
          : 0;

      return {
        ...product,
        reviewCount,
        averageRating,
        likeCount: product.likes.length,
      };
    });

    return NextResponse.json(productsWithStats);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
