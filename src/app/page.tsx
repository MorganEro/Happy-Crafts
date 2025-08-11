'use client';

import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/services/products';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    // Log the error to console for debugging
    console.error('Error fetching products:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Featured Products</h1>
          <p className="text-lg text-gray-600">Discover our amazing collection of products</p>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  hasLiked: false, // Add this if your ProductWithRelations includes it
                  _count: {
                    reviews: product._count?.reviews || 0,
                    likes: product._count?.likes || 0
                  },
                  averageRating: product.averageRating || 0
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700">No products found</h2>
            <p className="mt-2 text-gray-500">Check back later for new arrivals!</p>
          </div>
        )}
      </div>
    </div>
  );
}
