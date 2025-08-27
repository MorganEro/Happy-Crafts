// app/products/search/page.tsx
import { searchProductsAction } from '@/actions/product-actions';
import { ProductCard } from '@/components/products/ProductCard';
import { PageHeader } from '@/components/ui/PageHeader';

type SearchParamsPromise = Promise<
  Record<string, string | string[] | undefined>
>;

export default async function ProductsSearchPage({
  searchParams,
}: {
  searchParams: SearchParamsPromise;
}) {
  const sp = await searchParams;

  const rawQ = sp?.q;
  const q = (Array.isArray(rawQ) ? rawQ[0] : rawQ ?? '').trim();

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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {results.map(p => (
            <ProductCard
              key={p.id}
              id={p.id}
              name={p.name}
              imageUrl={p.image}
            />
          ))}
        </div>
      )}
    </main>
  );
}
