import { Review } from '@prisma/client';

export type ReviewWithAuthor = Review & {
  authorName: string | null;
  authorImageUrl: string | null;
};

export type ProductWithReviews = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  company: string;
  image: string;
  averageRating: number | null;
  reviews: ReviewWithAuthor[];
  _count: {
    reviews: number;
  };
};
