export type Review = {
  id: string;
  customerId: string;
  createdAt: Date;
  updatedAt: Date;
  rating: number;
  comment: string;
  authorName: string;
  authorImageUrl: string;
};

export type ReviewDisplay = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  rating: number;
  comment: string;
  authorName: string;
  authorImageUrl: string;
};
