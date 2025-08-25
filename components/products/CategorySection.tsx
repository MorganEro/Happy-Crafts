'use client';

import { useProductsQuery } from '@/lib/queries/product';
import Link from 'next/link';
import { ProductCard } from './ProductCard';
import { categoryToSlug } from '@/lib/slug';

function CategorySection() {
  const { data: products, error } = useProductsQuery();

  const productsByCategory = (products || []).reduce((acc, product) => {
    const category = product.category || 'UnCategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {} as Record<string, typeof products>);

  // 2. Get unique categories
  const categories = Object.keys(productsByCategory);

  if (error) {
    // Log the error to console for debugging
    console.error('Error fetching products:', error);
  }
  return (
    <main className="flex flex-col gap-4 max-w-6xl mx-auto py-8">
      {categories.map(category => (
        <section
          key={category}
          className=" border p-6 rounded-2xl bg-hc-cream/10 shadow-sm">
          <h2 className="text-hc-blue-600 text-2xl mb-6 capitalize">
            {category}
          </h2>
          <div className="flex overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] gap-4 pb-4">
            {productsByCategory[category]?.slice(0, 5).map(product => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                imageUrl={product.image}
                className="w-40 lg:w-60 flex-shrink-0" // 👈 all cards same size
              />
            ))}
          </div>
          <Link
            href={`/products/categories/${categoryToSlug(category)}`}
            className=" text-primary hover:underline capitalize">
            View All {category} Products
          </Link>
        </section>
      ))}
    </main>
  );
}
export default CategorySection;
