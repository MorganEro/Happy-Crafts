import { Prisma } from '@prisma/client';

export type { Product, Review, User, ProductImage } from '@prisma/client';

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    reviews: true;
    images: true;
    _count: {
      select: {
        reviews: boolean;
      };
    };
  };
}>;

export type ProductWithImages = Prisma.ProductGetPayload<{
  include: {
    images: true;
  };
}>;

export type ProductImageWithProduct = Prisma.ProductImageGetPayload<{
  include: {
    product: true;
  };
}>;
