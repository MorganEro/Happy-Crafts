'use client';

import { ProductCard } from '@/components/products/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import Loading from '@/components/ui/Loading';
import { PageHeader } from '@/components/ui/PageHeader';
import { Separator } from '@/components/ui/separator';
import { useUserFavoritesQuery } from '@/lib/queries/product';
import { FavoriteWithProduct } from '@/types';

export default function FavoritesPage() {
  const { data, isLoading, isError, error } = useUserFavoritesQuery(true);

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">
        <PageHeader title="Favorites" />
        <div className="rounded-2xl border p-6 bg-red-50 text-red-900">
          <p className="font-semibold">Couldn’t load favorites.</p>
          <p className="text-sm opacity-80">{(error as Error).message}</p>
        </div>
      </main>
    );
  }

  const items = (data ?? []) as FavoriteWithProduct[];

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6">
      <PageHeader
        title="Favorites"
        subtitle={`${items.length} ${
          items.length === 1 ? 'Product' : 'Products'
        } in your favorites`}
      />
      <Separator className="mb-8" />
      {items.length === 0 ? (
        <EmptyState
          heading="No favorites yet"
          content="Save products to revisit them later."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map(f => (
            <ProductCard
              id={f.product.id}
              name={f.product.name}
              imageUrl={f.product.image}
              key={f.product.id}
            />
          ))}
        </div>
      )}
    </main>
  );
}
