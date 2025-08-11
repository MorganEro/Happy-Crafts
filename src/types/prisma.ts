import { Prisma } from '@prisma/client';

// Re-export types we need
export type { Product, Review } from '@prisma/client';

// Define the review type with author information
export type ReviewWithAuthor = Prisma.ReviewGetPayload<{
  select: {
    id: true;
    rating: true;
    comment: true;
    authorName: true;
    authorImageUrl: true;
    createdAt: true;
    updatedAt: true;
    customerId: true;
    productId: true;
  };
}>;

// Define the full product type with reviews and count
export type ProductWithReviews = Prisma.ProductGetPayload<{
  include: {
    reviews: {
      select: {
        id: true;
        rating: true;
        comment: true;
        authorName: true;
        authorImageUrl: true;
        createdAt: true;
        updatedAt: true;
        customerId: true;
        productId: true;
      };
    };
  };
}> & {
  _count: {
    reviews: number;
  };
};

// Type for the review data we display in the UI
export interface DisplayReview {
  id: string;
  rating: number;
  comment: string | null;
  authorName: string | null;
  authorImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  customerId: string;
  productId: string;
};
