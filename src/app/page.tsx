'use client';

import { ProductCard } from '@/components/ProductCard';
import { getProducts } from '@/services/products';
import { useQuery } from '@tanstack/react-query';
import { useAdmin } from '@/hooks/use-admin';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
    const { isAdmin, isLoading: isAuthLoading } = useAdmin()
  
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
    <div className="min-h-screen bg-blue-50 py-12 px-4 sm:px-6 lg:px-8 ">
      {!isAuthLoading && isAdmin && (
        <div className="flex justify-end mb-6">
            <Button variant="outline" size="sm" asChild>
              <Link href="/products/new" title="Add Product">
                <Plus className="h-4 w-4" aria-label="Add Product" />
                Add Product
              </Link>
            </Button>
          </div>
          )}
      <div className="max-w-7xl mx-auto">        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Leslie's Happy Crafts</h1>
          <p className="text-lg text-gray-600 font-semibold">Come explore my amazing collection of crafts and gift ideas</p>
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
