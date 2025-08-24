'use server';

import { default as db, default as prisma } from '@/lib/db';

import { checkRole } from '@/lib/roles';
import { deleteImage } from '@/lib/supabase';
import { renderError } from '@/lib/utils/error';
import { errorMessage, productFormSchema, productUpdateSchema } from '@/types';
import { auth } from '@clerk/nextjs/server';
import { Product } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';

export type CreateResult =
  | { success: true; productId: string }
  | { success: false; error: string };

export type UpdateResult =
  | { success: true; productId: string }
  | { success: false; error: string };

type ToggleFavoriteParams = {
  productId: string;
  favoriteId: string | null;
};
export const fetchAllProducts = async () => {
  return db.product.findMany({
    orderBy: {
      name: 'asc',
    },
  });
};

export const fetchProductWithImages = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      images: {
        orderBy: [
          { isPrimary: 'desc' as const },
          { createdAt: 'asc' as const },
        ],
      },
    },
  });

  if (!product) {
    redirect('/products');
  }
  return product;
};

export const fetchAdminProducts = async () => {
  const products = await db.product.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  });
  return products;
};

export async function createProductAction(raw: unknown): Promise<CreateResult> {
  try {
    const data = productFormSchema.parse(raw);

    const { images, mainImageIndex } = data;
    if (mainImageIndex < 0 || mainImageIndex >= images.length) {
      return { success: false, error: 'Main image index out of range' };
    }

    const mainImageUrl = images[mainImageIndex];

    const created = await prisma.$transaction(async tx => {
      const product = await tx.product.create({
        data: {
          name: data.name,
          company: data.company,
          description: data.description,
          category: data.category,
          options: data.options,
          tags: data.tags,
          price: data.price,
          image: mainImageUrl,
        },
      });

      await tx.productImage.createMany({
        data: images.map((url, i) => ({
          productId: product.id,
          url,
          isPrimary: i === mainImageIndex,
          altText: '',
        })),
      });

      return product;
    });

    return { success: true, productId: created.id };
  } catch (err: unknown) {
    // ✅ cleanup orphan images if validation failed after upload
    try {
      const parsed = productFormSchema.safeParse(raw);
      if (parsed.success) {
        await Promise.allSettled(
          parsed.data.images.map(u => deleteImage(u, 'PRODUCTS'))
        );
      }
    } catch {
      // ignore cleanup errors
    }

    // Handle Zod validation errors
    if (err instanceof ZodError) {
      return {
        success: false,
        error: err.issues.map(e => e.message).join(', '),
      };
    }

    if (err instanceof Error) {
      return { success: false, error: err.message };
    }

    return { success: false, error: 'Failed to create product' };
  }
}

export async function updateProductAction(raw: unknown): Promise<UpdateResult> {
  try {
    const data = productUpdateSchema.parse(raw);
    const { id, images, mainImageIndex } = data;

    if (mainImageIndex >= images.length) {
      return { success: false, error: 'Main image index out of range' };
    }

    // fetch current images (to compute deletions)
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });
    if (!existing) return { success: false, error: 'Product not found' };

    const currentUrls = new Set(existing.images.map(i => i.url));
    const nextUrls = new Set(images);
    const toDelete = [...currentUrls].filter(u => !nextUrls.has(u));

    // delete removed assets in storage (best-effort)
    await Promise.allSettled(toDelete.map(u => deleteImage(u, 'PRODUCTS')));

    const mainUrl = images[mainImageIndex];

    // Replace ProductImage rows + update Product
    const updated = await prisma.$transaction(async tx => {
      // Update base fields
      const p = await tx.product.update({
        where: { id },
        data: {
          name: data.name,
          company: data.company,
          description: data.description,
          category: data.category,
          options: data.options,
          tags: data.tags,
          price: data.price,
          image: mainUrl, // mirror primary
        },
      });

      // Drop all image rows, recreate in desired order
      await tx.productImage.deleteMany({ where: { productId: id } });

      await tx.productImage.createMany({
        data: images.map((url, i) => ({
          productId: id,
          url,
          isPrimary: i === mainImageIndex,
          altText: '',
        })),
      });

      return p;
    });

    return { success: true, productId: updated.id };
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
    return { success: false, error: 'Failed to update product' };
  }
}

export const deleteProductAction = async (prevState: { productId: string }) => {
  const { productId } = prevState;
  try {
    const deletedProduct = await db.product.delete({
      where: {
        id: productId,
      },
    });

    await deleteImage(deletedProduct.image, 'PRODUCTS');
    const cookieStore = await cookies();
    cookieStore.set(
      'success',
      `Product ${deletedProduct.name} deleted successfully`,
      { maxAge: 5 }
    );
    revalidatePath('/admin/products');
    return { message: 'Product deleted successfully' };
  } catch (error) {
    return renderError(error);
  }
};

export const fetchAdminProductDetails = async (
  productId: string
): Promise<Product | errorMessage> => {
  if (!checkRole('admin')) {
    return { message: 'Unauthorized. Admin access required.' };
  }

  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
  });
  if (!product) redirect('/admin/products');
  return product;
};

export const fetchFavoriteId = async ({ productId }: { productId: string }) => {
  const { userId } = await auth();
  if (!userId) {
    return { message: 'Unauthorized. Please sign in.' };
  }
  const favorite = await db.favorite.findFirst({
    where: { productId, customerId: userId },
    select: { id: true },
  });
  return favorite?.id || null;
};

export const toggleFavoriteAction = async ({
  productId,
  favoriteId,
}: ToggleFavoriteParams) => {
  const { userId } = await auth();
  if (!userId) return null;

  try {
    if (favoriteId) {
      await db.favorite.delete({
        where: { id: favoriteId },
      });
      return null;
    } else {
      const favorite = await db.favorite.create({
        data: {
          productId,
          customerId: userId,
        },
      });
      return favorite.id;
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return null;
  }
};

export const fetchUserFavorites = async () => {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const favorites = await db.favorite.findMany({
    where: { customerId: userId },
    include: { product: true },
  });
  return favorites;
};
