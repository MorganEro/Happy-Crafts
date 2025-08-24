import { Favorite, Product } from '@prisma/client';

export type FavoriteWithProduct = Favorite & {
  product: Product;
};
