'use client';

import { FavoriteSubmitIcon } from '@/components/products/FavoriteSubmitIcon';
import { Spinner } from '@/components/ui/spinner';
import {
  useProductFavorite,
  useProductFavoritesQuery,
} from '@/lib/queries/product';
import { SignInButton, useUser } from '@clerk/nextjs';
import * as React from 'react';
import { FaRegHeart } from 'react-icons/fa';

type FavoriteToggleButtonProps = {
  productId: string;
};

export default function FavoriteToggleButton({
  productId,
}: FavoriteToggleButtonProps) {
  const { user } = useUser();

  const { data: initialFavoriteId, isLoading: isQueryLoading } =
    useProductFavoritesQuery({
      productId,
      enabled: !!user,
    });

  const [currentFavoriteId, setCurrentFavoriteId] = React.useState<
    string | null
  >(initialFavoriteId ?? null);
  const isFavorite = !!currentFavoriteId;

  const { mutate, isLoading: isMutating } = useProductFavorite({
    productId,
    favoriteId: currentFavoriteId,
    onSuccess: setCurrentFavoriteId,
  });

  // keep local state in sync if query result changes (e.g., re-auth)
  React.useEffect(() => {
    setCurrentFavoriteId(initialFavoriteId ?? null);
  }, [initialFavoriteId]);

  if (isQueryLoading) {
    return <Spinner />;
  }

  if (!user) {
    return (
      <SignInButton mode="modal">
        <FaRegHeart className="text-gray-400 h-4 w-4" />
      </SignInButton>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      disabled={isMutating}
      onClick={() => mutate()}
      className="inline-flex hover:scale-105 transition-transform duration-200 ease-in-out"
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
      <FavoriteSubmitIcon
        isFavorite={isFavorite}
        isLoading={isMutating}
      />
    </button>
  );
}
