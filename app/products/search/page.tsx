// app/products/search/page.tsx
import { searchProductsAction } from '@/actions/product-actions';
import { ProductCard } from '@/components/products/ProductCard';
import { PageHeader } from '@/components/ui/PageHeader';

export default async function ProductsSearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = (searchParams.q || '').trim();
  const results = q ? await searchProductsAction({ q, limit: 48 }) : [];
  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <PageHeader
        title={`Results for “${q}”`}
        subtitle={`${results.length} product${
          results.length !== 1 ? 's' : ''
        } found`}
      />
      {results.length === 0 ? (
        <p className="text-hc-teal-500">
          No results found. Please try a different search term.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.map(product => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              imageUrl={product.image}
            />
          ))}
        </div>
      )}
    </main>
  );
}
