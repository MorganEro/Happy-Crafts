import {
  fetchAllProducts,
  fetchProductWithImages,
  fetchUserFavorites,
  toggleFavoriteAction,
} from '@/actions/product-actions';
import { FavoriteWithProduct } from '@/types';
import { Product } from '@prisma/client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const productKeys = {
  single: (id: string) => ['product', id] as const,
  all: ['products'] as const,
  favorites: ['products', 'favorites'] as const,
};

// Queries
export const useProductQuery = (id: string) => {
  return useQuery({
    queryKey: productKeys.single(id),
    queryFn: () => fetchProductWithImages(id),
    staleTime: 0,
    retry: false,
  });
};
export const useProductsQuery = () => {
  return useQuery<Product[]>({
    queryKey: productKeys.all,
    queryFn: fetchAllProducts,
    staleTime: 0,
    retry: false,
  });
};

export const useUserFavoritesQuery = (enabled = true) => {
  return useQuery<FavoriteWithProduct[]>({
    queryKey: productKeys.favorites,
    queryFn: fetchUserFavorites,
    enabled,
    staleTime: 0,
    retry: false,
  });
};

export const useProductFavoritesQuery = ({
  productId,
  enabled = true,
}: {
  productId: string;
  enabled?: boolean;
}) => {
  const { data: favorites, isLoading } = useUserFavoritesQuery(enabled);
  const favoriteId =
    favorites?.find(
      (favorite: FavoriteWithProduct) => favorite.productId === productId
    )?.id || null;

  return { data: favoriteId, isLoading };
};

// Mutations
type UseProductFavoriteProps = {
  productId: string;
  favoriteId: string | null;
  onSuccess?: (newFavoriteId: string | null) => void;
};

export function useProductFavorite({
  productId,
  favoriteId,
  onSuccess,
}: UseProductFavoriteProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation<string | null, Error, void>({
    mutationFn: async () => {
      return await toggleFavoriteAction({ productId, favoriteId });
    },
    onError: () => {
      toast.error('Failed to update favorite');
    },
    onSuccess: async newFavoriteId => {
      await queryClient.invalidateQueries({
        queryKey: productKeys.favorites,
      });

      onSuccess?.(newFavoriteId);
    },
  });

  return {
    mutate: mutation.mutate,
    isLoading: mutation.isPending,
  };
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: string) => {
      const result = await fetch(`/api/product/delete`, {
        method: 'DELETE',
        body: JSON.stringify({ productId }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!result.ok) {
        throw new Error('Failed to delete product');
      }
      return result.json();
    },
    onSuccess: data => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: ['products'],
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
